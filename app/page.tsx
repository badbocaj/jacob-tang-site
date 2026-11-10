"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { MotionConfig, motion } from "framer-motion"
import { ArrowDown, ArrowUpRight, Lock } from "lucide-react"

import { ContactsMenu } from "@/components/ContactsMenu"
import { FILMS, TOP_FOUR } from "@/data/movies"
import { isLocked } from "@/lib/construction"

/* ───────────────────────────────────────────────────────────────────────────
   THE FRONT DOOR

   Three beats, top to bottom:
     1. Hero      — a real photo from the lab, one line of poster type, and the
                    roommate's hot take scribbled on top like a margin note.
     2. Channels  — every section as a tile (Anduril-style bento), so the
                    cockpit is the fun way in rather than the only way in.
     3. Sign-off  — the original "why this exists" note, plus contacts.
   ─────────────────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
})

export default function HomePage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative w-full bg-black">
        <Hero />
        <Channels />
        <SignOff />
      </main>
    </MotionConfig>
  )
}

/* ── 1. HERO ─────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[600px] w-full flex-col overflow-hidden">
      <Image
        src="/projects.jpg"
        alt="Jacob cutting wing ribs in the lab"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_45%] opacity-60 grayscale-[30%]"
      />
      {/* Darken the edges so the type always has something to sit on */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

      {/* Top bar */}
      <header className="relative z-20 flex items-start justify-between p-5 sm:p-8 md:p-10">
        <Link href="/" className="no-underline">
          <span className="block text-xl font-bold uppercase text-white">Jacob Tang&apos;s</span>
          <span className="mt-1 block font-mono text-xs uppercase tracking-label text-zinc-400">
            Persolio
          </span>
        </Link>
        <ContactsMenu />
      </header>

      {/* Poster block, anchored low-left */}
      <div className="relative z-10 mt-auto grid min-w-0 gap-10 px-5 pb-24 sm:px-8 md:grid-cols-[1fr_auto] md:items-end md:px-10 md:pb-28">
        <div>
          <motion.p
            {...rise(0.1)}
            className="m-0 font-mono text-xs uppercase tracking-label text-zinc-300"
          >
            Mechanical engineer · USC · Los Angeles
          </motion.p>

          <h1 className="wide m-0 mt-5 text-4xl font-bold uppercase leading-none tracking-tight text-white sm:text-6xl">
            {["shooting for the moon", "landing in the trees."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* The roommate's take, scribbled in the margin */}
          <motion.div
            initial={{ opacity: 0, rotate: -6, y: 10 }}
            animate={{ opacity: 1, rotate: -2, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.9 }}
            className="mt-8 inline-block origin-left"
          >
            <p className="m-0 font-hand text-2xl leading-tight text-amber-200 sm:text-4xl">
              &ldquo;Frontend is a solved problem.&rdquo;
            </p>
            <div className="mt-1 flex items-center gap-2">
              <svg width="64" height="14" viewBox="0 0 64 14" fill="none" aria-hidden className="text-amber-200/70">
                <path
                  d="M2 9c6-6 10 4 16-1s9-5 14 0 10 4 16-1 9-3 14 1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-hand text-xl text-zinc-400">my roommate</span>
            </div>
          </motion.div>
        </div>

        {/* Figure caption, like a plate in a lab notebook */}
        <motion.p
          {...rise(0.6)}
          className="m-0 hidden max-w-[16rem] border-l border-white/30 pl-3 font-mono text-xs uppercase leading-relaxed tracking-label text-zinc-400 md:block"
        >
          Fig. 01 — In the lab
          <br />
          <span className="text-zinc-600">Rib sections, one at a time</span>
        </motion.p>
      </div>

      <a
        href="#channels"
        aria-label="Scroll to channels"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-xs uppercase tracking-label text-zinc-500 no-underline transition-colors hover:text-white"
      >
        <span>Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  )
}

/* ── 2. CHANNELS ─────────────────────────────────────────────────────────── */

