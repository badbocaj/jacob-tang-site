"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";

import { Brackets } from "@/components/Cockpit/HudPrimitives";
import { OPEN_SECTIONS } from "@/lib/construction";

/* ───────────────────────────────────────────────────────────────────────────
   Zone A — the sealed-channel transmission.

   A section that is built but not ready should feel like a door the operator
   shut on purpose, not a page that fell over. So: the cockpit's own HUD
   vocabulary (mono caps, corner brackets, scanlines, amber for anything
   withheld), a computer with an attitude, and one low-fi barrier sketch
   parked in front of it all.
   ─────────────────────────────────────────────────────────────────────────── */

const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

/** The computer's editorial on why you cannot come in. */
const REMARKS: Record<string, string> = {
  ABOUT:
    "The operator has rewritten this page four times. Every draft turned into a parts list.",
  PROJECTS:
    "The hardware works. The page describing the hardware does not. Priorities were made.",
  MOVIES:
    "Opinions still under load test. Publishing them at this stage would be irresponsible.",
  FUN: "The jokes are load-bearing and currently unsupported.",
  FUNNY: "The jokes are load-bearing and currently unsupported.",
};

const DEFAULT_REMARK = "This channel is dark by order of the operator. I just work here.";

const LOG = [
  "CHANNEL HANDSHAKE ..... OK",
  "CONTENT MANIFEST ...... PARTIAL",
  "COPY PASS ............. PENDING",
  "OPERATOR SIGN-OFF ..... WITHHELD",
  "CHANNEL STATE ......... SEALED",
];

export function UnderConstruction({ section }: { section: string }) {
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (lines >= LOG.length) return;
    const id = window.setTimeout(() => setLines((n) => n + 1), 190);
    return () => window.clearTimeout(id);
  }, [lines]);

  const remark = REMARKS[section] ?? DEFAULT_REMARK;

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black pt-16 text-white">
      {/* Deck lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 12%, rgba(8,47,73,0.55) 0%, transparent 65%)," +
            "radial-gradient(60% 50% at 50% 100%, rgba(69,39,3,0.35) 0%, transparent 70%)",
        }}
      />
      <div className="cockpit-scanlines pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16">
        {/* ── Incoming transmission ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SNAP}
          className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-label"
        >
          <span className="cockpit-prompt block h-1.5 w-1.5 rounded-full bg-amber-300" />
          <span className="text-amber-300/90">INCOMING TRANSMISSION</span>
          <span className="text-cyan-300/35">JT-01 // FLIGHT DECK</span>
        </motion.div>

        <Barrier />

        {/* ── The panel ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SNAP, delay: 0.08 }}
          className="relative w-full px-6 py-8 sm:px-10"
          style={{
            border: "1px solid rgba(251,191,36,0.35)",
            background:
              "linear-gradient(180deg, rgba(6,22,34,0.75), rgba(2,8,15,0.9))",
            boxShadow: "0 0 60px rgba(8,47,73,0.6), inset 0 1px 0 rgba(165,243,252,0.12)",
          }}
        >
          <Brackets size={14} color="rgba(251,191,36,0.7)" offset={5} />

          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-label text-amber-300/80">
            <Lock className="cockpit-lockblink h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
            <span>CHANNEL {section}</span>
          </div>

          <GlitchTitle />

          <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-cyan-100/70">
            {remark}
          </p>

          {/* ── Diagnostics ─────────────────────────────────────────────── */}
          <div className="mt-7 border-t border-cyan-300/15 pt-5 font-mono text-xs uppercase leading-relaxed tracking-label">
            {LOG.slice(0, lines).map((line, i) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.16 }}
                className={
                  i === LOG.length - 1 ? "text-amber-300/90" : "text-cyan-300/45"
                }
              >
                {line}
              </motion.div>
            ))}
            {/* Reserve the block so the panel does not grow as it prints */}
            <div aria-hidden className="invisible">
              {LOG.slice(lines).map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Open channels ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SNAP, delay: 0.16 }}
          className="w-full"
        >
          <div className="mb-3 text-center font-mono text-xs uppercase tracking-label text-cyan-300/40">
            CHANNELS STILL OPEN
          </div>

          <div className="flex flex-wrap items-stretch justify-center gap-2">
            {OPEN_SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className="group relative">
                <motion.span
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SNAP}
                  className="relative flex items-center gap-2.5 px-4 py-2.5"
                  style={{
                    border: "1px solid rgba(34,211,238,0.35)",
                    background:
                      "linear-gradient(180deg, rgba(6,22,34,0.85), rgba(2,8,15,0.9))",
                  }}
                >
                  <Brackets size={9} color="rgba(34,211,238,0.6)" />
                  <span className="font-mono text-xs uppercase tracking-label text-cyan-100/90">
                    {s.label}
                  </span>
                  <span className="hidden font-mono text-xs uppercase tracking-label text-cyan-300/35 sm:inline">
                    {s.sub}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-cyan-300/60 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                  />
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   "UNDER CONSTRUCTION", with the channel dropping out every few seconds.

   Two coloured ghosts sit behind the real text and jump on the same beat. It
   is a cheap effect, which is exactly right — this is a terminal drawn by
   someone who also drew the barrier below it in pen.
   ─────────────────────────────────────────────────────────────────────────── */

