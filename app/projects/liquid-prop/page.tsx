"use client";

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT REGISTRY — keep this identical across all project pages
// ─────────────────────────────────────────────────────────────────────────────

const ALL_PROJECTS = [
  { id: "ARCHIVE_01", codename: "MAIIA",       href: "/projects/maiia" },
  { id: "ARCHIVE_02", codename: "HPFRT",       href: "/projects/hpfrt" },
  { id: "ARCHIVE_03", codename: "LIQUID_PROP", href: "/projects/liquid-prop" },
] as const;

const CURRENT_IDX = 2; // LIQUID_PROP is index 2

// ─────────────────────────────────────────────────────────────────────────────
// LIQUID_PROP DATA
// EDIT: Replace placeholder values with your actual project data.
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT = {
  archiveId: "ARCHIVE_03",
  codename:  "LIQUID_PROP",
  subtitle:  "// BIPROPELLANT_ENGINE_DESIGN_AND_HOTFIRE_TESTING",
  status:    "ACTIVE :: 2024–25",

  // ── Column 1: Mission Objectives ──────────────────────────────────────────
  summary:
    "A student-designed liquid bipropellant rocket engine targeting a " +
    "500 N thrust class, using LOX and ethanol as the propellant combination. " +
    "Built as part of a university propulsion team, the objective was to design, " +
    "manufacture, and hot-fire test a regeneratively cooled engine from scratch. " +
    "The hard part: getting the injector acoustics and chamber cooling " +
    "right before anything gets near a test stand.",

  specs: [
    { param: "ENGINE_TYPE",      value: "BIPROPELLANT",  unit: "—"    },
    { param: "PROPELLANTS",      value: "LOX / EtOH",    unit: "—"    },
    { param: "THRUST",           value: "~500",          unit: "N"    },
    { param: "CHAMBER_PRESSURE", value: "~150",          unit: "psi"  },
    { param: "SPECIFIC_IMPULSE", value: "~280",          unit: "s"    },
    { param: "THROAT_DIA",       value: "~15",           unit: "mm"   },
    { param: "COOLING",          value: "REGEN",         unit: "—"    },
    { param: "MATERIAL",         value: "C110 / 316L",   unit: "—"    },
    { param: "MASS",             value: "~2500",         unit: "g"    },
    { param: "STATUS",           value: "IN_PROGRESS",   unit: "—"    },
  ],

  // ── Column 2: Technical Schematics ───────────────────────────────────────
  schematics: [
    {
      label:   "FIG_01 :: INJECTOR_ASSEMBLY",
      callout: "> UNLIKE_LIKE_IMPINGING_ELEMENT_PATTERN // 12x DOUBLET_PAIRS",
      // src: "/images/liquid-prop-injector.png",
    },
    {
      label:   "FIG_02 :: CHAMBER_NOZZLE_CROSS_SECTION",
      callout: "> REGEN_COOLING_CHANNELS // COPPER_LINER + SS_JACKET",
      // src: "/images/liquid-prop-chamber.png",
    },
  ],

  // ── Column 3: Post-Mission Analysis ──────────────────────────────────────
  results: [
    { sym: ">", text: "Injector design iterated across 3 orifice configurations to hit target mixture ratio of O/F = 1.3." },
    { sym: ">", text: "Regenerative cooling channel geometry sized to keep copper liner below 500°C at full thrust." },
    { sym: "+", text: "CHAMBER_L*: 1.14 m — meets minimum residence time for complete combustion at target pressure." },
    { sym: "+", text: "THROAT_AREA: 177 mm² — derived from target thrust and chamber pressure via Isp–Cf trade." },
    { sym: ">", text: "Cold-flow testing of the injector element completed. Hot-fire scheduled for next semester." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const C  = "#00FFFF";
const C5 = "rgba(0,255,255,0.5)";
const C3 = "rgba(0,255,255,0.3)";
const C2 = "rgba(0,255,255,0.2)";
const C1 = "rgba(0,255,255,0.1)";

const prevProject = ALL_PROJECTS[(CURRENT_IDX - 1 + ALL_PROJECTS.length) % ALL_PROJECTS.length];
const nextProject = ALL_PROJECTS[(CURRENT_IDX + 1) % ALL_PROJECTS.length];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (identical to MAIIA page)
// ─────────────────────────────────────────────────────────────────────────────

function ColHeader({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-[9px] tracking-[0.3em] shrink-0" style={{ color: C3 }}>
        {id}
      </span>
      <span className="font-mono text-[11px] font-bold tracking-[0.2em] shrink-0" style={{ color: C }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: C2 }} />
    </div>
  );
}

function TargetCorners({ opacity = 0.45 }: { opacity?: number }) {
  const style = { borderColor: `rgba(0,255,255,${opacity})` } as React.CSSProperties;
  return (
    <>
      <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={style} />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={style} />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={style} />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={style} />
    </>
  );
}

function Schematic({ label, callout, src }: { label: string; callout: string; src?: string }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ aspectRatio: "16 / 9", border: `1px solid ${C2}`, background: "#000" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <>
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
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-8 h-8">
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: C2 }} />
              <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: C2 }} />
              <div className="absolute inset-[30%] border" style={{ borderColor: C2 }} />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] tracking-[0.35em] uppercase" style={{ color: C2 }}>
              [ AWAITING_ASSET ]
            </span>
          </div>
        </>
      )}

      <TargetCorners />

      <div className="absolute top-4 left-7 font-mono text-[8px] tracking-widest" style={{ color: C3 }}>
        {label}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 py-2"
        style={{ background: "rgba(0,0,0,0.8)", borderTop: `1px solid ${C2}` }}
      >
        <span className="font-mono text-[9px] tracking-wider" style={{ color: C5 }}>
          {callout}
        </span>
      </div>
    </div>
  );
}

