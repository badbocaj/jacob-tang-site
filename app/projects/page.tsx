"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Sky } from "@/components/lab/Sky";
import { LightSwitch } from "@/components/lab/LightSwitch";
import { Drawing, type DrawingKey } from "@/components/lab/Drawings";
import { AssembledRocket, RocketDefs } from "@/components/about/RocketParts";

/* ───────────────────────────────────────────────────────────────────────────
   THE LAB

   One light switch runs the whole page.
     ON   daylight, a sun, paper-white — the hardware
     OFF  night, stars, a moon, the Milky Way — the software

   Work, school and side projects live together; the only split is what they
   are made of. Everything below the sky (cards, drawings, links) takes its
   colours from the same two themes, so nothing is left lit when the lights
   go out. Shortcut: press L.
   ─────────────────────────────────────────────────────────────────────────── */

type Mode = "hardware" | "software";

interface Project {
  key: string;
  title: string;
  org?: string;
  context: "Work" | "School" | "Side";
  year: string;
  role?: string;
  blurb: string;
  drawing: DrawingKey;
  link?: { href: string; label: string };
  status?: string;
  /** Optional headline number, e.g. "47 g joint · 22% lighter". Shown big. */
  stat?: string;
  /** A real photo replaces the line drawing. `blend` suits shots on a white
      background: the white drops out into the card. `plate` suits dark renders,
      shown as a dark print. Leave it off for an ordinary photo. */
  photo?: { src: string; alt: string; look?: "blend" | "plate" };
  /** A YouTube video id. Plays in the frame instead of a drawing or photo. */
  youtube?: { id: string; title: string };
  /** Shows the assembled rocket from /about in the frame. */
  rocket?: boolean;
}

/* EDIT ME — the words on this page live here. Each project also takes an
   optional `stat`: one real number (load, mass, thrust, users) is the best
   thing you can add to a row. */
const PROJECTS: Record<Mode, Project[]> = {
  hardware: [
    {
      key: "vital",
      title: "Pressurization drivetrain",
      org: "Vital Lyfe",
      context: "Work",
      year: "2026",
      role: "Mechanical engineering intern",
      blurb:
        "Owned the high-pressure pump drivetrain of a portable seawater desalinator end to end: the brackets, the pump that turns motor torque into 50 to 100 bar, and the rig that tested it.",
      drawing: "drivetrain",
      photo: {
        src: "/projects/lab-vital-drivetrain.webp",
        alt: "Cutaway render of the Vital Lyfe portable watermaker, with the high-pressure pump, membrane housing and sensors labelled",
        look: "plate",
      },
      link: { href: "/projects/vital", label: "Read the write-up" },
    },
    {
      key: "hpfrt",
      title: "Human-powered flight",
      org: "Human Powered Flight Research Team",
      context: "School",
      year: "2024",
      role: "Structures researcher",
      blurb:
        "A student-built airplane that flies on one person's pedaling. I worked on the wing spar and the boom joints, the parts that carry the biggest loads in the airframe.",
      drawing: "aircraft",
      photo: {
        src: "/projects/lab-hpfrt-plane.webp",
        alt: "The team's red and white aircraft parked on a cracked desert lakebed",
      },
      link: { href: "/projects/hpfrt", label: "Read the write-up" },
    },
    {
      key: "lpl",
      title: "Liquid rocket engine",
      org: "Liquid Propulsion Lab",
      context: "School",
      year: "2024–25",
      role: "Propulsion team",
      blurb:
        "A student team building a liquid bipropellant hopper vehicle. I worked on WFTS, the water flow test stand that characterizes components before they're fired.",
      drawing: "engine",
      photo: {
        src: "/projects/lab-lpl-wfts.webp",
        alt: "The water flow test stand: a black steel frame holding tanks, plumbing, pressure gauges and a control laptop",
        look: "blend",
      },
      link: { href: "/projects/liquid-prop", label: "Read the write-up" },
    },
  ],
  software: [
    {
      key: "maiia",
      title: "MAIIA",
      context: "Side",
      year: "2024",
      blurb:
        "My roommate Denys has a blind grandmother whose English isn't very good. MAIIA was made to help people like her, using AI to turn visual media into audio descriptions. We were one of the first to solve this before AI got exponentially better.",
      drawing: "terminal",
      youtube: { id: "iVFS4_airkQ", title: "MAIIA demo" },
      link: { href: "/projects/maiia", label: "Open the file" },
    },
    {
      key: "site",
      title: "tangjacob.com",
      org: "This website",
      context: "Side",
      year: "2026",
      role: "Design + build",
      blurb:
        "The site you're on. Next.js, Tailwind and Framer Motion, built mostly to learn how to work with Claude Code. The light switch up there is part of it.",
      drawing: "browser",
      rocket: true,
      link: { href: "/", label: "Back to the front door" },
    },
    {
      key: "pantry",
      title: "Ingredients Tracker",
      context: "Side",
      year: "2026",
      role: "Solo build",
      blurb:
        "Logs what's in my kitchen as have, running low, or gone. Next up: an AI agent that hunts for cheap recipes and suggests meals from what's already on the shelf.",
      drawing: "pantry",
      status: "In progress",
    },
  ],
};

