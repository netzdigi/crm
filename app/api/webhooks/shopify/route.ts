import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  findClientByEmail,
  findClientByShopifyCustomerId,
  logOrderNote,
  upsertShopifyCustomer,
} from "@/lib/db/queries";

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
