"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { MotionConfig, motion } from "framer-motion"
import { ArrowDown, ArrowUpRight, Lock } from "lucide-react"

import { AssembledRocket, RocketDefs } from "@/components/about/RocketParts"
import { Brackets } from "@/components/HudPrimitives"
import { JOBS } from "@/components/professional/facilityConfig"
import { FILMS, TOP_FOUR } from "@/data/movies"
import { isLocked } from "@/lib/construction"

/* ───────────────────────────────────────────────────────────────────────────
   THE FRONT DOOR

   Three beats, top to bottom:
     1. Hero      — a real photo from the lab, one line of poster type, and the
                    roommate's hot take scribbled on top like a margin note.
     2. Channels  — every section as a tile (Anduril-style bento). Each tile
                    is a glimpse of the page behind it: the rocket still in
                    one piece, the service record's terminal, the Lab with
                    the lights off.
     3. Sign-off  — the original "why this exists" note, plus contacts.

   The site nav floats over the hero, so this page has no top bar of its own.
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
          05 channels{lockedCount > 0 ? ` · ${lockedCount} under construction` : ""}
        </p>
      </div>

      <div className="mt-6 grid auto-rows-[minmax(240px,auto)] grid-cols-1 gap-3 md:grid-cols-3">
        {/* About — the big one: the rocket, still in one piece */}
        <Tile
          href="/about"
          index="01"
          label="About"
          sub="Jacob, as a rocket. Scroll to take it apart."
          className="min-h-[420px] md:col-span-2 md:row-span-2"
          delay={0}
        >
          <RocketArt />
        </Tile>

        <Tile
          href="/professional"
          index="02"
          label="Professional"
          sub={`Service record · ${JOBS.length} missions logged`}
          delay={0.05}
        >
          <ServiceRecordArt />
        </Tile>

        <Tile
          href="/projects"
          index="03"
          label="The Lab"
          sub="Projects · lights off for the code"
          locked={isLocked("/projects")}
          delay={0.1}
        >
          <NightLabArt />
        </Tile>

        <Tile href="/travel" index="04" label="Travel" sub="Trips, people, bad bets" delay={0.15}>
          <Image
            src="/travel/Cover/japan-cover.jpg"
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover object-[50%_40%] opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
          />
        </Tile>

        <Tile
          href="/movies"
          index="05"
          label="Movies"
          sub="Top 4, hot takes, recent watches"
          className="md:col-span-2"
          locked={isLocked("/movies")}
          delay={0.2}
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
  locked = false,
  delay = 0,
  children,
}: {
  href: string
  index: string
  label: string
  sub: string
  className?: string
  locked?: boolean
  delay?: number
  children?: ReactNode
}) {
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
        className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden border border-white/10 bg-zinc-950 p-5 text-white no-underline transition-colors hover:border-white/30 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0">{children}</div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="relative flex items-start justify-between">
          <span className="font-mono text-xs tracking-label text-zinc-400">{index}</span>
          {locked ? (
            <span className="flex items-center gap-1.5 border border-amber-300/40 bg-black/60 px-2 py-1 font-mono text-xs uppercase tracking-label text-amber-300">
              <Lock className="h-3 w-3" strokeWidth={2.5} /> Soon
            </span>
          ) : (
            <ArrowUpRight
              className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
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
          <p className="m-0 mt-2 font-mono text-xs uppercase tracking-label text-zinc-400">{sub}</p>
        </div>
      </Link>
    </motion.div>
  )
}

/* Tile artwork — each one is a glimpse of the page behind it. */

/** /about before you scroll: the rocket, still in one piece. */
function RocketArt() {
  return (
    <div className="absolute inset-0 bg-[#0b0a09]">
      {/* the same isometric grid the page sits on */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,rgba(243,234,215,0.05)_0_1px,transparent_1px_56px),repeating-linear-gradient(150deg,rgba(243,234,215,0.05)_0_1px,transparent_1px_56px)]" />
      <RocketDefs />
      {/* On hover the parts ease apart, a hint of what scrolling does. */}
      <AssembledRocket
        className="absolute right-[8%] top-[6%] h-[88%] w-auto md:right-[16%]"
        partClassName="transition-[translate] duration-500 ease-out group-hover:translate-y-[calc(var(--i)*7px)]"
      />
      <span className="absolute left-5 top-14 font-mono text-xs uppercase tracking-label text-[#ff6a3d] sm:left-6">
        JT-01 // Exploded view
      </span>
    </div>
  )
}

