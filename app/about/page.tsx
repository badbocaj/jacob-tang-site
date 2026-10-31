import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";

import Journal from "@/components/about/Journal";
import { PORTFOLIO } from "@/components/about/data";
import { getLeagueRank } from "@/lib/riot";

export const metadata: Metadata = {
  title: "About — Jacob Tang",
  description: "Jacob's journal: what he's building, what he does outside, what he plays, and how he got here.",
};

export default async function AboutPage() {
  // The folder on page one only lights up once the PDF is actually there.
  const portfolioReady = existsSync(path.join(process.cwd(), PORTFOLIO.diskPath));
  const leagueRank = await getLeagueRank();

  return (
    <div
      className={`relative min-h-screen overflow-x-clip px-4 pb-12 pt-20 sm:px-8`}
      style={{
        background:
          "radial-gradient(70% 55% at 50% 42%, rgba(251,191,36,0.10), transparent 70%), #0b0a08",
      }}
    >
      <div className="mx-auto mb-3 max-w-[1140px]">
        <Link
          href="/cockpit"
          className="font-mono text-xs uppercase tracking-label text-amber-200/50 no-underline transition-colors hover:text-amber-100"
        >
          ← RETURN TO COCKPIT
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4">
          <h1
            className="m-0 text-4xl uppercase leading-none text-amber-50 sm:text-5xl"
            style={{ fontFamily: "var(--ff-journal), var(--ff-hand), cursive" }}
          >
            Jacob&apos;s Journal
          </h1>
          <p className="m-0 font-hand text-2xl text-amber-300/80">(it&apos;s NOT a diary)</p>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px]">
        <Journal portfolioReady={portfolioReady} leagueRank={leagueRank} />
      </div>
    </div>
  );
}
