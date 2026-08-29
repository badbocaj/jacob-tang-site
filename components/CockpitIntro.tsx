"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, Radio } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "sketch" | "boot" | "cockpit";

interface Zone {
  id: string;
  label: string;
  sublabel: string;
  href: string;
  description: string;
  color: string;
  glow: string;
  gridClass: string;
}

// ─── Static data ──────────────────────────────────────────────────────────────

const BOOT_LINES = [
  "> RETRIEVING SNACK RESERVES...",
  "> CALCULATING UNNECESSARY PHYSICS...",
  "> IGNORING 47 UNREAD EMAILS...",
  "> COCKPIT STABILIZED. WELCOME HOME.",
];

const MISSION_ENTRIES = [
  { year: "2026", role: "Mech. Eng. Intern", org: "Vital Lyfe" },
  { year: "2025", role: "Quality Eng. Intern", org: "L3Harris" },
  { year: "2024", role: "Structures Researcher", org: "AIM Lab @ UH" },
  { year: "2024", role: "Researcher", org: "CURVE @ USC" },
];

const FILM_LIST = [
  "> INTERSTELLAR.MOV",
  "> TENET.MKV",
  "> OPPENHEIMER.4K",
  "> BLADE_RUNNER_2049.MKV",
  "> ARRIVAL.MOV",
  "> DUNE.IMAX",
];

const MAP_STARS = [
  { cx: 28, cy: 22, r: 1.2, op: 0.8 },
  { cx: 68, cy: 16, r: 0.8, op: 0.6 },
  { cx: 82, cy: 38, r: 1.0, op: 0.9 },
  { cx: 18, cy: 56, r: 0.7, op: 0.5 },
  { cx: 76, cy: 70, r: 1.3, op: 0.7 },
  { cx: 44, cy: 78, r: 0.9, op: 0.8 },
  { cx: 12, cy: 32, r: 0.6, op: 0.4 },
  { cx: 88, cy: 24, r: 1.1, op: 0.6 },
  { cx: 58, cy: 86, r: 0.8, op: 0.5 },
  { cx: 34, cy: 62, r: 0.7, op: 0.7 },
  { cx: 56, cy: 44, r: 0.5, op: 0.3 },
  { cx: 8,  cy: 72, r: 1.0, op: 0.6 },
  { cx: 92, cy: 52, r: 0.7, op: 0.5 },
  { cx: 42, cy: 10, r: 0.9, op: 0.7 },
];

const ZONES: Zone[] = [
  {
    id: "travel",
    label: "NAV_MAP",
    sublabel: "Travel",
    href: "/travel",
    description:
      "Logs from traversing unfamiliar terrain. Coordinates of places that rewired my brain slightly. Itineraries built on vibes and delayed trains.",
    color: "border-cyan-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:border-cyan-300",
    gridClass: "col-start-1 col-span-2 row-start-1",
  },
  {
    id: "projects",
    label: "HOLO_SCHEMATICS",
    sublabel: "Projects",
    href: "/projects",
    description:
      "Physical and digital builds. HPFRT, liquid prop systems, code that works, and one project I will finish eventually. Probably.",
    color: "border-lime-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] hover:border-lime-300",
    gridClass: "col-start-3 col-span-2 row-start-1 row-span-2",
  },
  {
    id: "professional",
    label: "MISSION_LOG",
    sublabel: "Professional",
    href: "/professional",
    description:
      "Career history, roles, systems optimized. The résumé — but make it feel like a mission briefing, because everything is more interesting that way.",
    color: "border-violet-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] hover:border-violet-300",
    gridClass: "col-start-1 col-span-2 row-start-2",
  },
  {
    id: "movies",
    label: "MEDIA_ARCHIVE",
    sublabel: "Movies",
    href: "/movies",
    description:
      "Everything consumed: films, shows, literature. Curated takes with questionable objectivity and encyclopedic recall of plot holes.",
    color: "border-blue-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(96,165,250,0.4)] hover:border-blue-300",
    gridClass: "col-start-1 col-span-2 row-start-3",
  },
  {
    id: "misc",
    label: "AUX_SIGNAL",
    sublabel: "Misc / Funny",
    href: "/fun",
    description:
      "Unclassified transmissions. Random things that don't fit anywhere else but are too important to delete. Handle with curiosity.",
    color: "border-amber-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:border-amber-300",
    gridClass: "col-start-3 col-span-2 row-start-3",
  },
];

