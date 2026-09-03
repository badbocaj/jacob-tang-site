import { NextResponse, type NextRequest } from "next/server";

import {
  CONSTRUCTION_PATH,
  PREVIEW_COOKIE,
  isLocked,
} from "@/lib/construction";

/* ───────────────────────────────────────────────────────────────────────────
   The gate for the temporary section lock. See lib/construction.ts.

   This is Next 16's `proxy` convention — the old `middleware.ts` filename
   still runs but logs a deprecation warning on every boot.

   Sealed paths are REWRITTEN, not redirected: the visitor keeps the URL they
   asked for, so the bar reads /movies while the page explains why /movies is
   dark. That also means the moment a section is unlisted, its real page is
   back at the same address with no stale redirects cached anywhere.
   ─────────────────────────────────────────────────────────────────────────── */

const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ?preview=1 / ?preview=0 — flip the operator's own pass, then bounce to the
  // clean URL so the flag does not end up in shared links or the back stack.
  const toggle = searchParams.get("preview");
  if (toggle !== null) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete("preview");
    const res = NextResponse.redirect(clean);

    if (toggle === "0" || toggle === "false") {
      res.cookies.delete(PREVIEW_COOKIE);
    } else {
      res.cookies.set(PREVIEW_COOKIE, "1", {
        path: "/",
        maxAge: PREVIEW_MAX_AGE,
        sameSite: "lax",
      });
    }
    return res;
  }

  if (!isLocked(pathname)) return NextResponse.next();
  if (req.cookies.get(PREVIEW_COOKIE)?.value === "1") return NextResponse.next();

  const sealed = req.nextUrl.clone();
  sealed.pathname = CONSTRUCTION_PATH;
  // The page needs to know what was asked for; the visitor never sees this.
  sealed.search = `?from=${encodeURIComponent(pathname)}`;
  return NextResponse.rewrite(sealed);
}

export const config = {
  // Everything except Next internals, the API, and files with an extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
