"use client";

import { motion, type MotionProps } from "framer-motion";
import { dCircle, dLine, dPoly } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// INK
// Every stroke in the facility goes through here so the whole drawing reads as
// one marker and one hand.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = "#ece7dd";

export function Ink({
  d,
  w = 2.6,
  color = INK,
  fill = "none",
  opacity = 1,
}: {
  d: string;
  w?: number;
  color?: string;
  fill?: string;
  opacity?: number;
}) {
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={w}
      fill={fill}
      opacity={opacity}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Loose crosshatch shading, for anything that wants to read as solid. */
export function Hatch({
  x,
  y,
  w,
  h,
  seed = 7,
  gap = 11,
  color = INK,
  opacity = 0.3,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  seed?: number;
  gap?: number;
  color?: string;
  opacity?: number;
}) {
  const lines = [];
  for (let i = 0, k = 0; i < w + h; i += gap, k++) {
    const x1 = x + Math.max(0, i - h);
    const y1 = y + Math.min(i, h);
    const x2 = x + Math.min(i, w);
    const y2 = y + Math.max(0, i - w);
    lines.push(<Ink key={k} d={dLine(x1, y1, x2, y2, seed + k, 1.1)} w={1.3} color={color} opacity={opacity} />);
  }
  return <g>{lines}</g>;
}

// ─────────────────────────────────────────────────────────────────────────────
// JACOB
// Drawn in local coordinates with the feet at the origin, so a scene only has
// to say where he stands. Limbs are nested groups rotated about their own
// joint, which is what lets each scene animate an arm without re-authoring him.
// ─────────────────────────────────────────────────────────────────────────────

const HIP_Y = -88;
const SHOULDER_Y = -168;
const NECK_Y = -182;
const HEAD_Y = -208;
const HEAD_R = 25;

export interface Limb {
  /** Joint position, relative to the shoulder / hip. */
  elbow: [number, number];
  /** End of the limb, relative to the shoulder / hip. */
  hand: [number, number];
  animate?: MotionProps["animate"];
  transition?: MotionProps["transition"];
}

const STAND_ARM_L: Limb = { elbow: [-26, 34], hand: [-34, 72] };
const STAND_ARM_R: Limb = { elbow: [26, 34], hand: [34, 72] };
const STAND_LEG_L: Limb = { elbow: [-20, 44], hand: [-26, 88] };
const STAND_LEG_R: Limb = { elbow: [20, 44], hand: [26, 88] };

function LimbPath({ limb, seed, w }: { limb: Limb; seed: number; w: number }) {
  return (
    <>
      <Ink d={dLine(0, 0, limb.elbow[0], limb.elbow[1], seed, 1.6)} w={w} />
      <Ink d={dLine(limb.elbow[0], limb.elbow[1], limb.hand[0], limb.hand[1], seed + 1, 1.6)} w={w} />
    </>
  );
}

export function Jacob({
  x,
  y,
  scale = 1,
  flip = false,
  seed = 3,
  color = INK,
  armLeft = STAND_ARM_L,
  armRight = STAND_ARM_R,
  legLeft = STAND_LEG_L,
  legRight = STAND_LEG_R,
  headTilt,
  headTransition,
  bob,
  bobTransition,
  headProp,
  armLeftProp,
  armRightProp,
  children,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  seed?: number;
  color?: string;
  armLeft?: Limb;
  armRight?: Limb;
  legLeft?: Limb;
  legRight?: Limb;
  headTilt?: MotionProps["animate"];
  headTransition?: MotionProps["transition"];
  bob?: MotionProps["animate"];
  bobTransition?: MotionProps["transition"];
  /** Worn on the head, so it follows the head tilt (headphones, hats). */
  headProp?: React.ReactNode;
  /** Held in a hand, so it follows the arm swing. Positioned by the scene
   *  relative to the shoulder, matching that arm's `hand` offset. */
  armLeftProp?: React.ReactNode;
  armRightProp?: React.ReactNode;
  /** Anything else in Jacob's local space that should not follow a limb. */
  children?: React.ReactNode;
}) {
  const s = flip ? -scale : scale;

  return (
    <g transform={`translate(${x}, ${y}) scale(${s}, ${scale})`} style={{ color }}>
      <motion.g animate={bob} transition={bobTransition}>
        {/* Legs */}
        <g transform={`translate(0, ${HIP_Y})`}>
          <motion.g animate={legLeft.animate} transition={legLeft.transition}>
            <LimbPath limb={legLeft} seed={seed + 10} w={2.8} />
          </motion.g>
          <motion.g animate={legRight.animate} transition={legRight.transition}>
            <LimbPath limb={legRight} seed={seed + 20} w={2.8} />
          </motion.g>
        </g>

        {/* Torso */}
        <Ink d={dLine(0, NECK_Y, 0, HIP_Y, seed + 30, 2)} w={3} />

        {/* Arms */}
        <g transform={`translate(0, ${SHOULDER_Y})`}>
          <motion.g animate={armLeft.animate} transition={armLeft.transition}>
            <LimbPath limb={armLeft} seed={seed + 40} w={2.6} />
            {armLeftProp}
          </motion.g>
          <motion.g animate={armRight.animate} transition={armRight.transition}>
            <LimbPath limb={armRight} seed={seed + 50} w={2.6} />
            {armRightProp}
          </motion.g>
        </g>

        {/* Head — rotates about the neck */}
        <g transform={`translate(0, ${NECK_Y})`}>
          <motion.g animate={headTilt} transition={headTransition}>
            {headProp}
            <Ink d={dCircle(0, HEAD_Y - NECK_Y, HEAD_R, seed + 60, 1.5)} w={2.8} />
            {/* Face — a couple of dots and a line, kept minimal on purpose */}
            <circle cx={-8} cy={HEAD_Y - NECK_Y - 4} r={2.6} fill={color} />
            <circle cx={9} cy={HEAD_Y - NECK_Y - 4} r={2.6} fill={color} />
            <Ink d={dLine(-7, HEAD_Y - NECK_Y + 10, 8, HEAD_Y - NECK_Y + 11, seed + 70, 1)} w={2.1} />
            {/* Hair — three quick flicks */}
            <Ink d={dLine(-13, HEAD_Y - NECK_Y - 22, -17, HEAD_Y - NECK_Y - 33, seed + 80, 1.2)} w={2.2} />
            <Ink d={dLine(0, HEAD_Y - NECK_Y - 26, -2, HEAD_Y - NECK_Y - 38, seed + 81, 1.2)} w={2.2} />
            <Ink d={dLine(13, HEAD_Y - NECK_Y - 22, 16, HEAD_Y - NECK_Y - 32, seed + 82, 1.2)} w={2.2} />
          </motion.g>
        </g>

        {children}
      </motion.g>
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PROPS
// ─────────────────────────────────────────────────────────────────────────────

/** A music note, used on the AIM Lab floor. */
export function MusicNote({ x, y, seed = 1, color = INK }: { x: number; y: number; seed?: number; color?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <Ink d={dCircle(0, 0, 6.5, seed, 1.2)} w={2.2} color={color} fill={color} />
      <Ink d={dLine(6, -1, 7, -26, seed + 1, 1)} w={2.2} color={color} />
      <Ink d={dPoly([[7, -26], [17, -22], [17, -14]], seed + 2, 1.2)} w={2.2} color={color} />
    </g>
  );
}

/** Headphones. Pass as Jacob's `headProp` so they tilt with the head. */
export function Headphones({ color = INK }: { color?: string }) {
  const top = HEAD_Y - NECK_Y;
  return (
    <g>
      <Ink d={dPoly([[-27, top - 4], [-24, top - 24], [0, top - 31], [24, top - 24], [27, top - 4]], 91, 1.4)} w={2.6} color={color} />
      <Ink d={dRectLocal(-35, top - 8, 15, 24, 92)} w={2.6} color={color} />
      <Ink d={dRectLocal(20, top - 8, 15, 24, 93)} w={2.6} color={color} />
    </g>
  );
}

function dRectLocal(x: number, y: number, w: number, h: number, seed: number) {
  return dPoly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    seed,
    1.4,
    true
  );
}
