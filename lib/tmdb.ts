/* ───────────────────────────────────────────────────────────────────────────
   Posters from The Movie Database, fetched on the server.

   Optional: with no TMDB_API_KEY set this returns null and the page falls
   back to typographic title cards. Accepts either the short v3 "API key" or
   the long v4 "API Read Access Token" from themoviedb.org → Settings → API.
   ─────────────────────────────────────────────────────────────────────────── */

const REVALIDATE = 60 * 60 * 24 * 7; // posters basically never change

export async function getPosterUrl(tmdbId: number): Promise<string | null> {
  const key = process.env.TMDB_API_KEY?.trim();
  if (!key) return null;

  const bearer = key.length > 40;
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}${bearer ? "" : `?api_key=${encodeURIComponent(key)}`}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      headers: bearer ? { Authorization: `Bearer ${key}` } : undefined,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { poster_path?: string | null };
    return data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
  } catch (err) {
    console.error("[tmdb] poster fetch failed", tmdbId, err);
    return null;
  }
}
