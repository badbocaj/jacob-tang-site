"use client";

import { INK, Jacob, Lettering, PAPER, PEN_RED, Pulse, TINT, Travel } from "../Doodle";
import { TrainCar } from "../Marks";
import { FLOOR_Y, JACOB_X } from "../facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC CONTROL — CURVE @ USC
// A traffic board with three services running across it — an S, a C and a
// Trojan helmet — and him at the console making sure none of them meet.
// ─────────────────────────────────────────────────────────────────────────────

const JX = JACOB_X.curve;

const BOARD_L = 110;
const BOARD_R = 640;
const BOARD_T = 196;
const BOARD_B = 452;
const RUN_L = BOARD_L + 30;
const RUN_R = BOARD_R - 30;
const TRACKS = [282, 352, 422];

const DESK_T = 432;
const DESK_L = 850;
const DESK_R = 1160;

function StreetGrid() {
  const xs = [200, 300, 400, 500, 600];
  const ys = [236, 316, 386];
  return (
    <g stroke="#dccfa8" strokeWidth={2}>
      {xs.map((x) => (
        <path key={x} d={`M${x} ${BOARD_T + 12} L${x - 16} ${BOARD_B - 12}`} />
      ))}
      {ys.map((y) => (
        <path key={y} d={`M${BOARD_L + 12} ${y} H${BOARD_R - 12}`} />
      ))}
    </g>
  );
}

function Track({ y }: { y: number }) {
  const ties: number[] = [];
  for (let x = RUN_L; x <= RUN_R; x += 26) ties.push(x);
  return (
    <g>
      <g strokeWidth={2.2} opacity={0.45}>
        {ties.map((x) => (
          <path key={x} d={`M${x} ${y - 7} V${y + 7}`} />
        ))}
      </g>
      <path d={`M${RUN_L - 10} ${y} H${RUN_R + 10}`} strokeWidth={3} />
    </g>
  );
}

function Service({ y, dir, dur, delay, label, helmet }: {
  y: number;
  dir: 1 | -1;
  dur: number;
  delay: number;
  label?: string;
  helmet?: boolean;
}) {
  // Wheels sit on the rail.
  const cy = y - 22;
  const [from, to] = dir === 1 ? [RUN_L + 40, RUN_R - 40] : [RUN_R - 40, RUN_L + 40];
  return (
    <Travel path={`M${from} ${cy} H${to}`} dur={dur} delay={delay}>
      <g transform="scale(0.82)">
        <TrainCar label={label} helmet={helmet} />
      </g>
    </Travel>
  );
}

function Console() {
  const buttons = [890, 950, 1010, 1070, 1120];
  return (
    <g>
      <path d={`M${DESK_L} ${DESK_T} H${DESK_R} L${DESK_R + 14} ${DESK_T + 36} H${DESK_L - 14} Z`} fill="#e5e7eb" />
      <path d={`M${DESK_L + 20} ${DESK_T + 36} V${FLOOR_Y} M${DESK_R - 20} ${DESK_T + 36} V${FLOOR_Y}`} />
      <rect x={DESK_L + 6} y={DESK_T + 36} width={DESK_R - DESK_L - 12} height={FLOOR_Y - DESK_T - 36} fill={PAPER} strokeWidth={2.5} />
      {buttons.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={DESK_T + 18} r={10} fill={PAPER} strokeWidth={2.5} />
          <Pulse dur={2.4} delay={i * 0.48} values={[0, 0, 1, 0, 0]}>
            <circle cx={x} cy={DESK_T + 18} r={7} fill={TINT.gold} stroke="none" />
          </Pulse>
        </g>
      ))}
    </g>
  );
}

export default function CurveScene() {
  return (
    <g>
      {/* ── The board ──────────────────────────────────────────────────── */}
      <rect x={BOARD_L} y={BOARD_T} width={BOARD_R - BOARD_L} height={BOARD_B - BOARD_T} rx={14} fill="#fdf6dc" />
      <StreetGrid />
      {TRACKS.map((y) => (
        <Track key={y} y={y} />
      ))}

      {/* Signal lamps: green, flicking red when a service is due */}
      {TRACKS.map((y, i) => (
        <g key={y}>
          <circle cx={BOARD_L + 16} cy={y} r={8} fill={TINT.pass} strokeWidth={2.5} />
          <Pulse dur={4.5} delay={i * 1.5} values={[1, 1, 0, 0, 0]}>
            <circle cx={BOARD_L + 16} cy={y} r={6} fill={TINT.stop} stroke="none" />
          </Pulse>
        </g>
      ))}

      <Service y={TRACKS[0]} dir={-1} dur={6} delay={0} label="S" />
      <Service y={TRACKS[1]} dir={1} dur={7.2} delay={2.4} label="C" />
      <Service y={TRACKS[2]} dir={-1} dur={6.6} delay={4.4} helmet />

      <Lettering x={BOARD_L + 8} y={BOARD_B + 28} size={24} color={PEN_RED} anchor="start">
        NETWORK · LIVE
      </Lettering>

      {/* ── Him, at the console ────────────────────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        look={3}
        tilt={[-6, -10, -6]}
        tiltDur={2.4}
        // Near arm jabs at the buttons
        armRight={{ elbow: [34, 22], hand: [56, 52], swing: [0, 7, 0, 4, 0], dur: 2.4 }}
        armLeft={{ elbow: [-22, 34], hand: [-30, 70] }}
      />
      <Console />

      <Lettering x={DESK_L - 60} y={DESK_T - 40} size={30} color={INK} rotate={-8} scrawl>
        click.
      </Lettering>
    </g>
  );
}
