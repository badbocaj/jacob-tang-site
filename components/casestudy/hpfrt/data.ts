import type { CaseStudyData } from "../types";

/* EDIT ME — the words on /projects/hpfrt. Anything in [square brackets] is
   still to be written and shows up amber on the page until you replace it. */
export const HPFRT: CaseStudyData = {
  key: "hpfrt",
  title: "Human-powered flight",
  eyebrow: "School · 2024 · Human Powered Flight Research Team",
  summary:
    "A student-built airplane that flies on one person's pedaling. I worked on the wing spar and the boom joints, the parts that carry the biggest loads in the airframe.",

  facts: [
    { label: "Role", value: "Structures researcher" },
    { label: "Owned", value: "Wing spar · boom joints" },
    { label: "Team", value: "[N] students" },
    { label: "When", value: "2024 · [months]" },
    { label: "Tools", value: "[CAD · FEA · shop]" },
  ],

  hero: {
    src: "/projects/lab-hpfrt-plane.webp",
    alt: "The team's red and white aircraft parked on a cracked desert lakebed",
    caption: "Fig. 01 — On the lakebed. [Which aircraft is this, and did it fly?]",
    position: "50% 60%",
  },

  requirements: {
    headline: "Every gram gets pedaled, so the structure has to be just strong enough and not one gram more.",
    rows: [
      { need: "Carry flight loads", target: "[X g at Y kg]", why: "The spar is the backbone. If it goes, the wing folds." },
      { need: "Mass budget", target: "[≤ X g per joint]", why: "One pilot's legs are the whole power plant." },
      { need: "Stiffness", target: "[tip deflection ≤ X mm]", why: "A floppy wing twists and loses lift." },
      { need: "Buildable", target: "[hand layup, student shop]", why: "Students build it, so it has to be buildable twice." },
    ],
  },

  design: {
    headline: "[One sentence: the design idea in plain words.]",
    figure: {
      src: "/projects/hpfrt-rib-build.webp",
      alt: "Jacob gluing ribs onto a wing section on a shop bench",
      caption: "Fig. 02 — Building a wing section, one rib at a time.",
      position: "50% 70%",
    },
    choices: [
      { part: "Spar", pick: "[material · layup]", why: "[Why this over the alternative.]" },
      { part: "Ribs", pick: "[material · spacing]", why: "[Why.]" },
      { part: "Boom joint", pick: "[how wing meets boom]", why: "[The hard part, and why.]", key: true },
    ],
  },

  analysis: {
    headline:
      "Lift spreads along the wing, but the bending piles up at the root, right where the boom joint sits.",
    notes: [
      { label: "Method", value: "[Hand calcs → FEA in ___]" },
      { label: "Predicted tip deflection", value: "[X mm]" },
      { label: "What it flagged", value: "[The surprise the analysis caught]" },
    ],
  },

  testing: {
    headline: "Break the small pieces on purpose before the big one breaks by accident.",
    tests: [
      { id: "T1", name: "Joint coupon", detail: "[Setup · pass if ___]", result: "[Pass / Fail]" },
      { id: "T2", name: "Wing section proof load", detail: "[Setup · pass if ___]", result: "[Pass / Fail]" },
      { id: "T3", name: "Lakebed flight", detail: "[What you were checking]", result: "[Result]" },
    ],
  },

  results: [
    { value: "[X g]", label: "Joint mass, [X% lighter than ___]" },
    { value: "[X×]", label: "Load held in proof test without failure" },
    { value: "[N]", label: "[Flights / builds / something countable]" },
  ],

  lessons: {
    broke: "[The failure, specific: what, when, how you found out.]",
    differently: "[The change, and what it would have saved.]",
  },
};

/** Load cases for the bending chart. `scale` is the peak relative to the
    largest case; `peak` is the root bending moment to print. */
export const HPFRT_LOAD_CASES = [
  { key: "cruise", label: "1 g · cruise", scale: 0.42, peak: "[Y N·m]" },
  { key: "limit", label: "[N] g · limit", scale: 1, peak: "[X N·m]" },
];