const THEME: Record<Mode, Record<string, string>> = {
  hardware: {
    "--bg": "#f4f1ea",
    "--ink": "#18181b",
    "--muted": "#57534e",
    "--faint": "rgba(24,24,27,0.12)",
    "--card": "#fbfaf6",
    "--line": "#1e3a8a",
    "--accent": "#b45309",
  },
  software: {
    "--bg": "#060914",
    "--ink": "#e5e7eb",
    "--muted": "#94a3b8",
    "--faint": "rgba(148,163,184,0.16)",
    "--card": "rgba(15,23,42,0.55)",
    "--line": "#c7d2fe",
    "--accent": "#a5b4fc",
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LabPage() {
  const [mode, setMode] = useState<Mode>("hardware");
  const night = mode === "software";

  const flip = useCallback(() => setMode((m) => (m === "hardware" ? "software" : "hardware")), []);

  // Tell the floating nav which way the switch is, so it dims with the room.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.labMode = night ? "night" : "day";
    return () => {
      delete root.dataset.labMode;
    };
  }, [night]);

  // L for lights.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "l" || e.key === "L") flip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  const projects = PROJECTS[mode];

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative min-h-screen bg-[var(--bg)] text-[var(--ink)] transition-colors duration-700"
        style={THEME[mode] as CSSProperties}
      >
        {/* ── Sky + hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <Sky night={night} />

          <div className="relative mx-auto grid min-h-[30rem] w-full max-w-6xl gap-10 px-5 pb-16 pt-36 sm:px-8 md:min-h-[38rem] md:grid-cols-[1fr_auto] md:items-end md:pt-44">
            <div>
              <p className="m-0 font-mono text-xs uppercase tracking-label text-[var(--muted)] transition-colors duration-700">
                The Lab · {PROJECTS.hardware.length + PROJECTS.software.length} projects
              </p>

              <div className="relative mt-4 h-14 overflow-hidden sm:h-20">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.h1
                    key={mode}
                    className="wide absolute inset-x-0 top-0 m-0 text-5xl font-bold uppercase leading-none tracking-tight sm:text-6xl"
                    initial={{ y: night ? "100%" : "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: night ? "-100%" : "100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    {night ? "Software." : "Hardware."}
                  </motion.h1>
                </AnimatePresence>
              </div>

              <p className="m-0 mt-4 max-w-md text-lg leading-relaxed text-[var(--muted)] transition-colors duration-700">
                {night
                  ? "Things that run after dark. Flip the lights back on for the physical stuff."
                  : "Things you could drop on your foot. Flip the lights off for the code."}
              </p>
            </div>

            <div className="relative justify-self-start md:justify-self-end">
              <LightSwitch on={!night} onToggle={flip} dark={night} />
              <span
                className="absolute -bottom-9 right-0 -rotate-3 whitespace-nowrap font-hand text-xl text-[var(--muted)] transition-colors duration-700"
                aria-hidden
              >
                {night ? "lights back on? (or press L)" : "flip me (or press L)"}
              </span>
            </div>
          </div>
        </section>

        {/* ── Projects ────────────────────────────────────────────────── */}
        <section className="relative mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={mode}
              className="m-0 list-none p-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {projects.map((p, i) => (
                <ProjectRow key={p.key} project={p} index={i} night={night} />
              ))}
            </motion.ol>
          </AnimatePresence>

          <div className="mt-6 flex justify-center border-t border-[var(--faint)] pt-10 transition-colors duration-700">
            <button
              type="button"
              onClick={() => {
                flip();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex items-center gap-2 font-mono text-xs uppercase tracking-label text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              {night ? "Lights on — show me the hardware" : "Lights off — show me the software"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}

function ProjectRow({ project: p, index, night }: { project: Project; index: number; night: boolean }) {
  const flipSide = index % 2 === 1;

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.05 }}
      className="grid items-center gap-8 border-t border-[var(--faint)] py-12 transition-colors duration-700 md:grid-cols-12 md:gap-12 md:py-16"
    >
      {/* Drawing */}
      <figure
        className={`relative m-0 aspect-[4/3] overflow-hidden border border-[var(--faint)] bg-[var(--card)] transition-colors duration-700 md:col-span-5 ${
          flipSide ? "md:order-2" : ""
        }`}
      >
        {p.youtube ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${p.youtube.id}`}
            title={p.youtube.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full bg-black"
          />
        ) : p.rocket ? (
          <div className="absolute inset-0 bg-[#0b0a09]">
            {/* the same isometric grid /about sits on */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,rgba(243,234,215,0.05)_0_1px,transparent_1px_56px),repeating-linear-gradient(150deg,rgba(243,234,215,0.05)_0_1px,transparent_1px_56px)]" />
            <RocketDefs />
            <AssembledRocket className="absolute left-1/2 top-[6%] h-[88%] w-auto -translate-x-1/2" />
          </div>
        ) : p.photo ? (
          <Image
            src={p.photo.src}
            alt={p.photo.alt}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className={
              p.photo.look === "blend"
                ? "object-contain p-3 mix-blend-multiply"
                : "object-cover"
            }
          />
        ) : (
          <Drawing
            kind={p.drawing}
            className="absolute inset-0 h-full w-full p-4 text-[var(--line)] transition-[color,filter] duration-700"
          />
        )}
        {night && (
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(165,180,252,0.08)]" />
        )}
        {!p.youtube && (
        <figcaption
          className={`absolute bottom-3 left-3 font-mono text-xs uppercase tracking-label ${
            p.rocket || (p.photo && p.photo.look !== "blend")
              ? "bg-[#0b0a09]/55 px-1.5 py-0.5 text-stone-200"
              : "text-[var(--muted)]"
          }`}
        >
          Fig. {String(index + 1).padStart(2, "0")}
        </figcaption>
        )}
      </figure>

      {/* Words */}
      <div className={`md:col-span-7 ${flipSide ? "md:order-1" : ""}`}>
        <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-label text-[var(--muted)]">
          <span className="text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
          <span>{p.context}</span>
          <span aria-hidden>·</span>
          <span>{p.year}</span>
          {p.org && (
            <>
              <span aria-hidden>·</span>
              <span>{p.org}</span>
            </>
          )}
        </p>

        <h2 className="wide m-0 mt-3 text-4xl font-bold uppercase leading-tight tracking-tight">{p.title}</h2>

        {p.role && (
          <p className="m-0 mt-2 font-mono text-xs uppercase tracking-label text-[var(--muted)]">{p.role}</p>
        )}

        <p className="m-0 mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{p.blurb}</p>

        {p.stat && (
          <p className="m-0 mt-5 border-l-2 border-[var(--accent)] pl-3 font-mono text-sm uppercase tracking-label text-[var(--ink)]">
            {p.stat}
          </p>
        )}

        <div className="mt-6">
          {p.link ? (
            <Link
              href={p.link.href}
              className="group inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-sm font-semibold text-[var(--ink)] no-underline"
            >
              {p.link.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 border border-[var(--faint)] px-2.5 py-1 font-mono text-xs uppercase tracking-label text-[var(--accent)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
              {p.status}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
}
