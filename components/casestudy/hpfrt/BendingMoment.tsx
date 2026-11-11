"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { HPFRT_LOAD_CASES } from "./data";

/* HPFRT's signature piece: bending moment along the half span. Switch the
   load case and the curve grows, with its peak sitting on the boom joint at
   the root. The shape is illustrative (roughly (1 − x)² for a tapered lift
   distribution); the printed peak is the real number once it is filled in. */

const W = 800;
const H = 300;
const X0 = 60;
const X1 = 760;
const BASE = 250;
const MAX = 190;

function shape(scale: number) {
  const h = MAX * scale;
  const pts = Array.from({ length: 21 }, (_, i) => {
    const t = i / 20;
    return `${(X0 + (X1 - X0) * t).toFixed(1)} ${(BASE - h * (1 - t) ** 2).toFixed(1)}`;
  });
  const curve = `M ${pts.join(" L ")}`;
  return { curve, area: `${curve} L ${X1} ${BASE} L ${X0} ${BASE} Z`, peakY: BASE - h };
}

const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

export function BendingMoment() {
  const [active, setActive] = useState(HPFRT_LOAD_CASES[0].key);
  const loadCase = HPFRT_LOAD_CASES.find((c) => c.key === active) ?? HPFRT_LOAD_CASES[0];
  const { curve, area, peakY } = shape(loadCase.scale);

  return (
    <div className="flex flex-col gap-4 border border-[var(--faint)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 font-mono text-xs uppercase tracking-label text-[var(--muted)]">Bending moment · half span</p>
        <div className="flex" role="group" aria-label="Load case">
          {HPFRT_LOAD_CASES.map((c) => {
            const on = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(c.key)}
                className={`min-h-11 border px-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  on
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--faint)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Bending moment along the half span at ${loadCase.label}: highest at the boom joint at the root, ${loadCase.peak}, falling to zero at the tip`}
        className="block h-auto w-full"
      >
        <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--ink)" strokeWidth={1.5} />
        <line x1={X0} y1={40} x2={X0} y2={BASE} stroke="var(--ink)" strokeWidth={1.5} />
        <motion.path initial={false} animate={{ d: area }} transition={SPRING} fill="var(--accent)" fillOpacity={0.12} />
        <motion.path
          initial={false}
          animate={{ d: curve }}
          transition={SPRING}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
        />
        <motion.circle initial={false} animate={{ cy: peakY }} transition={SPRING} cx={X0} r={6} fill="var(--accent)" />
        <motion.text
          initial={false}
          animate={{ y: peakY + 5 }}
          transition={SPRING}
          x={X0 + 16}
          className="font-mono"
          fontSize={14}
          fill="var(--ink)"
        >
          PEAK · {loadCase.peak}
        </motion.text>
        <text x={X0} y={BASE + 26} className="font-mono" fontSize={13} fill="var(--muted)">
          ROOT · BOOM JOINT
        </text>
        <text x={X1} y={BASE + 26} textAnchor="end" className="font-mono" fontSize={13} fill="var(--muted)">
          TIP
        </text>
      </svg>
    </div>
  );
}
