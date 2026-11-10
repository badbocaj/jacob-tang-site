import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";

import ExplodedView from "@/components/about/ExplodedView";
import { PORTFOLIO } from "@/components/about/data";
import { getLeagueRank } from "@/lib/riot";

export const metadata: Metadata = {
  title: "About — Jacob Tang",
  description: "Jacob, taken apart: where he's headed, what he's building, what he runs on, and what makes him go.",
};

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT — Jacob as an exploded view of a rocket.
// Cream line art on warm black with one orange-red accent, on a faint
// isometric grid. Scrolling takes the rocket apart.
// ─────────────────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  // The cargo bay only offers the PDF once it is actually there.
  const portfolioReady = existsSync(path.join(process.cwd(), PORTFOLIO.diskPath));
  const leagueRank = await getLeagueRank();

  return (
    <main
      className="relative min-h-screen overflow-x-clip px-4 pb-24 pt-28 sm:px-8"
      style={{
        backgroundColor: "#0b0a09",
        backgroundImage:
          "repeating-linear-gradient(30deg, rgba(243,234,215,0.04) 0 1px, transparent 1px 56px), repeating-linear-gradient(150deg, rgba(243,234,215,0.04) 0 1px, transparent 1px 56px)",
      }}
    >
      <ExplodedView portfolioReady={portfolioReady} leagueRank={leagueRank} />
    </main>
  );
}