// ─── Module: NAV_MAP ─────────────────────────────────────────────────────────
// Minimalist star map with a slowly rotating GPS-style nav arrow.

function NavMapVisual() {
  const [angle, setAngle] = useState(35);

  useEffect(() => {
    const id = setInterval(() => setAngle((a) => (a + 0.5) % 360), 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <svg viewBox="0 0 100 100" className="w-full max-h-[264px]" fill="none">
        {/* Range rings */}
        <circle cx="50" cy="50" r="46" stroke="#22d3ee" strokeWidth="0.4" opacity="0.2" />
        <circle
          cx="50" cy="50" r="32"
          stroke="#22d3ee" strokeWidth="0.3" opacity="0.15"
          strokeDasharray="4 3"
        />
        <circle cx="50" cy="50" r="18" stroke="#22d3ee" strokeWidth="0.3" opacity="0.15" />

        {/* Crosshairs */}
        <line x1="50" y1="2"  x2="50" y2="98" stroke="#22d3ee" strokeWidth="0.2" opacity="0.1" />
        <line x1="2"  y1="50" x2="98" y2="50" stroke="#22d3ee" strokeWidth="0.2" opacity="0.1" />

        {/* Cardinal tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={50 + Math.sin(r) * 43} y1={50 - Math.cos(r) * 43}
              x2={50 + Math.sin(r) * 46} y2={50 - Math.cos(r) * 46}
              stroke="#22d3ee" strokeWidth="0.8" opacity="0.4"
            />
          );
        })}

        {/* Stars */}
        {MAP_STARS.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#22d3ee" opacity={s.op} />
        ))}

        {/* Origin dot + ring */}
        <circle cx="50" cy="50" r="2"  fill="#22d3ee" opacity="0.9" />
        <circle cx="50" cy="50" r="5" stroke="#22d3ee" strokeWidth="0.4" opacity="0.35" />

        {/* Rotating nav arrow — group spins around center */}
        <g transform={`rotate(${angle}, 50, 50)`}>
          <polygon points="50,19 47,31 50,28 53,31" fill="#22d3ee" opacity="0.95" />
          <line x1="50" y1="28" x2="50" y2="44" stroke="#22d3ee" strokeWidth="0.6" opacity="0.45" />
        </g>

        {/* Live coordinate readout */}
        <text
          x="50" y="97"
          textAnchor="middle"
          fontSize="4"
          fill="#22d3ee"
          opacity="0.35"
          fontFamily="monospace"
        >
          {`${angle.toFixed(0).padStart(3, "0")}°N :: ${(360 - angle).toFixed(0).padStart(3, "0")}°E`}
        </text>
      </svg>
    </div>
  );
}

// ─── Module: HOLO_SCHEMATICS ─────────────────────────────────────────────────
// Holographic wireframe cycling between a Rocket and a Plane with a glitch
// transition every 4 seconds.

function WireframeRocket() {
  return (
    <svg
      viewBox="0 0 80 120"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[168px] mx-auto"
    >
      {/* Body */}
      <rect x="28" y="38" width="24" height="44" />
      {/* Nose cone */}
      <path d="M 28 38 L 40 12 L 52 38" />
      {/* Left fin */}
      <path d="M 28 64 L 12 88 L 28 82" />
      {/* Right fin */}
      <path d="M 52 64 L 68 88 L 52 82" />
      {/* Window */}
      <circle cx="40" cy="52" r="7" />
      {/* Exhaust lines */}
      <line x1="34" y1="82" x2="31" y2="98" />
      <line x1="40" y1="82" x2="40" y2="102" />
      <line x1="46" y1="82" x2="49" y2="98" />
    </svg>
  );
}

