"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* Vital Lyfe's signature piece: every bracket load case's margin, at a 1.25
   safety factor and 80 g. Bars right of zero pass; left of zero fails and is
   drawn in the accent. Flip between the hand calc and the two FEA passes to
   see the story: stress always clears, ±Y deflection does not, and that is
   what set the rib layout. Values are percentages from the review deck; the
   absolute numbers stay withheld. */

type Row = { name: string; note?: string; margin: number };

const VIEWS: { key: string; label: string; caption: string; rows: Row[] }[] = [
  {
    key: "hand",
    label: "Hand calc",
    caption: "Pull-out or shear slip, first principles.",
    rows: [
      { name: "Female threads in boss", note: "Installation", margin: 37 },
      { name: "Female threads in boss", note: "X-drop right after assembly", margin: -15 },
      { name: "Boss", note: "Installation", margin: 68 },
      { name: "Boss", note: "X-drop right after assembly", margin: 4 },
      { name: "Bracket–enclosure interface", note: "Installation", margin: 167 },
      { name: "Bracket–enclosure interface", note: "Installation + Y drop", margin: 62 },
      { name: "Interface after 2 years creep", note: "Installation", margin: 25 },
      { name: "Interface after 2 years creep", note: "Installation + Y drop", margin: -6 },
    ],
  },
  {
    key: "stress",
    label: "FEA · stress",
    caption: "Elemental von Mises under g-load, pressure and temperature.",
    rows: [
      { name: "Subcase X", margin: 215 },
      { name: "Subcase Y", margin: 192 },
      { name: "Subcase Z", margin: 183 },
      { name: "Subcase −X", margin: 106 },
      { name: "Subcase −Y", margin: 173 },
      { name: "Subcase −Z", margin: 59 },
    ],
  },
  {
    key: "deflection",
    label: "FEA · deflection",
    caption: "Nodal, against the 1 mm budget.",
    rows: [
      { name: "Subcase X", margin: 89 },
      { name: "Subcase Y", margin: -10 },
      { name: "Subcase Z", margin: 55 },
      { name: "Subcase −X", margin: 37 },
      { name: "Subcase −Y", margin: -10 },
      { name: "Subcase −Z", margin: 107 },
    ],
  },
];

// Axis from −25% to +225%, so zero sits a tenth of the way in.
const MIN = -25;
const MAX = 225;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
const ZERO = pct(0);

const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

export function Margins() {
  const [active, setActive] = useState(VIEWS[0].key);
  const view = VIEWS.find((v) => v.key === active) ?? VIEWS[0];
  const fails = view.rows.filter((r) => r.margin < 0).length;

  return (
    <div className="flex flex-col gap-5 border border-[var(--faint)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 font-mono text-xs uppercase tracking-label text-[var(--muted)]">Margin of safety · SF 1.25 · 80 g</p>
        <div className="flex flex-wrap" role="group" aria-label="Analysis">
          {VIEWS.map((v) => {
            const on = v.key === active;
            return (
              <button
                key={v.key}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(v.key)}
                className={`min-h-11 border px-3.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  on
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--faint)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="m-0 text-sm text-[var(--muted)]">
        {view.caption}{" "}
        <span className={fails ? "font-semibold text-[var(--accent)]" : "font-semibold text-[var(--ink)]"}>
          {fails ? `${fails} of ${view.rows.length} cases fall short.` : `All ${view.rows.length} cases clear.`}
        </span>
      </p>

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {view.rows.map((r, i) => {
          const fail = r.margin < 0;
          const left = fail ? pct(r.margin) : ZERO;
          const width = Math.abs(pct(r.margin) - ZERO);
          return (
            <li key={`${view.key}-${i}`} className="grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-center sm:gap-4">
              <div className="min-w-0 text-sm leading-snug">
                <span className="font-semibold">{r.name}</span>
                {r.note && <span className="block text-xs text-[var(--muted)]">{r.note}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-5 flex-1">
                  <span aria-hidden className="absolute inset-y-0 w-px bg-[var(--ink)]" style={{ left: `${ZERO}%` }} />
                  <motion.span
                    aria-hidden
                    className={`absolute inset-y-0.5 ${fail ? "bg-[var(--accent)]" : "bg-[var(--ink)] opacity-80"}`}
                    initial={{ left: `${ZERO}%`, width: 0 }}
                    animate={{ left: `${left}%`, width: `${width}%` }}
                    transition={{ ...SPRING, delay: i * 0.03 }}
                  />
                </div>
                <span
                  className={`w-14 shrink-0 text-right font-mono text-sm ${fail ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}
                >
                  {r.margin > 0 ? "+" : r.margin < 0 ? "−" : ""}
                  {Math.abs(r.margin)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
