/* ───────────────────────────────────────────────────────────────────────────
   TEMPORARY SECTION LOCK

   Sections that are built but not ready to be shown. Everything about the
   lock — the middleware rewrite, the navbar treatment, the cockpit channel
   labels — reads from this one list.

   TO SHIP A SECTION: delete its entry from LOCKED_SECTIONS.
   TO REMOVE THE LOCK ENTIRELY: empty the list, then delete middleware.ts,
   app/under-construction/, components/UnderConstruction.tsx and this file.

   TO PREVIEW YOUR OWN WORK: hit any locked URL with ?preview=1 once. That
   drops a cookie and the lock steps aside on this browser for 30 days.
   ?preview=0 puts it back.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Path prefixes that are sealed. A prefix seals its children too, so
 * "/projects" also covers /projects/hpfrt and /projects/[slug].
 *
 * /fun and /funny are both here because the route lives at app/fun while parts
 * of the site still point at /funny — sealing both means neither leaks.
 */
export const LOCKED_SECTIONS = [
  "/about",
  "/projects",
  "/movies",
  "/fun",
  "/funny",
] as const;

/** Where a sealed request lands. Must NOT itself be a locked section. */
export const CONSTRUCTION_PATH = "/under-construction";

/** Set by ?preview=1, checked by the middleware. */
export const PREVIEW_COOKIE = "jt-preview";

export function isLocked(pathname: string): boolean {
  return LOCKED_SECTIONS.some(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );
}

/** Human label for a sealed path — "/projects/hpfrt" reads back as "PROJECTS". */
export function sectionLabel(pathname: string): string {
  const section = LOCKED_SECTIONS.find(
    (s) => pathname === s || pathname.startsWith(`${s}/`),
  );
  return (section ?? pathname).replace(/^\//, "").toUpperCase() || "SECTION";
}

/** The channels that are still open, for the "go here instead" offer. */
export const OPEN_SECTIONS: { label: string; href: string; sub: string }[] = [
  { label: "COCKPIT", href: "/cockpit", sub: "FLIGHT DECK" },
  { label: "PROFESSIONAL", href: "/professional", sub: "MISSION LOG" },
  { label: "TRAVEL", href: "/travel", sub: "NAV ARCHIVE" },
];
