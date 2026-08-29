"use client";

import { motion } from "framer-motion";
import { Ink, Jacob } from "../Doodle";
import { L3Mark, Scrawl } from "../Marks";
import { ACCENT, FLOOR_Y, TONE } from "../facilityConfig";
import { dCircle, dLine, dPoly, dRect, spread } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// INSPECTION LINE — L3Harris
// Parts ride the belt to the end, where he checks each one and waves it through.
// The belt is deliberately short: it only has to read as a belt.
// ─────────────────────────────────────────────────────────────────────────────

const BELT_L = 130;
const BELT_R = 740;
const BELT_TOP = 430;
const BELT_BOT = 472;
const JX = 830;

const ROLLERS = spread(8, BELT_L + 34, BELT_R - 34);
const CYCLE = 5.4;

// Geometry is drawn in room coordinates and the rotation origin is given
// explicitly. Setting a `transform` attribute here as well would be silently
// dropped: Framer writes `style.transform`, and CSS wins over the attribute.
function Roller({ x, i }: { x: number; i: number }) {
  const cy = (BELT_TOP + BELT_BOT) / 2;
  return (
    <motion.g
      animate={{ rotate: 360 }}
      style={{ transformOrigin: `${x}px ${cy}px` }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <Ink d={dCircle(x, cy, 17, 400 + i, 1.2)} w={2.2} opacity={0.75} />
      <Ink d={dLine(x, cy - 17, x, cy + 17, 420 + i, 0.9)} w={1.8} opacity={0.5} />
    </motion.g>
  );
}

/** One part travelling the belt, badge-side up. */
function Part({ delay }: { delay: number }) {
  return (
    <motion.g
      initial={{ x: BELT_L + 20, opacity: 0 }}
      animate={{
        x: [BELT_L + 20, BELT_R - 30],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: CYCLE,
        delay,
        repeat: Infinity,
        ease: "linear",
        opacity: { duration: CYCLE, delay, repeat: Infinity, times: [0, 0.08, 0.5, 0.9, 1] },
      }}
    >
      <g transform={`translate(0, ${BELT_TOP - 36})`}>
        <L3Mark scale={0.72} />
      </g>
    </motion.g>
  );
}

export default function L3HarrisScene() {
  return (
    <g>
      {/* ── Overhead sign ──────────────────────────────────────────────── */}
      <Ink d={dLine(300, 58, 300, 118, 430, 1.4)} w={2} opacity={0.4} />
      <Ink d={dLine(520, 58, 520, 118, 431, 1.4)} w={2} opacity={0.4} />
      <Ink d={dRect(268, 118, 284, 56, 432, 1.8)} w={2.4} opacity={0.75} />
      <Scrawl x={410} y={146} size={30} color={ACCENT} opacity={0.85}>
        QUALITY — LINE 3
      </Scrawl>

      {/* ── Belt frame ─────────────────────────────────────────────────── */}
      <Ink d={dLine(BELT_L, BELT_TOP, BELT_R, BELT_TOP, 440, 2)} w={3} />
      <Ink d={dLine(BELT_L, BELT_BOT, BELT_R, BELT_BOT, 441, 2)} w={3} />
      {/* End caps */}
      <Ink d={dCircle(BELT_L, (BELT_TOP + BELT_BOT) / 2, 21, 442, 1.4)} w={2.6} />
      <Ink d={dCircle(BELT_R, (BELT_TOP + BELT_BOT) / 2, 21, 443, 1.4)} w={2.6} />
      {ROLLERS.map((x, i) => (
        <Roller key={i} x={x} i={i} />
      ))}

      {/* Legs */}
      <Ink d={dLine(210, BELT_BOT, 210, FLOOR_Y, 444, 1.6)} w={2.6} />
      <Ink d={dLine(660, BELT_BOT, 660, FLOOR_Y, 445, 1.6)} w={2.6} />
      <Ink d={dLine(196, FLOOR_Y, 224, FLOOR_Y, 446, 1.2)} w={2.4} />
      <Ink d={dLine(646, FLOOR_Y, 674, FLOOR_Y, 447, 1.2)} w={2.4} />

      {/* ── Parts in transit ───────────────────────────────────────────── */}
      {[0, CYCLE / 3, (CYCLE * 2) / 3].map((d, i) => (
        <Part key={i} delay={d} />
      ))}

      {/* ── Pass stamp at the end of the line ──────────────────────────── */}
      <motion.g
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1.15, 1, 0.9] }}
        style={{ transformOrigin: `${BELT_R + 6}px ${BELT_TOP - 96}px` }}
        transition={{ duration: CYCLE / 3, repeat: Infinity, ease: "easeOut", times: [0, 0.55, 0.7, 0.9, 1] }}
      >
        <Ink
          d={dPoly(
            [
              [BELT_R - 18, BELT_TOP - 96],
              [BELT_R - 4, BELT_TOP - 82],
              [BELT_R + 26, BELT_TOP - 118],
            ],
            448,
            1.4
          )}
          w={4}
          color={TONE.pass}
        />
      </motion.g>

      {/* ── Jacob, inspecting ──────────────────────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        seed={17}
        bob={{ y: [0, -2.5, 0] }}
        bobTransition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        headTilt={{ rotate: [-10, -16, -10] }}
        headTransition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        // Near arm holds the magnifier over the belt
        armRight={{
          elbow: [40, 26],
          hand: [58, 58],
          animate: { rotate: [0, -7, 0] },
          transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        }}
        // Far arm holds a clipboard
        armLeft={{ elbow: [-30, 30], hand: [-40, 58] }}
        // Held items live inside their arm group, so they swing with it.
        armRightProp={
          <g transform="translate(58, 58)">
            <Ink d={dLine(0, 0, 0, 20, 450, 1)} w={3} />
            <Ink d={dCircle(0, 38, 20, 451, 1.3)} w={3} fill="rgba(103,212,232,0.08)" />
          </g>
        }
        armLeftProp={
          <g transform="translate(-40, 58)">
            <Ink d={dRect(-16, 0, 32, 42, 452, 1.3)} w={2.4} fill="rgba(5,7,10,0.8)" />
            <Ink d={dLine(-9, 12, 9, 12, 453, 0.8)} w={1.6} opacity={0.6} />
            <Ink d={dLine(-9, 22, 9, 22, 454, 0.8)} w={1.6} opacity={0.6} />
            <Ink d={dLine(-9, 32, 4, 32, 455, 0.8)} w={1.6} opacity={0.6} />
          </g>
        }
      />

      <Scrawl x={JX + 4} y={FLOOR_Y - 272} size={26} opacity={0.45}>
        conforms.
      </Scrawl>
    </g>
  );
}
