import collegesJson from "@/data/colleges.json";

import type { NoCollege } from "./guestbook-types";

/* ───────────────────────────────────────────────────────────────────────────
   US colleges for the guestbook (built by scripts/build-colleges.mts from
   IPEDS). Server-side only: the picker searches through a server action, so
   the ~2,700-school list never ships to the browser.
   ─────────────────────────────────────────────────────────────────────────── */

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export interface CollegeOption {
  /** A college id, or one of the NoCollege values. */
  value: string;
  label: string;
  sub?: string;
}

const COLLEGES = collegesJson as College[];
const BY_ID = new Map(COLLEGES.map((c) => [c.id, c]));

export const NO_COLLEGE_OPTIONS: CollegeOption[] = [
  { value: "outside_us" satisfies NoCollege, label: "Outside the US" },
  { value: "not_listed" satisfies NoCollege, label: "Didn't go / not listed" },
];

export function getCollege(id: string): College | undefined {
  return BY_ID.get(id);
}

export function collegeExists(id: string): boolean {
  return BY_ID.has(id);
}

/** Lower is better; null = no match. Plain string ops only, never a regex built from input. */
function rank(c: College, q: string): number | null {
  if (c.aliases.some((a) => a.toLowerCase() === q)) return 0;
  const name = c.name.toLowerCase();
  if (name.startsWith(q)) return 1;
  if (name.split(/[\s\-–,&/()]+/).some((word) => word.startsWith(q))) return 2;
  if (name.includes(q)) return 3;
  return null;
}

export function searchCollegeOptions(query: string, limit = 8): CollegeOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return NO_COLLEGE_OPTIONS;

  const matches: { c: College; r: number }[] = [];
  for (const c of COLLEGES) {
    const r = rank(c, q);
    if (r !== null) matches.push({ c, r });
  }
  matches.sort((a, b) => a.r - b.r || a.c.name.localeCompare(b.c.name));

  return [
    ...matches.slice(0, limit).map(({ c }) => ({ value: c.id, label: c.name, sub: `${c.city}, ${c.state}` })),
    ...NO_COLLEGE_OPTIONS,
  ];
}
