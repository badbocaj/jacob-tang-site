"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Brackets } from "./HudPrimitives";
import { NAV_TABS, type NavTab } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   Top HUD channel bar.

   Hover behaviour ("micro-holographic expansion"): the tab lifts a fraction,
   its corner brackets push outward, a scan bar rakes across it, and the
   channel sub-label unfolds underneath — absolutely positioned so nothing in
   the bar reflows while you sweep along it.
   ─────────────────────────────────────────────────────────────────────────── */

interface HudNavProps {
  onSelect: (tab: NavTab) => void;
  /** Tab currently mid-transition, so it can hold a "locked on" state. */
  engagingId: string | null;
}

const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

export function HudNav({ onSelect, engagingId }: HudNavProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className="pointer-events-auto flex flex-wrap items-start justify-center gap-1 sm:gap-2">
      {NAV_TABS.map((tab, i) => {
        const isHot = hovered === tab.id || engagingId === tab.id;
        const locked = Boolean(tab.locked);

        const line = locked
          ? isHot
            ? "rgba(248,113,113,0.95)"
            : "rgba(251,191,36,0.6)"
          : isHot
            ? "rgba(103,232,249,0.95)"
            : "rgba(34,211,238,0.35)";

        return (
          <motion.button
            key={tab.id}
            type="button"
            data-hud-target
            onClick={() => onSelect(tab)}
            onHoverStart={() => setHovered(tab.id)}
            onHoverEnd={() => setHovered((h) => (h === tab.id ? null : h))}
            onFocus={() => setHovered(tab.id)}
            onBlur={() => setHovered((h) => (h === tab.id ? null : h))}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SNAP, delay: 0.08 * i }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className="relative isolate px-3 py-2 outline-none sm:px-4"
            aria-label={`${tab.label} — ${tab.sub}`}
          >
            {/* Fill wash */}
            <span
              className="absolute inset-0 -z-10 transition-all duration-200"
              style={{
                background: isHot
                  ? locked
                    ? "linear-gradient(180deg, rgba(248,113,113,0.20), rgba(120,20,20,0.10))"
                    : "linear-gradient(180deg, rgba(34,211,238,0.18), rgba(8,40,60,0.10))"
                  : "transparent",
                boxShadow: isHot
                  ? locked
                    ? "0 0 26px rgba(248,113,113,0.35)"
                    : "0 0 26px rgba(34,211,238,0.30)"
                  : "none",
              }}
            />

            <Brackets size={isHot ? 13 : 8} color={line} offset={isHot ? 5 : 0} />

            {/* Scan bar sweeping the tab on hover */}
            <AnimatePresence>
              {isHot && (
                <motion.span
                  className="pointer-events-none absolute inset-x-0 h-px"
                  style={{
                    background: locked
                      ? "linear-gradient(90deg, transparent, rgba(248,113,113,0.9), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(186,230,253,0.9), transparent)",
                  }}
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: "100%", opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>

            <span className="flex items-center gap-1.5">
              {locked && (
                <Lock
                  className="cockpit-lockblink h-3 w-3 shrink-0"
                  style={{ color: isHot ? "#fca5a5" : "#fbbf24" }}
                  strokeWidth={2.5}
                />
              )}
              <span
                className="font-mono text-xs uppercase tracking-label transition-colors duration-200"
                style={{
                  color: locked
                    ? isHot ? "#fecaca" : "#fbbf24"
                    : isHot ? "#cffafe" : "rgba(165,243,252,0.72)",
                  textShadow: isHot
                    ? locked
                      ? "0 0 12px rgba(248,113,113,0.8)"
                      : "0 0 12px rgba(34,211,238,0.8)"
                    : "none",
                }}
              >
                {locked ? `[ ${tab.label} ]` : tab.label}
              </span>
            </span>

            {/* Channel descriptor — absolute, so the bar never reflows */}
            <AnimatePresence>
              {isHot && (
                <motion.span
                  className="absolute left-1/2 top-full z-10 mt-1.5 block -translate-x-1/2 whitespace-nowrap font-mono text-xs uppercase tracking-label"
                  style={{
                    color: tab.construction
                      ? "rgba(251,191,36,0.9)"
                      : locked
                        ? "rgba(252,165,165,0.9)"
                        : "rgba(103,232,249,0.75)",
                  }}
                  initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.16 }}
                >
                  {tab.construction ? "UNDER CONSTRUCTION" : tab.sub}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </nav>
  );
}
