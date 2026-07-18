import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  // Clerk's middleware crashes on Vercel's default Edge runtime
  // (MIDDLEWARE_INVOCATION_FAILED) even though it runs fine locally under
  // Node.js via `next dev`. Force Node.js explicitly.
  runtime: "nodejs",
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
