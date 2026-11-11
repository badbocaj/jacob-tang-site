import type { CaseStudyData } from "../types";

/* EDIT ME — the words on /projects/liquid-prop. Assumption to check: the
   components flowed are listed as the engine's valves, injector and nozzles. */
export const LPL: CaseStudyData = {
  key: "lpl",
  title: "Water flow test stand",
  eyebrow: "School · 2024–25 · Liquid Propulsion Lab",
  summary:
    "A student team building a liquid bipropellant hopper vehicle. I worked on WFTS, the water flow test stand that characterizes every engine component with water before anything is fired, and designed its electronic pressure regulator.",

  facts: [
    { label: "Role", value: "Member" },
    { label: "Owned", value: "Flow testing · EPR mechanical design" },
    { label: "Stand", value: "900 psig · 16 gal" },
    { label: "When", value: "2024 – 25" },
    { label: "Tools", value: "Python GUI · MATLAB · NI DAQ" },
  ],

  hero: {
    src: "/projects/lab-lpl-wfts.webp",
    alt: "The water flow test stand: a black steel frame holding tanks, plumbing, pressure gauges and a control laptop",
    caption: "Fig. 01 — WFTS. Nitrogen up top, COPVs in the frame, the catch tank and DAQ below.",
    look: "blend",
  },

  requirements: {
    headline:
      "Prove every valve and injector flows what its datasheet says, before it ever sees propellant.",
    rows: [
      {
        need: "Validate Cv",
        target: "Match the datasheet",
        why: "The engine is sized from datasheet flow coefficients. The stand checks them.",
      },
      {
        need: "Test pressure",
        target: "150 psig, held steady",
        why: "Cv depends on the pressure drop, so it has to be known for the whole flow.",
      },
      {
        need: "Leg one charge",
        target: "Up to 900 psig",
        why: "Pressure available upstream of the valve feeding the first line, so the flow stays sufficiently choked.",
      },
      { need: "Measure the flow", target: "16 gal catch tank", why: "Every run is caught and weighed." },
      { need: "Data", target: "NI DAQ · Python GUI", why: "Logged live, then reduced in MATLAB." },
    ],
  },

  design: {
    headline:
      "Nitrogen pushes water, a tank on four load cells weighs where it lands, and the flow rate falls straight out of the scale.",
    choices: [
      {
        part: "Pressurant",
        pick: "Nitrogen bottle → two COPVs",
        why: "Charge the COPVs from the bottle, close the valve, then flow. Water leaves, the gas expands, and pressure drops.",
      },
      {
        part: "Measurement",
        pick: "Four load cells under the catch tank",
        why: "Mass over time is the mass flow rate, read straight off the scale.",
      },
      {
        part: "Data",
        pick: "NI hardware · Python GUI · MATLAB",
        why: "A custom GUI to run the flow and log it, MATLAB to turn the log into Cv.",
      },
      {
        part: "EPR",
        pick: "Stepper motor + coupler on the valve",
        why: "Opens the valve as the COPVs blow down, to hold the upstream pressure. My mechanical design; the control loop is still open.",
        key: true,
      },
    ],
  },

  analysis: {
    headline: "The scale gives mass flow. One formula turns it into a flow coefficient.",
    notes: [
      { label: "Mass flow", value: "ṁ = dm/dt: the slope of the four load cells, summed." },
      { label: "Specific gravity", value: "SG ≈ 1 for water. It stays in the formula so other fluids work too." },
      { label: "Pass if", value: "The measured Cv matches the component's datasheet." },
    ],
  },

  testing: {
    headline: "Flow every engine component on water first. Water is cheap, safe and forgiving.",
    tests: [
      { id: "T1", name: "Engine valves", detail: "Flowed at 150 psig; Cv against the datasheet.", result: "Flowed" },
      { id: "T2", name: "Injector", detail: "Flowed at 150 psig; Cv against the design value.", result: "Flowed" },
      { id: "T3", name: "Nozzles", detail: "Flowed at 150 psig.", result: "Flowed" },
      {
        id: "T4",
        name: "Electronic pressure regulator",
        detail: "Mechanical design complete; control loop and first test still to come.",
        result: "Waiting",
      },
    ],
  },

  results: [
    { value: "All", label: "Engine components flowed and checked against their datasheets" },
    { value: "150 psig", label: "Test pressure for every component flow" },
    { value: "1", label: "Electronic pressure regulator designed, waiting for its first test" },
  ],

  lessons: {
    brokeTitle: "What it taught me",
    broke:
      "Choked flow, and how water systems actually behave. On paper a flow is a number; on the stand it is a pressure trace that sags the moment the valve opens, which is the whole reason the EPR exists.",
    differentlyTitle: "What's still open",
    differently:
      "The EPR's control loop. The motor, coupler and mount are designed; closing the loop between the transducer and the stepper, and proving it holds 150 psig, is next.",
  },
};
