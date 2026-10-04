"use client";

import { INK, Jacob, Lettering, Loop, PAPER, Pulse, TINT, Travel } from "../Doodle";
import { L3Mark } from "../Marks";
import { FLOOR_Y, JACOB_X } from "../facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// INSPECTION LINE — L3Harris
// Parts ride the belt to the end, where he checks each one under the glass
// and it gets the green tick. The belt only has to read as a belt.
// ─────────────────────────────────────────────────────────────────────────────

const JX = JACOB_X.l3;

const BELT_L = 110;
const BELT_R = 880;
const BELT_T = 432;
const BELT_H = 40;
const ROLL_Y = BELT_T + BELT_H / 2;
const ROLLERS = [146, 236, 326, 416, 506, 596, 686, 776, 846];

/** One part every CYCLE / 3 seconds, so the tick lands on a beat. */
const CYCLE = 6;
const PART_Y = BELT_T - 30;

function Roller({ x }: { x: number }) {
  return (
    <g>
      <circle cx={x} cy={ROLL_Y} r={13} fill={PAPER} strokeWidth={2.5} />
      <Loop type="rotate" values={[`0 ${x} ${ROLL_Y}`, `360 ${x} ${ROLL_Y}`]} dur={1.2} linear>
        <path d={`M${x} ${ROLL_Y - 13} V${ROLL_Y + 13}`} strokeWidth={2.5} />
      </Loop>
    </g>
  );
}

export default function L3HarrisScene() {
  return (
    <g>
      {/* ── Line sign ──────────────────────────────────────────────────── */}
      <path d={`M150 290 V${BELT_T} M350 290 V${BELT_T}`} strokeWidth={3} />
      <rect x={120} y={232} width={260} height={62} rx={8} fill={TINT.blue} />
      <Lettering x={250} y={264} size={30}>
        QUALITY · LINE 3
      </Lettering>

      {/* ── Belt ───────────────────────────────────────────────────────── */}
      <rect x={BELT_L} y={BELT_T} width={BELT_R - BELT_L} height={BELT_H} rx={BELT_H / 2} fill="#e5e7eb" />
      {ROLLERS.map((x) => (
        <Roller key={x} x={x} />
      ))}
      <path d={`M190 ${BELT_T + BELT_H} V${FLOOR_Y} M800 ${BELT_T + BELT_H} V${FLOOR_Y}`} />
      <path d={`M172 ${FLOOR_Y} H208 M782 ${FLOOR_Y} H818`} strokeWidth={5} />

      {/* ── Parts in transit ───────────────────────────────────────────── */}
      {[0, 1, 2].map((i) => (
        <Travel key={i} path={`M${BELT_L + 50} ${PART_Y} H${BELT_R - 40}`} dur={CYCLE} delay={(i * CYCLE) / 3}>
          <g transform="scale(0.8)">
            <L3Mark />
          </g>
        </Travel>
      ))}

      {/* ── The tick, each time a part reaches the glass ───────────────── */}
      <Pulse dur={CYCLE / 3} values={[0, 0, 0, 1, 1, 0]}>
        <path d="M842 340 l16 18 l34 -44" stroke={TINT.pass} strokeWidth={8} />
        <Lettering x={874} y={378} size={22} color={TINT.pass}>
          PASS
        </Lettering>
      </Pulse>

      {/* ── Him, with the glass and a clipboard ────────────────────────── */}
      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        look={4}
        bob={[0, -3, 0]}
        bobDur={2.6}
        tilt={[-10, -15, -10]}
        tiltDur={2.6}
        armRight={{ elbow: [34, 30], hand: [60, 34], swing: [0, -5, 0], dur: 2.6 }}
        armRightProp={
          <g transform="translate(60 34)">
            <path d="M0 0 L14 -10" strokeWidth={5} />
            <circle cx={30} cy={-20} r={20} fill="rgba(191,219,254,0.45)" strokeWidth={4} />
          </g>
        }
        armLeft={{ elbow: [-26, 30], hand: [-18, 62] }}
        armLeftProp={
          <g transform="translate(-18 62)">
            <rect x={-20} y={-8} width={36} height={46} rx={3} fill={PAPER} strokeWidth={3} />
            <path d="M-12 6 h20 M-12 16 h20 M-12 26 h12" strokeWidth={2} stroke={INK} opacity={0.6} />
          </g>
        }
      />
    </g>
  );
}
