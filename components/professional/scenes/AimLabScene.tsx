"use client";

import { Headphones, INK, Jacob, Lettering, Loop, MusicNote, PAPER, PEN_BLUE, PEN_RED, Pulse, TINT, Travel } from "../Doodle";
import { UHMark } from "../Marks";
import { FLOOR_Y, JACOB_X } from "../facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// SHAKER LAB — AIM Lab @ UH
// A hemisphere bolted to the lid of a shaker table, the whole rig buzzing, the
// scope sweeping beside it. He has headphones in and is nodding along: the
// hook is "Vibe-Researching", so the vibration and the vibe are one reading.
// ─────────────────────────────────────────────────────────────────────────────

const JX = JACOB_X.aim;

const BOX_L = 470;
const BOX_R = 750;
const BOX_T = 420;
const DOME_CX = (BOX_L + BOX_R) / 2;
const DOME_R = 78;

// Scope screen
const SCR_X = 110;
const SCR_Y = 250;
const SCR_W = 260;
const SCR_H = 130;
const WAVELENGTH = 60;

/** One long sine, rounded so the server and browser write the same path. */
const WAVE = (() => {
  const mid = SCR_Y + SCR_H / 2;
  const pts: string[] = [];
  for (let x = 0; x <= SCR_W + WAVELENGTH * 2; x += 5) {
    const y = mid + 30 * Math.sin((2 * Math.PI * x) / WAVELENGTH);
    pts.push(`${pts.length ? "L" : "M"}${SCR_X + x} ${Math.round(y * 10) / 10}`);
  }
  return pts.join(" ");
})();

function Scope() {
  return (
    <g>
      <defs>
        <clipPath id="aim-scope">
          <rect x={SCR_X + 8} y={SCR_Y + 8} width={SCR_W - 16} height={SCR_H - 16} rx={6} />
        </clipPath>
      </defs>
      <rect x={SCR_X} y={SCR_Y} width={SCR_W} height={SCR_H} rx={12} fill="#e8f2f8" />
      <g clipPath="url(#aim-scope)">
        <path d={`M${SCR_X} ${SCR_Y + SCR_H / 2} h${SCR_W}`} strokeWidth={1.5} opacity={0.25} />
        <Loop type="translate" values={["0 0", `${-WAVELENGTH} 0`]} dur={1.1} linear>
          <path d={WAVE} stroke={PEN_RED} strokeWidth={3.5} />
        </Loop>
      </g>
      {/* Cart */}
      <path d={`M${SCR_X + SCR_W / 2} ${SCR_Y + SCR_H} V${FLOOR_Y - 24} M${SCR_X + 40} ${FLOOR_Y - 24} H${SCR_X + SCR_W - 40}`} />
      <circle cx={SCR_X + 52} cy={FLOOR_Y - 12} r={12} fill={PAPER} />
      <circle cx={SCR_X + SCR_W - 52} cy={FLOOR_Y - 12} r={12} fill={PAPER} />
      <Lettering x={SCR_X + SCR_W / 2} y={SCR_Y + SCR_H + 30} size={26} color={PEN_BLUE} scrawl>
        resonance sweep
      </Lettering>
    </g>
  );
}

function ShakerRig() {
  const bolts = [BOX_L + 34, BOX_L + 98, BOX_R - 98, BOX_R - 34];
  return (
    // Everything bolted to the table buzzes as one rigid body.
    <Loop type="translate" values={["0 0", "-2.5 1", "2 -1", "-1.5 1.2", "1.5 -0.6", "0 0"]} dur={0.34} linear>
      <path
        d={`M${DOME_CX - DOME_R} ${BOX_T} A ${DOME_R} ${DOME_R} 0 0 1 ${DOME_CX + DOME_R} ${BOX_T} Z`}
        fill="#ffffff"
      />
      <path
        d={`M${DOME_CX - DOME_R / 2} ${BOX_T} A ${DOME_R / 2} ${DOME_R} 0 0 1 ${DOME_CX + DOME_R / 2} ${BOX_T}`}
        strokeWidth={2}
        opacity={0.4}
      />
      <rect x={BOX_L} y={BOX_T} width={BOX_R - BOX_L} height={FLOOR_Y - BOX_T} rx={8} fill={TINT.pink} />
      <path d={`M${BOX_L - 14} ${BOX_T} H${BOX_R + 14}`} strokeWidth={7} />
      {bolts.map((x) => (
        <circle key={x} cx={x} cy={BOX_T + 22} r={5} fill={INK} stroke="none" />
      ))}
      <g transform={`translate(${DOME_CX} ${BOX_T + 72})`}>
        <UHMark />
      </g>
    </Loop>
  );
}

/** Parenthesis-shaped buzz marks either side of the rig. */
function Buzz() {
  return (
    <g strokeWidth={3} stroke={PEN_RED}>
      {[0, 1, 2].map((i) => {
        const gap = 18 + i * 16;
        const h = 36 + i * 12;
        const y = 470 - h / 2;
        return (
          <Pulse key={i} dur={0.7} delay={i * 0.12} values={[0.15, 0.9, 0.15]}>
            <path d={`M${BOX_R + gap} ${y} q ${10 + i * 2} ${h / 2} 0 ${h}`} />
            <path d={`M${BOX_L - gap} ${y} q ${-(10 + i * 2)} ${h / 2} 0 ${h}`} />
          </Pulse>
        );
      })}
    </g>
  );
}

export default function AimLabScene() {
  const beat = 1.05;

  return (
    <g>
      <Scope />
      <ShakerRig />
      <Buzz />
      <Lettering x={DOME_CX - 160} y={340} size={38} color={PEN_RED} rotate={-10} scrawl>
        bzzzz
      </Lettering>

      {/* Music, drifting up off the headphones */}
      {[0, 1, 2].map((i) => (
        <Travel key={i} path={`M${JX + 40} 330 C ${JX + 80} 290 ${JX + 60} 250 ${JX + 120} 190`} dur={3.3} delay={i * 1.1}>
          <MusicNote color={PEN_BLUE} />
        </Travel>
      ))}

      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        look={2}
        bob={[0, -6, 0]}
        bobDur={beat}
        tilt={[-3, 5, -3]}
        tiltDur={beat}
        armRight={{ elbow: [24, 34], hand: [32, 70], swing: [0, 7, 0], dur: beat }}
        armLeft={{ elbow: [-24, 34], hand: [-32, 70], swing: [0, -7, 0], dur: beat }}
        headProp={<Headphones />}
      />
    </g>
  );
}
