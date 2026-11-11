/* ───────────────────────────────────────────────────────────────────────────
   CASE STUDY — the shape every project page fills in.

   Same six sections on every project, in the same order:
     01 Requirements  02 Design  03 Analysis  04 Testing  05 Results  06 Lessons

   Any text can hold [square-bracket placeholders]. They render in the accent
   colour with a dashed underline, so anything still to be written is obvious
   on the page. Replace them with the real thing.
   ─────────────────────────────────────────────────────────────────────────── */

export type CaseSide = "hardware" | "software";

export type SectionKey = "requirements" | "design" | "analysis" | "testing" | "results" | "lessons";

export interface Fact {
  label: string;
  value: string;
}

export interface CaseFigure {
  src: string;
  alt: string;
  caption: string;
  /** CSS object-position, for photos whose subject is off-centre. */
  position?: string;
  /** "blend" for renders on a white background: shown whole, and the white
      drops into the card colour. Leave it off for an ordinary photo. */
  look?: "blend";
}

export interface Requirement {
  need: string;
  target: string;
  why: string;
}

export interface DesignChoice {
  part: string;
  pick: string;
  why: string;
  /** Marks the hard part, drawn in the accent colour. */
  key?: boolean;
}

export interface TestRun {
  id: string;
  name: string;
  detail: string;
  result: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface CaseStudyData {
  /** Must match the project's key in registry.ts. */
  key: string;
  title: string;
  /** e.g. "School · 2024 · Human Powered Flight Research Team" */
  eyebrow: string;
  summary: string;
  facts: Fact[];
  hero: CaseFigure;

  /** Rename a section for this project (MAIIA's "Analysis" is not FEA). */
  labels?: Partial<Record<SectionKey, string>>;

  requirements: { headline: string; rows: Requirement[] };
  design: { headline: string; figure?: CaseFigure; choices: DesignChoice[] };
  /** The signature piece goes above these notes; see CaseStudy's `signature`. */
  analysis: { headline: string; notes: Fact[] };
  testing: { headline: string; tests: TestRun[] };
  results: Stat[];
  /** Titles default to "What broke" and "What I'd do differently". */
  lessons: { broke: string; differently: string; brokeTitle?: string; differentlyTitle?: string };
}
