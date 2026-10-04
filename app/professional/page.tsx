"use client";

import ComicStrip from "@/components/professional/ComicStrip";
import { JOBS } from "@/components/professional/facilityConfig";

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — the whole work history as one comic page.
// Four panels, all on screen at once, read left to right and top to bottom.
// Same desk and stationery as /about, so the two read as one notebook.
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfessionalPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-clip px-4 pb-8 pt-20 sm:px-8"
      style={{
        background: "radial-gradient(70% 55% at 50% 45%, rgba(251,191,36,0.10), transparent 70%), #0b0a08",
      }}
    >
      <header className="mx-auto mb-4 flex max-w-[1500px] flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div className="flex flex-wrap items-baseline gap-x-4">
          <h1
            className="m-0 text-4xl uppercase leading-none text-amber-50 sm:text-5xl"
            style={{ fontFamily: "var(--ff-journal), var(--ff-hand), cursive" }}
          >
            Work History
          </h1>
          <p className="m-0 font-hand text-2xl text-amber-300/80">
            ({JOBS.length} panels. no capes.)
          </p>
        </div>
        <p className="m-0 font-hand text-xl text-amber-100/40">read left to right, top to bottom →</p>
      </header>

      <ComicStrip />
    </div>
  );
}
