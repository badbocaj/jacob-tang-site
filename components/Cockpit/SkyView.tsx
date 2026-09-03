"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

import { ASTEROIDS, NAV_TABS, type Asteroid, type NavTab } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   SKY VIEW — the arrow-key half of the navigation.

   Pitch the nose up and a panel of deep space slides down over the city. It
   carries a streaking starfield (canvas, because 400 line segments a frame is
   not a job for the DOM) and one slowly tumbling asteroid per channel, held
   far enough out that they read as distant targets rather than obstacles.

   The mouse is the trigger. Put the reticle on a rock, click, and the bolts
   converge on the cursor — a hit hands the channel back up to the cockpit,
   which runs its usual transition.

   Geometry note: the asteroids live INSIDE the sliding panel, so they inherit
   its translate for free. Their own transforms only ever handle yaw (side to
   side) and drift, which keeps the maths in this file to two lines.
   ─────────────────────────────────────────────────────────────────────────── */

const HIT_MS = 420;
const BOLT_MS = 260;

interface SkyViewProps {
  /** 0 = eyes on the deck, 1 = nose fully up. */
  pitch: MotionValue<number>;
  /** -1 … 1, left to right. */
  yaw: MotionValue<number>;
  /** True once pitch is past the threshold: fire control is live. */
  active: boolean;
  /** A channel transition is already running — the trigger is dead. */
  busy: boolean;
  onEngage: (tab: NavTab) => void;
}

interface Bolt {
  id: number;
  x: number;
  y: number;
  hit: boolean;
}

/* ───────────────────────────────────────────────────────────────────────────
   Where the shot landed.

   Deliberately geometric rather than a DOM hit-test: the trigger fires from a
   window listener, and anything that ever ends up layered over the sky (the
   visor, the canopy, the HUD plane) would otherwise eat the shot before the
   rock saw it. Measuring at click time also makes the trigger forgiving — the
   hitbox is a circle the size of the target box, not the jagged silhouette
   inside it.

   The [data-rock] node is deliberately an unrotated div: its rect is the rock's
   true centre no matter where in the tumble the silhouette happens to be.
   ─────────────────────────────────────────────────────────────────────────── */

function hitTestRocks(x: number, y: number, dead: string[]): string | null {
  let best: { id: string; d: number } | null = null;

  for (const node of document.querySelectorAll<HTMLElement>("[data-rock]")) {
    const id = node.dataset.rock;
    if (!id || dead.includes(id)) continue;

    const rect = node.getBoundingClientRect();
    // Radius comes off the element, not the rect: the rect grows as the rock
    // tumbles, and the hitbox should not breathe with it.
    const radius = Number(node.dataset.rockR ?? 0);
    if (!radius) continue;

    const d = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
    if (d <= radius && (!best || d < best.d)) best = { id, d };
  }

  return best?.id ?? null;
}

