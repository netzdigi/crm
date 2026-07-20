// Classifies an order's traffic source using data Shopify already captures
// for every checkout (referring site, landing site, sales channel) — no ad
// pixels required. Once real Meta/Google/TikTok pixels are running on the
// storefront, Shopify's own attribution (which this reads) gets more
// precise automatically; this classification doesn't need to change.
export function classifyChannel(
  sourceName: string | null | undefined,
  referringSite: string | null | undefined
): string {
  const ref = (referringSite ?? "").toLowerCase();

  if (sourceName === "pos") return "Физически магазин";
  if (ref.includes("facebook.com") || ref.includes("instagram.com")) return "Facebook/Instagram";
  if (ref.includes("google.")) return "Google";
  if (ref.includes("tiktok.com")) return "TikTok";
  if (!ref) return "Директно";
  return "Друго препращане";
}