function SpecRow({ param, value, unit }: { param: string; value: string; unit: string }) {
  const [hovered, setHovered] = useState(false);
  const scanline = hovered
    ? `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.025) 2px, rgba(0,255,255,0.025) 4px)`
    : "none";
  return (
    <div
      className="grid grid-cols-[1fr_1fr] transition-colors duration-75"
      style={{ borderBottom: `1px solid ${C1}`, background: hovered ? "rgba(0,255,255,0.06)" : "transparent" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="px-3 py-2 font-mono text-[10px] tracking-widest transition-colors"
        style={{ color: hovered ? C5 : C3, borderRight: `1px solid ${C1}`, backgroundImage: scanline }}
      >
        {param}
      </div>
      <div
        className="px-3 py-2 font-mono text-[10px] tracking-widest flex justify-between"
        style={{ color: C, backgroundImage: scanline }}
      >
        <span>{value}</span>
        <span style={{ color: C3 }}>{unit}</span>
      </div>
    </div>
  );
}

function NavArrow({ href, direction }: { href: string; direction: "prev" | "next" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      className="font-mono text-sm tracking-widest select-none transition-all duration-150"
      style={{
        color: hovered ? C : C3,
        textShadow: hovered ? `0 0 10px ${C}, 0 0 22px rgba(0,255,255,0.45)` : "none",
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

export default function LiquidPropPage() {
  return (
    <div className="min-h-screen font-mono" style={{ background: "#000", color: C }}>

      {/* ── Fixed header ──────────────────────────────────────────────────── */}
      <header
        className="fixed top-16 left-0 right-0 z-50 flex items-center h-14"
        style={{ background: "#000", borderBottom: `1px solid ${C2}` }}
      >
        <div className="w-[22%] px-5 shrink-0">
          <Link
            href="/projects"
            className="text-[9px] tracking-[0.3em] transition-colors duration-150"
            style={{ color: C3 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C3)}
          >
            ← PROJECTS
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center gap-5">
          <NavArrow href={prevProject.href} direction="prev" />
          <div className="flex flex-col items-center">
            <span className="text-[8px] tracking-[0.35em] leading-none mb-0.5" style={{ color: C3 }}>
              {PROJECT.archiveId}
            </span>
            <span className="text-sm font-bold tracking-[0.3em] leading-none" style={{ color: C }}>
              {PROJECT.codename}
            </span>
          </div>
          <NavArrow href={nextProject.href} direction="next" />
        </div>

        <div className="w-[22%] px-5 flex items-center justify-end gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C }} />
            <span className="text-[9px] tracking-widest hidden sm:block" style={{ color: C3 }}>
              {PROJECT.status}
            </span>
          </div>
        </div>
      </header>

      {/* ── Subtitle bar ──────────────────────────────────────────────────── */}
      <div
        className="fixed top-[7.5rem] left-0 right-0 z-40 px-5 py-1.5 flex items-center"
        style={{ background: "#000", borderBottom: `1px solid ${C1}` }}
      >
        <span className="text-[9px] tracking-[0.3em]" style={{ color: C2 }}>
          {PROJECT.subtitle}
        </span>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="pt-[calc(4rem+3.5rem+1.75rem)] min-h-screen">

        <div
          className="grid gap-px grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)_minmax(0,1fr)]"
          style={{ background: C1 }}
        >

          {/* ── COLUMN 1: MISSION_OBJECTIVES ─────────────────────────────── */}
          <section className="p-5 lg:p-6 flex flex-col gap-6" style={{ background: "#000" }}>
            <ColHeader id="COL_01" label="MISSION_OBJECTIVES" />

            <div>
              <div className="text-[9px] tracking-[0.3em] mb-3" style={{ color: C3 }}>
                // BRIEF
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(0,255,255,0.72)" }}>
                {PROJECT.summary}
              </p>
            </div>

            <div>
              <div className="text-[9px] tracking-[0.3em] mb-3" style={{ color: C3 }}>
                // SPEC_TABLE
              </div>
              <div className="overflow-hidden" style={{ border: `1px solid ${C2}` }}>
                {PROJECT.specs.map((row) => (
                  <SpecRow key={row.param} param={row.param} value={row.value} unit={row.unit} />
                ))}
              </div>
            </div>
          </section>

          {/* ── COLUMN 2: TECHNICAL_SCHEMATICS ───────────────────────────── */}
          <section className="p-5 lg:p-6 flex flex-col gap-6" style={{ background: "#000" }}>
            <ColHeader id="COL_02" label="TECHNICAL_SCHEMATICS" />

            {PROJECT.schematics.map((s) => (
              <Schematic key={s.label} label={s.label} callout={s.callout} />
            ))}

            <div className="text-[10px] leading-relaxed" style={{ color: C2 }}>
              <span style={{ color: C3 }}>{"// NOTE :: "}</span>
              Replace schematic placeholders by uncommenting the{" "}
              <code style={{ color: C5 }}>src</code> field in the{" "}
              <code style={{ color: C5 }}>schematics</code> array above.
            </div>
          </section>

          {/* ── COLUMN 3: POST_MISSION_ANALYSIS ──────────────────────────── */}
          <section className="p-5 lg:p-6 flex flex-col gap-6" style={{ background: "#000" }}>
            <ColHeader id="COL_03" label="POST_MISSION_ANALYSIS" />

            <div>
              <div className="text-[9px] tracking-[0.3em] mb-4" style={{ color: C3 }}>
                // OUTCOMES
              </div>
              <ul className="space-y-4">
                {PROJECT.results.map((r, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 text-sm font-bold mt-px" style={{ color: C }}>
                      {r.sym}
                    </span>
                    <span className="text-[12px] leading-relaxed" style={{ color: "rgba(0,255,255,0.72)" }}>
                      {r.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px" style={{ background: C1 }} />

            <div>
              <div className="text-[9px] tracking-[0.3em] mb-3" style={{ color: C3 }}>
                // EXTERNAL_LINKS
              </div>
              <div className="space-y-2">
                {[
                  { label: "GITHUB_REPO",    href: "#" },
                  { label: "CDR_SLIDES",     href: "#" },
                  { label: "HOTFIRE_VIDEO",  href: "#" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-[10px] tracking-widest transition-colors duration-100"
                    style={{ color: C3 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C3)}
                  >
                    <span>{"→"}</span>
                    <span>{link.label}</span>
                    <div className="flex-1 h-px" style={{ background: C1 }} />
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
                onMouseEnter={(e) => (e.currentTarget.style.color = C)}
                onMouseLeave={(e) => (e.currentTarget.style.color = i === CURRENT_IDX ? C : C2)}
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
