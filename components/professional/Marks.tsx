"use client";

import { Ink, INK } from "./Doodle";
import { dArc, dCircle, dCurve, dLine, dPoly, dRect } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// MARKS
// Every logo here is drawn from scratch in the same marker hand as the rest of
// the facility — these are sketched stand-ins that say which employer a scene
// belongs to, not reproductions of anyone's trademark.
//
// All marks draw centred on their own origin, so a scene just translates them
// into place.
// ─────────────────────────────────────────────────────────────────────────────

/** Handwritten lettering. Caveat is already loaded globally as `font-hand`. */
export function Scrawl({
  children,
  x = 0,
  y = 0,
  size = 34,
  color = INK,
  opacity = 1,
  anchor = "middle",
  rotate = 0,
}: {
  children: React.ReactNode;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  opacity?: number;
  anchor?: "start" | "middle" | "end";
  rotate?: number;
}) {
  return (
    <text
      className="font-hand"
      x={x}
      y={y}
      fontSize={size}
      fill={color}
      opacity={opacity}
      textAnchor={anchor}
      dominantBaseline="middle"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ fontWeight: 700 }}
    >
      {children}
    </text>
  );
}

// ── USC — Trojan helmet ──────────────────────────────────────────────────────
// Dome, nose guard, cheek plate and a crest plume: the silhouette does the
// work, so it still reads at train-car size.
export function TrojanHelmet({ scale = 1, color = INK }: { scale?: number; color?: string }) {
  return (
    <g transform={`scale(${scale})`}>
      {/* Crest plume */}
      <Ink d={dCurve([-16, -20], [0, -46], [20, -16], 210, 1.6)} w={2.6} color={color} />
      <Ink d={dCurve([-11, -18], [0, -38], [16, -15], 211, 1.6)} w={2.2} color={color} opacity={0.65} />
      {/* Dome */}
      <Ink d={dArc(0, 2, 24, Math.PI, Math.PI * 2, 212, 1.5)} w={2.8} color={color} />
      {/* Brow line */}
      <Ink d={dLine(-24, 2, 24, 2, 213, 1.4)} w={2.4} color={color} />
      {/* Nose guard */}
      <Ink d={dLine(0, 2, 0, 26, 214, 1.3)} w={2.6} color={color} />
      {/* Cheek plates */}
      <Ink d={dCurve([-24, 2], [-22, 18], [-13, 24], 215, 1.3)} w={2.4} color={color} />
      <Ink d={dCurve([24, 2], [22, 18], [13, 24], 216, 1.3)} w={2.4} color={color} />
    </g>
  );
}

// ── UH — stencilled on the shaker box ────────────────────────────────────────
export function UHMark({ scale = 1, color = INK }: { scale?: number; color?: string }) {
  return (
    <g transform={`scale(${scale})`}>
      <Ink d={dRect(-30, -22, 60, 44, 220, 1.6)} w={2.2} color={color} opacity={0.55} />
      <Scrawl size={34} color={color} y={2}>
        UH
      </Scrawl>
    </g>
  );
}

// ── L3Harris — sketched module badge ─────────────────────────────────────────
// A hexagonal plate with an "L3" scrawl and three broadcast arcs, standing in
// for the electronic-warfare work.
export function L3Mark({ scale = 1, color = INK }: { scale?: number; color?: string }) {
  const hex: [number, number][] = [
    [-30, -16],
    [0, -32],
    [30, -16],
    [30, 16],
    [0, 32],
    [-30, 16],
  ];
  return (
    <g transform={`scale(${scale})`}>
      <Ink d={dPoly(hex, 230, 1.6, true)} w={2.6} color={color} />
      <Scrawl size={26} color={color} x={-9} y={1}>
        L3
      </Scrawl>
      {/* Broadcast arcs */}
      <Ink d={dArc(10, 0, 9, -Math.PI / 2.4, Math.PI / 2.4, 231, 0.9)} w={2} color={color} />
      <Ink d={dArc(10, 0, 15, -Math.PI / 2.4, Math.PI / 2.4, 232, 0.9)} w={1.8} color={color} opacity={0.7} />
      <Ink d={dArc(10, 0, 21, -Math.PI / 2.4, Math.PI / 2.4, 233, 0.9)} w={1.6} color={color} opacity={0.45} />
    </g>
  );
}

// ── Vital Lyfe — droplet with a pulse line ───────────────────────────────────
export function VitalLyfeMark({ scale = 1, color = INK }: { scale?: number; color?: string }) {
  return (
    <g transform={`scale(${scale})`}>
      {/* Droplet: point at the top, round at the base */}
      <Ink d={dCurve([0, -30], [-20, -6], [-16, 8], 240, 1.2)} w={2.6} color={color} />
      <Ink d={dArc(0, 8, 16, Math.PI, Math.PI * 2, 241, 1.2)} w={2.6} color={color} />
      <Ink d={dCurve([16, 8], [20, -6], [0, -30], 242, 1.2)} w={2.6} color={color} />
      {/* Pulse */}
      <Ink
        d={dPoly(
          [
            [-13, 6],
            [-6, 6],
            [-2, -5],
            [3, 15],
            [7, 6],
            [13, 6],
          ],
          243,
          0.9
        )}
        w={2.2}
        color={color}
      />
    </g>
  );
}

// ── Train cars ───────────────────────────────────────────────────────────────
// The USC floor runs three of these round a junction: an S, a C, and a helmet.

export function TrainCar({
  label,
  helmet = false,
  color = INK,
  accent,
}: {
  label?: string;
  helmet?: boolean;
  color?: string;
  accent?: string;
}) {
  return (
    <g>
      {/* Body */}
      <Ink d={dRect(-34, -26, 68, 40, 250, 1.6)} w={2.6} color={color} fill="rgba(5,7,10,0.85)" />
      {/* Cab roof */}
      <Ink d={dLine(-30, -26, 30, -26, 251, 1.3)} w={2.2} color={color} opacity={0.7} />
      {/* Wheels */}
      <Ink d={dCircle(-18, 18, 8, 252, 1.1)} w={2.2} color={color} />
      <Ink d={dCircle(18, 18, 8, 253, 1.1)} w={2.2} color={color} />
      {/* Cargo */}
      {helmet ? (
        <g transform="translate(0, -8) scale(0.62)">
          <TrojanHelmet color={accent ?? color} />
        </g>
      ) : (
        <Scrawl size={40} color={accent ?? color} y={-5}>
          {label}
        </Scrawl>
      )}
    </g>
  );
}
