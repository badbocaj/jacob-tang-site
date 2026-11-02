/* ───────────────────────────────────────────────────────────────────────────
   Letterboxd diary, read from the public RSS feed on the server.

   Letterboxd does not hand out API keys, but every profile publishes
   https://letterboxd.com/<user>/rss/ with ratings, rewatches, reviews,
   posters and TMDB ids. The page re-reads it at most once an hour, so a new
   log shows up on the site without a redeploy.
   ─────────────────────────────────────────────────────────────────────────── */

const REVALIDATE = 60 * 60;

export interface DiaryEntry {
  id: string;
  title: string;
  year: number | null;
  /** 0.5–5 in half stars, or null when unrated. */
  rating: number | null;
  rewatch: boolean;
  liked: boolean;
  watchedDate: string | null;
  posterUrl: string | null;
  /** Review text, if the entry has one. */
  review: string | null;
  tmdbId: number | null;
  link: string;
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : null;
}

function parseItem(block: string): DiaryEntry | null {
  const title = tag(block, "letterboxd:filmTitle");
  if (!title) return null; // lists and other non-film items

  const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/)?.[1] ?? title;
  const description = tag(block, "description") ?? "";
  const html = description.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");

  const posterUrl = html.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? null;

  // Every <p> that is not the poster or the stock "Watched on …" line is review.
  const review = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1])
    .filter((p) => !p.includes("<img") && !/^Watched on /.test(p.trim()))
    .map((p) => decode(p.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).trim())
    .filter(Boolean)
    .join("\n\n");

  const rating = tag(block, "letterboxd:memberRating");
  const year = tag(block, "letterboxd:filmYear");
  const tmdb = tag(block, "tmdb:movieId");

  return {
    id: guid,
    title: decode(title),
    year: year ? Number(year) : null,
    rating: rating ? Number(rating) : null,
    rewatch: tag(block, "letterboxd:rewatch") === "Yes",
    liked: tag(block, "letterboxd:memberLike") === "Yes",
    watchedDate: tag(block, "letterboxd:watchedDate"),
    posterUrl,
    review: review || null,
    tmdbId: tmdb ? Number(tmdb) : null,
    link: tag(block, "link") ?? "",
  };
}

export async function getDiary(user: string): Promise<DiaryEntry[]> {
  try {
    const res = await fetch(`https://letterboxd.com/${user}/rss/`, {
      next: { revalidate: REVALIDATE },
      headers: { "User-Agent": "tangjacob.com (personal site)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map((m) => parseItem(m[1]))
      .filter((e): e is DiaryEntry => e !== null);
  } catch (err) {
    console.error("[letterboxd] feed fetch failed", err);
    return [];
  }
}
