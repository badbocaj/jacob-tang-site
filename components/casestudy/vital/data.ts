import type { CaseStudyData } from "../types";

/* EDIT ME — the words on /projects/vital. Taken from the drivetrain review
   deck (July 2026). The deck's values are already simplified and
   de-identified for IP: pressures, displacements and materials are
   representative, and the margins are percentages with the absolute values
   withheld. Keep it that way here. */
export const VITAL: CaseStudyData = {
  key: "vital",
  title: "Pressurization drivetrain",
  eyebrow: "Work · 2026 · Vital Lyfe",
  summary:
    "Cradle-to-grave ownership of the high-pressure pump drivetrain in a portable, battery-powered desalinator: seawater in, drinking water out. Requirements, design and analysis, build, and activation.",

  facts: [
    { label: "Role", value: "Mechanical engineering intern" },
    { label: "Owned", value: "Pump & motor brackets · torque-to-pressure assembly · test rig" },
    { label: "Team", value: "High pressure" },
    { label: "When", value: "Jan – Aug 2026" },
    { label: "Tools", value: "Siemens NX · FEA · Excel" },
  ],

  hero: {
    src: "/projects/lab-vital-drivetrain.webp",
    alt: "Cutaway render of the portable watermaker, with the high-pressure pump, membrane housing and sensors labelled",
    caption: "Fig. 01 — The unit. My work is the high-pressure group on the right: motor, brackets and pump as one vertical column.",
    position: "50% 52%",
  },

  requirements: {
    headline:
      "Make 50 to 100 bar from a battery, hold it still to within a millimetre, and survive two years of seawater.",
    rows: [
      { need: "Pressure", target: "50 – 100 bar", why: "Reverse osmosis on seawater needs it; 725 to 1450 psi." },
      { need: "Flow", target: "50 – 100 LPH", why: "Drinking water at the point of need, about 13 to 26 gallons an hour." },
      {
        need: "Bracket deflection",
        target: "≤ 1 mm, any direction",
        why: "More misaligns the drivetrain and pushes bending into the joints next door.",
      },
      {
        need: "Static load",
        target: "No yield",
        why: "Motor ≈ 5 lb, wetted pressure vessel ≈ 7 lb, plus handling loads through the enclosure.",
      },
      {
        need: "Environment",
        target: "−20 to 60 °C · 2 years · 35 g/L",
        why: "Drives material choice, creep, thermal mismatch and corrosion.",
      },
      { need: "Rate", target: "Modular · no hand fitting", why: "Built overseas at more than 60 units an hour." },
    ],
  },

  design: {
    headline:
      "Every choice went through a trade study, and the winner was usually the one that made the next revision cheaper.",
    figure: {
      src: "/projects/vital-bracket.webp",
      alt: "Render of the green pump and motor bracket with its four screw holes and the pump locating features marked",
      caption:
        "Fig. 02 — One symmetric bracket, used twice and mirrored back to back. Locating features first, then the clearance-hole stackup.",
      look: "blend",
    },
    choices: [
      {
        part: "Bracket material",
        pick: "Glass-filled plastic",
        why: "Aluminium-class strength after moisture and heat, stiff enough once ribbed, cheapest at volume. New features are a mould change, not a redesign.",
      },
      {
        part: "Joint",
        pick: "Molded-in inserts",
        why: "Plastic bosses creep and shed clamp load. Inserts keep the most preload after two years.",
      },
      {
        part: "Pistons",
        pick: "Ceramic",
        why: "Far harder than steel against the seal and inert in seawater. Brittle, but a piston only sees compression.",
      },
      {
        part: "Stroke",
        pick: "Shorter stroke, run faster",
        why: "Keeps torque and current inside a commodity motor band. The cheapest way to hit flow, paid for in seal and bearing wear.",
        key: true,
      },
    ],
  },

  analysis: {
    headline: "Hand calc first, then FEA, at 80 g. Stress was never the problem. Deflection was.",
    notes: [
      {
        label: "Design load",
        value: "80 g: 40 g shock × dynamic factor 2. About 400 lbf at the motor and 560 lbf at the vessel.",
      },
      { label: "Safety factor", value: "1.25 on every case. Margins shown, absolute values withheld." },
      {
        label: "What it changed",
        value: "±Y deflection missed the 1 mm budget and drove the rib layout. End-of-life creep drove the inserts.",
      },
    ],
  },

  testing: {
    headline: "Build the rig before you feel ready: it put real numbers against the analysis.",
    tests: [
      { id: "T1", name: "Cavitation", detail: "Suction conditions swept until inception.", result: "Characterized" },
      { id: "T2", name: "Flow rate", detail: "Measured against predicted displacement.", result: "Characterized" },
      {
        id: "T3",
        name: "Performance at pressure",
        detail: "Components tested in high and low pressure.",
        result: "Characterized",
      },
      {
        id: "T4",
        name: "Stall torque",
        detail: "Loaded to stall to find the true torque ceiling.",
        result: "Motor re-specced",
      },
      {
        id: "T5",
        name: "Drop and creep",
        detail: "Runs after my internship; rig, test plan and open margins written up.",
        result: "Handed over",
      },
    ],
  },

  results: [
    { value: "15%", label: "Of the unit's bill of materials designed by me, requirements through activation" },
    { value: "60 UPH", label: "Assembles at rate: top-down, one part number for both brackets" },
    { value: "4", label: "Programs carried by one test rig: controls, EMI, flow sensors, membranes" },
    { value: "−1 lb", label: "Up to a pound out of the assembly once the motor was sized to measured torque" },
  ],

  lessons: {
    broke:
      "Three assumptions. Bearing seats are not just press fits: the bearing deforms and loses internal clearance. Clearance does not settle a stack: four stacked parts can sit anywhere in the window, and creep walks them further. And press-fit is not always the cheap option: at rate, the press cell, fixturing and scrapped parts cost more.",
    differently:
      "Run the worst-case stack first, locate on features, and size clearance from the result. Check assumptions with the manufacturer before closing off alternatives. Test earlier than I feel ready to. And design for the operation, not the part: rate is a requirement.",
  },
};
