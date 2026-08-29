"use client";

import { motion } from "framer-motion";
import { Headphones, Ink, Jacob, MusicNote } from "../Doodle";
import { Scrawl, UHMark } from "../Marks";
import { ACCENT, FLOOR_Y } from "../facilityConfig";
import { dArc, dCircle, dLine, dRect, r2, spread } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// SHAKER LAB — AIM Lab @ UH
// A hemisphere mounted so its equator sits on the lid of the shaker box, the
// whole rig buzzing. He has headphones in. The hook is "Vibe-Researching", so
// the joke is that the vibration and the vibe are the same reading.
// ─────────────────────────────────────────────────────────────────────────────

const BOX_L = 480;
const BOX_R = 762;
const BOX_T = 398;
const DOME_CX = (BOX_L + BOX_R) / 2;
const DOME_R = 80;

const JX = 950;

/** Everything bolted to the shaker table buzzes as one rigid body. */
const SHAKE = {
  x: [0, -2.4, 2.2, -1.6, 1.8, -0.8, 0],
  y: [0, 1.4, -1.2, 1.6, -0.9, 0.7, 0],
};
const SHAKE_T = { duration: 0.42, repeat: Infinity, ease: "linear" as const };

function Waveform() {
  const pts = spread(40, 0, 240);
  // Coordinates are rounded before they reach the `d` attribute — raw Math.sin
  // output differs between Node and the browser and breaks hydration.
  const d = pts
    .map((x, i) => `${i === 0 ? "M" : "L"} ${r2(x)} ${r2(Math.sin(i / 2.1) * 18)}`)
    .join(" ");
  return (
    <g transform="translate(150, 190)">
      <Ink d={dRect(-24, -54, 288, 108, 700, 2)} w={2.6} fill="rgba(3,6,12,0.9)" />
      <motion.g
        animate={{ x: [0, -24] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      >
        <path d={d} stroke={ACCENT} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.9} />
      </motion.g>
      <Ink d={dLine(-16, 0, 252, 0, 701, 1.2)} w={1.4} opacity={0.25} />
      <Scrawl x={110} y={-72} size={24} color={ACCENT} opacity={0.7}>
        RESONANCE SWEEP
      </Scrawl>
    </g>
  );
}

export default function AimLabScene() {
  return (
    <g>
      <Waveform />

      {/* ── Shaker rig ─────────────────────────────────────────────────── */}
      <motion.g animate={SHAKE} transition={SHAKE_T}>
        {/* Hemisphere — cut exactly by the lid of the box */}
        <Ink d={dArc(DOME_CX, BOX_T, DOME_R, Math.PI, Math.PI * 2, 710, 1.8)} w={3} fill="rgba(5,7,10,0.6)" />
        {/* Its hidden half, dashed, so the cut plane reads */}
        <Ink d={dArc(DOME_CX, BOX_T, DOME_R * 0.94, 0, Math.PI, 711, 1.6)} w={1.8} opacity={0.28} />
        {/* Meridian */}
        <Ink d={dArc(DOME_CX, BOX_T, DOME_R * 0.5, Math.PI, Math.PI * 2, 712, 1.4)} w={1.8} opacity={0.35} />

        {/* Box */}
        <Ink d={dRect(BOX_L, BOX_T, BOX_R - BOX_L, FLOOR_Y - BOX_T, 713, 2)} w={3} fill="rgba(5,7,10,0.75)" />
        {/* Lid line — the plane that halves the dome */}
        <Ink d={dLine(BOX_L - 12, BOX_T, BOX_R + 12, BOX_T, 714, 1.6)} w={3.2} />
        {/* Stencil */}
        <g transform={`translate(${DOME_CX}, 476)`}>
          <UHMark scale={1} />
        </g>
        {/* Hold-down bolts */}
        {spread(4, BOX_L + 26, BOX_R - 26).map((x, i) => (
          <Ink key={i} d={dCircle(x, BOX_T + 22, 5, 720 + i, 0.8)} w={2} opacity={0.6} />
        ))}
      </motion.g>

      {/* Buzz lines either side of the rig */}
      {[0, 1, 2].map((i) => (
        <motion.g
          key={i}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 0.42, delay: i * 0.09, repeat: Infinity, ease: "easeInOut" }}
        >
          <Ink d={dLine(BOX_L - 34 - i * 16, 430 + i * 22, BOX_L - 14 - i * 16, 430 + i * 22, 730 + i, 1)} w={2.2} color={ACCENT} />
          <Ink d={dLine(BOX_R + 14 + i * 16, 430 + i * 22, BOX_R + 34 + i * 16, 430 + i * 22, 740 + i, 1)} w={2.2} color={ACCENT} />
        </motion.g>
      ))}

      {/* ── Music, drifting off the headphones ─────────────────────────── */}
      {[
        { x: 872, delay: 0 },
        { x: 838, delay: 1.1 },
        { x: 856, delay: 2.2 },
      ].map((nvals, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -120], x: [0, -26], opacity: [0, 0.9, 0.9, 0], rotate: [-6, 10, -4] }}
          transition={{ duration: 3.3, delay: nvals.delay, repeat: Infinity, ease: "easeOut" }}
        >
          <g transform={`translate(${nvals.x}, 322)`}>
            <MusicNote x={0} y={0} seed={750 + i} color={ACCENT} />
          </g>
        </motion.g>
      ))}

      {/* ── Jacob, listening ───────────────────────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        seed={29}
        // Nodding to it. The whole figure bobs so the headphones stay put.
        bob={{ y: [0, -6, 0], rotate: [0, 1.4, 0] }}
        bobTransition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
        armRight={{
          elbow: [30, 30],
          hand: [22, 66],
          animate: { rotate: [0, 7, 0] },
          transition: { duration: 1.05, repeat: Infinity, ease: "easeInOut" },
        }}
        armLeft={{
          elbow: [-28, 32],
          hand: [-20, 68],
          animate: { rotate: [0, -7, 0] },
          transition: { duration: 1.05, repeat: Infinity, ease: "easeInOut" },
        }}
        headProp={<Headphones />}
      />

      <Scrawl x={JX + 6} y={FLOOR_Y - 276} size={26} opacity={0.45}>
        good vibes only
      </Scrawl>
    </g>
  );
}
