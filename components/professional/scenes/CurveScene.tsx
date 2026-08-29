"use client";

import { motion } from "framer-motion";
import { Ink, Jacob } from "../Doodle";
import { Scrawl, TrainCar } from "../Marks";
import { ACCENT, FLOOR_Y, TONE } from "../facilityConfig";
import { dCircle, dCurve, dLine, dPoly, dRect, spread } from "@/lib/doodle";

// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC CONTROL — CURVE @ USC
// A dark traffic board with three services running across it: an S, a C and a
// Trojan helmet. He works the console so they never meet at the junction.
// ─────────────────────────────────────────────────────────────────────────────

const BOARD_L = 110;
const BOARD_R = 800;
const BOARD_T = 92;
const BOARD_B = 438;

const TRACKS = [186, 272, 358];
const RUN_L = BOARD_L + 40;
const RUN_R = BOARD_R - 40;

const JX = 1000;
const DESK_T = 420;

/** Faint street grid behind the tracks — the "traffic map" itself. */
function TrafficMap() {
  const verticals = spread(9, BOARD_L + 40, BOARD_R - 40);
  const horizontals = spread(6, BOARD_T + 28, BOARD_B - 28);
  return (
    <g opacity={0.16}>
      {verticals.map((x, i) => (
        <Ink key={`v${i}`} d={dLine(x, BOARD_T + 12, x - 18, BOARD_B - 12, 500 + i, 2.2)} w={1.4} color={ACCENT} />
      ))}
      {horizontals.map((y, i) => (
        <Ink key={`h${i}`} d={dLine(BOARD_L + 14, y, BOARD_R - 14, y + 6, 520 + i, 2.2)} w={1.4} color={ACCENT} />
      ))}
      {/* A couple of arterials, drawn heavier */}
      <Ink d={dCurve([BOARD_L + 20, BOARD_B - 40], [420, 300], [BOARD_R - 30, BOARD_T + 60], 540, 3)} w={2.4} color={ACCENT} />
      <Ink d={dCurve([BOARD_L + 30, BOARD_T + 40], [430, 250], [BOARD_R - 20, BOARD_B - 50], 541, 3)} w={2.4} color={ACCENT} />
    </g>
  );
}