export function SkyView({ pitch, yaw, active, busy, onEngage }: SkyViewProps) {
  const reduced = useReducedMotion() ?? false;

  // Shared clock for drift and tumble, so every rock reads off one timeline.
  const clock = useMotionValue(0);
  useAnimationFrame((t) => clock.set(t / 1000));

  const panelY = useTransform(pitch, [0, 1], ["-100vh", "0vh"]);

  const [bolts, setBolts] = useState<Bolt[]>([]);
  const [blast, setBlast] = useState<{ id: number; x: number; y: number } | null>(null);
  const [killed, setKilled] = useState<string[]>([]);
  const [locked, setLocked] = useState<Asteroid | null>(null);
  const [shots, setShots] = useState(0);

  const boltId = useRef(0);

  // ── Trigger ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active || busy) return;

    const onFire = (e: PointerEvent) => {
      if (e.button !== 0) return;

      // Real chrome under the cursor (the quick-nav switch, the dossier) is a
      // UI click, not a shot.
      const el = e.target as Element | null;
      if (el?.closest?.("button, a, input, label")) return;

      const struck = hitTestRocks(e.clientX, e.clientY, killed);
      const tab = struck ? (NAV_TABS.find((t) => t.id === struck) ?? null) : null;

      const id = ++boltId.current;
      setBolts((b) => [...b, { id, x: e.clientX, y: e.clientY, hit: Boolean(tab) }]);
      setShots((n) => n + 1);
      window.setTimeout(() => setBolts((b) => b.filter((x) => x.id !== id)), BOLT_MS);

      if (!tab) return;

      window.setTimeout(() => {
        setBlast({ id, x: e.clientX, y: e.clientY });
        setKilled((k) => [...k, tab.id]);
        window.setTimeout(() => onEngage(tab), HIT_MS);
      }, BOLT_MS * 0.55);
    };

    window.addEventListener("pointerdown", onFire);
    return () => window.removeEventListener("pointerdown", onFire);
  }, [active, busy, killed, onEngage]);

  // A lock-on would otherwise survive being pitched back down to the city and
  // still be showing when you come back up. Adjusting during render (rather
  // than in an effect) keeps it from painting one frame of the stale target.
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setLocked(null);
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden={!active}>
      {/* ══ THE SKY PANEL ═══════════════════════════════════════════════════
          Slides down from above as the nose comes up. Everything in here is
          "out there"; the fire-control readout below is on the glass. */}
      <motion.div className="absolute inset-0" style={{ y: panelY }}>
        {/* Deep space plus a cold nebula wash, so it is not flat black */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 22% 8%, rgba(14,58,88,0.55) 0%, transparent 55%)," +
              "radial-gradient(90% 70% at 82% 30%, rgba(58,22,74,0.45) 0%, transparent 60%)," +
              "linear-gradient(180deg, #01030a 0%, #020617 62%, #030a16 100%)",
          }}
        />

        <Starfield pitch={pitch} yaw={yaw} reduced={reduced} />

        {ASTEROIDS.map((rock) => {
          const tab = NAV_TABS.find((t) => t.id === rock.id);
          if (!tab) return null;
          return (
            <AsteroidTarget
              key={rock.id}
              rock={rock}
              tab={tab}
              yaw={yaw}
              clock={clock}
              reduced={reduced}
              armed={active && !busy}
              dead={killed.includes(rock.id)}
              onLock={setLocked}
            />
          );
        })}

        {/* Horizon seam — where the panel meets the city on the way up */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(8,47,73,0.35) 62%, rgba(34,211,238,0.16) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background: "rgba(103,232,249,0.35)",
            boxShadow: "0 0 18px rgba(34,211,238,0.55)",
          }}
        />
      </motion.div>

      {/* ══ FIRE CONTROL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="fcs"
            className="pointer-events-none absolute inset-x-0 bottom-28 flex flex-col items-center gap-1.5 px-4 text-center font-mono text-xs uppercase tracking-label"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex items-center gap-2">
              <span className="cockpit-prompt block h-1.5 w-1.5 rounded-full bg-amber-300" />
              <span
                className="text-amber-300/90"
                style={{ textShadow: "0 0 12px rgba(251,191,36,0.6)" }}
              >
                FIRE CONTROL :: ARMED
              </span>
              <span className="tabular-nums text-cyan-300/40">
                RDS {String(shots).padStart(3, "0")}
              </span>
            </div>
            <div className="text-cyan-300/55">
              {locked ? (
                <span className="text-cyan-100/90">
                  LOCK :: {locked.id.toUpperCase()} · RNG {locked.range} — CLICK TO FIRE
                </span>
              ) : (
                "SLEW WITH ← → · PAINT A ROCK WITH THE RETICLE"
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BOLTS ═══════════════════════════════════════════════════════════
          Two cannons in the wing roots converging on the cursor. */}
      <AnimatePresence>
        {bolts.map((b) => (
          <motion.svg
            key={b.id}
            className="pointer-events-none fixed inset-0 z-[70] h-full w-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: BOLT_MS / 1000, ease: "easeIn" }}
          >
            {[0, 1].map((side) => (
              <motion.line
                key={side}
                x1={side ? "96%" : "4%"}
                y1="112%"
                x2={b.x}
                y2={b.y}
                stroke={b.hit ? "#fde68a" : "#67e8f9"}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: BOLT_MS / 2200, ease: "linear" }}
              />
            ))}
          </motion.svg>
        ))}
      </AnimatePresence>

      {/* ══ IMPACT ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {blast && (
          <motion.div
            key={blast.id}
            className="pointer-events-none fixed z-[70]"
            style={{ left: blast.x, top: blast.y }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: HIT_MS / 1000, ease: "easeOut" }}
          >
            <motion.span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 40,
                height: 40,
                border: "2px solid rgba(253,230,138,0.9)",
                boxShadow: "0 0 40px rgba(251,191,36,0.75)",
              }}
              initial={{ scale: 0.2 }}
              animate={{ scale: 5.5 }}
              transition={{ duration: HIT_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
            />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute block h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 bg-amber-200"
                  style={{ boxShadow: "0 0 8px rgba(251,191,36,0.9)" }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: Math.cos(a) * 150, y: Math.sin(a) * 150, opacity: 0 }}
                  transition={{ duration: HIT_MS / 1000, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   One rock.

   The outer motion.div handles yaw, the inner one drift, and the polygon is
   the only thing that takes pointer events — so a shot has to land on the
   silhouette rather than its bounding box.
   ─────────────────────────────────────────────────────────────────────────── */

interface AsteroidTargetProps {
  rock: Asteroid;
  tab: NavTab;
  yaw: MotionValue<number>;
  clock: MotionValue<number>;
  reduced: boolean;
  armed: boolean;
  dead: boolean;
  onLock: (rock: Asteroid | null) => void;
}

function AsteroidTarget({
  rock,
  tab,
  yaw,
  clock,
  reduced,
  armed,
  dead,
  onLock,
}: AsteroidTargetProps) {
  const [hot, setHot] = useState(false);

  // Rocks lower in the field swing wider — cheap parallax inside the panel, so
  // slewing left and right does not feel like one flat sheet.
  const depth = 0.55 + rock.y * 0.75;
  const x = useTransform(yaw, [-1, 1], [`${34 * depth}vw`, `${-34 * depth}vw`]);
  const drift = useTransform(clock, (t: number) =>
    reduced ? 0 : Math.sin((t / rock.bobDur + rock.phase) * Math.PI * 2) * rock.bobAmp,
  );
  const spin = useTransform(clock, (t: number) =>
    reduced ? 0 : (t / rock.spin) * 360 * rock.dir,
  );

  const locked = Boolean(tab.locked);
  const stroke = locked
    ? hot
      ? "#fca5a5"
      : "rgba(251,191,36,0.75)"
    : hot
      ? "#a5f3fc"
      : "rgba(103,232,249,0.6)";

  const size = rock.r * 2;
  /** Trigger radius. A shade under the target box, generous against the rock. */
  const hitR = rock.r * 0.92;
  const gradId = `rock-shade-${rock.id}`;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${rock.x * 100}%`,
        top: `${rock.y * 100}%`,
        x,
        marginLeft: -rock.r,
        marginTop: -rock.r,
      }}
    >
      <motion.div style={{ y: drift }} className="relative">
        <AnimatePresence>
          {!dead && (
            <motion.div
              className="relative"
              initial={false}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.18 }}
            >
              <motion.svg
                viewBox="-1.35 -1.35 2.7 2.7"
                width={size}
                height={size}
                className="pointer-events-none block overflow-visible"
                style={{ rotate: spin }}
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                <polygon
                  points={rock.points}
                  fill={locked ? "rgba(38,10,10,0.92)" : "rgba(9,17,28,0.92)"}
                  stroke={stroke}
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    filter: hot
                      ? `drop-shadow(0 0 10px ${
                          locked ? "rgba(248,113,113,0.8)" : "rgba(34,211,238,0.8)"
                        })`
                      : "none",
                  }}
                />

                {/* Terminator shading */}
                <polygon points={rock.points} fill={`url(#${gradId})`} />

                {rock.craters.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={c.r}
                    fill="rgba(0,0,0,0.45)"
                    stroke={stroke}
                    strokeWidth={0.7}
                    vectorEffect="non-scaling-stroke"
                    opacity={0.65}
                  />
                ))}
              </motion.svg>

              {/* The hitbox — one circle that the reticle, the lock-on and
                  hitTestRocks all agree on, so what looks targetable is what
                  is targetable. Sized off the target box rather than the
                  jagged silhouette, because this is a trigger, not surgery. */}
              <div
                data-rock={rock.id}
                data-rock-r={hitR}
                data-hud-target
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: hitR * 2,
                  height: hitR * 2,
                  pointerEvents: armed ? "auto" : "none",
                }}
                onPointerEnter={() => {
                  setHot(true);
                  onLock(rock);
                }}
                onPointerLeave={() => {
                  setHot(false);
                  onLock(null);
                }}
              />

              {/* Target box */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: size + 28, height: size + 28 }}
              >
                <TargetBox color={stroke} hot={hot} />
              </div>

              {/* Channel label */}
              <motion.div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center font-mono text-xs uppercase tracking-label"
                style={{ top: size + 22 }}
                animate={{ opacity: hot ? 1 : 0.6 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  style={{
                    color: locked ? "#fca5a5" : "#cffafe",
                    textShadow: hot
                      ? `0 0 12px ${
                          locked ? "rgba(248,113,113,0.8)" : "rgba(34,211,238,0.8)"
                        }`
                      : "none",
                  }}
                >
                  {locked ? `[ ${tab.label} ]` : tab.label}
                </div>
                <div
                  className={`mt-0.5 ${
                    tab.construction ? "text-amber-300/70" : "text-cyan-300/45"
                  }`}
                >
                  {tab.construction
                    ? "UNDER CONSTRUCTION"
                    : hot
                      ? tab.sub
                      : `RNG ${rock.range}`}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/** Four corner ticks that snap outward when the rock is painted. */
function TargetBox({ color, hot }: { color: string; hot: boolean }) {
  const arm = hot ? 14 : 8;
  const off = hot ? 0 : 7;
  const corners = [
    { key: "tl", top: off, left: off, borderTopWidth: 1, borderLeftWidth: 1 },
    { key: "tr", top: off, right: off, borderTopWidth: 1, borderRightWidth: 1 },
    { key: "bl", bottom: off, left: off, borderBottomWidth: 1, borderLeftWidth: 1 },
    { key: "br", bottom: off, right: off, borderBottomWidth: 1, borderRightWidth: 1 },
  ];

  return (
    <>
      {corners.map(({ key, ...c }) => (
        <span
          key={key}
          className="absolute block border-solid transition-all duration-200"
          style={{
            width: arm,
            height: arm,
            borderColor: color,
            borderWidth: 0,
            opacity: hot ? 1 : 0.35,
            ...c,
          }}
        />
      ))}
    </>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   Starfield.

   Classic z-tunnel: each star keeps its previous depth, so the segment between
   the two projections is the streak. Speed is tied to pitch, which makes the
   sky accelerate as you commit to looking up.
   ─────────────────────────────────────────────────────────────────────────── */

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  b: number;
  hot: boolean;
}

const STAR_COUNT = 420;

function seedStar(s: Star, initial: boolean) {
  s.x = Math.random() * 2 - 1;
  s.y = Math.random() * 2 - 1;
  s.z = initial ? 0.05 + Math.random() * 0.95 : 1;
  s.pz = s.z;
  s.b = 0.35 + Math.random() * 0.65;
  s.hot = Math.random() < 0.08;
}

function Starfield({
  pitch,
  yaw,
  reduced,
}: {
  pitch: MotionValue<number>;
  yaw: MotionValue<number>;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[] | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const ctx = canvasRef.current?.getContext("2d");
    const { w, h } = sizeRef.current;
    if (!ctx || !w || !h) return;

    const p = pitch.get();
    // Nothing to draw while the panel is still parked above the canopy.
    if (p <= 0.001) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    // Seeded on the first frame that matters, never during render — the canvas
    // contributes nothing to SSR markup, so Math.random() here is safe.
    let stars = starsRef.current;
    if (!stars) {
      stars = Array.from({ length: STAR_COUNT }, () => {
        const s: Star = { x: 0, y: 0, z: 1, pz: 1, b: 1, hot: false };
        seedStar(s, true);
        return s;
      });
      starsRef.current = stars;
    }

    const dt = Math.min(delta, 50) / 1000;
    const speed = (reduced ? 0.05 : 0.26) * (0.3 + p * 1.35);
    const ox = -yaw.get() * w * 0.3;
    const cx = w / 2;
    const cy = h / 2;
    const f = w * 0.42;

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";

    for (const s of stars) {
      s.pz = s.z;
      s.z -= speed * dt;
      if (s.z <= 0.04) {
        seedStar(s, false);
        continue;
      }

      const sx = cx + (s.x / s.z) * f + ox;
      const sy = cy + (s.y / s.z) * f;
      if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) continue;

      const px = cx + (s.x / s.pz) * f + ox;
      const py = cy + (s.y / s.pz) * f;

      const a = Math.min(1, (1 - s.z) * 1.2) * s.b;
      ctx.strokeStyle = s.hot
        ? `rgba(253,230,138,${a.toFixed(3)})`
        : `rgba(207,250,254,${a.toFixed(3)})`;
      ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.2);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
  });

  return (
    <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
  );
}
