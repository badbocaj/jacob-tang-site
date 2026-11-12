/* ───────────────────────────────────────────────────────────────────────────
   Builds data/colleges.json for the guestbook's college picker and map.

   1. Download the IPEDS directory file (HD2023.zip) from
      https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip
   2. Unzip it so the CSV sits at scripts/data/HD2023.csv (git-ignored).
   3. npm run build:colleges

   Keeps active, degree-granting schools that award a bachelor's or higher,
   in the 50 states + DC, with coordinates.
   ─────────────────────────────────────────────────────────────────────────── */

import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

const SOURCE = "scripts/data/HD2023.csv";
const OUT = "data/colleges.json";

const STATES = new Set(
  ("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY " +
    "NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY").split(" "),
);

/** Short forms people type that IPEDS names don't contain. Keyed by UNITID. */
const ALIASES: Record<string, string[]> = {
  "123961": ["USC"], // University of Southern California
  "218663": ["USC"], // University of South Carolina-Columbia
  "110662": ["UCLA"],
  "166683": ["MIT"],
  "110635": ["Berkeley", "Cal"],
  "243780": ["Purdue"],
  "228778": ["UT Austin"],
};

type Row = Record<string, string>;

const rows: Row[] = parse(readFileSync(SOURCE, "utf8"), { columns: true, bom: true, skip_empty_lines: true });

const colleges = rows
  .filter(
    (r) =>
      r.CYACTIVE === "1" &&
      r.DEGGRANT === "1" &&
      Number(r.HLOFFER) >= 5 &&
      STATES.has(r.STABBR) &&
      Number.isFinite(Number.parseFloat(r.LATITUDE)) &&
      Number.isFinite(Number.parseFloat(r.LONGITUD)),
  )
  .map((r) => ({
    id: r.UNITID,
    name: r.INSTNM.trim(),
    city: r.CITY.trim(),
    state: r.STABBR,
    lat: Number.parseFloat(r.LATITUDE),
    lng: Number.parseFloat(r.LONGITUD),
    aliases: ALIASES[r.UNITID] ?? [],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const ids = new Set(colleges.map((c) => c.id));
const missing = Object.keys(ALIASES).filter((id) => !ids.has(id));
if (missing.length) throw new Error(`Aliased UNITIDs not in the output: ${missing.join(", ")}`);

writeFileSync(OUT, JSON.stringify(colleges));
console.log(`Wrote ${colleges.length} colleges to ${OUT}`);
