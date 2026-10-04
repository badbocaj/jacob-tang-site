"use client";

import { createContext, useContext, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PEN KIT
// The comic is drawn the way the /about journal is: one black pen on cream
// paper, flat pastel fills, clean geometry. Scenes use plain SVG shapes — the
// panel wraps them in a group that sets the pen, so a scene only says where.
//
// Loops run on SVG's own <animateTransform>, which rotates about a real pivot
// in the shape's own coordinates. That is what lets an arm swing from the
// shoulder instead of from the middle of its bounding box.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = "#1f2328";
export const PAPER = "#fdfbf3";
export const PEN_RED = "#c2412d";
export const PEN_BLUE = "#2c4f94";

/** Flat fills, same family as the journal's tabs and highlighters. */
export const TINT = {
  yellow: "#fde68a",
  blue: "#bfdbfe",
  green: "#bbf7d0",
  pink: "#fecaca",
  sand: "#ead7b7",
  water: "#a5e4f3",
  sludge: "#8a6134",
  pass: "#16a34a",
  stop: "#dc2626",
  cardinal: "#9d2235",
  gold: "#ffc72c",
};

/** The pen every panel draws with. Spread onto a <g>. */
export const PEN = {
  fill: "none",
  stroke: INK,
  strokeWidth: 3.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const HAND_FONT = { fontFamily: "var(--ff-journal), var(--ff-hand), cursive" };
export const SCRAWL_FONT = { fontFamily: "var(--ff-hand), cursive", fontWeight: 700 };

// ─── Motion ──────────────────────────────────────────────────────────────────

/** True when the reader has asked for reduced motion: loops hold still. */
export const StillContext = createContext(false);

const EASE = "0.45 0 0.55 1";
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Loops a transform on its own group. `values` are SVG transform arguments,
 * e.g. ["0", "8", "0"] for rotate or ["0 0", "0 -4", "0 0"] for translate.
 */
export function Loop({
  type,
  values,
  dur,
  delay = 0,
  linear = false,
  children,
}: {
  type: "rotate" | "translate" | "scale";
  values: string[];
  dur: number;
  delay?: number;
  linear?: boolean;
  children: ReactNode;
}) {
  const still = useContext(StillContext);
  const n = values.length;
  const keyTimes = values.map((_, i) => r3(i / (n - 1))).join(";");

  return (
    <g>
      {!still && (
        <animateTransform
          attributeName="transform"
          type={type}
          values={values.join(";")}
          dur={`${dur}s`}
          // A negative begin starts the loop part-way through, so things that
          // share a rhythm don't all move in lockstep.
          begin={`${-delay}s`}
          repeatCount="indefinite"
          calcMode={linear ? "linear" : "spline"}
          keyTimes={keyTimes}
          keySplines={linear ? undefined : Array(n - 1).fill(EASE).join(";")}
          additive="sum"
        />
      )}
      {children}
    </g>
  );
}

/** Fades a group in and out on a loop — blinking lamps, buzz lines. */
export function Pulse({
  dur,
  delay = 0,
  values = [0.2, 1, 0.2],
  children,
}: {
  dur: number;
  delay?: number;
  values?: number[];
  children: ReactNode;
}) {
  const still = useContext(StillContext);
  const n = values.length;
  return (
    <g opacity={still ? values[Math.floor(n / 2)] : undefined}>
      {!still && (
        <animate
          attributeName="opacity"
          values={values.join(";")}
          keyTimes={values.map((_, i) => r3(i / (n - 1))).join(";")}
          dur={`${dur}s`}
          begin={`${-delay}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines={Array(n - 1).fill(EASE).join(";")}
        />
      )}
      {children}
    </g>
  );
}

/**
 * Carries something along a path on a loop, fading in at the start and out at
 * the end — parts on a belt, trains on a track, droplets in a hose.
 */
export function Travel({
  path,
  dur,
  delay = 0,
  children,
}: {
  path: string;
  dur: number;
  delay?: number;
  children: ReactNode;
}) {
  const still = useContext(StillContext);
  if (still) {
    // Parked where it would have been at the start of the loop — a frozen
    // motion, so the browser does the path maths and nothing moves.
    const at = r3(Math.min(0.85, Math.max(0.12, (delay / dur) % 1)));
    return (
      <g>
        <animateMotion path={path} keyPoints={`${at};${at}`} keyTimes="0;1" calcMode="linear" dur="1s" fill="freeze" />
        {children}
      </g>
    );
  }
  return (
    <g opacity={0}>
      <animateMotion path={path} dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" />
      <animate
        attributeName="opacity"
        values="0;1;1;0"
        keyTimes="0;0.1;0.88;1"
        dur={`${dur}s`}
        begin={`${-delay}s`}
        repeatCount="indefinite"
      />
      {children}
    </g>
  );
}

// ─── Lettering ───────────────────────────────────────────────────────────────

export function Lettering({
  x,
  y,
  size = 30,
  color = INK,
  rotate = 0,
  anchor = "middle",
  scrawl = false,
  opacity,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  color?: string;
  rotate?: number;
  anchor?: "start" | "middle" | "end";
  scrawl?: boolean;
  opacity?: number;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={color}
      stroke="none"
      opacity={opacity}
      textAnchor={anchor}
      dominantBaseline="middle"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={scrawl ? SCRAWL_FONT : HAND_FONT}
    >
      {children}
    </text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JACOB
// The same kid as the journal — round head, black mop of hair, dot eyes —
// drawn with his feet at the origin so a scene only says where he stands.
// Each limb is a group pivoting on its own joint.
// ─────────────────────────────────────────────────────────────────────────────

const HIP_Y = -84;
const SHOULDER_Y = -160;
const NECK_Y = -174;
const HEAD_Y = -205;
const HEAD_R = 30;

export interface Limb {
  /** Middle joint, relative to the shoulder / hip. */
  elbow: [number, number];
  /** End of the limb, relative to the shoulder / hip. */
  hand: [number, number];
  /** Optional swing, in degrees about the joint, e.g. [0, 8, 0]. */
  swing?: number[];
  dur?: number;
  delay?: number;
}

const STAND_ARM_L: Limb = { elbow: [-22, 36], hand: [-30, 74] };
const STAND_ARM_R: Limb = { elbow: [22, 36], hand: [30, 74] };
const STAND_LEG_L: Limb = { elbow: [-14, 42], hand: [-22, 84] };
const STAND_LEG_R: Limb = { elbow: [14, 42], hand: [22, 84] };

function LimbShape({
  limb,
  prop,
  foot,
}: {
  limb: Limb;
  prop?: ReactNode;
  /** Draw a shoe at the end, pointing away from the body. */
  foot?: boolean;
}) {
  const [ex, ey] = limb.elbow;
  const [hx, hy] = limb.hand;
  const out = hx < 0 ? -1 : 1;
  const shape = (
    <>
      <path d={`M0 0 L${ex} ${ey} L${hx} ${hy}`} />
      {foot && <path d={`M${hx} ${hy} l${out * 13} 0`} strokeWidth={5} />}
      {prop}
    </>
  );

  if (!limb.swing) return shape;
  return (
    <Loop type="rotate" values={limb.swing.map(String)} dur={limb.dur ?? 2} delay={limb.delay}>
      {shape}
    </Loop>
  );
}

/** The mop: a dome of hair with a jagged fringe, scaled from the journal's. */
function hairPath(r: number) {
  const k = r / 17;
  const p = (x: number, y: number) => `${Math.round(x * k * 10) / 10} ${Math.round(y * k * 10) / 10}`;
  return `M${p(-18, 1)} C${p(-19, -26)} ${p(19, -26)} ${p(18, 1)} L${p(14, -5)} L${p(10, -1)} L${p(4, -6)} L${p(0, -1)} L${p(-5, -6)} L${p(-9, -1)} L${p(-15, -5)} Z`;
}
const HAIR = hairPath(HEAD_R);

export function Head({ look = 0, shades = false }: { look?: number; shades?: boolean }) {
  return (
    <g>
      <circle cx={0} cy={0} r={HEAD_R} fill={PAPER} />
      <path d={HAIR} fill={INK} strokeWidth={2} />
      {shades ? (
        <g fill={INK} stroke="none">
          <ellipse cx={-10 + look} cy={6} rx={9} ry={6.5} />
          <ellipse cx={10 + look} cy={6} rx={9} ry={6.5} />
        </g>
      ) : (
        <g fill={INK} stroke="none">
          <circle cx={-9 + look} cy={6} r={3.2} />
          <circle cx={9 + look} cy={6} r={3.2} />
        </g>
      )}
      <path d={`M${-5 + look} 17 q5 4 10 0`} strokeWidth={3} />
    </g>
  );
}

export function Jacob({
  x,
  y,
  scale = 1,
  flip = false,
  look = 0,
  armLeft = STAND_ARM_L,
  armRight = STAND_ARM_R,
  legLeft = STAND_LEG_L,
  legRight = STAND_LEG_R,
  tilt,
  tiltDur = 2,
  bob,
  bobDur = 2,
  headProp,
  armLeftProp,
  armRightProp,
  children,
}: {
  x: number;
  y: number;
  scale?: number;
  /** Mirror him to face left. */
  flip?: boolean;
  /** Nudges the eyes; positive looks the way he is facing. */
  look?: number;
  armLeft?: Limb;
  armRight?: Limb;
  legLeft?: Limb;
  legRight?: Limb;
  /** Head rotation keyframes in degrees, about the neck. */
  tilt?: number[];
  tiltDur?: number;
  /** Whole-body vertical bob keyframes, in units. */
  bob?: number[];
  bobDur?: number;
  /** Worn on the head, drawn about its centre; follows the tilt. */
  headProp?: ReactNode;
  /** Held in a hand, positioned relative to the shoulder; follows the swing. */
  armLeftProp?: ReactNode;
  armRightProp?: ReactNode;
  children?: ReactNode;
}) {
  const sx = flip ? -scale : scale;

  const head = (
    <g transform={`translate(0 ${HEAD_Y - NECK_Y})`}>
      <Head look={look} />
      {headProp}
    </g>
  );

  const body = (
    <>
      <g transform={`translate(0 ${HIP_Y})`}>
        <LimbShape limb={legLeft} foot />
        <LimbShape limb={legRight} foot />
      </g>
      <path d={`M0 ${NECK_Y} L0 ${HIP_Y}`} />
      <g transform={`translate(0 ${SHOULDER_Y})`}>
        <LimbShape limb={armLeft} prop={armLeftProp} />
        <LimbShape limb={armRight} prop={armRightProp} />
      </g>
      <g transform={`translate(0 ${NECK_Y})`}>
        {tilt ? (
          <Loop type="rotate" values={tilt.map(String)} dur={tiltDur}>
            {head}
          </Loop>
        ) : (
          head
        )}
      </g>
      {children}
    </>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${scale})`}>
      {bob ? (
        <Loop type="translate" values={bob.map((v) => `0 ${v}`)} dur={bobDur}>
          {body}
        </Loop>
      ) : (
        body
      )}
    </g>
  );
}

/** Joint anchors, so scenes can hang props exactly where a hand ends up. */
export const RIG = {
  hipY: HIP_Y,
  shoulderY: SHOULDER_Y,
  neckY: NECK_Y,
  headY: HEAD_Y,
  headR: HEAD_R,
};

// ─── Shared props ────────────────────────────────────────────────────────────

/** Headphones. Pass as Jacob's `headProp` so they tilt with his head. */
export function Headphones() {
  return (
    <g>
      <path d="M-33 -2 C-36 -62 36 -62 33 -2" strokeWidth={5} />
      <rect x={-42} y={-10} width={15} height={28} rx={6} fill={TINT.pink} />
      <rect x={27} y={-10} width={15} height={28} rx={6} fill={TINT.pink} />
    </g>
  );
}

export function MusicNote({ color = INK }: { color?: string }) {
  return (
    <g stroke={color} fill={color}>
      <ellipse cx={0} cy={0} rx={8} ry={6} transform="rotate(-20)" />
      <path d="M7 -2 V-34 L22 -28 V-20" fill="none" strokeWidth={3.5} />
    </g>
  );
}
