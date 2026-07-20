import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  findClientByEmail,
  findClientByShopifyCustomerId,
  logOrderNote,
  upsertOrder,
  upsertOrderLineItems,
  upsertShopifyCustomer,
} from "@/lib/db/queries";
import { classifyChannel } from "@/lib/shopify/channel";
import { shopifyGraphql } from "@/lib/shopify/admin";

// Webhook subscriptions created through the Admin API (see
// scripts/shopify-register-webhooks.ts) are signed by Shopify with the
// custom app's API secret key, so the payload's authenticity can be verified
// cryptographically instead of trusting a shared URL secret.
function verifyHmac(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret || !hmacHeader) return false;

  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(hmacHeader, "utf8");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

interface ShopifyAddress {
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  zip?: string | null;
  province?: string | null;
  country?: string | null;
  company?: string | null;
}

interface ShopifyCustomer {
  id: number | string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  default_address?: ShopifyAddress | null;
  email_marketing_consent?: { state?: string | null } | null;
}

interface ShopifyOrder {
  id: number | string;
  name?: string | null;
  total_price?: string | null;
  currency?: string | null;
  customer?: ShopifyCustomer | null;
  email?: string | null;
  source_name?: string | null;
  referring_site?: string | null;
  created_at?: string | null;
}

function customerDisplayName(customer: ShopifyCustomer): string {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return name || customer.email || `Клиент ${customer.id}`;
}

function formatAddress(address?: ShopifyAddress | null): string {
  if (!address) return "";
  return [address.address1, address.address2, address.zip, address.city, address.province, address.country]
    .filter(Boolean)
    .join(", ");
}

// Only customers who have actually ordered belong in the CRM. Standalone
// customers/create + customers/update events don't guarantee that, so
// onlyUpdateExisting=true there means they only refresh an already-synced
// record (created earlier from a real order) instead of creating a new one.
async function handleCustomerPayload(customer: ShopifyCustomer, onlyUpdateExisting: boolean) {
  await upsertShopifyCustomer(
    {
      shopifyCustomerId: String(customer.id),
      company: customer.default_address?.company || customerDisplayName(customer),
      contact: customerDisplayName(customer),
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      address: formatAddress(customer.default_address),
      marketingStatus: customer.email_marketing_consent?.state ?? "",
    },
    onlyUpdateExisting
  );
}

const LINE_ITEMS_QUERY = `
  query orderLineItems($id: ID!) {
    order(id: $id) {
      lineItems(first: 20) {
        edges {
          node {
            title
            quantity
            originalUnitPriceSet { shopMoney { amount } }
            image { url }
          }
        }
      }
    }
  }
`;

interface LineItemsResult {
  order: {
    lineItems: {
      edges: {
        node: {
          title: string;
          quantity: number;
          originalUnitPriceSet: { shopMoney: { amount: string } };
          image: { url: string } | null;
        };
      }[];
    };
  } | null;
}

// The REST order payload doesn't include product images, so fetch line
// items via the Admin API GraphQL instead. Non-fatal: a failure here
// (e.g. missing scope) shouldn't fail the whole webhook and trigger a
// Shopify redelivery, since the order/customer sync already succeeded.
async function syncOrderLineItems(orderId: string) {
  try {
    const data = await shopifyGraphql<LineItemsResult>(LINE_ITEMS_QUERY, {
      id: `gid://shopify/Order/${orderId}`,
    });
    const edges = data.order?.lineItems.edges ?? [];
    await upsertOrderLineItems(
      orderId,
      edges.map((e) => ({
        title: e.node.title,
        quantity: e.node.quantity,
        price: Number(e.node.originalUnitPriceSet.shopMoney.amount),
        imageUrl: e.node.image?.url ?? "",
      }))
    );
  } catch (err) {
    console.error(`Failed to sync line items for order ${orderId}:`, err);
  }
}

async function handleOrderPayload(order: ShopifyOrder) {
  let clientId: string | null = null;

  if (order.customer) {
    await handleCustomerPayload(order.customer, false);
    clientId = await findClientByShopifyCustomerId(String(order.customer.id));
  } else if (order.email) {
    clientId = await findClientByEmail(order.email);
  }

  const totalPrice = order.total_price ? Number(order.total_price) : 0;
  const currency = order.currency ?? "EUR";
  const label = order.name ?? `#${order.id}`;

  await upsertOrder({
    shopifyOrderId: String(order.id),
    clientId,
    name: label,
    totalPrice,
    currency,
    channel: classifyChannel(order.source_name, order.referring_site),
    occurredAt: order.created_at ? new Date(order.created_at) : new Date(),
  });

  await syncOrderLineItems(String(order.id));

  if (!clientId) return;

  const price = order.total_price ? `${order.total_price} ${currency}` : "";
  await logOrderNote(
    clientId,
    `Нова поръчка ${label}`,
    price ? `Обща сума: ${price}` : "Поръчката е получена от Shopify.",
    `note-order-${order.id}`
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (topic.startsWith("customers/")) {
      await handleCustomerPayload(body as ShopifyCustomer, true);
    } else if (topic.startsWith("orders/")) {
      await handleOrderPayload(body as ShopifyOrder);
    } else {
      return NextResponse.json({ ok: true, ignored: topic });
    }
  } catch (err) {
    console.error("Shopify webhook processing failed:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
