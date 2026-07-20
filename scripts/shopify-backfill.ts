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
const { upsertShopifyCustomer } = await import("../lib/db/queries");

// Only customers who have placed at least one order are imported.
const QUERY = `
  query customers($cursor: String) {
    customers(first: 50, after: $cursor, query: "orders_count:>0") {
      edges {
        cursor
        node {
          id
          email
          phone
          firstName
          lastName
          defaultAddress { address1 address2 city zip province country company }
          emailMarketingConsent { marketingState }
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

interface CustomersResult {
  customers: {
    edges: { cursor: string; node: CustomerNode }[];
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
  let total = 0;

  for (;;) {
    const data = await shopifyGraphql<CustomersResult>(QUERY, { cursor });
    const { edges, pageInfo } = data.customers;

    for (const edge of edges) {
      const c = edge.node;
      const id = shopifyLegacyId(c.id);
      const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
      await upsertShopifyCustomer({
        shopifyCustomerId: id,
        company: c.defaultAddress?.company || name || c.email || `Клиент ${id}`,
        contact: name || c.email || `Клиент ${id}`,
        phone: c.phone ?? "",
        email: c.email ?? "",
        address: formatAddress(c.defaultAddress),
        marketingStatus: c.emailMarketingConsent?.marketingState ?? "",
      });
      total++;
      cursor = edge.cursor;
    }

    if (!pageInfo.hasNextPage) break;
  }

  console.log(`Backfill complete: ${total} customers imported into the "Versendet" board.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
  });