function Channels() {
  const lockedCount = ["/projects", "/movies"].filter(isLocked).length

  return (
    <section id="channels" className="mx-auto w-full max-w-7xl scroll-mt-8 px-5 py-24 sm:px-8 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <h2 className="wide m-0 text-4xl font-bold uppercase tracking-tight text-white">
          Pick a channel
        </h2>
        <p className="m-0 font-mono text-xs uppercase tracking-label text-zinc-500">
          06 channels{lockedCount > 0 ? ` · ${lockedCount} under construction` : ""}
        </p>
      </div>

      <div className="mt-6 grid auto-rows-[minmax(240px,auto)] grid-cols-1 gap-3 md:grid-cols-3">
        {/* Cockpit — the big one */}
        <Tile
          href="/cockpit"
          index="01"
          label="Board the cockpit"
          sub="The fun way in. Look up, shoot a rock, open a page."
          className="min-h-[360px] md:col-span-2 md:row-span-2"
          delay={0}
        >
          <CockpitArt />
        </Tile>

        <Tile href="/about" index="02" label="About" sub="The journal" delay={0.05}>
          <Image
            src="/about.png"
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
          />
        </Tile>

        <Tile
          href="/professional"
          index="03"
          label="Professional"
          sub="Work history, as a comic"
          tone="paper"
          delay={0.1}
        >
          <PaperArt />
        </Tile>

        <Tile
          href="/travel"
          index="04"
          label="Travel"
          sub="Trips, people, bad bets"
          className="md:col-span-2"
          delay={0.15}
        >
          <Image
            src="/travel/Cover/japan-cover.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover object-[50%_40%] opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
          />
        </Tile>

        <Tile
          href="/projects"
          index="05"
          label="The Lab"
          sub="Projects · hardware, math, failures"
          locked={isLocked("/projects")}
          delay={0.2}
        >
          <BlueprintArt />
        </Tile>

        <Tile
          href="/movies"
          index="06"
          label="Movies"
          sub="Top 4, hot takes, recent watches"
          className="md:col-span-3"
          locked={isLocked("/movies")}
          delay={0.25}
        >
          <TicketArt />
        </Tile>
      </div>
    </section>
  )
}

function Tile({
  href,
  index,
  label,
  sub,
  className = "",
  tone = "dark",
  locked = false,
  delay = 0,
  children,
}: {
  href: string
  index: string
  label: string
  sub: string
  className?: string
  tone?: "dark" | "paper"
  locked?: boolean
  delay?: number
  children?: ReactNode
}) {
  const paper = tone === "paper"

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={`relative ${className}`}
    >
      <Link
        href={href}
        className={`group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden border p-5 no-underline transition-colors sm:p-6 ${
          paper
            ? "border-transparent bg-[#f3ede1] text-zinc-900"
            : "border-white/10 bg-zinc-950 text-white hover:border-white/30"
        }`}
      >
        <div className="pointer-events-none absolute inset-0">{children}</div>
        {!paper && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        )}

        <div className="relative flex items-start justify-between">
          <span className={`font-mono text-xs tracking-label ${paper ? "text-zinc-500" : "text-zinc-400"}`}>
            {index}
          </span>
          {locked ? (
            <span className="flex items-center gap-1.5 border border-amber-300/40 bg-black/60 px-2 py-1 font-mono text-xs uppercase tracking-label text-amber-300">
              <Lock className="h-3 w-3" strokeWidth={2.5} /> Soon
            </span>
          ) : (
            <ArrowUpRight
              className={`h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${
                paper ? "text-zinc-700" : "text-white"
              }`}
              strokeWidth={1.75}
            />
          )}
        </div>

        <div className="relative">
          <h3
            className={`wide m-0 text-2xl font-bold uppercase leading-tight tracking-tight sm:text-4xl ${
              locked ? "text-zinc-500" : ""
            }`}
          >
            {label}
          </h3>
          <p className={`m-0 mt-2 font-mono text-xs uppercase tracking-label ${paper ? "text-zinc-600" : "text-zinc-400"}`}>
            {sub}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

/* Tile artwork — drawn, not photographed, so each one hints at its zone. */

function CockpitArt() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_110%,rgba(34,211,238,0.22),transparent_60%),linear-gradient(180deg,#01030a,#071227)]">
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full text-cyan-300 transition-transform duration-700 group-hover:scale-[1.03]"
        aria-hidden
      >
        {/* canopy struts + dash arc */}
        <path d="M60 0 L190 500 M740 0 L610 500" stroke="currentColor" strokeOpacity="0.18" strokeWidth="2" fill="none" />
        <path d="M0 360 Q400 300 800 360" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
        {/* reticle */}
        <g transform="translate(400 170)" stroke="currentColor" fill="none">
          <circle r="34" strokeOpacity="0.5" />
          <circle r="3" fill="currentColor" stroke="none" fillOpacity="0.8" />
          <path d="M-56 0 H-42 M42 0 H56 M0 -56 V-42 M0 42 V56" strokeOpacity="0.7" />
        </g>
        {/* a few rocks */}
        {[
          [190, 110, 0.8],
          [600, 90, 1],
          [560, 230, 0.7],
        ].map(([x, y, s]) => (
          <path
            key={`${x}-${y}`}
            transform={`translate(${x} ${y}) scale(${s})`}
            d="M-18 -8 L-6 -20 L14 -16 L22 0 L12 18 L-10 20 L-22 6 Z"
            stroke="currentColor"
            strokeOpacity="0.55"
            fill="rgba(34,211,238,0.06)"
          />
        ))}
      </svg>
      <span className="absolute left-1/2 top-[calc(34%+64px)] -translate-x-1/2 whitespace-nowrap font-mono text-xs uppercase tracking-label text-cyan-200/60">
        JT-01 // Flight deck
      </span>
    </div>
  )
}

