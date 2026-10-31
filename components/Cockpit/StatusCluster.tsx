"use client";

import { useEffect, useState } from "react";

/* ───────────────────────────────────────────────────────────────────────────
   Top-right: one clock, on pilot time (Los Angeles). It used to share the
   corner with a fake battery gauge and an uplink meter; three readouts that
   say nothing were louder than one that is real.

   Renders as dashes on the server and fills in after mount — a real timestamp
   in the server HTML would never match the client and trip a hydration error.
   ─────────────────────────────────────────────────────────────────────────── */

const FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function StatusCluster() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(FORMAT.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-baseline gap-2 font-mono text-xs uppercase tracking-label">
      <span className="text-cyan-300/45">LAX</span>
      <span className="tabular-nums tracking-[0.12em] text-cyan-100/85">
        {time ?? "--:--:--"}
      </span>
    </div>
  );
}
