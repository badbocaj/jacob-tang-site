"use client";

import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { Brackets } from "./HudPrimitives";
import {
  CORE_DRIVES,
  PROFILE,
  PROFILE_ROWS,
  TELEMETRY_VECTORS,
  type TelemetryVector,
} from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   The dead-centre holographic display: subject profile, live status rows and
   core drives, framed by target reticles and hairline telemetry leaders.
   ─────────────────────────────────────────────────────────────────────────── */

const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

/** Small crosshair used to "target" the panel edges. */
function TargetReticle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="7" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.65" />
      <circle cx="12" cy="12" r="1.6" fill="#67e8f9" />
      <line x1="12" y1="0" x2="12" y2="4.5" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
      <line x1="12" y1="19.5" x2="12" y2="24" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
      <line x1="0" y1="12" x2="4.5" y2="12" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
      <line x1="19.5" y1="12" x2="24" y2="12" stroke="#22d3ee" strokeWidth="1" opacity="0.8" />
    </svg>
  );
}

/** Diagonal leader from a panel corner out to its floating readout. */
function Leader({ dir }: { dir: TelemetryVector["side"] }) {
  const coords = {
    tl: { x1: 2, y1: 2, x2: 32, y2: 32 },
    tr: { x1: 32, y1: 2, x2: 2, y2: 32 },
    bl: { x1: 2, y1: 32, x2: 32, y2: 2 },
    br: { x1: 32, y1: 32, x2: 2, y2: 2 },
  }[dir];

  return (
    <svg viewBox="0 0 34 34" className="h-[34px] w-[34px] shrink-0" aria-hidden>
      <line {...coords} stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
      <circle cx={coords.x1} cy={coords.y1} r="1.6" fill="rgba(34,211,238,0.8)" />
    </svg>
  );
}

function VectorReadout({ v }: { v: TelemetryVector }) {
  const anchor: Record<TelemetryVector["side"], string> = {
    tl: "-left-2 -top-2 -translate-x-full -translate-y-full items-end",
    tr: "-right-2 -top-2 translate-x-full -translate-y-full items-end flex-row-reverse",
    bl: "-bottom-2 -left-2 -translate-x-full translate-y-full items-start",
    br: "-bottom-2 -right-2 translate-x-full translate-y-full items-start flex-row-reverse",
  };

  return (
    <motion.div
      className={`absolute hidden gap-1 lg:flex ${anchor[v.side]}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SNAP, delay: 0.45 }}
    >
      <span className="whitespace-nowrap pb-1 font-mono text-xs uppercase tracking-label">
        <span className="text-cyan-300/45">{v.label} </span>
        <span className="text-cyan-100/85">{v.value}</span>
      </span>
      <Leader dir={v.side} />
    </motion.div>
  );
}

interface ProfilePanelProps {
  /** Routes through to the full /about write-up. */
  onOpenDossier: () => void;
  /** Stows the panel back into the PILOT INFO switch. */
  onClose: () => void;
}

export function ProfilePanel({ onOpenDossier, onClose }: ProfilePanelProps) {
  return (
    <motion.div
      className="pointer-events-auto relative max-h-full w-full max-w-3xl"
      initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ ...SNAP, delay: 0.18 }}
    >
      {TELEMETRY_VECTORS.map((v) => (
        <VectorReadout key={v.side} v={v} />
      ))}

      <TargetReticle className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 sm:block" />
      <TargetReticle className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 sm:block" />

      {/* Brackets frame the panel from outside it, so they stay put when the
          card has to scroll internally on a short viewport. */}
      <Brackets size={16} color="rgba(103,232,249,0.9)" offset={4} className="z-10" />

      <div
        className="cockpit-holo relative max-h-full overflow-y-auto"
        style={{
          border: "1px solid rgba(34,211,238,0.32)",
          background:
            "linear-gradient(180deg, rgba(4,18,32,0.72), rgba(2,9,18,0.58))",
          backdropFilter: "blur(4px)",
          boxShadow:
            "0 0 60px rgba(34,211,238,0.16), inset 0 0 60px rgba(3,14,26,0.7)",
        }}
      >
        {/* Header strip */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-2"
          style={{
            borderBottom: "1px solid rgba(34,211,238,0.28)",
            background: "rgba(3,13,24,0.92)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span className="font-mono text-xs uppercase tracking-label text-cyan-300/85">
            {PROFILE.eyebrow}
          </span>

          <span className="ml-auto font-mono text-xs uppercase tracking-label text-cyan-200/40">
            {PROFILE.serial}
          </span>

          <button
            type="button"
            data-hud-target
            onClick={onClose}
            aria-label="Stow pilot dossier"
            className="group -mr-1 flex items-center gap-1.5 px-1.5 py-0.5 outline-none"
          >
            <span className="font-mono text-xs uppercase tracking-label text-cyan-300/45 transition-colors group-hover:text-cyan-100">
              STOW
            </span>
            <X
              className="h-3.5 w-3.5 text-cyan-300/60 transition-colors group-hover:text-cyan-100"
              strokeWidth={2.5}
            />
          </button>
        </div>

        <div className="px-4 py-5 sm:px-7 sm:py-7">
          {/* Identity */}
          <p className="m-0 font-mono text-xs uppercase tracking-label text-amber-300/90">
            {PROFILE.callsign}
          </p>

          <h1
            className="wide m-0 mt-2 text-4xl font-bold uppercase leading-none text-cyan-50 sm:text-6xl"
            style={{ textShadow: "0 0 28px rgba(34,211,238,0.55)" }}
          >
            {PROFILE.name}
          </h1>

          <p className="m-0 mt-3 font-mono text-xs uppercase leading-relaxed tracking-label text-cyan-200/60">
            {PROFILE.designation}
          </p>

          {/* Status rows */}
          <div className="mt-6 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            {PROFILE_ROWS.map((r) => (
              <div key={r.key} className="contents">
                <span className="font-mono text-xs uppercase tracking-label text-cyan-300/45">
                  <span className="text-cyan-400/70">▸ </span>
                  {r.key}
                </span>
                <span className="mb-2 font-mono text-xs uppercase leading-relaxed tracking-[0.08em] text-cyan-100/80 sm:mb-0">
                  {r.value}
                </span>
              </div>
            ))}
          </div>

          {/* Core drives */}
          <div
            className="mt-7 pt-5"
            style={{ borderTop: "1px solid rgba(34,211,238,0.18)" }}
          >
            <p className="m-0 font-mono text-xs uppercase tracking-label text-amber-300/80">
              PRIMARY CORE DRIVES
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              {CORE_DRIVES.map((d, i) => (
                <motion.div
                  key={d.index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SNAP, delay: 0.35 + i * 0.09 }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs tabular-nums text-cyan-400/60">
                      {d.index}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-label text-cyan-100">
                      {d.title}
                    </span>
                  </div>
                  <p className="m-0 mt-2 text-sm leading-relaxed text-cyan-100/55">
                    {d.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Route through to the full write-up */}
          <button
            type="button"
            data-hud-target
            onClick={onOpenDossier}
            className="group relative mt-7 inline-flex items-center gap-2 px-4 py-2 outline-none transition-colors"
            style={{ border: "1px solid rgba(34,211,238,0.4)" }}
          >
            <span className="absolute inset-0 -z-10 bg-cyan-400/0 transition-colors duration-200 group-hover:bg-cyan-400/15" />
            <span className="font-mono text-xs uppercase tracking-label text-cyan-200 transition-colors group-hover:text-cyan-50">
              OPEN FULL DOSSIER
            </span>
            <ChevronRight
              className="h-3.5 w-3.5 text-cyan-300 transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
