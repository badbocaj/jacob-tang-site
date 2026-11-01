"use client";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────────────────────────────────────
   The light switch.

   A wall plate with a rocker paddle: up is ON (daylight, hardware), down is
   OFF (night, software). It is a real <button role="switch">, so Space and
   Enter work and screen readers announce the state.
   ─────────────────────────────────────────────────────────────────────────── */

const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

export function LightSwitch({
  on,
  onToggle,
  dark,
}: {
  on: boolean;
  onToggle: () => void;
  /** Colour scheme of the wall the plate is mounted on. */
  dark: boolean;
}) {
  const plate = dark ? "#1b2033" : "#fbfaf6";
  const edge = dark ? "rgba(148,163,184,0.35)" : "rgba(24,24,27,0.16)";
  const well = dark ? "#11152a" : "#e7e2d6";
  const paddle = dark ? "#262c44" : "#ffffff";
  const ink = dark ? "#cbd5e1" : "#3f3f46";

  return (
    <div className="flex items-center gap-4">
      {/* Legends, set beside the plate like the markings on a panel */}
      <div className="flex h-40 flex-col justify-between py-6 text-right font-mono text-xs uppercase tracking-label">
        <span
          className="transition-colors duration-500"
          style={{ color: on ? "#b45309" : ink, opacity: on ? 1 : 0.4 }}
        >
          On · HW
        </span>
        <span
          className="transition-colors duration-500"
          style={{ color: on ? ink : "#a5b4fc", opacity: on ? 0.4 : 1 }}
        >
          Off · SW
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={on ? "Lights on, showing hardware. Flip for software." : "Lights off, showing software. Flip for hardware."}
        onClick={onToggle}
        className="group relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-4"
        style={{ perspective: 400 }}
      >
        {/* Wall plate */}
        <span
          className="relative block h-40 w-28 rounded-xl border transition-colors duration-700"
          style={{
            background: plate,
            borderColor: edge,
            boxShadow: dark
              ? "0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 14px 34px rgba(24,24,27,0.12), inset 0 1px 0 #fff",
          }}
        >
          {/* screws */}
          {["top-3", "bottom-3"].map((pos) => (
            <span
              key={pos}
              className={`absolute left-1/2 ${pos} block h-2.5 w-2.5 -translate-x-1/2 rounded-full border`}
              style={{ borderColor: edge, background: well }}
            >
              <span
                className="absolute left-1/2 top-1/2 block h-px w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
                style={{ background: ink, opacity: 0.5 }}
              />
            </span>
          ))}

          {/* Paddle well */}
          <span
            className="absolute left-1/2 top-1/2 block h-24 w-12 -translate-x-1/2 -translate-y-1/2 rounded-md transition-colors duration-700"
            style={{ background: well, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.2)" }}
          >
            {/* The rocker */}
            <motion.span
              className="absolute inset-x-1 block h-12 rounded-[5px] border transition-colors duration-700 group-hover:brightness-105"
              style={{ background: paddle, borderColor: edge }}
              initial={false}
              animate={
                on
                  ? { top: 4, rotateX: 22, boxShadow: "0 7px 0 rgba(0,0,0,0.12)" }
                  : { top: 40, rotateX: -22, boxShadow: "0 -7px 0 rgba(0,0,0,0.28)" }
              }
              transition={SNAP}
              whileTap={{ scale: 0.95 }}
            >
              {/* grip line */}
              <span
                className="absolute left-1/2 block h-px w-5 -translate-x-1/2"
                style={{ top: on ? 8 : "auto", bottom: on ? "auto" : 8, background: ink, opacity: 0.3 }}
              />
            </motion.span>
          </span>
        </span>
      </button>
    </div>
  );
}
