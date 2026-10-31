"use client";

import { useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   THE LAB — project index.

   This used to be a full-screen radar that swept, locked onto one project and
   auto-flew you there, which meant the other two were only reachable by URL.
   The radar stays (it is a good idea) but now it is a legend: every ping is a
   project, every project is a tile, and hovering one lights up the other.

   Look: blueprint paper. Ruled grid, hairline frames, figure captions.
   ─────────────────────────────────────────────────────────────────────────── */

type Art = "wing" | "engine" | "classified";

interface Project {
  id: string;
  codename: string;
  title: string;
  status: string;
  role: string;
  blurb: string;
  href: string;
  art: Art;
  /** Ping position on the radar, polar: r in 0–1, theta in degrees. */
  ping: { r: number; theta: number };
}

const PROJECTS: Project[] = [
  {
    id: "ARCHIVE_02",
    codename: "HPFRT",
    title: "Human-powered aircraft",
    status: "Active · 2024",
    role: "Structures researcher",
    blurb:
      "A student-built airplane that flies on legs alone. My part: designing and validating the structure that keeps it in one piece.",
    href: "/projects/hpfrt",
    art: "wing",
    ping: { r: 0.8, theta: 135 },
  },
  {
    id: "ARCHIVE_03",
    codename: "LIQUID_PROP",
    title: "Bipropellant rocket engine",
    status: "Active · 2024–25",
    role: "University propulsion team",
    blurb:
      "Design, build and hotfire a liquid bipropellant engine. The hard part is the injector and keeping the chamber from cooking itself.",
    href: "/projects/liquid-prop",
    art: "engine",
    ping: { r: 0.4, theta: 45 },
  },
  {
    id: "ARCHIVE_01",
    codename: "MAIIA",
    title: "Write-up in progress",
    status: "Filed · 2024",
    role: "Details pending",
    blurb: "Declassification pending. The hardware exists; the paragraph about it does not yet.",
    href: "/projects/maiia",
    art: "classified",
    ping: { r: 0.5, theta: 280 },
  },
];

const BLUE = "rgb(125 211 252)"; // sky-300

export default function ProjectsPage() {
  const [hot, setHot] = useState<string | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen bg-[#050b16] pt-16 text-white">
        {/* Blueprint grid, fading out toward the bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.07)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(180deg,#000_40%,transparent)]"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-14 sm:px-8 md:pt-20">
          {/* ── Header: title block + radar legend ─────────────────────── */}
          <header className="grid gap-10 border-b border-sky-300/20 pb-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="m-0 font-mono text-xs uppercase tracking-label text-sky-300/70">
                Zone C · The Lab
              </p>
              <h1 className="wide m-0 mt-4 text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">
                Hardware,
                <br />
                <span className="text-sky-300">math,</span> failures.
              </h1>
              <p className="m-0 mt-6 max-w-xl text-base leading-relaxed text-zinc-400">
                Things I&apos;ve helped design, build, break and rebuild. Each one is
                written up with the numbers, the sketches and the part where the math
                didn&apos;t work the first time.
              </p>
            </div>

            <Radar projects={PROJECTS} hot={hot} onHot={setHot} />
          </header>

          {/* ── Index ──────────────────────────────────────────────────── */}
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              >
                <Link
                  href={p.href}
                  onMouseEnter={() => setHot(p.id)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(p.id)}
                  onBlur={() => setHot(null)}
                  className={`group flex h-full flex-col border bg-[#071426]/80 no-underline backdrop-blur-sm transition-colors ${
                    hot === p.id ? "border-sky-300/70" : "border-sky-300/20"
                  }`}
                >
                  {/* Drawing */}
                  <div className="relative aspect-[4/3] border-b border-sky-300/20">
                    <ProjectArt art={p.art} hot={hot === p.id} />
                    <span className="absolute left-3 top-3 font-mono text-xs uppercase tracking-label text-sky-300/60">
                      Fig. {String(i + 1).padStart(2, "0")}
                    </span>
                    <ArrowUpRight
                      className="absolute right-3 top-3 h-5 w-5 text-sky-200 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Title block, like the corner of a drawing sheet */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-label">
                      <span className="text-sky-300">{p.codename}</span>
                      <span className="text-zinc-500">{p.status}</span>
                    </div>
                    <h2 className="wide m-0 mt-3 text-2xl font-bold uppercase leading-tight tracking-tight text-white">
                      {p.title}
                    </h2>
                    <p className="m-0 mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{p.blurb}</p>
                    <p className="m-0 mt-5 border-t border-sky-300/10 pt-3 font-mono text-xs uppercase tracking-label text-zinc-500">
                      Role · {p.role}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}

/* ── Radar legend ──────────────────────────────────────────────────────── */

function Radar({
  projects,
  hot,
  onHot,
}: {
  projects: Project[];
  hot: string | null;
  onHot: (id: string | null) => void;
}) {
  const R = 90;
  const toXY = (r: number, theta: number) => {
    const rad = (theta * Math.PI) / 180;
    return { x: r * R * Math.cos(rad), y: r * R * Math.sin(rad) };
  };

  return (
    <div className="relative mx-auto w-56 md:mx-0">
      <svg viewBox="-110 -110 220 220" className="block h-56 w-56" aria-hidden>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <circle
            key={f}
            r={R * f}
            fill="none"
            stroke={BLUE}
            strokeOpacity={f === 1 ? 0.5 : 0.15}
          />
        ))}
        <path d={`M${-R} 0 H${R} M0 ${-R} V${R}`} stroke={BLUE} strokeOpacity={0.12} strokeDasharray="3 5" />

        {/* sweep */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, ease: "linear", repeat: Infinity }}
        >
          <defs>
            <linearGradient id="lab-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={BLUE} stopOpacity="0" />
              <stop offset="1" stopColor={BLUE} stopOpacity="0.28" />
            </linearGradient>
          </defs>
          <path d={`M0 0 L${R} 0 A${R} ${R} 0 0 0 ${R * Math.cos(-0.9)} ${R * Math.sin(-0.9)} Z`} fill="url(#lab-sweep)" />
          <line x1="0" y1="0" x2={R} y2="0" stroke={BLUE} strokeOpacity="0.8" />
        </motion.g>

        <circle r="2.5" fill={BLUE} />
      </svg>

      {/* Pings are real links, layered over the drawing */}
      {projects.map((p) => {
        const { x, y } = toXY(p.ping.r, p.ping.theta);
        const isHot = hot === p.id;
        return (
          <Link
            key={p.id}
            href={p.href}
            aria-label={p.codename}
            onMouseEnter={() => onHot(p.id)}
            onMouseLeave={() => onHot(null)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 no-underline"
            style={{ left: `${50 + (x / 220) * 100}%`, top: `${50 + (y / 220) * 100}%` }}
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-sky-300/40" />
              <span className={`relative h-2 w-2 rounded-full ${isHot ? "bg-white" : "bg-sky-300"}`} />
            </span>
          </Link>
        );
      })}

      <p className="m-0 mt-2 text-center font-mono text-xs uppercase tracking-label text-sky-300/50">
        {hot ? projects.find((p) => p.id === hot)?.codename : `${projects.length} signatures`}
      </p>
    </div>
  );
}

