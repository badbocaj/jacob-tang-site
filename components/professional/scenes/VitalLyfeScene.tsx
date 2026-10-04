"use client";

import { Jacob, Lettering, Loop, PAPER, PEN_BLUE, Pulse, RIG, TINT, Travel } from "../Doodle";
import { VitalLyfeMark } from "../Marks";
import { FLOOR_Y, JACOB_X } from "../facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// FILTRATION BAY — Vital Lyfe
// Sludge goes in one side of the box, drinking water comes out the other and
// straight into his mouth. He is very confident about this.
// ─────────────────────────────────────────────────────────────────────────────

const JX = JACOB_X.vital;

const BARREL_L = 120;
const BARREL_R = 290;
const BARREL_T = 404;
const BARREL_CX = (BARREL_L + BARREL_R) / 2;

const BOX_L = 470;
const BOX_R = 690;
const BOX_T = 424;

/** Just in front of his face — derived from the rig so the hose always lands. */
const MOUTH: [number, number] = [JX - RIG.headR - 2, FLOOR_Y + RIG.headY + 18];

const DIRTY = `M${BARREL_R} 476 Q 380 532 ${BOX_L} 488`;
const CLEAN = `M620 ${BOX_T} C 660 290 ${MOUTH[0] - 120} 270 ${MOUTH[0]} ${MOUTH[1]}`;

/** A hose is a fat ink stroke with a lighter core laid on top. */
function Hose({ d, core }: { d: string; core: string }) {
  return (
    <g>
      <path d={d} strokeWidth={20} />
      <path d={d} stroke={core} strokeWidth={13} />
    </g>
  );
}

function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <Pulse dur={1.6} delay={delay} values={[0, 1, 0]}>
      <path d={`M${x - 9} ${y} h18 M${x} ${y - 9} v18`} stroke={PEN_BLUE} strokeWidth={3} />
    </Pulse>
  );
}

export default function VitalLyfeScene() {
  return (
    <g>
      {/* ── Sludge barrel ──────────────────────────────────────────────── */}
      <rect x={BARREL_L} y={BARREL_T} width={BARREL_R - BARREL_L} height={FLOOR_Y - BARREL_T} rx={12} fill={TINT.sand} />
      <path d={`M${BARREL_L} 450 H${BARREL_R} M${BARREL_L} 505 H${BARREL_R}`} strokeWidth={2.5} opacity={0.5} />
      <ellipse cx={BARREL_CX} cy={BARREL_T} rx={85} ry={15} fill="#d9c39b" />
      <Loop type="translate" values={["0 0", "0 -2", "0 0", "0 2", "0 0"]} dur={4}>
        <ellipse cx={BARREL_CX} cy={BARREL_T + 1} rx={66} ry={8} fill={TINT.sludge} stroke="none" />
      </Loop>
      <Lettering x={BARREL_CX} y={478} size={26} scrawl>
        raw intake
      </Lettering>

      {/* ── Dirty in ───────────────────────────────────────────────────── */}
      <Hose d={DIRTY} core="#d6d3d1" />
      {[0, 0.9, 1.8].map((d) => (
        <Travel key={d} path={DIRTY} dur={2.7} delay={d}>
          <circle r={5} fill={TINT.sludge} stroke="none" />
        </Travel>
      ))}

      {/* ── Filter box ─────────────────────────────────────────────────── */}
      <rect x={BOX_L} y={BOX_T} width={BOX_R - BOX_L} height={FLOOR_Y - BOX_T} rx={10} fill={TINT.green} />
      <g transform={`translate(536 ${BOX_T + 66})`}>
        <VitalLyfeMark />
      </g>
      <Lettering x={626} y={BOX_T + 72} size={24}>
        Vital Lyfe
      </Lettering>
      <circle cx={BOX_R - 22} cy={BOX_T + 20} r={7} fill={PAPER} strokeWidth={2.5} />
      <Pulse dur={1.4} values={[0.25, 1, 0.25]}>
        <circle cx={BOX_R - 22} cy={BOX_T + 20} r={5} fill={TINT.pass} stroke="none" />
      </Pulse>

      {/* ── Clean out, straight to him ─────────────────────────────────── */}
      <Hose d={CLEAN} core={TINT.water} />
      {[0, 0.7, 1.4, 2.1].map((d) => (
        <Travel key={d} path={CLEAN} dur={2.8} delay={d}>
          <circle r={4.5} fill="#ffffff" stroke="none" />
        </Travel>
      ))}
      <Sparkle x={700} y={318} delay={0} />
      <Sparkle x={742} y={292} delay={0.5} />
      <Sparkle x={668} y={286} delay={1} />

      <Jacob
        x={JX}
        y={FLOOR_Y}
        flip
        look={2}
        bob={[0, -3, 0]}
        bobDur={3.2}
        tilt={[0, -5, 0]}
        tiltDur={3.2}
        // Near arm holds the hose to his mouth; far arm on the hip, pleased
        armRight={{ elbow: [30, 18], hand: [26, -14] }}
        armLeft={{ elbow: [-30, 30], hand: [-6, 54] }}
      />

      {/* Contented gulp */}
      <Pulse dur={3.2} values={[0, 0, 1, 0]}>
        <Loop type="translate" values={["0 0", "0 0", "0 -14", "0 -24"]} dur={3.2}>
          <Lettering x={JX + 62} y={FLOOR_Y + RIG.headY - 30} size={32} color={PEN_BLUE} rotate={10} scrawl>
            ahh
          </Lettering>
        </Loop>
      </Pulse>
    </g>
  );
}
