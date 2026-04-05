"use client";

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT REGISTRY
// EDIT: Add/remove projects here. Keep CURRENT_IDX pointing at MAIIA (0).
// ─────────────────────────────────────────────────────────────────────────────

const ALL_PROJECTS = [
  { id: "ARCHIVE_01", codename: "MAIIA",       href: "/projects/maiia" },
  { id: "ARCHIVE_02", codename: "HPFRT",       href: "/projects/hpfrt" },
  { id: "ARCHIVE_03", codename: "LIQUID_PROP", href: "/projects/liquid-prop" },
] as const;

const CURRENT_IDX = 0;

// ─────────────────────────────────────────────────────────────────────────────
// MAIIA DATA
// EDIT: Replace all placeholder values below with your actual project content.
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT = {
  archiveId: "ARCHIVE_01",
  codename:  "MAIIA",
  subtitle:  "// REPLACE_WITH_YOUR_PROJECT_SUBTITLE",
  status:    "FILED :: 2024",

  // ── Column 1: Mission Objectives ──────────────────────────────────────────
  summary:
    "MAIIA is a [one-sentence description of the core system or device]. " +
    "Developed at [lab / team / org] in [year], the objective was to [what " +
    "problem it solved or what capability it demonstrated]. The central " +
    "technical challenge: [the hard part — what made this non-trivial].",

  specs: [
    { param: "FUNCTION",   value: "REPLACE",     unit: "—"     },
    { param: "PARAM_A",    value: "—",            unit: "UNIT"  },
    { param: "PARAM_B",    value: "—",            unit: "UNIT"  },
    { param: "PARAM_C",    value: "—",            unit: "UNIT"  },
    { param: "PARAM_D",    value: "—",            unit: "UNIT"  },
    { param: "MATERIAL",   value: "REPLACE",      unit: "—"     },
    { param: "MASS",       value: "—",            unit: "g"     },
    { param: "STATUS",     value: "COMPLETE",     unit: "—"     },
  ],

  // ── Column 2: Technical Schematics ───────────────────────────────────────
  schematics: [
    {
      label:   "FIG_01 :: MAIN_SYSTEM_VIEW",
      callout: "> REPLACE_WITH_TECHNICAL_CALLOUT_FOR_FIGURE_ONE",
      // src: "/images/maiia-main.png",  ← uncomment and add your image
    },
    {
      label:   "FIG_02 :: DETAIL_CROSS_SECTION",
      callout: "> REPLACE_WITH_TECHNICAL_CALLOUT_FOR_FIGURE_TWO",
      // src: "/images/maiia-detail.png",
    },
  ],

  // ── Column 3: Post-Mission Analysis ──────────────────────────────────────
  results: [
    { sym: ">", text: "Primary outcome — what was proven or demonstrated by this project." },
    { sym: ">", text: "Secondary technical finding — a specific system-level result." },
    { sym: "+", text: "METRIC_A: — [quantitative result with units and brief context]" },
    { sym: "+", text: "METRIC_B: — [another measured or calculated outcome]" },
    { sym: ">", text: "Lessons learned, unexpected outcomes, or defined next iteration." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const C  = "#00FFFF";          // full cyan
const C5 = "rgba(0,255,255,0.5)";
const C3 = "rgba(0,255,255,0.3)";
const C2 = "rgba(0,255,255,0.2)";
const C1 = "rgba(0,255,255,0.1)";

const prevProject = ALL_PROJECTS[(CURRENT_IDX - 1 + ALL_PROJECTS.length) % ALL_PROJECTS.length];
const nextProject = ALL_PROJECTS[(CURRENT_IDX + 1) % ALL_PROJECTS.length];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Top-of-column section label with a trailing rule line */
function ColHeader({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="font-mono text-[9px] tracking-[0.3em] shrink-0"
        style={{ color: C3 }}
      >
        {id}
      </span>
      <span
        className="font-mono text-[11px] font-bold tracking-[0.2em] shrink-0"
        style={{ color: C }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C2 }} />
    </div>
  );
}

/** Targeting-bracket corners — place inside a `relative` container */
function TargetCorners({ opacity = 0.45 }: { opacity?: number }) {
  const style = {
    borderColor: `rgba(0,255,255,${opacity})`,
  } as React.CSSProperties;
  return (
    <>
      <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={style} />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={style} />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={style} />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={style} />
    </>
  );
}

/** Blueprint-grid image placeholder. Pass src once you have real images. */
function Schematic({
  label,
  callout,
  src,
}: {
  label: string;
  callout: string;
  src?: string;
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: "16 / 9",
        border: `1px solid ${C2}`,
        background: "#000",
      }}
    >
      {src ? (
        // Real image
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <>
          {/* Blueprint grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(${C1} 1px, transparent 1px),
                linear-gradient(90deg, ${C1} 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-8 h-8">
              <div
                className="absolute left-1/2 top-0 bottom-0 w-px"
                style={{ background: C2 }}
              />
              <div
                className="absolute top-1/2 left-0 right-0 h-px"
                style={{ background: C2 }}
              />
              <div
                className="absolute inset-[30%] border"
                style={{ borderColor: C2 }}
              />
            </div>
          </div>

          {/* Awaiting-asset label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-mono text-[10px] tracking-[0.35em] uppercase"
              style={{ color: C2 }}
            >
              [ AWAITING_ASSET ]
            </span>
          </div>
        </>
      )}

      {/* Targeting brackets */}
      <TargetCorners />

      {/* Figure label — top left */}
      <div
        className="absolute top-4 left-7 font-mono text-[8px] tracking-widest"
        style={{ color: C3 }}
      >
        {label}
      </div>

      {/* Callout strip — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-2"
        style={{
          background: "rgba(0,0,0,0.8)",
          borderTop: `1px solid ${C2}`,
        }}
      >
        <span
          className="font-mono text-[9px] tracking-wider"
          style={{ color: C5 }}
        >
          {callout}
        </span>
      </div>
    </div>
  );
}

/** Spec table row — highlights with scanline on hover */
function SpecRow({
  param,
  value,
  unit,
}: {
  param: string;
  value: string;
  unit: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="grid grid-cols-[1fr_1fr] transition-colors duration-75"
      style={{
        borderBottom: `1px solid ${C1}`,
        background: hovered
          ? "rgba(0,255,255,0.06)"
          : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Scanline texture shows on hover */}
      <div
        className="px-3 py-2 font-mono text-[10px] tracking-widest transition-colors"
        style={{
          color: hovered ? C5 : C3,
          borderRight: `1px solid ${C1}`,
          backgroundImage: hovered
            ? `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,255,255,0.025) 2px,
                rgba(0,255,255,0.025) 4px
              )`
            : "none",
        }}
      >
        {param}
      </div>
      <div
        className="px-3 py-2 font-mono text-[10px] tracking-widest flex justify-between"
        style={{
          color: C,
          backgroundImage: hovered
            ? `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,255,255,0.025) 2px,
                rgba(0,255,255,0.025) 4px
              )`
            : "none",
        }}
      >
        <span>{value}</span>
        <span style={{ color: C3 }}>{unit}</span>
      </div>
    </div>
  );
}

/** Navigation arrow with hover glow */
function NavArrow({
  href,
  direction,
}: {
  href: string;
  direction: "prev" | "next";
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="font-mono text-sm tracking-widest select-none transition-all duration-150"
      style={{
        color: hovered ? C : C3,
        textShadow: hovered
          ? `0 0 10px ${C}, 0 0 22px rgba(0,255,255,0.45)`
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {direction === "prev" ? "[ < ]" : "[ > ]"}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function MaiiaPage() {
  return (
    <div className="min-h-screen font-mono" style={{ background: "#000", color: C }}>

      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <header
        className="fixed top-16 left-0 right-0 z-50 flex items-center h-14"
        style={{
          background: "#000",
          borderBottom: `1px solid ${C2}`,
        }}
      >
        {/* Left: site breadcrumb */}
        <div className="w-[22%] px-5 shrink-0">
          <Link
            href="/projects"
            className="text-[9px] tracking-[0.3em] transition-colors duration-150 hover:opacity-100"
            style={{ color: C3 }}
          >
            ← PROJECTS
          </Link>
        </div>

        {/* Center: project selector */}
        <div className="flex-1 flex items-center justify-center gap-5">
          <NavArrow href={prevProject.href} direction="prev" />

          <div className="flex flex-col items-center">
            <span
              className="text-[8px] tracking-[0.35em] leading-none mb-0.5"
              style={{ color: C3 }}
            >
              {PROJECT.archiveId}
            </span>
            <span
              className="text-sm font-bold tracking-[0.3em] leading-none"
              style={{ color: C }}
            >
              {PROJECT.codename}
            </span>
          </div>

          <NavArrow href={nextProject.href} direction="next" />
        </div>

        {/* Right: status indicators */}
        <div
          className="w-[22%] px-5 flex items-center justify-end gap-4 shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: C }}
            />
            <span
              className="text-[9px] tracking-widest hidden sm:block"
              style={{ color: C3 }}
            >
              {PROJECT.status}
            </span>
          </div>
        </div>
      </header>

      {/* ── Subtitle bar ──────────────────────────────────────────────────── */}
      <div
        className="fixed top-[7.5rem] left-0 right-0 z-40 px-5 py-1.5 flex items-center"
        style={{
          background: "#000",
          borderBottom: `1px solid ${C1}`,
        }}
      >
        <span
          className="text-[9px] tracking-[0.3em]"
          style={{ color: C2 }}
        >
          {PROJECT.subtitle}
        </span>
      </div>

      {/* ── Main content — offset below both bars ──────────────────────────── */}
      <main className="pt-[calc(4rem+3.5rem+1.75rem)] min-h-screen">

        {/* 3-column grid */}
        <div
          className="grid gap-px grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)_minmax(0,1fr)]"
          style={{ background: C1 }}  /* gap fills with faint cyan line */
        >

          {/* ── COLUMN 1: MISSION_OBJECTIVES ─────────────────────────────── */}
          <section
            className="p-5 lg:p-6 flex flex-col gap-6"
            style={{ background: "#000" }}
          >
            <ColHeader id="COL_01" label="MISSION_OBJECTIVES" />

            {/* Summary */}
            <div>
              <div
                className="text-[9px] tracking-[0.3em] mb-3"
                style={{ color: C3 }}
              >
                // BRIEF
              </div>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "rgba(0,255,255,0.72)" }}
              >
                {PROJECT.summary}
              </p>
            </div>

            {/* Spec table */}
            <div>
              <div
                className="text-[9px] tracking-[0.3em] mb-3"
                style={{ color: C3 }}
              >
                // SPEC_TABLE
              </div>
              <div
                className="overflow-hidden"
                style={{ border: `1px solid ${C2}` }}
              >
                {PROJECT.specs.map((row) => (
                  <SpecRow
                    key={row.param}
                    param={row.param}
                    value={row.value}
                    unit={row.unit}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── COLUMN 2: TECHNICAL_SCHEMATICS ───────────────────────────── */}
          <section
            className="p-5 lg:p-6 flex flex-col gap-6"
            style={{ background: "#000" }}
          >
            <ColHeader id="COL_02" label="TECHNICAL_SCHEMATICS" />

            {PROJECT.schematics.map((s) => (
              <Schematic
                key={s.label}
                label={s.label}
                callout={s.callout}
              />
            ))}

            {/* Technical note */}
            <div
              className="text-[10px] leading-relaxed"
              style={{ color: C2 }}
            >
              <span style={{ color: C3 }}>{"// NOTE :: "}</span>
              Replace schematic placeholders by adding a{" "}
              <code style={{ color: C5 }}>src</code> prop to each{" "}
              <code style={{ color: C5 }}>{"<Schematic />"}</code> once your
              renders or photos are ready.
            </div>
          </section>

          {/* ── COLUMN 3: POST_MISSION_ANALYSIS ──────────────────────────── */}
          <section
            className="p-5 lg:p-6 flex flex-col gap-6"
            style={{ background: "#000" }}
          >
            <ColHeader id="COL_03" label="POST_MISSION_ANALYSIS" />

            {/* Results list */}
            <div>
              <div
                className="text-[9px] tracking-[0.3em] mb-4"
                style={{ color: C3 }}
              >
                // OUTCOMES
              </div>
              <ul className="space-y-4">
                {PROJECT.results.map((r, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span
                      className="shrink-0 text-sm font-bold mt-px"
                      style={{ color: C }}
                    >
                      {r.sym}
                    </span>
                    <span
                      className="text-[12px] leading-relaxed"
                      style={{ color: "rgba(0,255,255,0.72)" }}
                    >
                      {r.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: C1 }} />

            {/* Links placeholder */}
            <div>
              <div
                className="text-[9px] tracking-[0.3em] mb-3"
                style={{ color: C3 }}
              >
                // EXTERNAL_LINKS
              </div>
              <div className="space-y-2">
                {[
                  { label: "GITHUB_REPO",  href: "#" },
                  { label: "FULL_WRITEUP", href: "#" },
                  { label: "CAD_FILES",    href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 group text-[10px] tracking-widest transition-colors duration-100"
                    style={{ color: C3 }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = C)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = C3)
                    }
                  >
                    <span>{"→"}</span>
                    <span>{link.label}</span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: C1 }}
                    />
                    <span style={{ color: C2 }}>{"[LINK]"}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Bottom status bar ─────────────────────────────────────────────── */}
        <footer
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: `1px solid ${C2}`, background: "#000" }}
        >
          <span className="text-[9px] tracking-[0.3em]" style={{ color: C3 }}>
            JACOB_TANG :: {PROJECT.archiveId} // {PROJECT.codename}
          </span>
          <div className="flex items-center gap-6">
            {ALL_PROJECTS.map((p, i) => (
              <Link
                key={p.id}
                href={p.href}
                className="text-[9px] tracking-widest transition-colors duration-100"
                style={{ color: i === CURRENT_IDX ? C : C2 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = C)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    i === CURRENT_IDX ? C : C2)
                }
              >
                {p.id}
              </Link>
            ))}
          </div>
          <span className="text-[9px] tracking-widest" style={{ color: C2 }}>
            ALL_SYSTEMS_NOMINAL
          </span>
        </footer>
      </main>
    </div>
  );
}
