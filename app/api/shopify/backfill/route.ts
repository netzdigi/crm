import { NextRequest, NextResponse } from "next/server";
import { shopifyGraphql } from "@/lib/shopify/admin";
import { upsertShopifyCustomer } from "@/lib/db/queries";

// Same rationale as register-webhooks/route.ts: triggered via browser visit
// (protected by ?secret=) instead of scripts/shopify-backfill.ts, since this
// sandbox's network can't reach Shopify or Neon directly.
const QUERY = `
  query customers($cursor: String) {
    customers(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          email
          phone
          firstName
          lastName
          defaultAddress { company }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

interface CustomerNode {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  defaultAddress: { company: string | null } | null;
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

export async function GET(request: NextRequest) {
  const expected = process.env.SHOPIFY_API_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      });
      total++;
      cursor = edge.cursor;
    }

    if (!pageInfo.hasNextPage) break;
  }

  return NextResponse.json({ imported: total });
}
