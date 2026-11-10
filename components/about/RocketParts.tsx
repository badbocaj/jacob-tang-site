import type { ReactElement } from "react";

/* ───────────────────────────────────────────────────────────────────────────
   THE ROCKET, IN SEVEN PIECES

   Each part is its own drawing on a 360-wide board, seen from slightly above:
   a body with a shaded side and an open top face. Every body is 220 wide with
   a 110×34 ellipse at each joint (the nose and capsule taper to 68×21), so any
   part sits flush on the one below it.

   `top` and `bottom` are the heights of those joint ellipses in board units.
   ExplodedView uses them to work out how far each part has to travel to dock
   with its neighbour — change a drawing's joints and update them here.
   ─────────────────────────────────────────────────────────────────────────── */

export const INK = "#f3ead7";
export const ACCENT = "#ff6a3d";
const VOID = "#0b0a09";
const DECK = "#211d18";
const PANEL = "#16130f";
const CRATE = "#2b2620";

const SIDE = "url(#jt-side)";
const SPHERE = "url(#jt-sphere)";
const FLAME = "url(#jt-flame)";

const PEN = {
  fill: "none",
  stroke: INK,
  strokeWidth: 1.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

/** Shared gradients. Render once, anywhere on the page. */
export function RocketDefs() {
  return (
    <svg aria-hidden width={0} height={0} className="absolute">
      <defs>
        <linearGradient id="jt-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3d362e" />
          <stop offset="0.45" stopColor="#16130f" />
          <stop offset="1" stopColor="#2b2620" />
        </linearGradient>
        <radialGradient id="jt-sphere" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#5c5348" />
          <stop offset="1" stopColor="#17140f" />
        </radialGradient>
        <linearGradient id="jt-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.95" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** A straight-walled section of hull from y1 down to y2. */
function Hull({ y1, y2 }: { y1: number; y2: number }) {
  return (
    <>
      <path d={`M70 ${y1} L70 ${y2} A110 34 0 0 0 290 ${y2} L290 ${y1} A110 34 0 0 1 70 ${y1} Z`} fill={SIDE} />
      <ellipse cx={180} cy={y1} rx={110} ry={34} fill={DECK} />
    </>
  );
}

function NoseCone() {
  return (
    <g {...PEN}>
      <path d="M180 20 V4" />
      <path d="M180 20 C 168 50 124 100 112 130 A68 21 0 0 0 248 130 C 236 100 192 50 180 20 Z" fill={SIDE} />
      <path d="M136 92 A44 13 0 0 0 224 92" />
      <path d="M158 56 A22 7 0 0 0 202 56" />
      <circle cx={180} cy={4} r={3.5} fill={ACCENT} stroke="none" />
    </g>
  );
}

function CrewCapsule() {
  return (
    <g {...PEN}>
      <path d="M112 36 L70 140 A110 34 0 0 0 290 140 L248 36 A68 21 0 0 1 112 36 Z" fill={SIDE} />
      <ellipse cx={180} cy={36} rx={68} ry={21} fill={DECK} />
      <ellipse cx={180} cy={36} rx={30} ry={9} />
      <rect x={118} y={84} width={28} height={34} rx={9} fill={VOID} />
      {/* The lit window: somebody is home. */}
      <rect x={166} y={90} width={28} height={34} rx={9} fill={ACCENT} stroke={ACCENT} />
      <rect x={214} y={84} width={28} height={34} rx={9} fill={VOID} />
      <path d="M84 150 A104 30 0 0 0 276 150" />
    </g>
  );
}

function AvionicsBay() {
  return (
    <g {...PEN}>
      <Hull y1={36} y2={80} />
      <rect x={150} y={24} width={60} height={22} rx={2} fill={PANEL} />
      <rect x={100} y={29} width={32} height={12} rx={1.5} fill={PANEL} />
      <rect x={228} y={29} width={32} height={12} rx={1.5} fill={PANEL} />
      <path d="M132 35 H150 M210 35 H228 M180 46 V58 M166 46 V54 M194 46 V54" />
      <path d="M150 90 h60 M150 98 h60" />
      <g fill={ACCENT} stroke="none">
        <circle cx={164} cy={35} r={2.8} />
        <circle cx={180} cy={35} r={2.8} />
        <circle cx={196} cy={35} r={2.8} />
      </g>
    </g>
  );
}

function LivingQuarters() {
  return (
    <g {...PEN}>
      <Hull y1={36} y2={160} />
      {/* Bunk, table, two stools */}
      <rect x={112} y={24} width={56} height={18} rx={4} fill={PANEL} />
      <path d="M124 24 V42" />
      <ellipse cx={218} cy={36} rx={20} ry={7} fill={PANEL} />
      <ellipse cx={248} cy={44} rx={7} ry={3} />
      <ellipse cx={204} cy={50} rx={7} ry={3} />
      <circle cx={116} cy={102} r={14} fill={VOID} />
      <circle cx={180} cy={112} r={14} fill={ACCENT} fillOpacity={0.3} stroke={ACCENT} />
      <circle cx={244} cy={102} r={14} fill={VOID} />
      <path d="M172 140 v36 M188 140 v36 M172 150 h16 M172 160 h16 M172 170 h16" />
    </g>
  );
}

function Crate({ x, y, w, h, d }: { x: number; y: number; w: number; h: number; d: number }) {
  return (
    <>
      <path d={`M${x} ${y} h${w} v${h} h${-w} z`} />
      <path d={`M${x} ${y} l${d} ${-d} h${w} l${-d} ${d} z`} />
      <path d={`M${x + w} ${y} l${d} ${-d} v${h} l${-d} ${d} z`} />
    </>
  );
}

function CargoBay() {
  return (
    <g {...PEN}>
      <Hull y1={50} y2={130} />
      <g fill={CRATE}>
        <Crate x={112} y={22} w={32} h={26} d={8} />
        <Crate x={214} y={20} w={32} h={26} d={8} />
      </g>
      {/* The one that matters: the portfolio. */}
      <g fill={CRATE} stroke={ACCENT}>
        <Crate x={160} y={34} w={36} h={30} d={9} />
      </g>
      <path d="M180 84 V163 M168 118 h-10 M192 118 h10" />
    </g>
  );
}

function FuelTanks() {
  return (
    <g {...PEN}>
      <Hull y1={60} y2={144} />
      <circle cx={126} cy={44} r={30} fill={SPHERE} />
      <circle cx={234} cy={44} r={30} fill={SPHERE} />
      <circle cx={180} cy={58} r={32} fill={SPHERE} stroke={ACCENT} />
      <path d="M108 34 A22 22 0 0 1 124 22 M216 34 A22 22 0 0 1 232 22 M160 48 A24 24 0 0 1 178 34" />
      <path d="M70 104 A110 34 0 0 0 290 104" />
    </g>
  );
}

function Bell({ x, top, bottom, r }: { x: number; top: number; bottom: number; r: number }) {
  const ry = Math.round(r * 0.3);
  return (
    <>
      <path
        d={`M${x - 14} ${top} L${x - r} ${bottom} A${r} ${ry} 0 0 0 ${x + r} ${bottom} L${x + 14} ${top} Z`}
        fill={SIDE}
      />
      <ellipse cx={x} cy={bottom} rx={r} ry={ry} fill={VOID} />
    </>
  );
}

function Engines() {
  return (
    <>
      <g stroke="none">
        <path d="M98 156 Q120 240 142 156 Z" fill={FLAME} />
        <path d="M218 156 Q240 240 262 156 Z" fill={FLAME} />
        <path d="M150 178 Q180 290 210 178 Z" fill={FLAME} />
      </g>
      <g {...PEN}>
        <Bell x={120} top={76} bottom={150} r={34} />
        <Bell x={240} top={76} bottom={150} r={34} />
        <Bell x={180} top={82} bottom={170} r={40} />
        <ellipse cx={180} cy={170} rx={40} ry={12} stroke={ACCENT} />
        <Hull y1={34} y2={54} />
        <ellipse cx={180} cy={34} rx={60} ry={18} />
      </g>
    </>
  );
}

export type PartKey = "nose" | "capsule" | "avionics" | "quarters" | "cargo" | "fuel" | "engines";

export interface RocketPart {
  key: PartKey;
  /** Shown in the callout, after the part number. */
  name: string;
  /** Board height; every board is 360 wide. */
  viewH: number;
  /** Height of the joint this part docks to the one above with. */
  top: number;
  /** Height of the joint the next part docks onto. */
  bottom: number;
  Art: () => ReactElement;
}

/** Top of the stack first. */
export const PARTS: RocketPart[] = [
  { key: "nose", name: "Nose cone", viewH: 160, top: 0, bottom: 130, Art: NoseCone },
  { key: "capsule", name: "Crew capsule", viewH: 180, top: 36, bottom: 140, Art: CrewCapsule },
  { key: "avionics", name: "Avionics bay", viewH: 120, top: 36, bottom: 80, Art: AvionicsBay },
  { key: "quarters", name: "Living quarters", viewH: 200, top: 36, bottom: 160, Art: LivingQuarters },
  { key: "cargo", name: "Cargo bay", viewH: 170, top: 50, bottom: 130, Art: CargoBay },
  { key: "fuel", name: "Fuel tanks", viewH: 185, top: 60, bottom: 144, Art: FuelTanks },
  { key: "engines", name: "Engines", viewH: 280, top: 34, bottom: 280, Art: Engines },
];
