import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/* ───────────────────────────────────────────────────────────────────────────
   The one place that talks to Neon. DATABASE_URL is set by the Vercel ↔ Neon
   integration in production, and by hand in .env.local (dev branch) locally.
   ─────────────────────────────────────────────────────────────────────────── */

export class DbUnavailableError extends Error {
  constructor(message = "DATABASE_URL is not set") {
    super(message);
    this.name = "DbUnavailableError";
  }
}

let client: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DbUnavailableError();
  client ??= neon(url);
  return client;
}
