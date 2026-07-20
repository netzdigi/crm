import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const required = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN", "DATABASE_URL"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing env vars: ${missing.join(", ")} (checked process.env and .env.local). Aborting.`
  );
  process.exit(1);
}

const { shopifyGraphql } = await import("../lib/shopify/admin");
const { logOrderNote, upsertOrder, upsertShopifyCustomer } = await import("../lib/db/queries");
const { classifyChannel } = await import("../lib/shopify/channel");

// Iterates orders (not customers), so a single pass both only ever syncs
// customers who have actually ordered and fills the orders table the
// dashboard's revenue/channel numbers are computed from.
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

interface OrderNode {
  id: string;
  name: string | null;
  createdAt: string;
  sourceName: string | null;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
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

async function main() {
  let cursor: string | undefined;
  let ordersImported = 0;
  let customersImported = 0;

  for (;;) {
    const data = await shopifyGraphql<OrdersResult>(QUERY, { cursor });
    const { edges, pageInfo } = data.orders;

    for (const edge of edges) {
      const o = edge.node;
      const orderId = shopifyLegacyId(o.id);
      let clientId: string | null = null;

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
        customersImported++;
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

      if (clientId) {
        await logOrderNote(
          clientId,
          `Поръчка ${o.name ?? `#${orderId}`}`,
          `Обща сума: ${totalPrice.toFixed(2)} ${currency}`,
          `note-order-${orderId}`
        );
      }

      ordersImported++;
      cursor = edge.cursor;
    }

    if (!pageInfo.hasNextPage) break;
  }

  console.log(
    `Backfill complete: ${ordersImported} orders, ${customersImported} customers imported into "Versendet".`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
