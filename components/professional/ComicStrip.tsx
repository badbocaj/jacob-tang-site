"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HAND_FONT, INK, PAPER, PEN, PEN_BLUE, SCRAWL_FONT, StillContext, TINT } from "./Doodle";
import { FLOOR_Y, HEAD_TOP_Y, JACOB_X, JOBS, ROOM_H, ROOM_W, type Job, type SceneKey } from "./facilityConfig";
import VitalLyfeScene from "./scenes/VitalLyfeScene";
import L3HarrisScene from "./scenes/L3HarrisScene";
import CurveScene from "./scenes/CurveScene";
import AimLabScene from "./scenes/AimLabScene";

// ─────────────────────────────────────────────────────────────────────────────
// THE STRIP
// Four jobs, four panels on one comic page, read left to right and top to
// bottom. Same stationery as the /about journal: cream paper, one black pen,
// yellow narration boxes, and Jacob saying the hook in a speech bubble.
//
// Panel art lives in fixed 1200×620 scene units, so the lettering on top is
// sized in container units (cqw) and scales with the panel it sits in. On a
// phone the panel is taller than the art, which sits on the bottom and leaves
// headroom for the narration box — the lettering can't shrink as far as the
// drawing can and would otherwise land on top of it.
// ─────────────────────────────────────────────────────────────────────────────

const SCENES: Record<SceneKey, () => React.ReactElement> = {
  vital: VitalLyfeScene,
  l3: L3HarrisScene,
  curve: CurveScene,
  aim: AimLabScene,
};

/** Panels are dealt onto the page one after another, like reading them. */
const DEAL = { type: "spring", stiffness: 240, damping: 24 } as const;
const POP = { type: "spring", stiffness: 400, damping: 20 } as const;

function Floor() {
  const ticks: number[] = [];
  for (let x = 40; x < ROOM_W; x += 64) ticks.push(x);
  return (
    <g>
      <path d={`M0 ${FLOOR_Y} H${ROOM_W}`} strokeWidth={4.5} />
      <g strokeWidth={2.2} opacity={0.28}>
        {ticks.map((x) => (
          <path key={x} d={`M${x} ${FLOOR_Y + 16} l-18 24`} />
        ))}
      </g>
    </g>
  );
}

function Narration({ job }: { job: Job }) {
  return (
    <figcaption
      className="absolute left-[2.5%] top-[4%] max-w-[52%] border-[2.5px] px-[1.6cqw] py-[1.1cqw]"
      style={{ background: TINT.yellow, borderColor: INK, boxShadow: `3px 3px 0 ${INK}`, color: INK }}
    >
      <p className="m-0 uppercase leading-none tracking-wide opacity-70" style={{ ...HAND_FONT, fontSize: "clamp(10px, 1.55cqw, 14px)" }}>
        {job.period} · {job.location}
      </p>
      <p className="m-0 mt-[0.5cqw] uppercase leading-none" style={{ ...HAND_FONT, fontSize: "clamp(16px, 3.3cqw, 28px)" }}>
        {job.company}
      </p>
      <p className="m-0 leading-tight" style={{ ...SCRAWL_FONT, color: PEN_BLUE, fontSize: "clamp(14px, 2.5cqw, 22px)" }}>
        {job.title}
      </p>
      {/* Appears on its own once there is real copy in facilityConfig */}
      {!job.description.startsWith("Placeholder") && (
        <p className="m-0 mt-[0.6cqw] max-w-[38ch] leading-snug" style={{ ...HAND_FONT, fontSize: "clamp(11px, 1.7cqw, 15px)" }}>
          {job.description}
        </p>
      )}
    </figcaption>
  );
}

function SpeechBubble({ job, index }: { job: Job; index: number }) {
  const jx = JACOB_X[job.key];
  // Hang the bubble up and to the left of his head, tail pointing down at it.
  const box: CSSProperties = {
    right: `${((ROOM_W - (jx + 56)) / ROOM_W) * 100}%`,
    bottom: `${((ROOM_H - (HEAD_TOP_Y - 20)) / ROOM_H) * 100}%`,
    // Never narrower than a few words, so a phone bubble stays three lines.
    maxWidth: "max(36%, 12em)",
    transformOrigin: "85% 100%",
  };

  return (
    <motion.div
      className="absolute"
      style={box}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...POP, delay: 0.5 + index * 0.14 }}
    >
      <p
        className="relative m-0 rounded-[1.3em] border-[2.5px] bg-white px-[1em] py-[0.5em] leading-[1.15]"
        style={{ ...HAND_FONT, color: INK, borderColor: INK, fontSize: "clamp(11px, 2.25cqw, 19px)" }}
      >
        {job.hook}
        <svg
          aria-hidden
          viewBox="0 0 24 18"
          className="absolute right-[16%] top-full -mt-[3px] h-[1.05em] w-[1.3em]"
          style={{ overflow: "visible" }}
        >
          <path d="M1 0 L17 17 L21 0" fill="#ffffff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
      </p>
    </motion.div>
  );
}

function Panel({ job, index }: { job: Job; index: number }) {
  const Scene = SCENES[job.key];

  return (
    <motion.figure
      className="relative m-0 aspect-[1200/860] overflow-hidden sm:aspect-[1200/620]"
      style={{
        containerType: "inline-size",
        background: PAPER,
        border: `3px solid ${INK}`,
        borderRadius: 3,
      }}
      initial={{ opacity: 0, y: 22, rotate: index % 2 ? 1.2 : -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ ...DEAL, delay: 0.08 + index * 0.14 }}
      whileHover={{ y: -4, boxShadow: `6px 8px 0 rgba(31,35,40,0.85)` }}
    >
      {/* The art box: exactly the scene's shape, pinned to the panel floor */}
      <div className="absolute inset-x-0 bottom-0" style={{ aspectRatio: `${ROOM_W} / ${ROOM_H}` }}>
        <svg
          viewBox={`0 0 ${ROOM_W} ${ROOM_H}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Panel ${index + 1}. ${job.company}: Jacob in the ${job.room}.`}
        >
          <g {...PEN}>
            <Floor />
            <Scene />
          </g>
        </svg>
        <SpeechBubble job={job} index={index} />
      </div>

      <Narration job={job} />

      <span
        aria-hidden
        className="absolute bottom-[2%] right-[1.6%] leading-none opacity-50"
        style={{ ...SCRAWL_FONT, color: INK, fontSize: "clamp(14px, 2.6cqw, 22px)" }}
      >
        {index + 1}
      </span>
    </motion.figure>
  );
}

const noSubscribe = () => () => {};

export default function ComicStrip() {
  const reduceMotion = useReducedMotion();
  // The server can't know the reader's motion setting, so the first client
  // render has to match it (animated); the still version swaps in after.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  return (
    <StillContext.Provider value={hydrated && Boolean(reduceMotion)}>
      <div
        className="mx-auto w-full rounded-[4px] p-3 sm:p-4 lg:max-w-(--sheet-max)"
        style={{
          // Two rows of panels plus the gutter have to fit under the masthead,
          // so the sheet's width follows the viewport's height.
          ["--sheet-max" as string]: `calc((100svh - 18rem) * ${(ROOM_W / ROOM_H).toFixed(4)} + 3rem)`,
          background: "#f3eee0",
          boxShadow: "0 28px 60px rgba(0,0,0,0.6), 0 8px 18px rgba(0,0,0,0.45)",
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {JOBS.map((job, i) => (
            <Panel key={job.key} job={job} index={i} />
          ))}
        </div>
      </div>
    </StillContext.Provider>
  );
}
