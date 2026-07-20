import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

// Verifies Shopify's OAuth callback query-string signature. Distinct from
// the webhook body signature in app/api/webhooks/shopify/route.ts: this one
// is hex-encoded and computed over the sorted query params, per Shopify's
// OAuth docs.
function verifyOAuthHmac(searchParams: URLSearchParams, secret: string): boolean {
  const hmac = searchParams.get("hmac");
  if (!hmac) return false;

  const pairs: string[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === "hmac" || key === "signature") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const message = pairs.join("&");

  const digest = createHmac("sha256", secret).update(message, "utf8").digest("hex");
  const expected = Buffer.from(digest, "utf8");
  const received = Buffer.from(hmac, "utf8");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

function htmlPage(body: string) {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:monospace;padding:2rem;background:#111;color:#eee;line-height:1.6">${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const shop = process.env.SHOPIFY_STORE_DOMAIN;

  if (!apiKey || !apiSecret || !shop) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY, SHOPIFY_API_SECRET or SHOPIFY_STORE_DOMAIN is not set" },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const state = searchParams.get("state");
  const code = searchParams.get("code");
  const cookieState = request.cookies.get("shopify_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return htmlPage("<h2>Ungültige Anfrage</h2><p>State stimmt nicht überein — bitte starte den Vorgang erneut über /api/shopify/install.</p>");
  }

  if (!verifyOAuthHmac(searchParams, apiSecret)) {
    return htmlPage("<h2>Ungültige Signatur</h2><p>Die Anfrage konnte nicht als von Shopify stammend verifiziert werden.</p>");
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: apiKey, client_secret: apiSecret, code }),
  });

  if (!tokenRes.ok) {
    return htmlPage(`<h2>Token-Austausch fehlgeschlagen</h2><pre>${tokenRes.status} ${await tokenRes.text()}</pre>`);
  }

  const data = (await tokenRes.json()) as { access_token: string; scope: string };

  return htmlPage(`
    <h2>Shopify verbunden ✅</h2>
    <p>Kopiere diesen Wert einmalig in Vercel als <code>SHOPIFY_ADMIN_ACCESS_TOKEN</code>:</p>
    <pre style="background:#222;padding:1rem;border-radius:8px;word-break:break-all;user-select:all">${data.access_token}</pre>
    <p>Berechtigungen: ${data.scope}</p>
    <p>Diese Seite zeigt den Token nur dieses eine Mal.</p>
  `);
}