/* ── Line drawings ─────────────────────────────────────────────────────── */

function ProjectArt({ art, hot }: { art: Art; hot: boolean }) {
  const common = {
    fill: "none",
    stroke: BLUE,
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 300 225"
      className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${hot ? "opacity-100" : "opacity-70"}`}
      aria-hidden
    >
      {art === "wing" && (
        <g {...common}>
          {/* Wing panel in plan view: spar plus a row of ribs */}
          <path d="M30 120 L270 96 L270 132 L30 150 Z" />
          <path d="M30 134 L270 112" strokeDasharray="6 4" strokeOpacity="0.7" />
          {Array.from({ length: 11 }, (_, i) => {
            const x = 50 + i * 21;
            const t = (x - 30) / 240;
            const top = 120 - t * 24;
            const bot = 150 - t * 18;
            return <path key={i} d={`M${x} ${top} L${x} ${bot}`} strokeOpacity="0.55" />;
          })}
          {/* Rib section, drawn big */}
          <path d="M70 60 Q120 34 200 50 Q230 56 236 62 Q200 70 120 70 Q86 70 70 60 Z" />
          <circle cx="128" cy="57" r="6" />
          <path d="M70 80 H236 M70 76 V84 M236 76 V84" strokeOpacity="0.5" />
          <text x="153" y="94" fill={BLUE} fillOpacity="0.6" fontSize="9" fontFamily="monospace" textAnchor="middle" stroke="none">
            RIB SECTION
          </text>
        </g>
      )}

      {art === "engine" && (
        <g {...common}>
          {/* Chamber, throat, bell, injector plate */}
          <path d="M120 40 H180 V96 Q180 106 166 112 L162 116 Q198 146 212 196 H88 Q102 146 138 116 L134 112 Q120 106 120 96 Z" />
          <path d="M112 40 H188 M116 34 H184" />
          <path d="M150 18 V34" strokeDasharray="3 3" strokeOpacity="0.7" />
          <path d="M150 116 V196" strokeDasharray="8 4 2 4" strokeOpacity="0.4" />
          <path d="M226 116 H240 M226 196 H240 M233 116 V196" strokeOpacity="0.5" />
          <text x="246" y="160" fill={BLUE} fillOpacity="0.6" fontSize="9" fontFamily="monospace" stroke="none">
            Ae/At
          </text>
        </g>
      )}

      {art === "classified" && (
        <g {...common}>
          <rect x="70" y="50" width="160" height="120" strokeDasharray="5 5" strokeOpacity="0.6" />
          <path d="M70 50 L230 170 M230 50 L70 170" strokeOpacity="0.25" />
          <rect x="96" y="98" width="108" height="24" fill="#050b16" stroke={BLUE} />
          <text x="150" y="114" fill={BLUE} fontSize="10" fontFamily="monospace" textAnchor="middle" stroke="none">
            REDACTED
          </text>
        </g>
      )}
    </svg>
  );
}
