import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Jacob Tang",
  description: "Operator dossier.",
};

/* ───────────────────────────────────────────────────────────────────────────
   Deliberately an empty shell.

   The old CockpitIntro animation that used to live at this route has been
   retired — the flight deck is now its own page at /cockpit, and the ABOUT
   channel routes here. Everything below the header is yours to fill in.
   ─────────────────────────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <main className="bg-system min-h-screen px-6 pb-32 pt-28 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/cockpit"
          className="font-mono text-xs uppercase tracking-label text-cyan-300/60 no-underline transition-colors hover:text-cyan-200"
        >
          ← RETURN TO COCKPIT
        </Link>

        <p className="m-0 mt-10 font-mono text-xs uppercase tracking-label text-amber-300/80">
          OPERATOR DOSSIER
        </p>

        <h1 className="wide m-0 mt-3 text-4xl font-bold uppercase leading-none text-white sm:text-6xl">
          About
        </h1>

        <div className="divider mt-10 pt-10">
          <p className="m-0 font-mono text-xs uppercase tracking-label text-zinc-500">
            CHANNEL EMPTY :: AWAITING TRANSMISSION
          </p>
          <p className="m-0 mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
            This page is a stub. Drop the real dossier in here whenever you are
            ready — the cockpit already routes to it from the ABOUT tab and from
            the OPEN FULL DOSSIER control on the centre panel.
          </p>
        </div>
      </div>
    </main>
  );
}
