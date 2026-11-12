"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { nextActiveDot, type DotEvent } from "@/lib/map-dot-state";
import type { MapDot } from "@/lib/us-map";
import { usePing } from "./PingContext";

const W = 975;
const H = 610;
const ACCENT = "#7dffa0";
const MAX_NAMES = 8;
const SPRING = { type: "spring", stiffness: 400, damping: 20 } as const;

/** The dots layer: sits exactly over UsMap's outline, same viewBox. */
export default function MapDots({ dots }: { dots: MapDot[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { pingId, pingKey } = usePing();
  const reduceMotion = useReducedMotion();
  const active = dots.find((d) => d.collegeId === activeId);
  const on = (id: string, event: DotEvent) => () => setActiveId((current) => nextActiveDot(current, id, event));

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-label="Visitor dots">
        {dots.map((d) => {
          const count = d.names.length;
          return (
            <circle
              key={d.collegeId}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill={ACCENT}
              fillOpacity={activeId === d.collegeId ? 1 : 0.8}
              stroke="#06110b"
              strokeWidth={1}
              tabIndex={0}
              role="button"
              aria-label={`${d.label}: ${count} ${count === 1 ? "visitor" : "visitors"}`}
              className="cursor-pointer outline-none [filter:drop-shadow(0_0_4px_rgba(125,255,160,.8))] focus-visible:stroke-[#c8ffd9] focus-visible:stroke-2"
              onMouseEnter={on(d.collegeId, "enter")}
              onMouseLeave={on(d.collegeId, "leave")}
              onFocus={on(d.collegeId, "focus")}
              onBlur={on(d.collegeId, "blur")}
              onClick={on(d.collegeId, "click")}
            />
          );
        })}

        {!reduceMotion &&
          dots
            .filter((d) => d.collegeId === pingId)
            .map((d) => (
              <motion.circle
                key={`${d.collegeId}-${pingKey}`}
                cx={d.x}
                cy={d.y}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2}
                initial={{ r: d.r, opacity: 1 }}
                animate={{ r: d.r + 36, opacity: 0 }}
                transition={{ r: SPRING, opacity: { duration: 1.2, ease: "easeOut" } }}
                pointerEvents="none"
              />
            ))}
      </svg>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.collegeId}
            role="status"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={SPRING}
            className="pointer-events-none absolute z-10 w-max max-w-[16rem] -translate-x-1/2 -translate-y-full border border-[#7dffa0]/50 bg-[#06110b]/95 px-3 py-2 font-mono text-xs leading-snug text-[#c8ffd9] shadow-[0_0_12px_rgba(125,255,160,.25)]"
            style={{
              left: `${Math.min(Math.max((active.x / W) * 100, 15), 85)}%`,
              top: `calc(${(active.y / H) * 100}% - ${active.r + 6}px)`,
            }}
          >
            <span className="block font-semibold text-[#7dffa0]">{active.label}</span>
            {active.names.slice(0, MAX_NAMES).join(", ")}
            {active.names.length > MAX_NAMES && ` +${active.names.length - MAX_NAMES} more`}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
