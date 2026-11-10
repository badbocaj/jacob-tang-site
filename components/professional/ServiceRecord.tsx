"use client";

import { useState, useSyncExternalStore, type CSSProperties, type ReactElement } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Brackets } from "@/components/Cockpit/HudPrimitives";
import { HAND_FONT, INK, PAPER, PEN, StillContext } from "./Doodle";
import { FLOOR_Y, HEAD_TOP_Y, JACOB_X, JOBS, ROOM_H, ROOM_W, type Job, type SceneKey } from "./facilityConfig";
import VitalLyfeScene from "./scenes/VitalLyfeScene";
import L3HarrisScene from "./scenes/L3HarrisScene";
import CurveScene from "./scenes/CurveScene";
import AimLabScene from "./scenes/AimLabScene";

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE RECORD
// The work history as a pilot's mission log: an amber-phosphor terminal with a
// flight path of jobs on the left and one mission debrief on the right. The
// comic survives as a single cream sketch card taped onto the terminal — the
// one place the journal's pen shows up on this page.
//
// Palette is the site's warm family and nothing else: warm black, cream,
// stone greys, one amber accent.
// ─────────────────────────────────────────────────────────────────────────────

const SCENES: Record<SceneKey, () => ReactElement> = {
  vital: VitalLyfeScene,
  l3: L3HarrisScene,
  curve: CurveScene,
  aim: AimLabScene,
};

interface Mission {
  job: Job;
  /** Two-digit mission number, counted from the earliest job. */
  num: string;
}

const MISSIONS: Mission[] = JOBS.map((job, i) => ({ job, num: String(i + 1).padStart(2, "0") }));
const NEWEST_FIRST = [...MISSIONS].reverse();
const CURRENT = MISSIONS.find((m) => /present/i.test(m.job.period)) ?? NEWEST_FIRST[0];
const FIRST_LOGGED = MISSIONS[0].job.period.split("–")[0].trim();

const AMBER = "#fbbf24";
const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

const LABEL = "font-mono text-xs uppercase tracking-label";

// ─── Header ──────────────────────────────────────────────────────────────────

function Readout({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className={`${LABEL} text-stone-400`}>{label}</dt>
      <dd className={`m-0 font-mono text-2xl font-semibold uppercase ${accent ? "text-amber-400" : "text-[#f3ead7]"}`}>
        {value}
      </dd>
    </div>
  );
}

function Masthead() {
  return (
    <header className="flex flex-wrap items-end justify-between gap-8">
      <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-3.5">
        <p className={`m-0 ${LABEL} text-amber-400`}>
          JT-01 // Pilot file · {MISSIONS.length} missions logged
        </p>
        <h1
          className="wide m-0 font-display text-4xl font-extrabold uppercase leading-none text-[#f3ead7] sm:text-6xl"
          style={{ textShadow: "0 0 28px rgba(251,191,36,0.25)" }}
        >
          Service record
        </h1>
        <p className="m-0 max-w-[46ch] text-lg leading-relaxed text-stone-300">
          Mechanical engineer. Structures, testing, propulsion. Every job below is a mission: what the
          objective was, what I did, and what I broke on the way.
        </p>
      </div>
      <dl className="m-0 flex flex-wrap gap-7">
        <Readout label="Missions" value={String(MISSIONS.length).padStart(2, "0")} />
        <Readout label="First logged" value={FIRST_LOGGED} />
        <Readout label="Current post" value={CURRENT.job.company} accent />
      </dl>
    </header>
  );
}

// ─── Flight path ─────────────────────────────────────────────────────────────

