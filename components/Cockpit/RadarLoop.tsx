"use client";

import { BLIPS } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   Bottom-left orbital scope.

   The sweep and the contacts share a 3.2s period (see globals.css) so the
   blips read as if the sweep is what illuminates them, without any JS timing.
   ─────────────────────────────────────────────────────────────────────────── */

const RINGS = [46, 34, 22, 10];

export function RadarLoop() {
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-[124px] w-[124px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="cockpit-radar-wedge" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* Scope face */}
          <circle cx="50" cy="50" r="47" fill="rgba(3,14,24,0.55)" />

          {RINGS.map((r) => (
            <circle
              key={r}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="0.5"
              opacity={r === 46 ? 0.5 : 0.2}
              strokeDasharray={r === 34 ? "3 3" : undefined}
            />
          ))}

          <line x1="50" y1="4" x2="50" y2="96" stroke="#22d3ee" strokeWidth="0.4" opacity="0.16" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="#22d3ee" strokeWidth="0.4" opacity="0.16" />

          {/* Bearing ticks every 30 degrees */}
          {Array.from({ length: 12 }, (_, i) => {
            const rad = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + Math.sin(rad) * 43}
                y1={50 - Math.cos(rad) * 43}
                x2={50 + Math.sin(rad) * 46}
                y2={50 - Math.cos(rad) * 46}
                stroke="#22d3ee"
                strokeWidth={i % 3 === 0 ? 1.1 : 0.5}
                opacity={i % 3 === 0 ? 0.65 : 0.3}
              />
            );
          })}

          {/* Contacts */}
          {BLIPS.map((b, i) => {
            const rad = (b.angle * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={50 + Math.sin(rad) * b.dist}
                cy={50 - Math.cos(rad) * b.dist}
                r={b.size}
                fill={i === 2 ? "#fbbf24" : "#67e8f9"}
                className="cockpit-blip"
                style={{ animationDelay: `-${b.delay}s`, transformOrigin: "center" }}
              />
            );
          })}

          {/* Sweep */}
          <g className="cockpit-sweep">
            <path d="M50 50 L50 4 A46 46 0 0 1 82.5 17.5 Z" fill="url(#cockpit-radar-wedge)" />
            <line x1="50" y1="50" x2="50" y2="4" stroke="#a5f3fc" strokeWidth="0.8" opacity="0.9" />
          </g>

          {/* Ownship */}
          <circle cx="50" cy="50" r="1.8" fill="#a5f3fc" />
        </svg>
      </div>

      <div className="pb-1 font-mono text-xs uppercase leading-relaxed tracking-label">
        <div className="text-cyan-300/80">ORBITAL SCAN</div>
        <div className="text-cyan-200/40">LOCAL AIRSPACE</div>
        <div className="mt-1 text-amber-300/90">{BLIPS.length} CONTACTS</div>
        <div className="text-cyan-200/40">RANGE 40 KM</div>
      </div>
    </div>
  );
}
