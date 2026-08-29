// ─────────────────────────────────────────────────────────────────────────────
// FACILITY CONFIG
// The four jobs are four rooms of one building, shown as four comic panels.
// Everything that has to agree between the panels, the scenes and the captions
// lives here.
// ─────────────────────────────────────────────────────────────────────────────

/** Interior width of a room, in scene units. */
export const ROOM_W = 1200;
/** Full height of a room, slab included. */
export const ROOM_H = 620;
/** The line every stick figure stands on. */
export const FLOOR_Y = 545;
/** Ceiling of the usable interior. */
export const CEIL_Y = 58;

export type SceneKey = "vital" | "l3" | "curve" | "aim";

export interface Job {
  key: SceneKey;
  company: string;
  title: string;
  period: string;
  location: string;
  hook: string;
  description: string;
  /** Room name within the facility. */
  room: string;
}

/**
 * Chronological — a strip is read as a sequence, so panel 1 is the earliest job
 * and panel 4 is current. Reverse this array to show newest first instead.
 */
export const JOBS: Job[] = [
  {
    key: "aim",
    company: "AIM Lab @ UH",
    title: "Structures Researcher",
    period: "May 2024 – Aug 2024",
    location: "Houston, TX",
    hook: "Vibe-Researching",
    description: "Placeholder — replace with your full role description.",
    room: "Shaker Lab",
  },
  {
    key: "curve",
    company: "CURVE @ USC",
    title: "Researcher",
    period: "Aug 2024 – May 2025",
    location: "Los Angeles, CA",
    hook: "Found solutions for LA traffic by secondhand experience.",
    description: "Placeholder — replace with your full role description.",
    room: "Traffic Control",
  },
  {
    key: "l3",
    company: "L3Harris",
    title: "Quality Engineering Intern",
    period: "May 2025 – Aug 2025",
    location: "Clifton, NJ",
    hook: "Made the electronic warfare systems conform",
    description: "Placeholder — replace with your full role description.",
    room: "Inspection Line",
  },
  {
    key: "vital",
    company: "Vital Lyfe",
    title: "Mechanical Engineering Intern",
    period: "Jan 2026 – Present",
    location: "Torrance, CA",
    hook: "Solving the water crisis, clearly didn't solve traffic",
    description: "Placeholder — replace with your full role description.",
    room: "Filtration Bay",
  },
];

/** Amber, same accent as the travel log — one colour for the whole facility. */
export const ACCENT = "#f59e0b";

/** Semantic colours. Used only where the content needs them to read at all. */
export const TONE = {
  dirty: "#8a6134",
  clean: "#67d4e8",
  pass: "#4ade80",
  stop: "#ef4444",
};
