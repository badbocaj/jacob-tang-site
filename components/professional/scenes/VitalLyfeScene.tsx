"use client";

import { motion } from "framer-motion";
import { Ink, Jacob, RIG } from "../Doodle";
import { Scrawl, VitalLyfeMark } from "../Marks";
import { FLOOR_Y, TONE } from "../facilityConfig";
import { curvePoints, dArc, dCircle, dCurve, dLine, dRect, spread } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// FILTRATION BAY — Vital Lyfe
// Sludge goes in one side of the box, drinking water comes out the other and
// straight into his mouth. He is very confident about this.
// ─────────────────────────────────────────────────────────────────────────────

const JX = 900; // where Jacob stands

// Hose routes. The mouth end is derived from the rig so the hose always meets
// his face, even if the figure's proportions change.
const MOUTH: [number, number] = [JX - 8, FLOOR_Y + RIG.shoulderY - 26];

const DIRTY_A: [number, number] = [300, 466];
const DIRTY_C: [number, number] = [385, 508];
const DIRTY_B: [number, number] = [470, 474];

const CLEAN_A: [number, number] = [618, 430];
const CLEAN_C: [number, number] = [742, 318];
const CLEAN_B: [number, number] = MOUTH;

const dirty = curvePoints(DIRTY_A, DIRTY_C, DIRTY_B, 12);
const clean = curvePoints(CLEAN_A, CLEAN_C, CLEAN_B, 16);

function Droplet({
  xs,
  ys,
  color,
  delay,
  duration,
  r = 5,
}: {
  xs: number[];
  ys: number[];
  color: string;
  delay: number;
  duration: number;
  r?: number;
}) {
  return (
    <motion.circle
      r={r}
      fill={color}
      initial={{ cx: xs[0], cy: ys[0], opacity: 0 }}
      animate={{ cx: xs, cy: ys, opacity: [0, 1, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        opacity: { duration, delay, repeat: Infinity, times: [0, 0.12, 0.5, 0.88, 1] },
      }}
    />
  );
}

function Sparkle({ x, y, delay, size = 9 }: { x: number; y: number; delay: number; size?: number }) {
  return (
    <motion.g
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
      style={{ transformOrigin: `${x}px ${y}px` }}
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Ink d={dLine(x - size, y, x + size, y, 300, 0.6)} w={2} color={TONE.clean} />
      <Ink d={dLine(x, y - size, x, y + size, 301, 0.6)} w={2} color={TONE.clean} />
    </motion.g>
  );
}

export default function VitalLyfeScene() {
  return (
    <g>
      {/* ── Sludge barrel ──────────────────────────────────────────────── */}
      <Ink d={dRect(130, 400, 170, 145, 310, 2)} w={2.8} />
      <Ink d={dArc(215, 400, 85, Math.PI, Math.PI * 2, 311, 1.8)} w={2.2} opacity={0.5} />
      {/* Sludge line, sloshing */}
      <motion.g
        animate={{ y: [0, -3, 0, 3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ink d={dLine(140, 452, 292, 449, 312, 2.4)} w={3} color={TONE.dirty} />
        <Ink d={dLine(140, 462, 292, 460, 313, 2.4)} w={2.4} color={TONE.dirty} opacity={0.6} />
      </motion.g>
      <Scrawl x={215} y={510} size={26} opacity={0.5}>
        raw intake
      </Scrawl>

      {/* ── Dirty hose ─────────────────────────────────────────────────── */}
      <Ink d={dCurve(DIRTY_A, DIRTY_C, DIRTY_B, 314, 1.6)} w={13} opacity={0.28} />
      {[0, 0.9, 1.8].map((d, i) => (
        <Droplet key={i} xs={dirty.xs} ys={dirty.ys} color={TONE.dirty} delay={d} duration={2.7} />
      ))}

      {/* ── Filter box ─────────────────────────────────────────────────── */}
      <motion.g
        animate={{ scale: [1, 1.012, 1] }}
        style={{ transformOrigin: `580px ${FLOOR_Y}px` }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Ink d={dRect(470, 425, 220, 120, 320, 2)} w={3} fill="rgba(5,7,10,0.7)" />
        {/* Intake + outlet collars */}
        <Ink d={dRect(456, 456, 18, 34, 321, 1.4)} w={2.2} />
        <Ink d={dRect(600, 412, 34, 18, 322, 1.4)} w={2.2} />
        {/* Badge */}
        <g transform="translate(540, 480)">
          <VitalLyfeMark scale={0.85} />
        </g>
        <Scrawl x={630} y={500} size={24} opacity={0.6}>
          Vital Lyfe
        </Scrawl>
        {/* Status lamp */}
        <motion.circle
          cx={666}
          cy={444}
          r={5}
          fill={TONE.pass}
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.g>

      {/* ── Clean hose ─────────────────────────────────────────────────── */}
      <Ink d={dCurve(CLEAN_A, CLEAN_C, CLEAN_B, 330, 1.6)} w={12} opacity={0.28} />
      {[0, 0.7, 1.4, 2.1].map((d, i) => (
        <Droplet key={i} xs={clean.xs} ys={clean.ys} color={TONE.clean} delay={d} duration={2.8} r={4.5} />
      ))}
      {spread(3, 0, 2).map((d, i) => (
        <Sparkle key={i} x={648 + i * 26} y={378 - i * 18} delay={d * 0.6} />
      ))}

      {/* ── Jacob, drinking ────────────────────────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        seed={11}
        bob={{ y: [0, -4, 0] }}
        bobTransition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        headTilt={{ rotate: [0, -7, 0] }}
        headTransition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        // Near arm brings the hose to his mouth
        armRight={{ elbow: [34, 14], hand: [8, -26] }}
        // Far arm on the hip, pleased with himself
        armLeft={{ elbow: [-30, 30], hand: [-8, 52] }}
      >
        {/* Contented gulp */}
        <motion.g
          animate={{ opacity: [0, 1, 0], y: [0, -14, -26] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
        >
          <Scrawl x={44} y={RIG.headY - 26} size={26} color={TONE.clean} rotate={-8}>
            ahh
          </Scrawl>
        </motion.g>
      </Jacob>

      <Scrawl x={JX} y={FLOOR_Y - 268} size={26} opacity={0.45}>
        tastes fine
      </Scrawl>
      <Ink d={dCircle(JX, FLOOR_Y - 268, 62, 340, 2.4)} w={1.8} opacity={0.18} />
    </g>
  );
}
