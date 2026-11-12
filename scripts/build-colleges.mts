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

/** Short forms people type that IPEDS names don't contain. Keyed by the cleaned name (see clean()). */
const ALIASES: Record<string, string[]> = {
  "University of Southern California": ["USC"],
  "University of South Carolina-Columbia": ["USC"],
  "University of California-Los Angeles": ["UCLA"],
  "University of California-Berkeley": ["Berkeley", "Cal", "UC Berkeley", "UCB"],
  "University of California-San Diego": ["UCSD", "UC San Diego"],
  "University of California-Irvine": ["UCI", "UC Irvine"],
  "University of California-Santa Barbara": ["UCSB", "UC Santa Barbara"],
  "University of California-Davis": ["UCD", "UC Davis"],
  "University of California-Santa Cruz": ["UCSC", "UC Santa Cruz"],
  "University of California-Riverside": ["UCR", "UC Riverside"],
  "Massachusetts Institute of Technology": ["MIT"],
  "California Institute of Technology": ["Caltech"],
  "Purdue University": ["Purdue"],
  "The University of Texas at Austin": ["UT Austin", "UT"],
  "New York University": ["NYU"],
  "Georgia Institute of Technology": ["Georgia Tech", "GT", "GaTech"],
  "Virginia Polytechnic Institute and State University": ["Virginia Tech", "VT"],
  "Pennsylvania State University": ["Penn State", "PSU"],
  "University of Pennsylvania": ["UPenn", "Penn"],
  "University of Illinois Urbana-Champaign": ["UIUC", "Illinois"],
  "University of Michigan-Ann Arbor": ["UMich", "U of M", "Michigan"],
  "University of North Carolina at Chapel Hill": ["UNC", "UNC Chapel Hill"],
  "Carnegie Mellon University": ["CMU"],
  "Texas A & M University-College Station": ["Texas A&M", "TAMU"],
  "California Polytechnic State University-San Luis Obispo": ["Cal Poly", "Cal Poly SLO"],
  "California State Polytechnic University-Pomona": ["Cal Poly Pomona", "CPP"],
  "University of Washington-Seattle Campus": ["UW", "UDub"],
  "University of Wisconsin-Madison": ["UW", "UW Madison"],
  "Boston University": ["BU"],
  "Boston College": ["BC"],
  "Rensselaer Polytechnic Institute": ["RPI"],
  "Worcester Polytechnic Institute": ["WPI"],
  "Ohio State University": ["OSU", "Ohio State"],
  "Oregon State University": ["OSU"],
  "Oklahoma State University": ["OSU"],
  "University of Colorado Boulder": ["CU Boulder", "CU"],
  "San Diego State University": ["SDSU"],
  "San Jose State University": ["SJSU"],
  "California State University-Long Beach": ["CSULB", "Long Beach State", "Cal State Long Beach"],
  "California State University-Fullerton": ["CSUF", "Cal State Fullerton"],
  "University of South Florida": ["USF"],
  "University of Central Florida": ["UCF"],
  "University of Florida": ["UF"],
  "Florida State University": ["FSU"],
  "Johns Hopkins University": ["JHU", "Hopkins"],
  "University of Virginia": ["UVA"],
  "University of Maryland-College Park": ["UMD"],
  "George Washington University": ["GWU", "GW"],
  "Arizona State University Campus Immersion": ["ASU", "Arizona State"],
  "Embry-Riddle Aeronautical University-Daytona Beach": ["ERAU", "Embry-Riddle"],
  "Embry-Riddle Aeronautical University-Prescott": ["ERAU", "Embry-Riddle"],
};

/** "Purdue University-Main Campus" → "Purdue University". */
const clean = (name: string) => name.trim().replace(/\s*-?\s*Main Campus$/i, "");
/** Administrative offices, not schools anyone attended. */
const isOffice = (name: string) => /\b(System Offices?|Central Office)\b/i.test(name);

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
      Number.isFinite(Number.parseFloat(r.LONGITUD)) &&
      !isOffice(r.INSTNM),
  )
  .map((r) => ({
    id: r.UNITID,
    name: clean(r.INSTNM),
    city: r.CITY.trim(),
    state: r.STABBR,
    lat: Number.parseFloat(r.LATITUDE),
    lng: Number.parseFloat(r.LONGITUD),
    aliases: ALIASES[clean(r.INSTNM)] ?? [],
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const names = new Set(colleges.map((c) => c.name));
const missing = Object.keys(ALIASES).filter((name) => !names.has(name));
if (missing.length) throw new Error(`Aliased names not in the output: ${missing.join(" | ")}`);

writeFileSync(OUT, JSON.stringify(colleges));
console.log(`Wrote ${colleges.length} colleges to ${OUT}`);
