/* ───────────────────────────────────────────────────────────────────────────
   The words on /movies. Everything you write lives here.

   • blurb / explanation: leave as "" until you are ready — the page shows a
     "still writing this one" note instead of an empty box.
   • tmdbId: The Movie Database id. Posters load from it when TMDB_API_KEY is
     set; without a key, each film gets a typographic title card in `tint`.
   ─────────────────────────────────────────────────────────────────────────── */

export const LETTERBOXD_USER = "badbocaj";

export interface Film {
  tmdbId: number;
  title: string;
  year: number;
  director: string;
  /** Accent for the title card used when there is no poster. */
  tint: string;
}

export const FILMS = {
  interstellar: { tmdbId: 157336, title: "Interstellar", year: 2014, director: "Christopher Nolan", tint: "#1e3a5f" },
  oldboy: { tmdbId: 670, title: "Oldboy", year: 2003, director: "Park Chan-wook", tint: "#5b1d1d" },
  martian: { tmdbId: 286217, title: "The Martian", year: 2015, director: "Ridley Scott", tint: "#8a3b12" },
  basterds: { tmdbId: 16869, title: "Inglourious Basterds", year: 2009, director: "Quentin Tarantino", tint: "#3f3a1c" },
  pulpFiction: { tmdbId: 680, title: "Pulp Fiction", year: 1994, director: "Quentin Tarantino", tint: "#6b1414" },
} satisfies Record<string, Film>;

export type FilmKey = keyof typeof FILMS;

/* ── Top 4 ─────────────────────────────────────────────────────────────── */

export interface Favorite {
  film: FilmKey;
  /** Why it's in the top 4. Your words. */
  blurb: string;
}

export const TOP_FOUR: Favorite[] = [
  { film: "interstellar", blurb: "" },
  { film: "oldboy", blurb: "" },
  { film: "martian", blurb: "" },
  { film: "basterds", blurb: "" },
];

/* ── Hot takes ─────────────────────────────────────────────────────────── */

export type HotTake =
  | {
      id: string;
      kind: "versus";
      verdict: string;
      winner: FilmKey;
      loser: FilmKey;
      explanation: string;
    }
  | {
      id: string;
      kind: "single";
      verdict: string;
      film: FilmKey;
      explanation: string;
    };

export const HOT_TAKES: HotTake[] = [
  {
    id: "martian-over-interstellar",
    kind: "versus",
    verdict: "The Martian is better than Interstellar.",
    winner: "martian",
    loser: "interstellar",
    explanation: "",
  },
  {
    id: "pulp-fiction",
    kind: "single",
    verdict: "Pulp Fiction is not a good movie.",
    film: "pulpFiction",
    explanation: "",
  },
];
