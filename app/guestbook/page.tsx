import type { Metadata } from "next";

import NoteWall from "@/components/guestbook/NoteWall";
import { PingProvider } from "@/components/guestbook/PingContext";
import Stats from "@/components/guestbook/Stats";
import UsMap from "@/components/guestbook/UsMap";
import { getMapEntries, getStats, listNotes } from "@/lib/guestbook";
import { REASONS, type GuestbookStats, type MapEntry, type PublicNote, type Reason } from "@/lib/guestbook-types";
import { toMapDots } from "@/lib/us-map";

export const metadata: Metadata = {
  title: "Guestbook — Jacob Tang",
  description: "Sign the log. Leave a note, drop a pin on where you went to college, and tell Jacob what you think.",
};

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// GUESTBOOK — a green radar screen. Map first, then stats, then the form
// beside the wall. Spec: docs/superpowers/specs/2026-11-11-guestbook-design.md
// ─────────────────────────────────────────────────────────────────────────────

const LABEL = "font-mono text-xs uppercase tracking-label";

const EMPTY_STATS: GuestbookStats = {
  total: 0,
  schools: 0,
  byReason: Object.fromEntries(REASONS.map((r) => [r, 0])) as Record<Reason, number>,
};

async function load(): Promise<{
  notes: PublicNote[];
  stats: GuestbookStats;
  entries: MapEntry[];
  offline: boolean;
  now: number;
}> {
  const now = Date.now();
  try {
    const [notes, stats, entries] = await Promise.all([listNotes(), getStats(), getMapEntries()]);
    return { notes, stats, entries, offline: false, now };
  } catch (err) {
    console.error("[guestbook] load failed", err);
    return { notes: [], stats: EMPTY_STATS, entries: [], offline: true, now };
  }
}

export default async function GuestbookPage() {
  const { notes, stats, entries, offline, now } = await load();

  return (
    <main
      className="relative min-h-screen overflow-x-clip px-4 pb-24 pt-28 text-[#c8ffd9] sm:px-8"
      style={{
        backgroundColor: "#06110b",
        backgroundImage: "repeating-linear-gradient(0deg, rgba(125,255,160,0.035) 0 1px, transparent 1px 3px)",
      }}
    >
      <PingProvider>
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8">
          <header className="flex flex-col gap-3">
            <p className={`m-0 ${LABEL} text-[#7dffa0]`}>JT-01 // Guestbook</p>
            <h1 className="wide m-0 font-display text-4xl font-extrabold uppercase leading-none text-[#c8ffd9] [text-shadow:0_0_18px_rgba(125,255,160,.35)] max-sm:text-3xl sm:text-6xl">
              Incoming transmissions
            </h1>
            <p className="m-0 font-mono text-sm uppercase tracking-label text-[#6fa585]">
              Sign in. The computer is watching.
            </p>
            {offline && (
              <p role="status" className={`m-0 mt-1 w-fit border border-[#7dffa0]/50 px-3 py-1.5 ${LABEL} text-[#7dffa0]`}>
                Comms offline
              </p>
            )}
          </header>

          <UsMap dots={toMapDots(entries)} />
          <Stats stats={stats} />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <section aria-labelledby="sign-heading" className="flex flex-col gap-4">
              <h2 id="sign-heading" className={`m-0 ${LABEL} font-normal text-[#7dffa0]`}>
                Sign the log
              </h2>
              {/* NoteForm (Task 8) */}
            </section>
            <section aria-labelledby="wall-heading" className="flex flex-col gap-4">
              <h2 id="wall-heading" className={`m-0 ${LABEL} font-normal text-[#7dffa0]`}>
                The log
              </h2>
              <div className="lg:max-h-[70vh] lg:overflow-y-auto lg:pr-2">
                <NoteWall notes={notes} now={now} />
              </div>
            </section>
          </div>
        </div>
      </PingProvider>
    </main>
  );
}
