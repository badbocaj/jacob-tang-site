import type { CaseSide } from "./types";

/* Every Lab project, in the order the Lab lists them. A project gets an `href`
   once its case study page is built; until then prev/next links fall back to
   the Lab itself. */
export const LAB_PROJECTS: { key: string; title: string; side: CaseSide; href?: string }[] = [
  { key: "vital", title: "Pressurization drivetrain", side: "hardware", href: "/projects/vital" },
  { key: "hpfrt", title: "Human-powered flight", side: "hardware", href: "/projects/hpfrt" },
  { key: "lpl", title: "Liquid rocket engine", side: "hardware" },
  { key: "maiia", title: "MAIIA", side: "software" },
  { key: "site", title: "tangjacob.com", side: "software" },
  { key: "pantry", title: "Ingredients Tracker", side: "software" },
];

/** Paths of the built case studies. The nav takes the Lab's colours on these. */
export const CASE_STUDY_PATHS = LAB_PROJECTS.flatMap((p) => (p.href ? [p.href] : []));
