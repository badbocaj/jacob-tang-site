"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* WFTS's signature piece, in two halves.

   1. The flow coefficient, built from what the stand measures: the load cells
      give mass over time, so mass flow is a slope, and Cv follows.
   2. Why the EPR exists. The COPVs are charged and then cut off from the
      nitrogen, so as water leaves the gas expands and upstream pressure sags.
      With the EPR, a stepper opens the valve to hold 150 psig. Both curves are
      illustrative: the EPR has not been tested yet. */

const X0 = 60;
const X1 = 760;
const BASE = 250;
const TOP = 30;
const PMAX = 180;
const TARGET = 150;

const y = (p: number) => BASE - (p / PMAX) * (BASE - TOP);

function trace(regulated: boolean) {
  const pts = Array.from({ length: 61 }, (_, i) => {
    const t = i / 60;
    // Blowdown: gas expanding as the water leaves. Regulated: small stepper
    // corrections around the set point.
    const p = regulated ? TARGET - 3 * ((t * 10) % 1) : TARGET * (1 / (1 + 0.9 * t)) ** 1.2;
    return `${(X0 + (X1 - X0) * t).toFixed(1)} ${y(p).toFixed(1)}`;
  });
  return `M ${pts.join(" L ")}`;
}

const MODES = [
  { key: "off", label: "EPR off · blowdown", end: "≈ 70 psig by the end" },
  { key: "on", label: "EPR on · regulated", end: "held at 150 psig" },
];

const SPRING = { type: "spring", stiffness: 200, damping: 30 } as const;

export function FlowCoefficient() {
  const [mode, setMode] = useState("off");
  const regulated = mode === "on";
  const current = MODES.find((m) => m.key === mode) ?? MODES[0];

  return (
    <div className="flex flex-col gap-4">
      {/* the formula */}
      <div className="flex flex-col gap-4 border border-[var(--faint)] bg-[var(--card)] p-5 sm:p-6">
        <p className="m-0 font-mono text-xs uppercase tracking-label text-[var(--muted)]">Flow coefficient</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Formula label="From the scale" expr="ṁ = dm / dt" />
          <Formula label="To volume" expr="Q = ṁ / ρ" />
          <Formula label="Definition" expr="Cv = Q · √(SG / ΔP)" />
        </div>
        <div className="flex flex-col gap-1.5 border-t border-[var(--faint)] pt-4">
          <p className="m-0 font-display text-xl font-bold sm:text-2xl">
            Cv = 7.19 · ṁ / √(SG · ΔP)
          </p>
          <p className="m-0 text-sm text-[var(--muted)]">
            ṁ in lb/s, ΔP in psi across the part, Q in US gpm. The 7.19 is 60 s/min ÷ 8.34 lb/gal.
          </p>
        </div>
      </div>

      {/* the blowdown */}
      <div className="flex flex-col gap-4 border border-[var(--faint)] bg-[var(--card)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 font-mono text-xs uppercase tracking-label text-[var(--muted)]">Upstream pressure · one flow</p>
          <div className="flex flex-wrap" role="group" aria-label="Regulator">
            {MODES.map((m) => {
              const on = m.key === mode;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMode(m.key)}
                  className={`min-h-11 border px-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    on
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                      : "border-[var(--faint)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <svg
          viewBox="0 0 800 300"
          role="img"
          aria-label={`Upstream pressure during one flow with the ${current.label}: starts at 150 psig and is ${current.end}`}
          className="block h-auto w-full"
        >
          <line x1={X0} y1={BASE} x2={X1} y2={BASE} stroke="var(--ink)" strokeWidth={1.5} />
          <line x1={X0} y1={TOP} x2={X0} y2={BASE} stroke="var(--ink)" strokeWidth={1.5} />
          <line
            x1={X0}
            y1={y(TARGET)}
            x2={X1}
            y2={y(TARGET)}
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="6 6"
          />
          <text x={X1} y={y(TARGET) - 10} textAnchor="end" className="font-mono" fontSize={13} fill="var(--muted)">
            TARGET · 150 PSIG
          </text>
          <motion.path
            initial={false}
            animate={{ d: trace(regulated) }}
            transition={SPRING}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <text x={X0} y={BASE + 26} className="font-mono" fontSize={13} fill="var(--muted)">
            VALVE OPENS
          </text>
          <text x={X1} y={BASE + 26} textAnchor="end" className="font-mono" fontSize={13} fill="var(--muted)">
            TIME →
          </text>
        </svg>

        <p className="m-0 text-sm text-[var(--muted)]">
          {regulated
            ? "The stepper turns the valve open a little at a time, so ΔP and Cv stay readable for the whole flow."
            : "The COPVs are cut off from the nitrogen before the flow, so pressure falls as the water leaves."}{" "}
          Illustrative: the EPR hasn&apos;t been tested yet.
        </p>
      </div>
    </div>
  );
}

function Formula({ label, expr }: { label: string; expr: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-xs uppercase tracking-label text-[var(--muted)]">{label}</span>
      <span className="font-mono text-base text-[var(--ink)]">{expr}</span>
    </div>
  );
}
