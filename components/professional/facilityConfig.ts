// ─────────────────────────────────────────────────────────────────────────────
// FACILITY CONFIG
// Four jobs, four missions in the service record. Everything that has to agree
// between the debrief, the scenes and the sketch cards lives here.
// ─────────────────────────────────────────────────────────────────────────────

/** Interior width of a room, in scene units. */
export const ROOM_W = 1200;
/** Full height of a room, slab included. */
export const ROOM_H = 620;
/** The line every stick figure stands on. */
export const FLOOR_Y = 545;

export type SceneKey = "vital" | "l3" | "curve" | "aim";

/** Ceiling of the usable interior. */
export const CEIL_Y = 58;

/** Where Jacob stands in each panel. The speech bubble hangs off his head. */
export const JACOB_X: Record<SceneKey, number> = {
  aim: 1000,
  curve: 1010,
  l3: 1000,
  vital: 1000,
};
/** Top of his hair, in scene units — the bubble's tail points here. */
export const HEAD_TOP_Y = FLOOR_Y - 240;

export interface Job {
  key: SceneKey;
  company: string;
  title: string;
  period: string;
  location: string;
  hook: string;
  /** One line: what the team was trying to do. */
  objective: string;
  /** Two or three bullets: what Jacob built, tested or fixed. */
  did: string[];
  /** Software, equipment and methods used. */
  tools: string[];
  /** What the panel shows, for screen readers. */
  room: string;
}

/**
 * Stand-in debrief copy. Replace `...TODO_DEBRIEF` on each job below with that
 * job's own `objective`, `did` and `tools`.
 */
const TODO_DEBRIEF: Pick<Job, "objective" | "did" | "tools"> = {
  objective: "[One line: what the team was trying to do]",
  did: [
    "[What you built or tested, with a number]",
    "[The hardest problem and how you solved it]",
    "[The result: what changed because of you]",
  ],
  tools: ["[Tool]", "[Tool]", "[Method]"],
};

/**
 * Chronological — mission 01 is the earliest job and the last entry is current.
 * The service record numbers them from this order and lists newest first.
 */
export const JOBS: Job[] = [
  {
    key: "aim",
    company: "AIM Lab @ UH",
    title: "Structures Researcher",
    period: "May 2024 – Aug 2024",
    location: "Houston, TX",
    hook: "Vibe-Researching",
    ...TODO_DEBRIEF,
    room: "Shaker Lab",
  },
  {
    key: "curve",
    company: "CURVE @ USC",
    title: "Researcher",
    period: "Aug 2024 – May 2025",
    location: "Los Angeles, CA",
    hook: "Found solutions for LA traffic by secondhand experience.",
    ...TODO_DEBRIEF,
    room: "Traffic Control",
  },
  {
    key: "l3",
    company: "L3Harris",
    title: "Quality Engineering Intern",
    period: "May 2025 – Aug 2025",
    location: "Clifton, NJ",
    hook: "Made the electronic warfare systems conform",
    ...TODO_DEBRIEF,
    room: "Inspection Line",
  },
  {
    key: "vital",
    company: "Vital Lyfe",
    title: "Mechanical Engineering Intern",
    period: "Jan 2026 – Present",
    location: "Torrance, CA",
    hook: "Solving the water crisis, clearly didn't solve traffic",
    ...TODO_DEBRIEF,
    room: "Filtration Bay",
  },
];
