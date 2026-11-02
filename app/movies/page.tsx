import MoviesView, { type FilmView } from "@/components/movies/MoviesView";
import { FILMS, HOT_TAKES, LETTERBOXD_USER, TOP_FOUR, type FilmKey } from "@/data/movies";
import { getDiary } from "@/lib/letterboxd";
import { getPosterUrl } from "@/lib/tmdb";

/* ───────────────────────────────────────────────────────────────────────────
   /movies — server half. Reads the Letterboxd diary and (optionally) TMDB
   posters here so no key ever reaches the browser, then hands plain data to
   the interactive view. Re-built at most once an hour.
   ─────────────────────────────────────────────────────────────────────────── */

export const revalidate = 3600;

export default async function MoviesPage() {
  const diary = await getDiary(LETTERBOXD_USER);

  const keys = Object.keys(FILMS) as FilmKey[];
  const entries = await Promise.all(
    keys.map(async (key): Promise<[FilmKey, FilmView]> => {
      const film = FILMS[key];
      const logged = diary.find((e) => e.tmdbId === film.tmdbId && e.rating !== null);
      return [
        key,
        {
          ...film,
          key,
          posterUrl: await getPosterUrl(film.tmdbId),
          rating: logged?.rating ?? null,
          letterboxdUrl: `https://letterboxd.com/tmdb/${film.tmdbId}/`,
        },
      ];
    }),
  );
  const films = Object.fromEntries(entries) as Record<FilmKey, FilmView>;

  // The feed has one item per diary entry, so a film logged twice (a rewatch,
  // or a separate review) appears twice. Count films, not entries.
  const filmId = (e: (typeof diary)[number]) => e.tmdbId ?? e.title;
  const stats = {
    logged: new Set(diary.map(filmId)).size,
    fiveStars: new Set(diary.filter((e) => e.rating === 5).map(filmId)).size,
    rewatches: diary.filter((e) => e.rewatch).length,
  };

  return (
    <MoviesView
      films={films}
      topFour={TOP_FOUR}
      hotTakes={HOT_TAKES}
      recent={diary.slice(0, 12)}
      stats={stats}
      user={LETTERBOXD_USER}
    />
  );
}
