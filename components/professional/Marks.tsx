"use client";

import { HAND_FONT, INK, PAPER, TINT } from "./Doodle";

// ─────────────────────────────────────────────────────────────────────────────
// MARKS
// Sketched stand-ins that say which employer a panel belongs to — drawn from
// scratch in the comic's pen, not reproductions of anyone's trademark.
// Every mark is centred on its own origin; scenes translate it into place.
// ─────────────────────────────────────────────────────────────────────────────

/** UH, stencilled onto the shaker box. */
export function UHMark() {
  return (
    <g>
      <rect x={-34} y={-24} width={68} height={48} rx={6} fill={PAPER} strokeWidth={3} />
      <text
        x={0}
        y={2}
        fontSize={34}
        fill={TINT.cardinal}
        stroke="none"
        textAnchor="middle"
        dominantBaseline="middle"
        style={HAND_FONT}
      >
        UH
      </text>
    </g>
  );
}

/** A hex module badge with broadcast arcs — the parts on the L3Harris line. */
export function L3Mark({ fill = TINT.blue }: { fill?: string }) {
  return (
    <g>
      <polygon points="-30,-17 0,-34 30,-17 30,17 0,34 -30,17" fill={fill} />
      <text x={-7} y={2} fontSize={24} fill={INK} stroke="none" textAnchor="middle" dominantBaseline="middle" style={HAND_FONT}>
        L3
      </text>
      <path d="M10 -9 a 11 11 0 0 1 0 18" strokeWidth={2.6} />
      <path d="M15 -15 a 18 18 0 0 1 0 30" strokeWidth={2.6} opacity={0.55} />
    </g>
  );
}

/** A droplet with a pulse line through it. */
export function VitalLyfeMark() {
  return (
    <g>
      <path d="M0 -34 C 14 -16 22 -4 22 8 A 22 22 0 0 1 -22 8 C -22 -4 -14 -16 0 -34 Z" fill={TINT.water} />
      <path d="M-15 8 H-6 L-2 -3 L3 18 L7 8 H15" strokeWidth={3} />
    </g>
  );
}

/** Dome, brow, nose guard, cheek plates and a crest. Reads at train-car size. */
export function TrojanHelmet({ color = TINT.cardinal }: { color?: string }) {
  return (
    <g stroke={color}>
      <path d="M-18 -18 C -10 -46 14 -46 22 -16" strokeWidth={5} />
      <path d="M-24 4 A 24 24 0 0 1 24 4 Z" fill={TINT.gold} strokeWidth={3} />
      <path d="M0 4 V26 M-24 4 C -22 18 -16 24 -10 26 M24 4 C 22 18 16 24 10 26" strokeWidth={3} />
    </g>
  );
}

/** One car on the USC traffic board: an S, a C, or a helmet. */
export function TrainCar({ label, helmet = false }: { label?: string; helmet?: boolean }) {
  return (
    <g>
      <rect x={-40} y={-30} width={80} height={44} rx={9} fill={TINT.gold} />
      <path d="M-30 -30 V-38 H30 V-30" strokeWidth={3} />
      <circle cx={-20} cy={18} r={8} fill={PAPER} />
      <circle cx={20} cy={18} r={8} fill={PAPER} />
      {helmet ? (
        <g transform="translate(0 -10) scale(0.62)">
          <TrojanHelmet />
        </g>
      ) : (
        <text
          x={0}
          y={-7}
          fontSize={36}
          fill={TINT.cardinal}
          stroke="none"
          textAnchor="middle"
          dominantBaseline="middle"
          style={HAND_FONT}
        >
          {label}
        </text>
      )}
    </g>
  );
}
