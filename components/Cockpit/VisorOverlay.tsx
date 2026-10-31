"use client";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────────────────────────────────────
   The visor itself.

   One plate that sweeps down over the camera and stays there. It carries the
   helmet aperture (a rounded window with a 100vmax box-shadow that swallows
   everything outside it), the holographic gridlines, and the CRT scanlines.

   The plate is overflow-hidden on purpose: that clips the aperture shadow to
   the plate, so while the plate is still off-screen the view stays clean.
   ─────────────────────────────────────────────────────────────────────────── */

const GRID_LINE = "rgba(34,211,238,0.5)";

export function VisorOverlay({ booting }: { booting: boolean }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
        initial={{ y: "-102%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, mass: 0.9 }}
      >
        {/* Tint of the visor material */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,20,34,0.66) 0%, rgba(3,10,20,0.26) 34%, rgba(3,10,20,0.30) 68%, rgba(5,20,34,0.70) 100%)",
          }}
        />

        {/* Helmet aperture — everything beyond it is the inside of the helmet */}
        <div
          className="absolute rounded-[42px]"
          style={{
            inset: "3.2vh 3.6vw",
            boxShadow:
              "0 0 0 100vmax rgba(1,3,8,0.9), inset 0 0 90px rgba(3,12,22,0.85)",
            border: "1px solid rgba(34,211,238,0.22)",
          }}
        />

        {/* Holographic gridlines ─────────────────────────────────────────── */}
        <div className="cockpit-holo absolute inset-0">
          {/* Receding floor grid across the glareshield */}
          <div
            className="absolute inset-x-0 bottom-0 h-[32%] opacity-15"
            style={{
              transform: "perspective(320px) rotateX(62deg)",
              transformOrigin: "50% 100%",
              backgroundImage:
                `repeating-linear-gradient(90deg, ${GRID_LINE} 0px, ${GRID_LINE} 1px, transparent 1px, transparent 56px),` +
                `repeating-linear-gradient(180deg, ${GRID_LINE} 0px, ${GRID_LINE} 1px, transparent 1px, transparent 42px)`,
              maskImage: "linear-gradient(180deg, transparent, #000 70%)",
              WebkitMaskImage: "linear-gradient(180deg, transparent, #000 70%)",
            }}
          />
        </div>

        <div className="cockpit-scanlines absolute inset-0 opacity-30" />

        {/* Leading edge of the plate — the bright line that drags it down */}
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[2px] bg-cyan-200"
          style={{ boxShadow: "0 0 44px 14px rgba(34,211,238,0.55)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />

      </motion.div>

      {/* Lock flash — a single frame of white as the plate seats */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-40 bg-cyan-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.5, 0] }}
        transition={{ duration: 0.55, times: [0, 0.58, 0.68, 1], ease: "easeOut" }}
      />

      {/* Power-up light sweep raking down the freshly seated visor */}
      {booting && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          <div
            className="cockpit-bootsweep absolute inset-x-0 h-[16vh]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(34,211,238,0.20) 45%, rgba(186,230,253,0.42) 60%, transparent)",
            }}
          />
        </div>
      )}
    </>
  );
}
