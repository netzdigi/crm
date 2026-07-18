import { NextRequest, NextResponse } from "next/server";
import {
  findClientByEmail,
  findClientByShopifyCustomerId,
  logOrderNote,
  upsertShopifyCustomer,
} from "@/lib/db/queries";

// Receives Shopify's native admin-configured webhooks (Settings > Notifications
// > Webhooks). Those aren't tied to an app, so Shopify doesn't sign them with
// an HMAC header — the shared "secret" query param on the webhook URL is the
// only thing standing between this endpoint and a forged request.
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!expected) return false;
  return request.nextUrl.searchParams.get("secret") === expected;
}

interface ShopifyCustomer {
  id: number | string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  default_address?: { company?: string | null } | null;
}

interface ShopifyOrder {
  id: number | string;
  name?: string | null;
  total_price?: string | null;
  currency?: string | null;
  customer?: ShopifyCustomer | null;
  email?: string | null;
}

function customerDisplayName(customer: ShopifyCustomer): string {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return name || customer.email || `Клиент ${customer.id}`;
}

async function handleCustomerPayload(customer: ShopifyCustomer) {
  await upsertShopifyCustomer({
    shopifyCustomerId: String(customer.id),
    company: customer.default_address?.company || customerDisplayName(customer),
    contact: customerDisplayName(customer),
    phone: customer.phone ?? "",
    email: customer.email ?? "",
  });
}

async function handleOrderPayload(order: ShopifyOrder) {
  let clientId: string | null = null;

  if (order.customer) {
    await handleCustomerPayload(order.customer);
    clientId = await findClientByShopifyCustomerId(String(order.customer.id));
  } else if (order.email) {
    clientId = await findClientByEmail(order.email);
  }

  if (!clientId) return;

  const price = order.total_price ? `${order.total_price} ${order.currency ?? "EUR"}` : "";
  const label = order.name ?? `#${order.id}`;
  await logOrderNote(
    clientId,
    `Нова поръчка ${label}`,
    price ? `Обща сума: ${price}` : "Поръчката е получена от Shopify."
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    if (topic.startsWith("customers/")) {
      await handleCustomerPayload(body as ShopifyCustomer);
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
