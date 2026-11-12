import { createHmac } from "node:crypto";

/** The visitor's IP: first x-forwarded-for entry (Vercel sets it), else localhost. */
export function clientIpFrom(headers: Headers): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "127.0.0.1";
}

/** Keyed hash of an IP. Stored only for rate limiting; the raw IP is never kept. */
export function hashIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}
