import { NextRequest, NextResponse } from "next/server";
import { shopifyGraphql } from "@/lib/shopify/admin";

// Triggered by visiting the URL once (protected by ?secret=), not via CLI —
// this project's sandbox network can't reach Shopify directly, and the
// deployed app can, so registration happens through this route instead of
// scripts/shopify-register-webhooks.ts.
const TOPICS = ["CUSTOMERS_CREATE", "CUSTOMERS_UPDATE", "ORDERS_CREATE"] as const;

const MUTATION = `
  mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      webhookSubscription { id topic }
      userErrors { field message }
    }
  }
`;

interface WebhookSubscriptionCreateResult {
  webhookSubscriptionCreate: {
    webhookSubscription: { id: string; topic: string } | null;
    userErrors: { field: string[] | null; message: string }[];
  };
}

export async function GET(request: NextRequest) {
  const expected = process.env.SHOPIFY_API_SECRET;
  const provided = request.nextUrl.searchParams.get("secret");
  if (!expected || provided !== expected) {
    // Temporary diagnostics — never echoes the actual secret value, only
    // shape/length info, to track down a persistent auth mismatch.
    return NextResponse.json(
      {
        error: "Unauthorized",
        debug: {
          expectedSet: Boolean(expected),
          expectedLength: expected?.length ?? 0,
          expectedFirst2: expected?.slice(0, 2) ?? null,
          expectedLast2: expected?.slice(-2) ?? null,
          providedSet: Boolean(provided),
          providedLength: provided?.length ?? 0,
          providedFirst2: provided?.slice(0, 2) ?? null,
          providedLast2: provided?.slice(-2) ?? null,
        },
      },
      { status: 401 }
    );
  }

  const callbackUrl = new URL("/api/webhooks/shopify", request.url).toString();
  const results: { topic: string; id?: string; errors?: unknown }[] = [];

  for (const topic of TOPICS) {
    const data = await shopifyGraphql<WebhookSubscriptionCreateResult>(MUTATION, {
      topic,
      webhookSubscription: { callbackUrl, format: "JSON" },
    });
    const result = data.webhookSubscriptionCreate;
    if (result.userErrors.length > 0) {
      results.push({ topic, errors: result.userErrors });
    } else {
      results.push({ topic, id: result.webhookSubscription?.id });
    }
  }

  return NextResponse.json({ callbackUrl, results });
}
