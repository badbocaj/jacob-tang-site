/* ───────────────────────────────────────────────────────────────────────────
   Cockpit — static scene data + deterministic generators.

   Everything random here runs through a seeded PRNG at module scope so the
   server and the client produce identical markup. Do not swap any of this for
   Math.random() — the city would re-roll on hydration and React would flag it.
   ─────────────────────────────────────────────────────────────────────────── */

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number, p = 2): number => Number(n.toFixed(p));

// ─── Navigation ─────────────────────────────────────────────────────────────

export type TabId =
  | "about"
  | "professional"
  | "projects"
  | "travel"
  | "movies"
  | "override";

export interface NavTab {
  id: TabId;
  label: string;
  /** Micro-copy revealed on hover inside the holographic expansion. */
  sub: string;
  href: string;
  /**
   * Renders the tab in emergency red/amber with a blinking lock and switches
   * the channel transition to the warning strobe. It does NOT gate anything —
   * the destination enforces its own clearance.
   */
  locked?: boolean;
}

export const NAV_TABS: NavTab[] = [
  { id: "about",        label: "ABOUT",        sub: "OPERATOR DOSSIER",  href: "/about" },
  { id: "professional", label: "PROFESSIONAL", sub: "MISSION LOG",       href: "/professional" },
  { id: "projects",     label: "PROJECTS",     sub: "HARDWARE INDEX",    href: "/projects" },
  { id: "travel",       label: "TRAVEL",       sub: "NAV ARCHIVE",       href: "/travel" },
  { id: "movies",       label: "MOVIES",       sub: "MEDIA CACHE",       href: "/movies" },
  { id: "override",     label: "OVERRIDE",     sub: "LEVEL-5 CLEARANCE", href: "/personalized", locked: true },
];

// ─── Boot diagnostics ───────────────────────────────────────────────────────

export const BOOT_LINES: string[] = [
  "VISOR SERVO ......... LOCKED",
  "OPTICAL RELAY ....... NOMINAL",
  "CANOPY SEAL ......... 1.00 ATM",
  "NAV UPLINK .......... ACQUIRED",
  "TELEMETRY BUS ....... 12 CH LIVE",
  "OPERATOR ID ......... VERIFIED",
  "HUD ................. ONLINE",
];

// ─── Centre panel: operator profile ─────────────────────────────────────────

export interface ProfileRow {
  key: string;
  value: string;
}

export interface CoreDrive {
  index: string;
  title: string;
  body: string;
}

export const PROFILE_ROWS: ProfileRow[] = [
  { key: "STATUS",     value: "ACTIVE — BUILDING THINGS THAT HAVE TO SURVIVE REALITY" },
  { key: "BASE",       value: "UNIV. OF SOUTHERN CALIFORNIA · LOS ANGELES" },
  { key: "ASSIGNMENT", value: "MECH. ENG. INTERN — VITAL LYFE" },
  { key: "PRIOR",      value: "L3HARRIS · AIM LAB @ UH · CURVE @ USC" },
];

export const CORE_DRIVES: CoreDrive[] = [
  {
    index: "01",
    title: "BUILD TO UNDERSTAND",
    body: "Reading about a system gets you a vocabulary. Bending one until it fails gets you an intuition.",
  },
  {
    index: "02",
    title: "HARDWARE DOES NOT NEGOTIATE",
    body: "The test stand is the only reviewer whose notes I cannot argue with. So I ask it first.",
  },
  {
    index: "03",
    title: "SHIP → MEASURE → ITERATE",
    body: "A rough thing in the world beats a perfect thing in a folder. Measure it, then go again.",
  },
];

export const PROFILE = {
  eyebrow: "SUBJECT PROFILE",
  serial: "ID 0x4A54",
  callsign: "SYSTEM OPERATOR",
  name: "JACOB TANG",
  designation: "MECHANICAL ENGINEER // STRUCTURES · TESTING · PROPULSION",
} as const;

/** Small floating readouts wired to the centre panel by hairline leader lines. */
export interface TelemetryVector {
  side: "tl" | "tr" | "bl" | "br";
  label: string;
  value: string;
}

export const TELEMETRY_VECTORS: TelemetryVector[] = [
  { side: "tl", label: "AOA", value: "04.2°" },
  { side: "tr", label: "VEC", value: "118.4" },
  { side: "bl", label: "THR", value: "62%" },
  { side: "br", label: "G",   value: "1.03" },
];

// ─── Right-edge telemetry ladder ────────────────────────────────────────────

export const LADDER_TICKS: number[] = Array.from({ length: 13 }, (_, i) => i);

