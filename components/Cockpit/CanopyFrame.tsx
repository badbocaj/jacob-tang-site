"use client";

import type { CSSProperties } from "react";
import { DROPLETS } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   Everything on THIS side of the glass: the canopy structure, the glareshield
   and dash, the beads of water on the pane, and the vignette that sells the
   fact that you are sitting inside something.

   The frame is one full-bleed SVG stretched with preserveAspectRatio="none".
   Fills distort happily; every stroke carries vector-effect="non-scaling-stroke"
   so the hairlines stay a true 1px at any viewport ratio.
   ─────────────────────────────────────────────────────────────────────────── */

const HEADER = "M0,0 H100 V15 Q50,3.5 0,15 Z";
const PILLAR_L = "M0,12.5 L5.2,12.2 L19,100 L6,100 Z";
const PILLAR_R = "M100,12.5 L94.8,12.2 L81,100 L94,100 Z";
const BOW_L = "M27.4,7.6 L29,7.6 L31.4,78 L28.6,78 Z";
const BOW_R = "M72.6,7.6 L71,7.6 L68.6,78 L71.4,78 Z";
const COWL = "M0,79 Q50,66.5 100,79 L100,100 L0,100 Z";

/** Dash indicator lights along the glareshield. */
const DASH_LEDS = [
  { left: 26, hue: "#22d3ee" },
  { left: 32, hue: "#22d3ee" },
  { left: 38, hue: "#fbbf24" },
  { left: 44, hue: "#22d3ee" },
  { left: 56, hue: "#22d3ee" },
  { left: 62, hue: "#f87171" },
  { left: 68, hue: "#22d3ee" },
  { left: 74, hue: "#22d3ee" },
];

export function CanopyFrame({ powered }: { powered: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* ── Water beaded on the inside face of the pane ─────────────────── */}
      <div className="absolute inset-0" style={{ filter: "blur(0.6px)" }}>
        {DROPLETS.map((d, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.r * 2}px`,
              height: `${d.r * 2.6}px`,
              opacity: d.o,
              background:
                "radial-gradient(circle at 32% 28%, rgba(224,242,254,0.9), rgba(125,211,252,0.15) 62%, transparent 72%)",
            }}
          />
        ))}
      </div>

      {/* ── Glass sheen: one broad raking highlight across the canopy ────── */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: powered ? 0.5 : 0.32,
          background:
            "linear-gradient(112deg, transparent 12%, rgba(186,230,253,0.05) 30%, rgba(186,230,253,0.11) 38%, transparent 52%)",
        }}
      />

      {/* ── Canopy structure ─────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="cockpit-frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#05080f" />
            <stop offset="100%" stopColor="#010206" />
          </linearGradient>
          <linearGradient id="cockpit-cowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070c15" />
            <stop offset="55%" stopColor="#020408" />
            <stop offset="100%" stopColor="#000103" />
          </linearGradient>
        </defs>

        {[HEADER, PILLAR_L, PILLAR_R, BOW_L, BOW_R].map((d, i) => (
          <path key={i} d={d} fill="url(#cockpit-frame)" />
        ))}
        <path d={COWL} fill="url(#cockpit-cowl)" />

        {/* Edge lighting picked up from the city — the only thing that tells
            you the frame has a third dimension. */}
        {[HEADER, PILLAR_L, PILLAR_R, COWL].map((d, i) => (
          <path
            key={`edge-${i}`}
            d={d}
            fill="none"
            stroke="rgba(125,211,252,0.16)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Glareshield lip, lit once the systems come up */}
        <path
          d={COWL}
          fill="none"
          stroke={powered ? "rgba(34,211,238,0.5)" : "rgba(34,211,238,0.12)"}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          style={{ transition: "stroke 1s ease-out" }}
        />
      </svg>

      {/* ── Dash indicator lights ────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-[6%] h-0">
        {DASH_LEDS.map((led, i) => (
          <span
            key={i}
            className="absolute h-[5px] w-[5px] rounded-full transition-all duration-700"
            style={
              {
                left: `${led.left}%`,
                background: led.hue,
                opacity: powered ? 0.9 : 0.14,
                boxShadow: powered ? `0 0 8px ${led.hue}` : "none",
                transitionDelay: `${i * 70}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* ── Vignette: the helmet interior falling off into black ─────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 46%, transparent 42%, rgba(0,0,0,0.55) 78%, rgba(0,0,0,0.9) 100%)",
        }}
      />
    </div>
  );
}