function PaperArt() {
  return (
    <div className="absolute inset-0">
      {/* ruled lines */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_27px,rgba(37,99,235,0.12)_27px,rgba(37,99,235,0.12)_28px)]" />
      <div className="absolute inset-y-0 left-10 w-px bg-rose-400/40" />
      {/* a stick figure, waving */}
      <svg
        viewBox="0 0 120 140"
        className="absolute right-6 top-8 h-24 w-20 text-zinc-800 transition-transform duration-500 group-hover:-rotate-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="60" cy="26" r="14" />
        <path d="M60 40 V92 M60 92 L44 128 M60 92 L76 128 M60 56 L38 74 M60 56 L84 34" />
        <path d="M90 22 l6 -6 M94 30 l8 -2" strokeWidth="1.8" />
      </svg>
      <span
        className="absolute right-28 top-10 -rotate-6 text-xl text-zinc-600"
        style={{ fontFamily: "var(--ff-journal)" }}
      >
        (no capes.)
      </span>
    </div>
  )
}

function BlueprintArt() {
  return (
    <div className="absolute inset-0 bg-[#06101f]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.12)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <svg
        viewBox="0 0 300 200"
        className="absolute inset-0 h-full w-full text-sky-300 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden
      >
        {/* a little engine: chamber, throat, bell */}
        <path d="M120 40 H180 V90 Q180 100 166 106 L162 110 Q200 140 214 176 H86 Q100 140 138 110 L134 106 Q120 100 120 90 Z" />
        <path d="M150 20 V40 M110 40 H190" strokeDasharray="4 4" strokeOpacity="0.6" />
        <path d="M86 186 H214 M86 182 V190 M214 182 V190" strokeOpacity="0.6" />
      </svg>
      {/* hazard tape across the corner */}
      <div className="absolute -right-10 top-16 w-56 rotate-45 bg-[repeating-linear-gradient(45deg,#fbbf24_0,#fbbf24_10px,#0a0a0a_10px,#0a0a0a_20px)] py-1 opacity-80" />
    </div>
  )
}

function TicketArt() {
  return (
    <div className="absolute inset-0 bg-[#0d0b09]">
      {/* projector beam from the top edge, same glow as /movies */}
      <div className="absolute inset-0 bg-[radial-gradient(50%_90%_at_50%_0%,rgba(255,236,200,0.14),transparent_70%)]" />
      {/* the top 4, as a fanned row of ticket stubs */}
      <div className="absolute inset-y-0 right-0 hidden items-center gap-3 pr-10 sm:flex md:pr-16">
        {TOP_FOUR.map((fav, i) => {
          const film = FILMS[fav.film]
          return (
            <div
              key={fav.film}
              style={{ rotate: `${[-5, 3, -2, 6][i % 4]}deg` }}
              className="relative flex h-36 w-24 flex-col justify-between border-l-2 border-dashed border-[#1f2328]/30 bg-[#f1e6cf] p-2.5 text-[#1f2328] shadow-lg shadow-black/50 transition-transform duration-500 group-hover:-translate-y-2 md:h-44 md:w-28"
            >
              <span className="font-mono text-[10px] uppercase tracking-label text-[#c2412d]">
                Admit one
              </span>
              <span className="text-sm font-bold uppercase leading-tight">{film.title}</span>
              <span className="font-mono text-[10px] uppercase tracking-label text-zinc-500">{film.year}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── 3. SIGN-OFF ─────────────────────────────────────────────────────────── */

function SignOff() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1fr_auto] md:items-end md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-3xl"
        >
          <p className="m-0 font-mono text-xs uppercase tracking-label text-zinc-500">Why this exists</p>
          <p className="m-0 mt-5 text-2xl font-bold uppercase leading-snug text-white sm:text-4xl">
            I wanted to learn how to use Claude Code because I thought it was important.
          </p>
          <p className="m-0 mt-4 text-xl font-bold uppercase text-zinc-500 sm:text-2xl">
            This is the result. <span className="text-white">Please enjoy!</span>
          </p>
        </motion.div>

        <div className="flex flex-col items-start gap-3 font-mono text-xs uppercase tracking-label md:items-end">
          <a href="mailto:jacobdtang@gmail.com" className="text-zinc-400 no-underline transition-colors hover:text-white">
            Email ↗
          </a>
          <a
            href="https://linkedin.com/in/tangjacob"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 no-underline transition-colors hover:text-white"
          >
            LinkedIn ↗
          </a>
          <Link href="/cockpit" className="mt-3 text-amber-300 no-underline transition-colors hover:text-amber-200">
            Board the cockpit →
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 px-5 py-6 text-center font-mono text-xs uppercase tracking-label text-zinc-600 sm:px-8">
        Jacob Tang · Los Angeles · Built by hand (and Claude)
      </div>
    </footer>
  )
}