function FlightPath({ selected, onSelect }: { selected: SceneKey; onSelect: (key: SceneKey) => void }) {
  return (
    <nav aria-label="Missions" className="flex min-w-0 flex-1 basis-[300px] flex-col gap-3.5">
      <p className={`m-0 ${LABEL} text-stone-400`}>Flight path · newest first</p>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {NEWEST_FIRST.map(({ job, num }) => {
          const active = job.key === selected;
          return (
            <li key={job.key}>
              <motion.button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(job.key)}
                whileTap={{ scale: 0.98 }}
                transition={SNAP}
                className={`flex w-full cursor-pointer items-start gap-4 rounded-xs border px-4.5 py-4 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f3ead7] ${
                  active
                    ? "border-amber-400 bg-amber-400/12"
                    : "border-amber-400/25 bg-[#16120d]/60 hover:border-amber-400/60 hover:bg-amber-400/6"
                }`}
              >
                <span className="font-mono text-xl font-semibold leading-none text-amber-400">{num}</span>
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="wide font-display text-lg font-bold uppercase leading-tight text-[#f3ead7]">
                    {job.company}
                  </span>
                  <span className="text-sm leading-snug text-stone-300">{job.title}</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-stone-400">{job.period}</span>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── The recovered sketch ────────────────────────────────────────────────────

function Floor() {
  const ticks: number[] = [];
  for (let x = 40; x < ROOM_W; x += 64) ticks.push(x);
  return (
    <g>
      <path d={`M0 ${FLOOR_Y} H${ROOM_W}`} strokeWidth={4.5} />
      <g strokeWidth={2.2} opacity={0.28}>
        {ticks.map((x) => (
          <path key={x} d={`M${x} ${FLOOR_Y + 16} l-18 24`} />
        ))}
      </g>
    </g>
  );
}

function SpeechBubble({ job }: { job: Job }) {
  const jx = JACOB_X[job.key];
  // Hang the bubble up and to the left of his head, tail pointing down at it.
  const box: CSSProperties = {
    right: `${((ROOM_W - (jx + 56)) / ROOM_W) * 100}%`,
    bottom: `${((ROOM_H - (HEAD_TOP_Y - 20)) / ROOM_H) * 100}%`,
    maxWidth: "max(40%, 12em)",
    transformOrigin: "85% 100%",
  };

  return (
    <motion.div
      className="absolute"
      style={box}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SNAP, delay: 0.18 }}
    >
      <p
        className="relative m-0 rounded-[1.3em] border-[2.5px] bg-white px-[1em] py-[0.5em] leading-[1.15]"
        style={{ ...HAND_FONT, color: INK, borderColor: INK, fontSize: "clamp(12px, 3.1cqw, 19px)" }}
      >
        {job.hook}
        <svg
          aria-hidden
          viewBox="0 0 24 18"
          className="absolute right-[16%] top-full -mt-[3px] h-[1.05em] w-[1.3em]"
          style={{ overflow: "visible" }}
        >
          <path d="M1 0 L17 17 L21 0" fill="#ffffff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
      </p>
    </motion.div>
  );
}

function SketchCard({ job }: { job: Job }) {
  const Scene = SCENES[job.key];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className={`m-0 ${LABEL} text-stone-400`}>Recovered sketch · {job.room}</p>
      <motion.figure
        className="relative m-0 border-[2.5px]"
        style={{
          containerType: "inline-size",
          background: PAPER,
          borderColor: INK,
          boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
        }}
        initial={{ opacity: 0, y: 14, rotate: 2.5 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        transition={SNAP}
      >
        {/* Tape */}
        <span
          aria-hidden
          className="absolute left-1/2 -top-3.5 z-10 h-6 w-21 -translate-x-1/2 rotate-3"
          style={{ background: "rgba(236,224,186,0.9)", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
        />
        <div className="relative overflow-hidden" style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}` }}>
          <svg
            viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`Sketch: ${job.company}, Jacob in the ${job.room}.`}
          >
            <g {...PEN}>
              <Floor />
              <Scene />
            </g>
          </svg>
          <SpeechBubble job={job} />
        </div>
      </motion.figure>
      <p className="m-0 mt-1 font-hand text-2xl leading-none text-amber-400">
        exhibit {job.room.toLowerCase()}: drawn on site, not to scale
      </p>
    </div>
  );
}

// ─── Debrief ─────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className={`m-0 ${LABEL} font-normal text-stone-400`} style={{ fontFamily: "var(--font-mono)" }}>
        {label}
      </h3>
      {children}
    </div>
  );
}

function Debrief({ mission }: { mission: Mission }) {
  const { job, num } = mission;

  return (
    <motion.section
      key={job.key}
      aria-live="polite"
      className="flex flex-col gap-7"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10, transition: { duration: 0.08 } }}
      transition={SNAP}
    >
      <div className="flex flex-col gap-3">
        <p className={`m-0 ${LABEL} text-amber-400`}>
          Mission {num} · {job.period} · {job.location}
        </p>
        <h2 className="wide m-0 font-display text-4xl font-extrabold uppercase leading-none text-[#f3ead7]">
          {job.company}
        </h2>
        <p className="m-0 font-mono text-sm uppercase tracking-wider text-stone-300">{job.title}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Field label="Objective">
            <p className="m-0 text-lg leading-relaxed text-[#f3ead7]">{job.objective}</p>
          </Field>
          <Field label="What I did">
            <ul className="m-0 flex list-disc flex-col gap-2 pl-5 text-base leading-normal text-[#f3ead7] marker:text-amber-400">
              {job.did.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Field>
          <Field label="Loadout">
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-xs uppercase tracking-wider text-stone-300">
              {job.tools.map((tool, i) => (
                <li key={`${tool}-${i}`} className="border border-amber-400/35 px-2.5 py-1.5">
                  {tool}
                </li>
              ))}
            </ul>
          </Field>
        </div>

        <SketchCard job={job} />
      </div>
    </motion.section>
  );
}

// ─── The page body ───────────────────────────────────────────────────────────

const noSubscribe = () => () => {};

export default function ServiceRecord() {
  const reduceMotion = useReducedMotion();
  // The server can't know the reader's motion setting, so the first client
  // render has to match it (animated); the still version swaps in after.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [selected, setSelected] = useState<SceneKey>(CURRENT.job.key);
  const mission = MISSIONS.find((m) => m.job.key === selected) ?? CURRENT;

  return (
    <StillContext.Provider value={hydrated && Boolean(reduceMotion)}>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-9">
        <Masthead />

        <div className="flex flex-wrap items-start gap-7">
          <FlightPath selected={selected} onSelect={setSelected} />

          <div className="relative min-w-0 flex-[999] basis-[560px] border border-amber-400/25 bg-[#16120d]/85 p-6 sm:p-9">
            <Brackets size={18} thickness={2} color={AMBER} offset={1} />
            <AnimatePresence mode="wait" initial={false}>
              <Debrief key={mission.job.key} mission={mission} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StillContext.Provider>
  );
}
