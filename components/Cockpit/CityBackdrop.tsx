"use client";

import type { CSSProperties } from "react";
import {
  CITY_FAR,
  CITY_MID,
  CITY_NEAR,
  RAIN,
  SKYLINE_BASE,
  SKYLINE_SPAN,
  TRAFFIC,
  type Building,
} from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   The world outside the canopy: a rain-slicked mega-city at night, built
   entirely from generated geometry so it costs no network requests and can
   be tuned by editing numbers in data.ts.

   Depth order (back to front): sky → neon haze → traffic → far skyline →
   mid skyline (the one carrying the neon) → near rooftops → wet ground
   bloom → rain.
   ─────────────────────────────────────────────────────────────────────────── */

interface BandProps {
  buildings: Building[];
  fill: string;
  windowColor: string;
  /** Buildings taller than this get a blinking rooftop beacon. */
  beaconAbove?: number;
  className?: string;
  style?: CSSProperties;
}

function SkylineBand({
  buildings,
  fill,
  windowColor,
  beaconAbove,
  className,
  style,
}: BandProps) {
  return (
    <svg
      viewBox={`0 0 ${SKYLINE_SPAN} ${SKYLINE_BASE}`}
      preserveAspectRatio="xMidYMax slice"
      className={className}
      style={style}
      aria-hidden
    >
      {buildings.map((b, i) => {
        const top = SKYLINE_BASE - b.h;
        return (
          <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={fill} />

            {b.windows.map((w, j) => (
              <rect
                key={j}
                x={w.x}
                y={w.y}
                width={4}
                height={5}
                fill={windowColor}
                opacity={w.o}
              />
            ))}

            {beaconAbove !== undefined && b.h > beaconAbove && (
              <circle
                cx={b.x + b.w / 2}
                cy={top - 3}
                r={2.6}
                fill="#fbbf24"
                className="cockpit-beacon"
                style={{ animationDelay: `${(i % 7) * 0.44}s` }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function CityBackdrop({ powered }: { powered: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden transition-[filter] duration-[1400ms] ease-out"
      style={{
        filter: powered
          ? "brightness(1) saturate(1.06)"
          : "brightness(0.5) saturate(0.62)",
      }}
      aria-hidden
    >
      {/* Sky — near-black overhead, warming into sodium haze at street level */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg,#01030a 0%,#030815 38%,#071227 66%,#0d2038 86%,#14304a 100%)",
        }}
      />

      {/* Neon bloom pushed up out of the city */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(760px 420px at 21% 80%, rgba(34,211,238,0.18), transparent 66%)," +
            "radial-gradient(640px 360px at 73% 86%, rgba(232,121,249,0.13), transparent 66%)," +
            "radial-gradient(1000px 460px at 50% 104%, rgba(251,191,36,0.12), transparent 70%)",
        }}
      />

      {/* Flying traffic — thin light streaks at several altitudes */}
      <div className="absolute inset-x-0 top-0 h-[62%]">
        {TRAFFIC.map((l, i) => (
          <span
            key={i}
            className="cockpit-traffic absolute h-px rounded-full"
            style={{
              top: `${l.top}%`,
              width: `${l.len}px`,
              opacity: l.o,
              background: l.hot
                ? "linear-gradient(90deg, transparent, #fbbf24, transparent)"
                : "linear-gradient(90deg, transparent, #67e8f9, transparent)",
              boxShadow: l.hot
                ? "0 0 7px rgba(251,191,36,0.75)"
                : "0 0 7px rgba(103,232,249,0.7)",
              animationDuration: `${l.dur}s`,
              animationDelay: `${l.delay}s`,
              animationDirection: l.dir === 1 ? "normal" : "reverse",
            }}
          />
        ))}
      </div>

      {/* Skyline — three depth bands, atmospheric perspective via blur+opacity */}
      <SkylineBand
        buildings={CITY_FAR}
        fill="#050b18"
        windowColor="#67e8f9"
        className="absolute bottom-0 left-0 h-[44%] w-full"
        style={{ filter: "blur(2.5px)", opacity: 0.85 }}
      />
      <SkylineBand
        buildings={CITY_MID}
        fill="#04091a"
        windowColor="#7dd3fc"
        beaconAbove={280}
        className="absolute bottom-0 left-0 h-[54%] w-full"
        style={{ filter: "blur(0.4px)" }}
      />
      <SkylineBand
        buildings={CITY_NEAR}
        fill="#01030a"
        windowColor="#fbbf24"
        className="absolute bottom-0 left-0 h-[30%] w-full"
      />

      {/* Wet streets: a bright band at the base plus its smeared reflection */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.10) 48%, rgba(251,191,36,0.14) 82%, rgba(186,230,253,0.20) 100%)",
          maskImage: "linear-gradient(180deg, transparent, #000 60%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 60%)",
        }}
      />

      {/* Rain on the far side of the glass */}
      <div className="absolute inset-0">
        {RAIN.map((r, i) => (
          <span
            key={i}
            className="cockpit-rain absolute top-0 w-px"
            style={
              {
                left: `${r.left}%`,
                height: `${r.len}px`,
                opacity: r.o,
                background:
                  "linear-gradient(180deg, transparent, rgba(186,230,253,0.95))",
                animationDuration: `${r.dur}s`,
                animationDelay: `${r.delay}s`,
                "--rain-drift": `${r.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
