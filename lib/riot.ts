/* ───────────────────────────────────────────────────────────────────────────
   Live League rank, fetched on the server so RIOT_API_KEY never reaches the
   browser. Set the key in .env.local (dev) or your host's env vars (prod).
   ─────────────────────────────────────────────────────────────────────────── */

const RIOT_ID = { gameName: "loganlovesyordle", tagLine: "furry" };
const ACCOUNT_HOST = "https://americas.api.riotgames.com";
const LEAGUE_HOST = "https://na1.api.riotgames.com";
const SOLO_QUEUE = "RANKED_SOLO_5x5";
const APEX_TIERS = new Set(["MASTER", "GRANDMASTER", "CHALLENGER"]); // no division

/** Re-ask Riot at most this often (seconds). */
const REVALIDATE = 600;

export interface LeagueRank {
  /** e.g. "Gold IV", or "Unranked" */
  label: string;
  /** Riot's tier, e.g. "GOLD". Missing when unranked. */
  tier?: string;
  lp?: number;
  wins?: number;
  losses?: number;
}

interface LeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

async function riotGet<T>(url: string, apiKey: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": apiKey },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Riot ${res.status} for ${new URL(url).pathname}`);
  return res.json() as Promise<T>;
}

/** Solo/Duo rank, or null when the key is missing or Riot can't be reached. */
export async function getLeagueRank(): Promise<LeagueRank | null> {
  const apiKey = process.env.RIOT_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const name = encodeURIComponent(RIOT_ID.gameName);
    const tag = encodeURIComponent(RIOT_ID.tagLine);
    const { puuid } = await riotGet<{ puuid: string }>(
      `${ACCOUNT_HOST}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      apiKey,
    );
    const entries = await riotGet<LeagueEntry[]>(
      `${LEAGUE_HOST}/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`,
      apiKey,
    );

    const solo = entries.find((e) => e.queueType === SOLO_QUEUE);
    if (!solo) return { label: "Unranked" };

    const tier = solo.tier.charAt(0) + solo.tier.slice(1).toLowerCase();
    return {
      label: APEX_TIERS.has(solo.tier) ? tier : `${tier} ${solo.rank}`,
      tier: solo.tier,
      lp: solo.leaguePoints,
      wins: solo.wins,
      losses: solo.losses,
    };
  } catch (err) {
    // 401/403 here almost always means the 24h dev key expired.
    console.warn("[riot] rank fetch failed:", err);
    return null;
  }
}