/** Kept mutable — motion's keyframe type will not take a readonly tuple. */
const GLITCH_X: number[] = [0, -3, 2, -1, 0];
const GLITCH_T = {
  duration: 0.22,
  repeat: Infinity,
  repeatDelay: 3.6,
  ease: "linear",
} as const;

function GlitchTitle() {
  return (
    <div className="relative mt-3 select-none">
      <motion.span
        aria-hidden
        className="absolute inset-0 font-display text-3xl font-bold uppercase leading-none tracking-tight text-red-500/60 sm:text-5xl"
        animate={{ x: GLITCH_X.map((v) => -v) }}
        transition={GLITCH_T}
        style={{ mixBlendMode: "screen" }}
      >
        UNDER CONSTRUCTION
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute inset-0 font-display text-3xl font-bold uppercase leading-none tracking-tight text-cyan-400/60 sm:text-5xl"
        animate={{ x: GLITCH_X }}
        transition={GLITCH_T}
        style={{ mixBlendMode: "screen" }}
      >
        UNDER CONSTRUCTION
      </motion.span>

      <h1 className="relative font-display text-3xl font-bold uppercase leading-none tracking-tight text-white sm:text-5xl">
        UNDER CONSTRUCTION
      </h1>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   The low-fi half of Zone A: a trestle barrier drawn by hand, wobbly on
   purpose — every coordinate is a little bit wrong, the way it would be in
   pen. It bobs, because nothing on this site is allowed to sit perfectly
   still.
   ─────────────────────────────────────────────────────────────────────────── */

function Barrier() {
  return (
    <motion.svg
      viewBox="0 0 240 116"
      className="h-24 w-auto sm:h-28"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ y: [0, -5, 0], rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      {/* Legs — deliberately not parallel */}
      {[
        "M46,44 L30,108",
        "M62,45 L78,107",
        "M176,44 L162,109",
        "M192,45 L207,107",
      ].map((d) => (
        <path key={d} d={d} stroke="rgba(165,243,252,0.5)" strokeWidth="3" />
      ))}

      {/* Cross-braces */}
      <path d="M36,84 L74,86" stroke="rgba(165,243,252,0.32)" strokeWidth="2.5" />
      <path d="M168,85 L202,84" stroke="rgba(165,243,252,0.32)" strokeWidth="2.5" />

      {/* The plank, with a hand-drawn sag in the middle */}
      <path
        d="M22,30 L219,26 Q222,27 221,33 L220,52 Q220,57 216,57 L26,60 Q21,60 21,55 L20,35 Q20,30 22,30 Z"
        fill="rgba(2,8,15,0.9)"
        stroke="rgba(251,191,36,0.85)"
        strokeWidth="3"
      />

      {/* Hazard stripes, clipped to the plank */}
      <clipPath id="uc-plank">
        <path d="M22,30 L219,26 Q222,27 221,33 L220,52 Q220,57 216,57 L26,60 Q21,60 21,55 L20,35 Q20,30 22,30 Z" />
      </clipPath>
      <g clipPath="url(#uc-plank)">
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M${8 + i * 22},64 L${34 + i * 22},22`}
            stroke="rgba(251,191,36,0.5)"
            strokeWidth="9"
          />
        ))}
      </g>

      {/* Warning lamp, blinking off-beat from everything else */}
      <motion.circle
        cx="120"
        cy="14"
        r="5.5"
        fill="#fbbf24"
        animate={{ opacity: [1, 0.15, 1] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
      />
      <path d="M120,20 L120,27" stroke="rgba(251,191,36,0.6)" strokeWidth="2.5" />
    </motion.svg>
  );
}
