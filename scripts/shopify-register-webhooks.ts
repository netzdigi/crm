import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const required = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN", "SHOPIFY_WEBHOOK_URL"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `Missing env vars: ${missing.join(", ")} (checked process.env and .env.local). Aborting.`
  );
  console.error("SHOPIFY_WEBHOOK_URL example: https://crm-eight-cyan.vercel.app/api/webhooks/shopify");
  process.exit(1);
}

const { shopifyGraphql } = await import("../lib/shopify/admin");

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

async function main() {
  const callbackUrl = process.env.SHOPIFY_WEBHOOK_URL as string;

  for (const topic of TOPICS) {
    const data = await shopifyGraphql<WebhookSubscriptionCreateResult>(MUTATION, {
      topic,
      webhookSubscription: { callbackUrl, format: "JSON" },
    });

    const result = data.webhookSubscriptionCreate;
    if (result.userErrors.length > 0) {
      console.error(`Failed to register ${topic}:`, result.userErrors);
    } else {
      console.log(`Registered ${topic} -> ${result.webhookSubscription?.id}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Webhook registration failed:", err);
    process.exit(1);
  });
