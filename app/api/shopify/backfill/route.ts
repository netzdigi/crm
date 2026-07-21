import { NextRequest, NextResponse } from "next/server";
import { shopifyGraphql } from "@/lib/shopify/admin";
import { logOrderNote, upsertOrder, upsertOrderLineItems, upsertShopifyCustomer } from "@/lib/db/queries";
import { classifyChannel } from "@/lib/shopify/channel";

// Same rationale as register-webhooks/route.ts: triggered via browser visit
// (protected by ?secret=) instead of a CLI script, since this sandbox's
// network can't reach Shopify or Neon directly.
//
// Iterates orders (not customers) so a single pass both (a) only ever syncs
// customers who have actually ordered, and (b) fills the orders table the
// dashboard's revenue/channel numbers are computed from.
//
// Each page's orders are processed concurrently (not one at a time) — a
// store with thousands of orders processed sequentially risks exceeding the
// serverless function's time limit. If the whole store still can't finish
// within the time budget, the response includes nextCursor: revisit the
// same URL with &cursor=<value> appended to continue where it left off.
const QUERY = `
  query orders($cursor: String) {
    orders(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          sourceName
          totalPriceSet { shopMoney { amount currencyCode } }
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
          customer {
            id
            email
            phone
            firstName
            lastName
            defaultAddress { address1 address2 city zip province country company }
            emailMarketingConsent { marketingState }
          }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

interface CustomerAddress {
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  province: string | null;
  country: string | null;
  company: string | null;
}

interface CustomerNode {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  defaultAddress: CustomerAddress | null;
  emailMarketingConsent: { marketingState: string | null } | null;
}

interface LineItemNode {
  title: string;
  quantity: number;
  originalUnitPriceSet: { shopMoney: { amount: string } };
  image: { url: string } | null;
}

interface OrderNode {
  id: string;
  name: string | null;
  createdAt: string;
  sourceName: string | null;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: { edges: { node: LineItemNode }[] };
  customer: CustomerNode | null;
}

interface OrdersResult {
  orders: {
    edges: { cursor: string; node: OrderNode }[];
    pageInfo: { hasNextPage: boolean };
  };
}

function shopifyLegacyId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

function formatAddress(address: CustomerAddress | null): string {
  if (!address) return "";
  return [address.address1, address.address2, address.zip, address.city, address.province, address.country]
    .filter(Boolean)
    .join(", ");
}

async function processOrder(o: OrderNode): Promise<{ ok: boolean; hadCustomer: boolean }> {
  const orderId = shopifyLegacyId(o.id);
  let clientId: string | null = null;

  try {
    if (o.customer) {
      const customerId = shopifyLegacyId(o.customer.id);
      const name = [o.customer.firstName, o.customer.lastName].filter(Boolean).join(" ").trim();
      clientId = await upsertShopifyCustomer({
        shopifyCustomerId: customerId,
        company: o.customer.defaultAddress?.company || name || o.customer.email || `Клиент ${customerId}`,
        contact: name || o.customer.email || `Клиент ${customerId}`,
        phone: o.customer.phone ?? "",
        email: o.customer.email ?? "",
        address: formatAddress(o.customer.defaultAddress),
        marketingStatus: o.customer.emailMarketingConsent?.marketingState ?? "",
      });
    }

    const totalPrice = Number(o.totalPriceSet.shopMoney.amount);
    const currency = o.totalPriceSet.shopMoney.currencyCode;

    await upsertOrder({
      shopifyOrderId: orderId,
      clientId,
      name: o.name ?? `#${orderId}`,
      totalPrice,
      currency,
      channel: classifyChannel(o.sourceName, null),
      occurredAt: new Date(o.createdAt),
    });

    await upsertOrderLineItems(
      orderId,
      o.lineItems.edges.map((e) => ({
        title: e.node.title,
        quantity: e.node.quantity,
        price: Number(e.node.originalUnitPriceSet.shopMoney.amount),
        imageUrl: e.node.image?.url ?? "",
      }))
    );

    if (clientId) {
      await logOrderNote(
        clientId,
        `Поръчка ${o.name ?? `#${orderId}`}`,
        `Обща сума: ${totalPrice.toFixed(2)} ${currency}`,
        `note-order-${orderId}`
      );
    }

    return { ok: true, hadCustomer: Boolean(clientId) };
  } catch (err) {
    console.error(`Backfill: failed to process order ${orderId}:`, err);
    return { ok: false, hadCustomer: false };
  }
}

const TIME_BUDGET_MS = 4 * 60 * 1000; // stay comfortably under Vercel's function time limit

export async function GET(request: NextRequest) {
  const expected = process.env.SHOPIFY_API_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  let cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  let ordersImported = 0;
  let ordersFailed = 0;
  let customersImported = 0;
  let done = false;

  for (;;) {
    const data = await shopifyGraphql<OrdersResult>(QUERY, { cursor });
    const { edges, pageInfo } = data.orders;

    const results = await Promise.all(edges.map((edge) => processOrder(edge.node)));
    ordersImported += results.filter((r) => r.ok).length;
    ordersFailed += results.filter((r) => !r.ok).length;
    customersImported += results.filter((r) => r.hadCustomer).length;
    cursor = edges[edges.length - 1]?.cursor ?? cursor;

    if (!pageInfo.hasNextPage) {
      done = true;
      break;
    }
    if (Date.now() - startedAt > TIME_BUDGET_MS) break;
  }

  return NextResponse.json({
    done,
    ordersImported,
    ordersFailed,
    customersImported,
    nextCursor: done ? null : cursor,
  });
}