/** /professional's amber terminal, with the mission list on screen. */
function ServiceRecordArt() {
  const newestFirst = [...JOBS].reverse()
  return (
    <div className="absolute inset-0 bg-[#0d0b09]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(243,234,215,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(243,234,215,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-x-5 bottom-24 top-12 overflow-hidden border border-amber-400/25 bg-[#16120d]/85 px-4 py-3 transition-colors duration-500 group-hover:border-amber-400/60 sm:inset-x-6">
        <Brackets size={12} thickness={2} color="#fbbf24" />
        <p className="m-0 font-mono text-xs uppercase tracking-label text-amber-400">JT-01 // Pilot file</p>
        <ul className="m-0 mt-2 grid list-none grid-cols-2 gap-x-4 gap-y-1 p-0 font-mono text-xs uppercase tracking-wider text-stone-300">
          {newestFirst.map((job, i) => (
            <li key={job.key} className="flex min-w-0 gap-2.5">
              <span className="text-amber-400">{String(JOBS.length - i).padStart(2, "0")}</span>
              <span className="truncate">{job.company}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** A handful of fixed stars: x, y, radius, opacity on a 300×200 board. */
const NIGHT_STARS: [number, number, number, number][] = [
  [18, 22, 0.9, 0.8], [46, 96, 0.6, 0.5], [64, 34, 0.7, 0.7], [92, 142, 0.8, 0.5], [108, 18, 0.6, 0.6],
  [124, 78, 1, 0.9], [142, 44, 0.6, 0.5], [156, 122, 0.7, 0.6], [171, 26, 0.9, 0.8], [188, 92, 0.6, 0.5],
  [204, 14, 0.7, 0.6], [226, 58, 0.6, 0.4], [262, 20, 0.8, 0.7], [284, 104, 0.6, 0.5], [34, 152, 0.7, 0.4],
]

/** /projects with the lights off: night sky, moon up, switch flipped to software. */
function NightLabArt() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#02040c_0%,#070c1f_60%,#060914_100%)]">
      <svg
        viewBox="0 0 300 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <mask id="home-crescent">
            <rect width="300" height="200" fill="#fff" />
            <circle cx="88" cy="56" r="20" fill="#000" />
          </mask>
        </defs>
        {NIGHT_STARS.map(([x, y, r, o]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#e0e7ff" opacity={o} />
        ))}
        <circle cx="80" cy="62" r="34" fill="rgba(226,232,240,0.07)" />
        <circle cx="80" cy="62" r="21" fill="#f1f5f9" mask="url(#home-crescent)" />
      </svg>

      {/* The wall switch, paddle down: off, software */}
      <div className="absolute right-6 top-[42%] flex -translate-y-1/2 items-center gap-3">
        <div className="flex h-24 flex-col justify-between py-3 text-right font-mono text-xs uppercase tracking-label">
          <span className="text-slate-300/40">On · HW</span>
          <span className="text-[#a5b4fc]">Off · SW</span>
        </div>
        <div className="relative h-24 w-16 rounded-lg border border-slate-400/35 bg-[#1b2033] shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
          <div className="absolute left-1/2 top-1/2 h-14 w-7 -translate-x-1/2 -translate-y-1/2 rounded bg-[#11152a] shadow-[inset_0_2px_6px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-x-0.5 bottom-0.5 h-7 rounded-[3px] border border-slate-400/35 bg-[#262c44] shadow-[0_-4px_0_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
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
          <Link href="/about" className="mt-3 text-amber-300 no-underline transition-colors hover:text-amber-200">
            Take the rocket apart →
          </Link>
        </div>
      </div>
      <div className="border-t border-white/5 px-5 py-6 text-center font-mono text-xs uppercase tracking-label text-zinc-600 sm:px-8">
        Jacob Tang · Los Angeles · Built by hand (and Claude)
      </div>
    </footer>
  )
}
