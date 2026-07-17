import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazily initialized so importing this module (e.g. transitively during
// `next build`'s static analysis) never fails just because DATABASE_URL
// isn't set yet -- the error only surfaces when a query actually runs.
let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Missing DATABASE_URL environment variable");
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}
