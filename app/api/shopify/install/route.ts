import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const SCOPES = "read_customers,read_orders";

// Shopify discontinued static-token legacy custom apps on 2026-01-01 — new
// apps must go through the standard OAuth authorization-code flow to get an
// Admin API access token. Visiting this route once (logged in as the store
// owner) kicks that off; app/api/shopify/callback/route.ts finishes it.
export async function GET(request: NextRequest) {
  const apiKey = process.env.SHOPIFY_API_KEY;
  const shop = process.env.SHOPIFY_STORE_DOMAIN;

  if (!apiKey || !shop) {
    return NextResponse.json(
      { error: "SHOPIFY_API_KEY or SHOPIFY_STORE_DOMAIN is not set" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/shopify/callback", request.url).toString();

  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", apiKey);
  authorizeUrl.searchParams.set("scope", SCOPES);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
  });
  return response;
}
