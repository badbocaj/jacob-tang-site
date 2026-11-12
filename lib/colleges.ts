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

/**
 * Lowercase, drop apostrophes, treat "&" and "and" alike (both vanish), and turn other
 * punctuation into spaces: "St. John's" → "st johns", "Texas A&M" / "a & m" / "a and m" → "texas a m".
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && w !== "and")
    .join(" ");
}

interface Indexed {
  c: College;
  name: string;
  words: string[];
  aliases: string[];
}

const INDEX: Indexed[] = COLLEGES.map((c) => {
  const name = normalize(c.name);
  return { c, name, words: name.split(" "), aliases: c.aliases.map(normalize) };
});

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

/** Queries shorter than this never match mid-word. */
const MIN_SUBSTRING = 4;

/**
 * Lower is better; null = no match. Both sides are normalized; plain string ops only,
 * never a regex built from input.
 *   0  an alias or the whole name equals the query ("nyu", "purdue university")
 *   1  the name starts with the query
 *   2  every query word starts some word of the name ("georgia te" → Georgia Institute of Technology)
 *   3  the name contains the query anywhere (queries of MIN_SUBSTRING+ characters only)
 */
function rank(entry: Indexed, q: string, qWords: string[]): number | null {
  if (entry.name === q || entry.aliases.includes(q)) return 0;
  if (entry.name.startsWith(q)) return 1;
  if (qWords.every((qw) => entry.words.some((w) => w.startsWith(qw)))) return 2;
  // Mid-word matches are noise for short queries ("unc" in "acupuncture").
  if (q.length >= MIN_SUBSTRING && entry.name.includes(q)) return 3;
  return null;
}

export function searchCollegeOptions(query: string, limit = 8): CollegeOption[] {
  const q = normalize(query);
  if (!q) return NO_COLLEGE_OPTIONS;
  const qWords = q.split(" ");

  const matches: { c: College; r: number }[] = [];
  for (const entry of INDEX) {
    const r = rank(entry, q, qWords);
    if (r !== null) matches.push({ c: entry.c, r });
  }
  matches.sort((a, b) => a.r - b.r || a.c.name.localeCompare(b.c.name));

  return [
    ...matches.slice(0, limit).map(({ c }) => ({ value: c.id, label: c.name, sub: `${c.city}, ${c.state}` })),
    ...NO_COLLEGE_OPTIONS,
  ];
}
