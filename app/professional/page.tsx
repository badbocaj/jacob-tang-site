"use client";

import SingularityGate from "@/components/SingularityGate";
import ComicStrip from "@/components/professional/ComicStrip";
import { JOBS } from "@/components/professional/facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — the whole work history as one comic strip.
// Four panels, all on screen at once, read left to right and top to bottom.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfessionalPage() {
  return (
    <div className="bg-[#05070a]" style={{ marginTop: 64 }}>
      {/* Black-hole intro — unchanged, still the way you arrive */}
      <SingularityGate />

      <section
        className="flex flex-col px-4 pb-4 lg:h-[calc(100vh-4rem)] lg:overflow-hidden"
        aria-label="Work history, told as a four-panel comic"
      >
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Work History
            </h1>
            <p className="font-mono text-xs uppercase tracking-label text-amber-400/50">
              {JOBS.length} panels · one building
            </p>
          </div>
          <p className="font-hand text-base text-zinc-500">
            read left to right, top to bottom
          </p>
        </header>

        <ComicStrip />
      </section>
    </div>
  );
}
