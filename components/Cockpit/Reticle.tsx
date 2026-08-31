"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* ───────────────────────────────────────────────────────────────────────────
   Targeting cursor.

   Only engages for a fine pointer with motion allowed — on touch, or when the
   viewer has asked for reduced motion, the native cursor stays put and this
   renders nothing.

   Anything interactive marked data-hud-target flips the reticle into its
   locked-on state.
   ─────────────────────────────────────────────────────────────────────────── */

export function usePreciseCursor(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOk(fine.matches && !reduce.matches);

    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  return ok;
}

export function Reticle({ enabled }: { enabled: boolean }) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 900, damping: 42, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 900, damping: 42, mass: 0.35 });

  const [hot, setHot] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const el = e.target as Element | null;
      setHot(Boolean(el?.closest?.("[data-hud-target]")));
    };
    // pointerout bubbles, so it fires constantly as the pointer crosses child
    // elements. A null relatedTarget is the only one that means "left the window".
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget === null) setVisible(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
      aria-hidden
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: hot ? 1 : 0.55 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {/* Rotating bracket ring, only meaningful when locked on */}
        <motion.svg
          viewBox="0 0 48 48"
          className={`h-12 w-12 ${hot ? "cockpit-reticle-spin" : ""}`}
          animate={{ opacity: hot ? 1 : 0.5 }}
          transition={{ duration: 0.15 }}
        >
          {[
            "M4 14 V4 H14",
            "M34 4 H44 V14",
            "M44 34 V44 H34",
            "M14 44 H4 V34",
          ].map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={hot ? "#fbbf24" : "#67e8f9"}
              strokeWidth="2"
              strokeLinecap="square"
            />
          ))}
          <circle
            cx="24"
            cy="24"
            r="13"
            fill="none"
            stroke={hot ? "rgba(251,191,36,0.45)" : "rgba(103,232,249,0.3)"}
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        </motion.svg>

        {/* Boresight dot + ticks */}
        <svg
          viewBox="0 0 48 48"
          className="absolute inset-0 h-12 w-12"
        >
          <circle cx="24" cy="24" r="1.8" fill={hot ? "#fde68a" : "#a5f3fc"} />
          <line x1="24" y1="16" x2="24" y2="20" stroke={hot ? "#fbbf24" : "#67e8f9"} strokeWidth="1.4" />
          <line x1="24" y1="28" x2="24" y2="32" stroke={hot ? "#fbbf24" : "#67e8f9"} strokeWidth="1.4" />
          <line x1="16" y1="24" x2="20" y2="24" stroke={hot ? "#fbbf24" : "#67e8f9"} strokeWidth="1.4" />
          <line x1="28" y1="24" x2="32" y2="24" stroke={hot ? "#fbbf24" : "#67e8f9"} strokeWidth="1.4" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
