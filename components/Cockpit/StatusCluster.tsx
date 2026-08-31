"use client";

import { useEffect, useState } from "react";
import { Battery, Radio } from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   Top-right cluster: UTC time, cell energy, uplink state.

   The clock renders as dashes on the server and fills in after mount — a real
   timestamp in the server HTML would never match the client and would trip a
   hydration mismatch.
   ─────────────────────────────────────────────────────────────────────────── */

const CELLS = 12;

export function StatusCluster() {
  const [utc, setUtc] = useState<string | null>(null);
  const [energy, setEnergy] = useState(87);

  useEffect(() => {
    const tick = () => setUtc(new Date().toISOString().slice(11, 19));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Cell draw wanders a little so the gauge is not a dead readout.
  useEffect(() => {
    const id = window.setInterval(() => {
      setEnergy((e) => {
        const next = e + (Math.random() - 0.45) * 2.4;
        return Math.min(96, Math.max(74, next));
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const lit = Math.round((energy / 100) * CELLS);

  return (
    <div className="flex flex-col items-end gap-2 font-mono text-xs uppercase tracking-label">
      {/* UTC */}
      <div className="flex items-baseline gap-2">
        <span className="text-cyan-300/45">UTC</span>
        <span
          className="text-base tabular-nums tracking-[0.12em] text-cyan-100"
          style={{ textShadow: "0 0 14px rgba(34,211,238,0.6)" }}
        >
          {utc ?? "--:--:--"}
        </span>
        <span className="text-cyan-300/45">Z</span>
      </div>

      {/* Energy cell */}
      <div className="flex items-center gap-2">
        <Battery className="h-3.5 w-3.5 text-cyan-300/70" strokeWidth={2} />
        <span className="flex items-center gap-[2px]">
          {Array.from({ length: CELLS }, (_, i) => (
            <span
              key={i}
              className="h-3 w-[3px] transition-colors duration-500"
              style={{
                background:
                  i < lit
                    ? i >= CELLS - 3
                      ? "#67e8f9"
                      : "#22d3ee"
                    : "rgba(34,211,238,0.16)",
                boxShadow: i < lit ? "0 0 6px rgba(34,211,238,0.7)" : "none",
              }}
            />
          ))}
        </span>
        <span className="w-10 text-right tabular-nums text-cyan-200/80">
          {energy.toFixed(0)}%
        </span>
      </div>

      {/* Uplink */}
      <div className="flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 text-amber-300/80" strokeWidth={2} />
        <span className="text-cyan-300/45">UPLINK</span>
        <span
          className="text-amber-300"
          style={{ textShadow: "0 0 12px rgba(251,191,36,0.7)" }}
        >
          LOCKED
        </span>
        <span className="flex items-end gap-[2px]">
          {[4, 7, 10, 13].map((h, i) => (
            <span
              key={h}
              className="w-[3px] bg-amber-300/90"
              style={{
                height: h,
                animation: `cockpit-prompt ${1.1 + i * 0.22}s ease-in-out infinite`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
