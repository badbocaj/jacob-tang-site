"use client";

import { MotionConfig } from "framer-motion";
import { Ink, INK } from "./Doodle";
import { Scrawl } from "./Marks";
import { ACCENT, FLOOR_Y, JOBS, ROOM_H, ROOM_W, type Job, type SceneKey } from "./facilityConfig";
import { dLine, dRect } from "@/lib/doodle";
import VitalLyfeScene from "./scenes/VitalLyfeScene";
import L3HarrisScene from "./scenes/L3HarrisScene";
import CurveScene from "./scenes/CurveScene";
import AimLabScene from "./scenes/AimLabScene";

// ─────────────────────────────────────────────────────────────────────────────
// THE STRIP
// Four jobs, four panels, read left to right and top to bottom. Every panel is
// a room in the same facility, so the walls, floor slab and stair shaft carry
// across the gutters and it still reads as one building.
// ─────────────────────────────────────────────────────────────────────────────

const SCENES: Record<SceneKey, () => React.ReactElement> = {
  vital: VitalLyfeScene,
  l3: L3HarrisScene,
  curve: CurveScene,
  aim: AimLabScene,
};

const WALL_L = 26;
const WALL_R = ROOM_W - 26;
const SHAFT_L = 46;
const SHAFT_R = 92;

/** Room fabric: slab, stair shaft and wall faces, identical in every panel. */
function RoomShell({ index, hatchId }: { index: number; hatchId: string }) {
  return (
    <g>
      {/* Slab, split either side of the stair shaft */}
      <rect x={0} y={FLOOR_Y} width={SHAFT_L - 6} height={ROOM_H - FLOOR_Y} fill={`url(#${hatchId})`} opacity={0.55} />
      <rect x={SHAFT_R + 6} y={FLOOR_Y} width={ROOM_W - SHAFT_R - 6} height={ROOM_H - FLOOR_Y} fill={`url(#${hatchId})`} opacity={0.55} />
      <Ink d={dLine(0, FLOOR_Y, SHAFT_L - 6, FLOOR_Y, 800 + index, 1.6)} w={3.2} />
      <Ink d={dLine(SHAFT_R + 6, FLOOR_Y, ROOM_W, FLOOR_Y, 810 + index, 2)} w={3.2} />

      {/* Stair shaft — the thread that ties the panels into one building */}
      <Ink d={dLine(SHAFT_L, 0, SHAFT_L, ROOM_H, 862 + index, 2.4)} w={2.2} opacity={0.35} />
      <Ink d={dLine(SHAFT_R, 0, SHAFT_R, ROOM_H, 863 + index, 2.4)} w={2.2} opacity={0.35} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <Ink key={k} d={dLine(SHAFT_L, 40 + k * 84, SHAFT_R, 40 + k * 84, 870 + index * 10 + k, 1)} w={1.8} opacity={0.25} />
      ))}

      {/* Interior wall faces */}
      <Ink d={dLine(WALL_L, 0, WALL_L, FLOOR_Y, 830 + index, 2)} w={2.2} opacity={0.45} />
      <Ink d={dLine(WALL_R, 0, WALL_R, FLOOR_Y, 840 + index, 2)} w={2.2} opacity={0.45} />
    </g>
  );
}

function Panel({ job, index }: { job: Job; index: number }) {
  const Scene = SCENES[job.key];
  // Ids must be unique per panel — four SVGs share one document.
  const hatchId = `slabHatch-${job.key}`;

  return (
    <figure className="group relative m-0 min-h-0 overflow-hidden rounded-sm max-lg:aspect-[1200/620]">
      <svg
        viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Panel ${index + 1}. ${job.company}: a stick figure in the ${job.room}.`}
      >
        <defs>
          <pattern id={hatchId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={INK} strokeWidth="1.4" opacity="0.5" />
          </pattern>
        </defs>

        <RoomShell index={index} hatchId={hatchId} />
        <Scene />

        {/* Panel frame, drawn in the same hand as everything inside it */}
        <Ink
          d={dRect(5, 5, ROOM_W - 10, ROOM_H - 10, 960 + index, 2.6)}
          w={4}
          color={INK}
          opacity={0.55}
        />

        {/* Panel number, bottom right, comic style */}
        <Scrawl x={ROOM_W - 40} y={ROOM_H - 28} size={30} color={INK} opacity={0.35}>
          {index + 1}
        </Scrawl>
      </svg>

      {/* ── Caption box ─────────────────────────────────────────────────── */}
      <figcaption className="pointer-events-none absolute left-[3%] top-[5%] max-w-[62%]">
        <div className="inline-block border border-white/25 bg-black/85 px-3 py-2 backdrop-blur-[2px]">
          <p className="font-mono text-xs uppercase tracking-label text-amber-400/70">
            {job.period} · {job.location}
          </p>
          <p className="mt-1 text-lg font-bold leading-tight text-white">{job.company}</p>
          <p className="font-mono text-xs text-zinc-400">{job.title}</p>
          {/* Appears on its own once there is real copy in facilityConfig */}
          {!job.description.startsWith("Placeholder") && (
            <p className="mt-2 max-w-[34ch] text-xs leading-relaxed text-zinc-400">
              {job.description}
            </p>
          )}
        </div>
      </figcaption>

      {/* ── Narration box ───────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute bottom-[5%] left-[3%] max-w-[72%]">
        <p className="font-hand inline-block border border-amber-400/25 bg-black/85 px-3 py-1.5 text-base leading-snug text-amber-200/90">
          “{job.hook}”
        </p>
      </div>

    </figure>
  );
}

export default function ComicStrip() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4"
        style={{ color: ACCENT }}
      >
        {JOBS.map((job, i) => (
          <Panel key={job.key} job={job} index={i} />
        ))}
      </div>
    </MotionConfig>
  );
}