function WireframePlane() {
  return (
    <svg
      viewBox="0 0 80 100"
      fill="none"
      stroke="#22d3ee"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-[168px] mx-auto"
    >
      {/* Fuselage center line */}
      <path d="M 40 5 L 40 90" />
      {/* Nose ellipse */}
      <ellipse cx="40" cy="10" rx="5" ry="7" />
      {/* Main wings */}
      <path d="M 40 42 L 5 58 L 18 62 L 40 50 L 62 62 L 75 58 L 40 42 Z" />
      {/* Tail fins */}
      <path d="M 40 78 L 25 92 L 34 88 L 40 82 L 46 88 L 55 92 L 40 78 Z" />
      {/* Engine nacelles */}
      <ellipse cx="18" cy="56" rx="5" ry="2.5" />
      <ellipse cx="62" cy="56" rx="5" ry="2.5" />
      {/* Cockpit window */}
      <ellipse cx="40" cy="20" rx="4" ry="6" />
    </svg>
  );
}

function HoloSchematicsVisual() {
  const [current, setCurrent] = useState<"rocket" | "plane">("rocket");
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setGlitching(true);
      const swap = setTimeout(() => {
        setCurrent((c) => (c === "rocket" ? "plane" : "rocket"));
        setGlitching(false);
      }, 360);
      return swap;
    };
    const id = setInterval(cycle, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 py-1">
      {/* Hologram frame */}
      <div
        style={{
          transform: glitching ? "translateX(6px) skewX(6deg)" : "translateX(0) skewX(0deg)",
          opacity: glitching ? 0.1 : 1,
          filter: glitching
            ? "hue-rotate(120deg) saturate(5) brightness(3)"
            : "drop-shadow(0 0 6px rgba(34,211,238,0.5))",
          transition: glitching ? "all 0.07s" : "all 0.28s ease",
        }}
      >
        {current === "rocket" ? <WireframeRocket /> : <WireframePlane />}
      </div>

      {/* Pulsing status label */}
      <div className="font-mono text-sm text-cyan-400/50 tracking-label animate-pulse">
        [LOADING...]
      </div>
      <div className="font-mono text-xs text-zinc-600 tracking-label">
        {current === "rocket" ? "HPFRT_v2.STEP" : "AERO_WING.CAD"}
      </div>
    </div>
  );
}

// ─── Module: MISSION_LOG ─────────────────────────────────────────────────────
// Scrolling CLI that types out job history line-by-line on mount.

function MissionLogVisual() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const entries = MISSION_ENTRIES.map(
      (e) => `> LOG: ${e.year} ${e.role} @ ${e.org} // COMPLETED`
    );
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i < entries.length) {
        const idx = i++;
        setLines((prev) => [...prev, entries[idx]]);
        timer = setTimeout(tick, 520);
      }
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="font-mono overflow-hidden">
      <div className="text-violet-500/40 text-xs tracking-label mb-1">
        {"// MISSION_LOG INTERFACE v1.0"}
      </div>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="text-green-400/75 text-sm leading-[1.65] truncate"
        >
          {line}
        </motion.div>
      ))}
      {lines.length < MISSION_ENTRIES.length && (
        <span
          className="inline-block w-[5px] h-[9px] bg-green-400/70"
          style={{ animation: "cockpit-cursor 1s step-start infinite" }}
        />
      )}
    </div>
  );
}

// ─── Module: MEDIA_ARCHIVE ───────────────────────────────────────────────────
// Canvas TV static/snow behind a glowing film-list overlay.

function MediaArchiveVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let alive = true;
    const draw = () => {
      if (!alive) return;
      const { width: w, height: h } = canvas;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() > 0.62 ? Math.floor(Math.random() * 110) : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      timerRef.current = setTimeout(draw, 45);
    };
    draw();
    return () => {
      alive = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Static canvas — low-res then CSS-stretched for pixelated noise look */}
      <canvas
        ref={canvasRef}
        width={64}
        height={52}
        className="absolute inset-0 w-full h-full opacity-[0.18]"
        style={{ imageRendering: "pixelated" }}
      />
      {/* Film list overlay with glow */}
      <div
        className="relative z-10 font-mono"
        style={{ textShadow: "0 0 10px rgba(96,165,250,0.85)" }}
      >
        <div className="text-blue-400/45 text-xs tracking-label mb-0.5">
          C:/ARCHIVE/BRAIN_ROT/
        </div>
        {FILM_LIST.map((film, i) => (
          <div key={i} className="text-blue-200/80 text-sm leading-[1.6]">
            {film}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module: AUX_SIGNAL ──────────────────────────────────────────────────────
// Amber oscilloscope waveform. Frequency + amplitude spike on hover.

function AuxSignalVisual({ hovered }: { hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef(0);
  const hotRef    = useRef(hovered);
  const rafRef    = useRef<number>(0);

  useEffect(() => { hotRef.current = hovered; }, [hovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const hot = hotRef.current;
      const freq  = hot ? 6.5 : 2.5;
      const amp   = hot ? h * 0.38 : h * 0.20;
      const speed = hot ? 0.09  : 0.03;

      // Oscilloscope grid
      ctx.strokeStyle = "rgba(180,80,0,0.15)";
      ctx.lineWidth = 0.5;
      for (let y = h / 4; y < h; y += h / 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      for (let x = w / 4; x < w; x += w / 4) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Main waveform
      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = hot ? 2 : 1.5;
      ctx.shadowBlur  = hot ? 16 : 6;
      ctx.shadowColor = "#f59e0b";
      for (let x = 0; x <= w; x++) {
        const y =
          h / 2 +
          Math.sin((x / w) * Math.PI * 2 * freq + phaseRef.current) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic ghost (subtle)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(245,158,11,0.25)";
      ctx.lineWidth = 0.8;
      ctx.shadowBlur = 0;
      for (let x = 0; x <= w; x++) {
        const y =
          h / 2 +
          Math.sin((x / w) * Math.PI * 2 * (freq * 2) + phaseRef.current * 1.5) *
            (amp * 0.35);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      phaseRef.current += speed;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <canvas
        ref={canvasRef}
        width={200}
        height={56}
        className="w-full"
        style={{ height: "56px" }}
      />
      <div className="font-mono text-sm text-amber-400/40 tracking-label mt-1">
        [UNCLASSIFIED DATA] :: HOVER_FOR_FREQ_BOOST
      </div>
    </div>
  );
}

// ─── Zone cell wrapper ────────────────────────────────────────────────────────

function ZoneCell({
  zone,
  onClick,
  delay = 0,
  onHoverChange,
  children,
}: {
  zone: Zone;
  onClick: () => void;
  delay?: number;
  onHoverChange?: (h: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`relative ${zone.gridClass} border ${zone.color} ${zone.glow} bg-zinc-950/80 p-3 text-left transition-all duration-300 overflow-hidden group cursor-pointer`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Lock-on bracket corners — expand on hover */}
      <span className="absolute top-1.5 left-1.5  w-2 h-2 border-t border-l border-current opacity-40 group-hover:w-3 group-hover:h-3 group-hover:opacity-90 transition-all duration-200" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-current opacity-40 group-hover:w-3 group-hover:h-3 group-hover:opacity-90 transition-all duration-200" />
      <span className="absolute bottom-1.5 left-1.5  w-2 h-2 border-b border-l border-current opacity-40 group-hover:w-3 group-hover:h-3 group-hover:opacity-90 transition-all duration-200" />
      <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-current opacity-40 group-hover:w-3 group-hover:h-3 group-hover:opacity-90 transition-all duration-200" />

      {/* Scanline sweep on hover */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(255,255,255,0.012)_3px,rgba(255,255,255,0.012)_6px)]" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Zone ID header */}
        <div className="shrink-0 mb-1.5">
          <div className="font-mono text-sm tracking-label text-zinc-600 uppercase">
            {zone.sublabel}
          </div>
          <div className="font-mono text-lg font-bold text-white/80">
            {zone.label}
          </div>
        </div>

        {/* Visual module */}
        <div className="flex-1 overflow-hidden min-h-0">{children}</div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between mt-1">
          <span className="font-mono text-sm text-zinc-700 tracking-label opacity-0 group-hover:opacity-100 transition-opacity">
            CLICK TO ACCESS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 group-hover:animate-ping" />
        </div>
      </div>
    </motion.button>
  );
}

// ─── Boot + Sketch (preserved from original) ─────────────────────────────────

function RocketSketch() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const style = (delay: number): React.CSSProperties => ({
    strokeDasharray: 500,
    strokeDashoffset: drawn ? 0 : 500,
    transition: `stroke-dashoffset 0.6s ease ${delay}s`,
  });

  return (
    <svg
      viewBox="0 0 200 280"
      className="w-48 h-64 mx-auto"
      fill="none"
      stroke="#7dd3fc"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="70" y="90" width="60" height="110"
        style={style(0)}
        strokeDasharray={340}
        strokeDashoffset={drawn ? 0 : 340}
        className="transition-all duration-700"
      />
      <path d="M70 90 L100 30 L130 90" style={style(0.3)} />
      <path d="M70 160 L40 210 L70 200" style={style(0.6)} />
      <path d="M130 160 L160 210 L130 200" style={style(0.8)} />
      <circle
        cx="100" cy="120" r="14"
        strokeDasharray={88}
        strokeDashoffset={drawn ? 0 : 88}
        style={{ transition: "stroke-dashoffset 0.5s ease 1s" }}
      />
      <line x1="82"  y1="200" x2="78"  y2="230" style={style(1.1)} strokeDasharray={40} />
      <line x1="100" y1="200" x2="100" y2="240" style={style(1.2)} strokeDasharray={40} />
      <line x1="118" y1="200" x2="122" y2="230" style={style(1.3)} strokeDasharray={40} />
      <text
        x="100" y="270"
        textAnchor="middle"
        fontSize="16"
        fill="#7dd3fc"
        stroke="none"
        fontFamily="monospace"
        opacity={drawn ? 1 : 0}
        style={{ transition: "opacity 0.4s ease 1.5s" }}
      >
        my ship (probably)
      </text>
    </svg>
  );
}

function BootTerminal({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });

  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const addLine = () => {
      if (cancelled) return;
      if (i < BOOT_LINES.length) {
        const line = BOOT_LINES[i];
        i++;
        setLines((prev) => [...prev, line]);
        setTimeout(addLine, 700);
      } else {
        setTimeout(() => { if (!cancelled) onDoneRef.current(); }, 800);
      }
    };
    const t = setTimeout(addLine, 300);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-2xl text-green-400 space-y-2 p-8 max-w-md mx-auto relative">
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        }}
      />
      <div className="text-green-600 text-2xl mb-4">
        JACOB-TANG-OS v2.6 :: BOOT SEQUENCE
      </div>
      {lines.map((line, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={line?.includes("WELCOME") ? "text-white font-bold" : ""}
        >
          {line}
        </motion.div>
      ))}
      <span
        className={`inline-block w-2 h-4 bg-green-400 ${cursor ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

// ─── Transmission modal ───────────────────────────────────────────────────────

function TransmissionModal({
  zone,
  onClose,
}: {
  zone: Zone;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-[90%] max-w-lg bg-zinc-950 border border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.2)] overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hazard stripe — top */}
        <div
          className="h-3 w-full"
          style={{
            background:
              "repeating-linear-gradient(45deg, #eab308, #eab308 10px, #1a1a1a 10px, #1a1a1a 20px)",
          }}
        />

        {/* Header bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-red-500/40 bg-red-950/20">
          <Radio size={14} className="text-red-400 animate-pulse" />
          <span className="font-mono text-2xl text-red-400 uppercase">
            ((o)) Incoming Transmission
          </span>
          <span className="ml-auto font-mono text-2xl text-zinc-600">
            [{zone.id.toUpperCase()}_CHAN]
          </span>
        </div>

        {/* Scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 6px)",
          }}
        />

        {/* Body */}
        <div className="p-6 relative z-20">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-mono text-2xl text-zinc-500 uppercase mb-1">
                {zone.label}
              </div>
              <h2 className="font-mono text-4xl text-white font-bold">
                {zone.sublabel}
              </h2>
            </div>
          </div>

          <div className="border-l-2 border-red-500/40 pl-4 mb-6">
            <p className="font-mono text-2xl text-zinc-300 leading-relaxed">
              {zone.description}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={zone.href}
              className="flex-1 font-mono text-2xl uppercase py-2.5 border border-white/20 text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-150 text-center"
            >
              [ ENTER SECTOR ]
            </Link>
            <motion.button
              onClick={onClose}
              className="flex-1 font-mono text-2xl uppercase py-2.5 border border-red-500/60 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all duration-150 relative overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">[ ACKNOWLEDGE ]</span>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.03)_4px,rgba(255,255,255,0.03)_8px)]" />
            </motion.button>
          </div>
        </div>

        {/* Hazard stripe — bottom */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "repeating-linear-gradient(45deg, #eab308, #eab308 10px, #1a1a1a 10px, #1a1a1a 20px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Cockpit grid ─────────────────────────────────────────────────────────────

function Cockpit({ onZoneClick }: { onZoneClick: (zone: Zone) => void }) {
  const [miscHovered, setMiscHovered] = useState(false);

  const renderVisual = (zone: Zone) => {
    switch (zone.id) {
      case "travel":       return <NavMapVisual />;
      case "projects":     return <HoloSchematicsVisual />;
      case "professional": return <MissionLogVisual />;
      case "movies":       return <MediaArchiveVisual />;
      case "misc":         return <AuxSignalVisual hovered={miscHovered} />;
      default:             return null;
    }
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Fixed CRT scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.055) 2px, rgba(0,0,0,0.055) 4px)",
        }}
      />

      {/* Top HUD bar */}
      <div className="relative z-30 flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
        <div className="font-mono text-xs tracking-label text-zinc-500 uppercase">
          JACOB-TANG-OS :: COCKPIT VIEW
        </div>
        <div className="flex gap-4">
          {["SYS", "NAV", "COMM"].map((label) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-xs text-zinc-600 tracking-label">{label}</span>
            </div>
          ))}
        </div>
        <div className="font-mono text-xs text-zinc-600 tracking-label">
          {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
        </div>
      </div>

      {/* Main grid — 4 cols × 3 rows */}
      <div className="relative z-10 flex-1 grid grid-cols-4 grid-rows-3 gap-px bg-white/5 p-px overflow-hidden">
        {ZONES.map((zone, i) => (
          <ZoneCell
            key={zone.id}
            zone={zone}
            onClick={() => onZoneClick(zone)}
            delay={i * 0.08}
            onHoverChange={zone.id === "misc" ? setMiscHovered : undefined}
          >
            {renderVisual(zone)}
          </ZoneCell>
        ))}
      </div>

      {/* Bottom status bar */}
      <div className="relative z-30 flex items-center gap-6 px-6 py-2 border-t border-white/10 shrink-0">
        <span className="font-mono text-lg text-zinc-700">
          SELECT A QUADRANT TO OPEN TRANSMISSION
        </span>
        <span className="ml-auto font-mono text-lg text-zinc-700">
          ALL SYSTEMS NOMINAL
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CockpitIntro() {
  const [phase, setPhase] = useState<Phase>("sketch");
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase("boot"), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleBootDone = useCallback(() => setPhase("cockpit"), []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] flex items-center justify-center">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Phase 1: Sketch ── */}
      <AnimatePresence>
        {phase === "sketch" && (
          <motion.div
            key="sketch"
            className="absolute inset-0 flex flex-col items-center justify-center"
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5 }}
          >
            <RocketSketch />
            <p className="font-mono text-xl text-slate-600 uppercase mt-6 animate-pulse">
              initializing...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 2: Boot terminal ── */}
      <AnimatePresence>
        {phase === "boot" && (
          <motion.div
            key="boot"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
          >
            <BootTerminal onDone={handleBootDone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase 3: Cockpit ── */}
      <AnimatePresence>
        {phase === "cockpit" && (
          <motion.div
            key="cockpit"
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Cockpit onZoneClick={setActiveZone} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activeZone && (
          <TransmissionModal zone={activeZone} onClose={() => setActiveZone(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
