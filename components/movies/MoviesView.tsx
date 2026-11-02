"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, RotateCcw, X } from "lucide-react";

import type { Favorite, Film, FilmKey, HotTake } from "@/data/movies";
import type { DiaryEntry } from "@/lib/letterboxd";

/* ───────────────────────────────────────────────────────────────────────────
   /movies — Zone B, the archives. A personal log, not a database.

     Top 4        ticket stubs; click one and it opens into the full ticket
                  with the blurb on why it made the cut
     Hot takes    "unpopular opinion" index cards that unfold into the case
     Recently     the live Letterboxd diary, rewatches and mini-reviews included
   ─────────────────────────────────────────────────────────────────────────── */

export interface FilmView extends Film {
  key: FilmKey;
  posterUrl: string | null;
  rating: number | null;
  letterboxdUrl: string;
}

const PAPER = "#fdfbf3";
const TICKET = "#f1e6cf";
const INK = "#1f2328";
const PEN_BLUE = "#2f4a8a";
const STAMP = "#c2412d";
const STAR = "#4ade80";

const EASE = [0.22, 1, 0.36, 1] as const;
const SNAP = { type: "spring", stiffness: 400, damping: 30 } as const;

export default function MoviesView({
  films,
  topFour,
  hotTakes,
  recent,
  stats,
  user,
}: {
  films: Record<FilmKey, FilmView>;
  topFour: Favorite[];
  hotTakes: HotTake[];
  recent: DiaryEntry[];
  stats: { logged: number; fiveStars: number; rewatches: number };
  user: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const openFav = open === null ? null : topFour[open];

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen bg-[#0d0b09] pb-24 pt-32 text-[#f3ead7]">
        {/* Projector glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(255,236,200,0.08),transparent_70%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
          {/* ── Header ────────────────────────────────────────────────── */}
          <header className="border-b border-white/10 pb-10">
            <p className="m-0 font-mono text-xs uppercase tracking-label text-stone-400">
              The archives · Movies
            </p>
            <h1 className="wide m-0 mt-4 text-5xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
              Movies
            </h1>
            <p className="m-0 mt-4 max-w-xl text-lg leading-relaxed text-stone-400">
              What I watch, what I love, and what I&apos;ll defend in the group chat.
            </p>
            <p className="m-0 mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-label text-stone-500">
              {stats.logged > 0 && (
                <>
                  <span>{stats.logged} films logged</span>
                  <span aria-hidden>·</span>
                  <span>{stats.fiveStars} five-star</span>
                  <span aria-hidden>·</span>
                  <span>{stats.rewatches} rewatches</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <a
                href={`https://letterboxd.com/${user}/`}
                target="_blank"
                rel="noreferrer"
                className="text-stone-300 no-underline transition-colors hover:text-white"
              >
                Letterboxd ↗
              </a>
            </p>
          </header>

          {/* ── Top 4 ─────────────────────────────────────────────────── */}
          <Section title="Top 4" note="click a ticket">
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">
              {topFour.map((fav, i) => (
                <Ticket key={fav.film} film={films[fav.film]} index={i} onOpen={() => setOpen(i)} />
              ))}
            </div>
          </Section>

          {/* ── Hot takes ─────────────────────────────────────────────── */}
          <Section title="Hot takes" note="I will die on these hills">
            <div className="grid gap-6 md:grid-cols-2">
              {hotTakes.map((take, i) => (
                <TakeCard key={take.id} take={take} films={films} index={i} />
              ))}
            </div>
          </Section>

          {/* ── Recently watched ──────────────────────────────────────── */}
          <Section title="Recently watched" note="live from Letterboxd">
            {recent.length === 0 ? (
              <p className="m-0 font-hand text-2xl text-stone-500">
                Letterboxd isn&apos;t answering right now. The projector will be back.
              </p>
            ) : (
              <ol className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-6">
                {recent.map((e, i) => (
                  <DiaryCard key={e.id} entry={e} index={i} />
                ))}
              </ol>
            )}
          </Section>

          <footer className="mt-20 border-t border-white/10 pt-8 text-center">
            <a
              href={`https://letterboxd.com/${user}/`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs uppercase tracking-label text-stone-400 no-underline transition-colors hover:text-white"
            >
              Follow along on Letterboxd ↗
            </a>
            <p className="m-0 mt-4 text-xs text-stone-600">
              Posters via{" "}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="text-stone-500 underline-offset-2 hover:underline">
                TMDB
              </a>
              . This site uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </footer>
        </div>

        <AnimatePresence>
          {openFav && open !== null && (
            <TicketModal
              key={openFav.film}
              film={films[openFav.film]}
              blurb={openFav.blurb}
              index={open}
              onClose={() => setOpen(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}

/* ── Layout pieces ─────────────────────────────────────────────────────── */

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="mt-16 md:mt-20">
      <div className="mb-8 flex items-baseline gap-4">
        <h2 className="wide m-0 text-2xl font-bold uppercase tracking-tight sm:text-4xl">{title}</h2>
        <span className="-rotate-2 font-hand text-xl text-amber-200/80">({note})</span>
      </div>
      {children}
    </section>
  );
}

function Stars({ rating, className = "" }: { rating: number | null; className?: string }) {
  if (rating === null) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className={`tracking-[0.08em] ${className}`} style={{ color: STAR }} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(full)}
      {half ? "½" : ""}
    </span>
  );
}

/** Poster when we have one, otherwise a typographic title card. */
function PosterArt({ film, size = "md" }: { film: FilmView; size?: "sm" | "md" | "lg" }) {
  if (film.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={film.posterUrl} alt={`${film.title} poster`} className="h-full w-full object-cover" loading="lazy" />
    );
  }
  const small = size === "sm";
  const titleSize = size === "lg" ? "text-4xl" : small ? "text-xs" : "text-lg sm:text-2xl";
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between p-[9%] text-[#f3ead7]"
      style={{
        background: `linear-gradient(160deg, ${film.tint} 0%, #0d0b09 120%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 3px)" }}
      />
      <span className="relative self-end font-mono text-xs tracking-label opacity-70">{film.year}</span>
      <div className="relative">
        <span className={`block font-bold uppercase leading-none tracking-tight ${small ? "" : "wide"} ${titleSize}`}>
          {film.title}
        </span>
        {!small && (
          <span className="mt-2 block font-mono text-xs uppercase tracking-label opacity-60">{film.director}</span>
        )}
      </div>
    </div>
  );
}

/* ── Top 4: tickets ────────────────────────────────────────────────────── */

function Ticket({ film, index, onOpen }: { film: FilmView; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
      whileHover={{ y: -6, rotate: index % 2 ? 1 : -1 }}
      className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70"
      aria-label={`${film.title}: read why it is in the top 4`}
    >
      <motion.div
        layoutId={`poster-${film.key}`}
        className="aspect-[2/3] overflow-hidden rounded-t-md shadow-[0_18px_40px_rgba(0,0,0,0.5)]"
      >
        <PosterArt film={film} />
      </motion.div>

      {/* Stub, with punched notches at the perforation */}
      <div className="relative rounded-b-md px-3 pb-3 pt-4" style={{ background: TICKET, color: INK }}>
        <span aria-hidden className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[#0d0b09]" />
        <span aria-hidden className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-[#0d0b09]" />
        <span aria-hidden className="absolute inset-x-3 top-0 border-t-2 border-dashed border-black/20" />

        <div className="flex items-center justify-between font-mono text-xs uppercase tracking-label text-black/50">
          <span className="hidden sm:inline">Admit one</span>
          <span>No. {String(index + 1).padStart(2, "0")}</span>
        </div>
        <p className="wide m-0 mt-2 truncate text-base font-bold uppercase leading-tight">{film.title}</p>
        <div className="mt-1 flex items-center justify-between gap-2 font-mono text-xs text-black/55">
          <span className="truncate">{film.year}</span>
          <Stars rating={film.rating} className="text-sm [text-shadow:0_0_1px_rgba(0,0,0,0.4)]" />
        </div>
        <p className="m-0 mt-2 font-hand text-lg leading-none text-black/50 transition-colors group-hover:text-[#c2412d]">
          why this one →
        </p>
      </div>
    </motion.button>
  );
}

function TicketModal({
  film,
  blurb,
  index,
  onClose,
}: {
  film: FilmView;
  blurb: string;
  index: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${film.title}: why it's in the top 4`}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        className="relative grid max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-lg sm:grid-cols-[minmax(0,15rem)_1fr]"
        style={{ background: PAPER, color: INK }}
        initial={{ y: 30, rotate: -2 }}
        animate={{ y: 0, rotate: 0 }}
        exit={{ y: 20, rotate: 2, opacity: 0 }}
        transition={SNAP}
      >
        <motion.div layoutId={`poster-${film.key}`} className="aspect-[2/3] overflow-hidden sm:aspect-auto sm:h-full">
          <PosterArt film={film} size="lg" />
        </motion.div>

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-black/60 transition-colors hover:bg-black hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="m-0 font-mono text-xs uppercase tracking-label text-black/50">
            Top 4 · No. {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="wide m-0 mt-3 pr-10 text-4xl font-bold uppercase leading-none tracking-tight">{film.title}</h3>
          <p className="m-0 mt-3 flex flex-wrap items-center gap-x-3 font-mono text-xs uppercase tracking-label text-black/55">
            <span>{film.year}</span>
            <span aria-hidden>·</span>
            <span>{film.director}</span>
            {film.rating !== null && (
              <>
                <span aria-hidden>·</span>
                <Stars rating={film.rating} className="text-sm [text-shadow:0_0_1px_rgba(0,0,0,0.5)]" />
              </>
            )}
          </p>

          <div className="mt-6 border-t-2 border-dashed border-black/15 pt-6">
            {blurb ? (
              <p className="m-0 whitespace-pre-line text-xl leading-relaxed" style={{ fontFamily: "var(--ff-journal)", color: PEN_BLUE }}>
                {blurb}
              </p>
            ) : (
              <p className="m-0 font-hand text-2xl text-black/45">Still finding the words for this one. Check back.</p>
            )}
          </div>

          <a
            href={film.letterboxdUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-label text-black/55 no-underline hover:text-black"
          >
            On Letterboxd <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Hot takes: index cards ────────────────────────────────────────────── */

function TakeCard({ take, films, index }: { take: HotTake; films: Record<FilmKey, FilmView>; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `take-${take.id}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className="relative overflow-hidden rounded-md shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
      style={{
        background: PAPER,
        color: INK,
        backgroundImage:
          "repeating-linear-gradient(180deg, transparent 0 31px, rgba(47,74,138,0.13) 31px 32px)",
        rotate: index % 2 ? "0.6deg" : "-0.6deg",
      }}
    >
      {/* Margin rule */}
      <span aria-hidden className="absolute inset-y-0 left-10 w-px bg-rose-400/50" />

      <div className="relative py-6 pl-14 pr-6">
        {/* Stamp */}
        <span
          className="mb-4 inline-block rotate-3 rounded-sm border-2 px-2 py-0.5 font-mono text-xs font-semibold uppercase tracking-label sm:absolute sm:right-5 sm:top-5 sm:mb-0 sm:rotate-6"
          style={{ borderColor: STAMP, color: STAMP, opacity: 0.85 }}
        >
          Unpopular opinion
        </span>

        <p className="m-0 font-mono text-xs uppercase tracking-label text-black/45 sm:pr-48">
          Take No. {String(index + 1).padStart(2, "0")}
        </p>
        <p className="m-0 mt-3 text-3xl leading-tight" style={{ fontFamily: "var(--ff-journal)" }}>
          {take.verdict}
        </p>

        {take.kind === "versus" ? (
          <div className="mt-5 flex items-center gap-4">
            <MiniFilm film={films[take.winner]} badge="Winner" />
            <span className="wide text-xl font-bold text-black/40">VS</span>
            <MiniFilm film={films[take.loser]} dim />
          </div>
        ) : (
          <div className="mt-5">
            <MiniFilm film={films[take.film]} dim badge="Overrated" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="mt-6 inline-flex items-center gap-1.5 border-b border-black/40 pb-0.5 text-sm font-semibold text-black/80"
        >
          {expanded ? "Okay, fine" : "Hear me out"}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={panelId}
              key="case"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              {take.explanation ? (
                <p className="m-0 whitespace-pre-line pt-4 text-xl leading-8" style={{ fontFamily: "var(--ff-journal)", color: PEN_BLUE }}>
                  {take.explanation}
                </p>
              ) : (
                <p className="m-0 pt-4 font-hand text-2xl text-black/45">The case is being prepared. Opening statements soon.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function MiniFilm({ film, dim = false, badge }: { film: FilmView; dim?: boolean; badge?: string }) {
  return (
    <div className="relative">
      <div className={`aspect-[2/3] w-24 overflow-hidden rounded-sm shadow-md sm:w-28 ${dim ? "opacity-60 grayscale" : ""}`}>
        <PosterArt film={film} size="sm" />
      </div>
      {badge && (
        <span
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 -rotate-6 whitespace-nowrap rounded-sm border-2 px-1.5 font-mono text-xs font-semibold uppercase tracking-label"
          style={{ borderColor: STAMP, color: STAMP, background: PAPER }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── Recently watched ──────────────────────────────────────────────────── */

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function DiaryCard({ entry: e, index }: { entry: DiaryEntry; index: number }) {
  const date = e.watchedDate ? DATE.format(new Date(`${e.watchedDate}T00:00:00Z`)) : null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: EASE, delay: (index % 6) * 0.05 }}
    >
      <a href={e.link} target="_blank" rel="noreferrer" className="group block no-underline">
        <div className="aspect-[2/3] overflow-hidden rounded-md border border-white/10 bg-stone-900 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
          {e.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.posterUrl}
              alt={`${e.title} poster`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-end p-3">
              <span className="wide text-sm font-bold uppercase leading-tight text-stone-300">{e.title}</span>
            </div>
          )}
        </div>
        <p className="m-0 mt-3 truncate text-sm font-semibold text-[#f3ead7]">{e.title}</p>
        <p className="m-0 mt-1 flex items-center gap-2 text-xs">
          <Stars rating={e.rating} />
          {e.rewatch && (
            <RotateCcw className="h-3.5 w-3.5 text-stone-400" strokeWidth={2.25} aria-label="Rewatch" />
          )}
        </p>
        {date && <p className="m-0 mt-1 font-mono text-xs text-stone-500">{date}</p>}
        {e.review && (
          <p className="m-0 mt-2 line-clamp-3 font-hand text-lg leading-tight text-amber-100/80">&ldquo;{e.review}&rdquo;</p>
        )}
      </a>
    </motion.li>
  );
}