/** Ambient traffic — dots crawling the arterials while he works. */
function TrafficDots() {
  return (
    <g opacity={0.4}>
      {[0, 1.6, 3.2, 4.8].map((d, i) => (
        <motion.circle
          key={i}
          r={2.6}
          fill={ACCENT}
          animate={{
            cx: [BOARD_L + 24, 420, BOARD_R - 28],
            cy: [BOARD_B - 44, 300, BOARD_T + 58],
            opacity: [0, 0.9, 0],
          }}
          transition={{ duration: 6.4, delay: d, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </g>
  );
}

function Track({ y, seed }: { y: number; seed: number }) {
  const ties = spread(22, RUN_L - 24, RUN_R + 24);
  return (
    <g>
      {ties.map((x, i) => (
        <Ink key={i} d={dLine(x, y - 9, x, y + 9, seed + i, 0.7)} w={1.5} opacity={0.35} />
      ))}
      <Ink d={dLine(BOARD_L + 14, y - 7, BOARD_R - 14, y - 7, seed + 60, 1.4)} w={2.2} opacity={0.75} />
      <Ink d={dLine(BOARD_L + 14, y + 7, BOARD_R - 14, y + 7, seed + 61, 1.4)} w={2.2} opacity={0.75} />
    </g>
  );
}

function Service({
  y,
  dir,
  duration,
  delay,
  label,
  helmet,
}: {
  y: number;
  dir: 1 | -1;
  duration: number;
  delay: number;
  label?: string;
  helmet?: boolean;
}) {
  const from = dir === 1 ? RUN_L : RUN_R;
  const to = dir === 1 ? RUN_R : RUN_L;
  return (
    <motion.g
      initial={{ x: from }}
      animate={{ x: [from, to], opacity: [0, 1, 1, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        opacity: { duration, delay, repeat: Infinity, times: [0, 0.07, 0.5, 0.93, 1] },
      }}
    >
      <g transform={`translate(0, ${y - 22})`}>
        <TrainCar label={label} helmet={helmet} accent={ACCENT} />
      </g>
    </motion.g>
  );
}

export default function CurveScene() {
  return (
    <g>
      {/* ── Traffic board ──────────────────────────────────────────────── */}
      <Ink d={dRect(BOARD_L, BOARD_T, BOARD_R - BOARD_L, BOARD_B - BOARD_T, 560, 2.4)} w={3} fill="rgba(3,6,12,0.92)" />
      <TrafficMap />
      <TrafficDots />

      {TRACKS.map((y, i) => (
        <Track key={i} y={y} seed={570 + i * 40} />
      ))}

      {/* Junction spur between the top two tracks, with its switch */}
      <Ink d={dCurve([392, TRACKS[1] - 7], [452, TRACKS[1] - 40], [512, TRACKS[0] + 7], 600, 1.6)} w={2.2} opacity={0.6} />
      <motion.g
        animate={{ rotate: [0, -26, -26, 0, 0] }}
        style={{ transformOrigin: `392px ${TRACKS[1]}px` }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.18, 0.5, 0.68, 1] }}
      >
        <Ink d={dLine(392, TRACKS[1], 426, TRACKS[1], 601, 1)} w={3.4} color={ACCENT} />
        <Ink d={dCircle(392, TRACKS[1], 5, 602, 0.8)} w={2.4} color={ACCENT} />
      </motion.g>

      {/* Signal lamps beside each track */}
      {TRACKS.map((y, i) => (
        <motion.circle
          key={i}
          cx={BOARD_L + 26}
          cy={y}
          r={6}
          animate={{ fill: [TONE.pass, TONE.pass, TONE.stop, TONE.pass], opacity: [1, 1, 0.9, 1] }}
          transition={{ duration: 6, delay: i * 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── The three services ─────────────────────────────────────────── */}
      <Service y={TRACKS[0]} dir={-1} duration={7.5} delay={0} label="S" />
      <Service y={TRACKS[1]} dir={1} duration={9} delay={1.4} label="C" />
      <Service y={TRACKS[2]} dir={-1} duration={8.2} delay={3} helmet />

      <Scrawl x={BOARD_L + 96} y={BOARD_T + 26} size={26} color={ACCENT} opacity={0.75}>
        NETWORK — LIVE
      </Scrawl>

      {/* ── Console ────────────────────────────────────────────────────── */}
      <Ink d={dPoly([[858, DESK_T], [1146, DESK_T], [1160, DESK_T + 34], [844, DESK_T + 34]], 610, 2, true)} w={2.8} fill="rgba(5,7,10,0.85)" />
      <Ink d={dLine(880, DESK_T + 34, 880, FLOOR_Y, 611, 1.6)} w={2.6} />
      <Ink d={dLine(1122, DESK_T + 34, 1122, FLOOR_Y, 612, 1.6)} w={2.6} />

      {/* Buttons, lighting in sequence as he works the junction */}
      {spread(5, 892, 1108).map((x, i) => (
        <g key={i}>
          <Ink d={dCircle(x, DESK_T + 15, 12, 620 + i, 1)} w={2.2} opacity={0.8} />
          <motion.circle
            cx={x}
            cy={DESK_T + 15}
            r={7}
            fill={ACCENT}
            animate={{ opacity: [0.15, 0.15, 1, 0.15] }}
            transition={{ duration: 6, delay: i * 0.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}

      {/* ── Jacob at the console ───────────────────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        seed={23}
        bob={{ y: [0, -3, 0] }}
        bobTransition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        headTilt={{ rotate: [-12, -18, -12] }}
        headTransition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        // Near arm jabs at the buttons
        armRight={{
          elbow: [40, 24],
          hand: [58, 46],
          animate: { rotate: [0, 9, 0, 5, 0] },
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        armLeft={{ elbow: [-32, 26], hand: [-46, 48] }}
      />

      <Scrawl x={JX - 10} y={FLOOR_Y - 272} size={26} opacity={0.45}>
        nobody crashes today
      </Scrawl>
      <Ink d={dCurve([JX - 120, FLOOR_Y - 262], [JX - 60, FLOOR_Y - 290], [JX - 96, FLOOR_Y - 244], 640, 1.6)} w={1.8} opacity={0.3} />
    </g>
  );
}
