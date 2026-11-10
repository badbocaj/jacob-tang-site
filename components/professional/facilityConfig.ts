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
 * Chronological — mission 01 is the earliest job and the last entry is current.
 * The service record numbers them from this order and lists newest first.
 */
export const JOBS: Job[] = [
  {
    key: "curve",
    company: "CURVE @ USC",
    title: "Researcher",
    period: "Aug 2023 – May 2024",
    location: "Los Angeles, CA",
    hook: "Found solutions for LA traffic by secondhand experience.",
    objective: "Develop an algorithm for utilitarian surge toll pricing.",
    did: [
      "Developed a program to run user studies on fair-pricing intuition",
      "Identified pattern deltas between optimal and user-chosen pricing",
      "Presented findings to 200+ people at a symposium",
    ],
    tools: ["Python"],
    room: "Traffic Control",
  },
  {
    key: "aim",
    company: "AIM Lab @ UH",
    title: "Structures Researcher",
    period: "May 2024 – Aug 2024",
    location: "Houston, TX",
    hook: "Vibe-Researching",
    objective:
      "Determine how thickness-altering manufacturing imperfections influence structural integrity.",
    did: [
      "Built a machine to deform plastic domes acoustically",
      "Modeled thickness differences in an Abaqus vibration analysis",
      "Reconstructed the domes with a CT scanner",
    ],
    tools: ["Abaqus", "FEA", "Prototyping"],
    room: "Shaker Lab",
  },
  {
    key: "l3",
    company: "L3Harris",
    title: "Quality Engineering Intern",
    period: "May 2025 – Aug 2025",
    location: "Clifton, NJ",
    hook: "Made the electronic warfare systems conform",
    objective: "Proof the electronic warfare boards.",
    did: [
      "Resolved non-conformances on boards and found long-term fixes",
      "Moved the team onto Confluence so documentation lived in one place",
      "Performed FAIs and served as the supplier's point of contact",
    ],
    tools: ["Electronics manufacturing", "FRACAS", "Confluence"],
    room: "Inspection Line",
  },
  {
    key: "vital",
    company: "Vital Lyfe",
    title: "Mechanical Engineering Intern",
    period: "Jan 2026 – Present",
    location: "Torrance, CA",
    hook: "Solving the water crisis",
    objective: "Build a portable watermaker that can be manufactured at rate.",
    did: [
      "Designed, built, and tested injection-molded brackets",
      "Sized the pump drivetrain pressurization system",
      "Built a scrappy test rig prototype before real units arrived",
    ],
    tools: ["Siemens NX", "Excel", "Claude"],
    room: "Filtration Bay",
  },
];
