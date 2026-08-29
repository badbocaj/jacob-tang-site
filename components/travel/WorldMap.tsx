"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { GRID, GRID_ASPECT, LAND, lonLatToPct } from "@/data/worldDots";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MapPoint {
  id: string;
  label: string;
  sublabel?: string;
  lon: number;
  lat: number;
}

/** Parses the `coords` strings already stored on each travel log,
 *  e.g. "40.7128° N, 74.0060° W" -> { lat: 40.7128, lon: -74.006 } */
export function parseCoords(coords: string): { lat: number; lon: number } | null {
  const m = coords.match(
    /(-?[\d.]+)\s*°?\s*([NS])\s*,\s*(-?[\d.]+)\s*°?\s*([EW])/i
  );
  if (!m) return null;
  const lat = parseFloat(m[1]) * (m[2].toUpperCase() === "S" ? -1 : 1);
  const lon = parseFloat(m[3]) * (m[4].toUpperCase() === "W" ? -1 : 1);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT MATH
// The dot field is equirectangular, so the drawn map is just the largest
// GRID_ASPECT rectangle that fits the panel. Pins use the identical rect, which
// is why a pin always lands exactly on its cell.
// ─────────────────────────────────────────────────────────────────────────────

interface Fit {
  x: number;
  y: number;
  w: number;
  h: number;
}

function fitRect(cw: number, ch: number): Fit {
  if (cw <= 0 || ch <= 0) return { x: 0, y: 0, w: 0, h: 0 };
  let w = cw;
  let h = w / GRID_ASPECT;
  if (h > ch) {
    h = ch;
    w = h * GRID_ASPECT;
  }
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

type PlacedPin = MapPoint & { x: number; y: number };

/** Fans out pins that would otherwise land on top of each other. */
function placePins(points: MapPoint[]): PlacedPin[] {
  const groups = new Map<string, MapPoint[]>();
  for (const p of points) {
    const { x, y } = lonLatToPct(p.lon, p.lat);
    const key = `${x.toFixed(3)}|${y.toFixed(3)}`;
    const g = groups.get(key);
    if (g) g.push(p);
    else groups.set(key, [p]);
  }

  const out: PlacedPin[] = [];
  for (const group of groups.values()) {
    const { x, y } = lonLatToPct(group[0].lon, group[0].lat);
    if (group.length === 1) {
      out.push({ ...group[0], x, y });
      continue;
    }
    // Spread duplicates evenly around a small ring so each stays clickable.
    const r = 0.012;
    group.forEach((p, i) => {
      const a = (i / group.length) * Math.PI * 2 - Math.PI / 2;
      out.push({
        ...p,
        x: x + Math.cos(a) * r,
        y: y + Math.sin(a) * r * GRID_ASPECT,
      });
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function WorldMap({
  points,
  activeId,
  onHover,
  onSelect,
  className = "",
}: {
  points: MapPoint[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduce = useReducedMotion();

  const pins = useMemo(() => placePins(points), [points]);
  const fit = useMemo(() => fitRect(size.w, size.h), [size]);

  // ── Track panel size ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Draw the dot field ────────────────────────────────────────────────────
  // Dots brighten near logged waypoints, so the map lights up exactly where the
  // trips are. The glow encodes the content rather than decorating it.
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || fit.w <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    const cellW = fit.w / GRID.cols;
    const radius = Math.max(0.55, cellW * 0.26);
    const active = pins.find((p) => p.id === activeId) ?? null;

    for (const idx of LAND) {
      const col = idx % GRID.cols;
      const row = (idx - col) / GRID.cols;
      const fx = col / GRID.cols;
      const fy = row / GRID.rows;

      // Distance to the nearest waypoint, in aspect-corrected fraction space.
      let near = Infinity;
      for (const p of pins) {
        const dx = (fx - p.x) * GRID_ASPECT;
        const dy = fy - p.y;
        const d = dx * dx + dy * dy;
        if (d < near) near = d;
      }
      let alpha = 0.13 + 0.34 * Math.exp(-near / 0.006);

      if (active) {
        const dx = (fx - active.x) * GRID_ASPECT;
        const dy = fy - active.y;
        alpha += 0.4 * Math.exp(-(dx * dx + dy * dy) / 0.004);
      }

      ctx.beginPath();
      ctx.arc(fit.x + fx * fit.w, fit.y + fy * fit.h, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,158,11,${Math.min(alpha, 0.92).toFixed(3)})`;
      ctx.fill();
    }
  }, [fit, size, pins, activeId]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Panel chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6">
        <span className="font-mono text-xs tracking-label uppercase text-amber-400/40">
          Waypoint_Index
        </span>
        <span className="font-mono text-xs tracking-label uppercase text-zinc-700">
          {points.length} logged
        </span>
      </div>

      <div ref={wrapRef} className="relative h-full w-full">
        <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />

        {/* Pins — same rect as the dots, so each sits exactly on its cell */}
        <div
          className="absolute"
          style={{ left: fit.x, top: fit.y, width: fit.w, height: fit.h }}
        >
          {fit.w > 0 &&
            pins.map((p) => {
              const isActive = activeId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => onHover(p.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(p.id)}
                  onBlur={() => onHover(null)}
                  onClick={() => onSelect(p.id)}
                  aria-label={`${p.label}${p.sublabel ? `, ${p.sublabel}` : ""}`}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
                  style={{
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`,
                    width: 22,
                    height: 22,
                    zIndex: isActive ? 30 : 10,
                  }}
                >
                  {/* Halo */}
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-300"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 68%)",
                      opacity: isActive ? 1 : 0,
                      transform: `scale(${isActive ? 1.5 : 0.6})`,
                    }}
                  />
                  {/* Ping */}
                  {!reduce && (
                    <span
                      className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full border border-amber-400/60"
                      style={{
                        animation:
                          "travel-ping 2.8s cubic-bezier(0,0,0.2,1) infinite",
                        animationDelay: `${((p.x * 3.1) % 2.8).toFixed(2)}s`,
                      }}
                    />
                  )}
                  {/* Core */}
                  <span
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 transition-all duration-200 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#05070a]"
                    style={{
                      width: isActive ? 9 : 6,
                      height: isActive ? 9 : 6,
                      boxShadow: isActive
                        ? "0 0 12px rgba(245,158,11,0.95), 0 0 26px rgba(245,158,11,0.45)"
                        : "0 0 6px rgba(245,158,11,0.6)",
                    }}
                  />
                  {/* Label */}
                  <span
                    className="pointer-events-none absolute left-1/2 whitespace-nowrap rounded border border-amber-400/25 bg-black/90 px-2 py-1 font-mono text-xs uppercase tracking-label text-amber-200 backdrop-blur-sm transition-all duration-200"
                    style={{
                      bottom: "calc(100% + 4px)",
                      opacity: isActive ? 1 : 0,
                      transform: `translate(-50%, ${isActive ? "0" : "4px"})`,
                    }}
                  >
                    {p.label}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <style>{`
        @keyframes travel-ping {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
          70%  { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
