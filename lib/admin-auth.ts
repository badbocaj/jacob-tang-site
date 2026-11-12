import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/* ───────────────────────────────────────────────────────────────────────────
   Guestbook admin login. One password (GUESTBOOK_ADMIN_PASSWORD); a session is
   a cookie holding "<expiresAtMs>.<hmac>" signed with GUESTBOOK_SECRET.
   ─────────────────────────────────────────────────────────────────────────── */

export const ADMIN_COOKIE = "gb_admin";
export const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const digest = (s: string) => createHash("sha256").update(s).digest();
const sign = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("hex");

/** Constant-time compare. Hashing first makes both sides the same length. */
export function checkPassword(given: string, expected: string): boolean {
  return timingSafeEqual(digest(given), digest(expected));
}

export function createSessionToken(secret: string, now: number = Date.now()): string {
  const exp = String(now + SESSION_MS);
  return `${exp}.${sign(exp, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now: number = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!/^\d+$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig)) return false;
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(sign(exp, secret), "hex"))) return false;
  return Number(exp) > now;
}
