"use client";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────────────────────────────────────
   The sky over the Lab.

   Day: a pale blue wash and one sun. Night: stars, a crescent moon and a
   faint Milky Way band. Both layers are always mounted and cross-fade, so the
   flip feels like a light going out rather than a page swap.

   Every star comes from a seeded PRNG at module scope so the server and the
   client draw the identical sky — Math.random() here would fail hydration.
   ─────────────────────────────────────────────────────────────────────────── */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  delay: number;
  twinkle: boolean;
}

const W = 1000;
const H = 600;

/** Scattered field stars. */
const FIELD: Star[] = (() => {
  const rand = mulberry32(415);
  return Array.from({ length: 130 }, () => ({
    x: round(rand() * W),
    y: round(rand() * H * 0.92),
    r: round(rand() < 0.08 ? 1.6 + rand() * 0.8 : 0.5 + rand() * 0.8),
    o: round(0.35 + rand() * 0.6),
    delay: round(rand() * 6),
    twinkle: rand() < 0.35,
  }));
})();

/** Dense dust along the galactic band: a diagonal line with a soft spread. */
const BAND: Star[] = (() => {
  const rand = mulberry32(2026);
  // Band runs from lower-left to upper-right.
  const x0 = -60, y0 = 560, x1 = 1060, y1 = 40;
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len;
  return Array.from({ length: 260 }, () => {
    const t = rand();
    // Sum of uniforms ≈ normal, so dust thins out toward the band's edges.
    const spread = (rand() + rand() + rand() - 1.5) * 70;
    return {
      x: round(x0 + dx * t + nx * spread),
      y: round(y0 + dy * t + ny * spread),
      r: round(0.3 + rand() * 0.6),
      o: round(0.2 + rand() * 0.5),
      delay: 0,
      twinkle: false,
    };
  });
})();

const EASE = [0.65, 0, 0.35, 1] as const;

/** Starburst: long, faint primaries plus shorter secondaries between them,
 *  slightly irregular so it reads as optics rather than clip art. */
const SPIKES: { angle: number; length: number; width: number }[] = [
  { angle: 0, length: 98, width: 1.1 },
  { angle: 33, length: 58, width: 0.8 },
  { angle: 62, length: 92, width: 1.0 },
  { angle: 94, length: 50, width: 0.7 },
  { angle: 121, length: 96, width: 1.1 },
  { angle: 152, length: 62, width: 0.8 },
  { angle: 180, length: 90, width: 1.0 },
  { angle: 213, length: 54, width: 0.7 },
  { angle: 242, length: 97, width: 1.1 },
  { angle: 271, length: 60, width: 0.8 },
  { angle: 301, length: 88, width: 1.0 },
  { angle: 331, length: 52, width: 0.7 },
];

export function Sky({ night }: { night: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* ── Day ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: night ? 0 : 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          background:
            "linear-gradient(180deg, #a9cff2 0%, #cfe4f6 40%, rgba(244,241,234,0) 100%)",
        }}
      />

      {/* Sun, as the eye actually sees it: not a yellow disc but a small,
          nearly white core drowned in glare — a bright bloom, a wide warm
          haze, and the thin starburst spikes that eyelashes and the pupil
          edge diffract around any very bright point. */}
      <motion.div
        className="absolute right-[8%] top-[15%] h-14 w-14 sm:right-[12%] sm:top-[20%] sm:h-24 sm:w-24"
        initial={false}
        animate={night ? { y: 260, opacity: 0, scale: 0.9 } : { y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        {/* Atmospheric haze: brightens the sky around the sun, slightly warm */}
        <div className="absolute -inset-[260%] rounded-full bg-[radial-gradient(circle,rgba(255,252,240,0.55)_0%,rgba(255,247,225,0.28)_18%,rgba(235,244,252,0.12)_40%,rgba(235,244,252,0)_68%)]" />

        {/* Glare bloom */}
        <div className="absolute -inset-[90%] rounded-full bg-[radial-gradient(circle,#ffffff_0%,rgba(255,255,250,0.95)_14%,rgba(255,250,232,0.55)_32%,rgba(255,246,220,0.18)_55%,rgba(255,246,220,0)_72%)]" />

        {/* Diffraction spikes */}
        <motion.svg
          viewBox="-100 -100 200 200"
          className="absolute -inset-[160%] h-[420%] w-[420%] mix-blend-screen"
          animate={{ opacity: [0.75, 1, 0.8, 0.95, 0.75], rotate: [0, 1.5, 0, -1.5, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        >
          <defs>
            <radialGradient id="lab-spike" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.3" stopColor="#fffbea" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fffbea" stopOpacity="0" />
            </radialGradient>
            <filter id="lab-spike-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.7" />
            </filter>
          </defs>
          <g fill="url(#lab-spike)" filter="url(#lab-spike-blur)">
            {SPIKES.map(({ angle, length, width }) => (
              <polygon
                key={angle}
                points={`0,${-width} ${length},0 0,${width}`}
                transform={`rotate(${angle})`}
              />
            ))}
          </g>
        </motion.svg>

        {/* The disc itself: tiny, white-hot, edge lost in its own glow */}
        <div className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle,#ffffff_55%,#fffdf4_75%,rgba(255,250,235,0.9)_100%)] shadow-[0_0_18px_8px_rgba(255,255,255,0.95),0_0_60px_24px_rgba(255,250,230,0.7)]" />
      </motion.div>

      {/* ── Night ───────────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: night ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #02040c 0%, #070c1f 55%, rgba(6,9,20,0) 100%)",
          }}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <filter id="lab-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="38" />
            </filter>
          </defs>

          {/* Galactic glow: two soft clouds of light along the band */}
          <g filter="url(#lab-glow)" opacity="0.55">
            <ellipse cx="500" cy="300" rx="560" ry="46" transform="rotate(-25 500 300)" fill="#6d7fd6" opacity="0.35" />
            <ellipse cx="560" cy="270" rx="300" ry="30" transform="rotate(-25 560 270)" fill="#e9d5ff" opacity="0.35" />
            <ellipse cx="300" cy="400" rx="160" ry="22" transform="rotate(-25 300 400)" fill="#fde68a" opacity="0.18" />
          </g>

          {BAND.map((s, i) => (
            <circle key={`b${i}`} cx={s.x} cy={s.y} r={s.r} fill="#e0e7ff" opacity={s.o} />
          ))}

          {FIELD.map((s, i) => (
            <circle
              key={`f${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#f8fafc"
              opacity={s.o}
              className={s.twinkle ? "lab-twinkle" : undefined}
              style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
            />
          ))}
        </svg>
      </motion.div>

      {/* Moon: rises where the sun went down */}
      <motion.div
        className="absolute right-[9%] top-[14%] h-12 w-12 sm:right-[13%] sm:top-[19%] sm:h-24 sm:w-24"
        initial={false}
        animate={night ? { y: 0, opacity: 1, rotate: 0 } : { y: 220, opacity: 0, rotate: -20 }}
        transition={{ duration: 1.2, ease: EASE, delay: night ? 0.25 : 0 }}
      >
        <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(226,232,240,0.22),rgba(226,232,240,0)_65%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="lab-crescent">
              <rect width="100" height="100" fill="#fff" />
              <circle cx="66" cy="38" r="40" fill="#000" />
            </mask>
          </defs>
          <circle cx="50" cy="50" r="42" fill="#f1f5f9" mask="url(#lab-crescent)" />
        </svg>
      </motion.div>
    </div>
  );
}