export const SYSTEM_READOUTS: ProfileRow[] = [
  { key: "ALT", value: "04120 M" },
  { key: "SPD", value: "0.71 MACH" },
  { key: "HDG", value: "284°" },
  { key: "O2",  value: "97%" },
];

// ─── City skyline generation ────────────────────────────────────────────────

export interface CityWindow {
  x: number;
  y: number;
  o: number;
}

export interface Building {
  x: number;
  w: number;
  h: number;
  windows: CityWindow[];
}

export const SKYLINE_SPAN = 1200;
export const SKYLINE_BASE = 420;

interface SkylineOpts {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  windowChance: number;
  gapMax: number;
}

function buildSkyline(seed: number, o: SkylineOpts): Building[] {
  const rnd = mulberry32(seed);
  const out: Building[] = [];
  let x = -60;

  while (x < SKYLINE_SPAN + 60) {
    const w = round(o.minW + rnd() * (o.maxW - o.minW));
    const h = round(o.minH + rnd() * (o.maxH - o.minH));
    const windows: CityWindow[] = [];

    if (o.windowChance > 0) {
      for (let wx = x + 7; wx < x + w - 8; wx += 12) {
        for (let wy = SKYLINE_BASE - h + 14; wy < SKYLINE_BASE - 12; wy += 18) {
          if (rnd() < o.windowChance) {
            windows.push({ x: round(wx), y: round(wy), o: round(0.2 + rnd() * 0.75) });
          }
        }
      }
    }

    out.push({ x: round(x), w, h, windows });
    x += w + 4 + rnd() * o.gapMax;
  }

  return out;
}

/** Deepest band — silhouette only, heavily hazed. */
export const CITY_FAR: Building[] = buildSkyline(7, {
  minW: 34, maxW: 78, minH: 90, maxH: 210, windowChance: 0, gapMax: 26,
});

/** The band that carries the neon. */
export const CITY_MID: Building[] = buildSkyline(13, {
  minW: 46, maxW: 112, minH: 160, maxH: 340, windowChance: 0.42, gapMax: 20,
});

/** Foreground rooftops just past the canopy. */
export const CITY_NEAR: Building[] = buildSkyline(29, {
  minW: 90, maxW: 190, minH: 50, maxH: 130, windowChance: 0.1, gapMax: 34,
});

// ─── Flying traffic ─────────────────────────────────────────────────────────

export interface TrafficLane {
  /** vertical position as a % of the sky band */
  top: number;
  /** seconds for one full crossing */
  dur: number;
  delay: number;
  dir: 1 | -1;
  len: number;
  o: number;
  hot: boolean;
}

export const TRAFFIC: TrafficLane[] = (() => {
  const rnd = mulberry32(101);
  return Array.from({ length: 14 }, (_, i) => ({
    top: round(6 + rnd() * 62, 1),
    dur: round(9 + rnd() * 16, 1),
    delay: round(rnd() * -22, 1),
    dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
    len: round(18 + rnd() * 52, 1),
    o: round(0.18 + rnd() * 0.5, 2),
    hot: rnd() < 0.3,
  }));
})();

// ─── Rain on the canopy ─────────────────────────────────────────────────────

export interface RainStreak {
  left: number;
  len: number;
  dur: number;
  delay: number;
  o: number;
  drift: number;
}

export const RAIN: RainStreak[] = (() => {
  const rnd = mulberry32(211);
  return Array.from({ length: 72 }, () => ({
    left: round(rnd() * 100, 2),
    len: round(38 + rnd() * 90),
    dur: round(0.5 + rnd() * 0.9, 2),
    delay: round(rnd() * -2.2, 2),
    o: round(0.06 + rnd() * 0.22, 2),
    drift: round(-14 - rnd() * 22),
  }));
})();

export interface Droplet {
  left: number;
  top: number;
  r: number;
  o: number;
}

/** Beads clinging to the glass — in front of everything, softly blurred. */
export const DROPLETS: Droplet[] = (() => {
  const rnd = mulberry32(307);
  return Array.from({ length: 46 }, () => ({
    left: round(rnd() * 100, 2),
    top: round(rnd() * 100, 2),
    r: round(1 + rnd() * 4, 2),
    o: round(0.05 + rnd() * 0.16, 2),
  }));
})();

// ─── Radar ──────────────────────────────────────────────────────────────────

export interface Blip {
  angle: number;
  dist: number;
  size: number;
  delay: number;
}

export const BLIPS: Blip[] = (() => {
  const rnd = mulberry32(401);
  return Array.from({ length: 8 }, () => ({
    angle: round(rnd() * 360, 1),
    dist: round(14 + rnd() * 28, 1),
    size: round(0.9 + rnd() * 1.5, 2),
    delay: round(rnd() * 3.2, 2),
  }));
})();
