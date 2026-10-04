"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Photo } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   Stationery for the journal: ruled paper, pens, tape, polaroids, stickies.

   Every page is laid out on a fixed 520×720 sheet and the whole book is
   scaled to fit the screen, so collage pieces can be placed by pixel and
   stay where they were put at any viewport size.
   ─────────────────────────────────────────────────────────────────────────── */

export const PAGE_W = 520;
export const PAGE_H = 720;

/** Ruled lines sit at RULE_TOP + n·RULE_GAP. Use `onLine(n)` to sit text on one. */
export const RULE_TOP = 95;
export const RULE_GAP = 32;
export const onLine = (n: number) => RULE_TOP - RULE_GAP + 5 + n * RULE_GAP;

export const INK = "#1f2328";
export const PEN_RED = "#c2412d";
export const PEN_BLUE = "#2c4f94";
const PAPER = "#fdfbf3";
const RULE = "#bfd5ea";

/** The journal's two hands: a neat printed one for writing, a scrawl for notes. */
export const PRINT: CSSProperties = { fontFamily: "var(--ff-journal), var(--ff-hand), cursive" };
export const SCRAWL: CSSProperties = { fontFamily: "var(--ff-hand), cursive" };

// ─── The sheet ──────────────────────────────────────────────────────────────

export function Paper({ index, children }: { index: number; children: ReactNode }) {
  // Even pages sit left of the spine, odd pages right.
  const leftPage = index % 2 === 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        ...PRINT,
        color: INK,
        backgroundColor: PAPER,
        backgroundImage: `linear-gradient(${PAPER} 0 ${RULE_TOP - RULE_GAP + 2}px, transparent 0),
          repeating-linear-gradient(to bottom, transparent 0 ${RULE_GAP - 1}px, ${RULE} ${RULE_GAP - 1}px ${RULE_GAP}px)`,
      }}
    >
      {children}

      {/* Spine shadow, on whichever edge faces the gutter */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-14"
        style={{
          [leftPage ? "right" : "left"]: 0,
          background: `linear-gradient(to ${leftPage ? "left" : "right"}, rgba(60,40,10,0.2), rgba(60,40,10,0.05) 40%, transparent)`,
        }}
      />

      <span
        aria-hidden
        className="absolute bottom-3 text-xl text-zinc-500"
        style={{ ...SCRAWL, [leftPage ? "left" : "right"]: 22 }}
      >
        {index + 1}
      </span>
    </div>
  );
}

/** The back of a turning sheet when there is no page on it (phone view). */
export function BlankLeaf() {
  return <div className="h-full w-full" style={{ backgroundColor: "#f4f0e3" }} />;
}

// ─── Placement ──────────────────────────────────────────────────────────────

/** Absolutely places a collage piece on the sheet. */
export function At({
  x,
  y,
  w,
  rotate = 0,
  z,
  className = "",
  children,
}: {
  x: number;
  y: number;
  w?: number;
  rotate?: number;
  z?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute ${className}`}
      style={{ left: x, top: y, width: w, rotate: `${rotate}deg`, zIndex: z }}
    >
      {children}
    </div>
  );
}

// ─── Lettering ──────────────────────────────────────────────────────────────

/** A diary-entry heading with a wobbly underline. */
export function DayHeader({ title, aside }: { title: string; aside?: string }) {
  return (
    <At x={38} y={22} w={450}>
      <div className="flex items-baseline gap-3">
        <h2 className="relative m-0 text-[34px] uppercase leading-none tracking-wide" style={PRINT}>
          {title}
          <Squiggle className="absolute -bottom-2.5 left-0 h-2.5 w-full" />
        </h2>
        {aside && (
          <span className="text-2xl leading-none" style={{ ...SCRAWL, color: PEN_BLUE }}>
            {aside}
          </span>
        )}
      </div>
    </At>
  );
}

export function Squiggle({ className, color = INK }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 120 8" preserveAspectRatio="none" className={className} aria-hidden>
      <path
        d="M2 5 q 7 -4 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Yellow highlighter swiped across the lower half of the text. */
export function Highlight({ children, color = "rgba(253,224,71,0.75)" }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="px-1"
      style={{
        backgroundImage: `linear-gradient(transparent 52%, ${color} 52%, ${color} 92%, transparent 92%)`,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

/** A note in the margin — the scrawl hand, in pen colour. */
export function Note({
  children,
  color = PEN_BLUE,
  size = 24,
  className = "",
}: {
  children: ReactNode;
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <p className={`m-0 leading-[1.05] ${className}`} style={{ ...SCRAWL, color, fontSize: size }}>
      {children}
    </p>
  );
}

// ─── Hand-drawn controls ────────────────────────────────────────────────────

/** The classic uneven-radius trick: reads as a box drawn without a ruler. */
const WOBBLY = "255px 15px 225px 15px / 15px 225px 15px 255px";

const buttonClass =
  "inline-flex items-center gap-2 border-2 px-4 py-1.5 text-[22px] leading-none no-underline transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-yellow-200 focus-visible:bg-yellow-200 focus-visible:outline-none";

export function InkButton({
  href,
  download,
  external,
  disabled,
  children,
}: {
  href: string;
  download?: string;
  external?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled
        className={`${buttonClass} cursor-not-allowed text-zinc-400 line-through hover:translate-y-0 hover:bg-transparent`}
        style={{ ...PRINT, borderColor: "#a1a1aa", borderRadius: WOBBLY }}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      download={download}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={buttonClass}
      style={{ ...PRINT, color: INK, borderColor: INK, borderRadius: WOBBLY }}
    >
      {children}
    </a>
  );
}

/** An in-site link written as a margin note with an arrow. */
export function NoteLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-block text-[23px] leading-none no-underline"
      style={{ ...SCRAWL, color: PEN_BLUE }}
    >
      <span className="border-b-2 border-dashed border-current pb-0.5 transition-colors group-hover:bg-yellow-200">
        {children}
      </span>
      <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

// ─── Collage ────────────────────────────────────────────────────────────────

export function Tape({ rotate = -4, style }: { rotate?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className="absolute left-1/2 z-10 h-6 w-20"
      style={{
        top: -12,
        translate: "-50% 0",
        rotate: `${rotate}deg`,
        background: "rgba(236,224,186,0.78)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        ...style,
      }}
    />
  );
}

export function Polaroid({
  photo,
  width,
  ratio = 1,
  tape = -4,
  priority,
}: {
  photo: Photo;
  width: number;
  /** Image height ÷ width. */
  ratio?: number;
  tape?: number | false;
  priority?: boolean;
}) {
  const inner = width - 16;
  return (
    <figure
      className="relative m-0 bg-white p-2 pb-1"
      style={{ width, boxShadow: "0 3px 10px rgba(40,30,10,0.28), 0 1px 2px rgba(40,30,10,0.2)" }}
    >
      {tape !== false && <Tape rotate={tape} />}
      <div className="relative overflow-hidden bg-zinc-200" style={{ width: inner, height: inner * ratio }}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority}
          sizes={`${Math.round(width * 1.5)}px`}
          className="object-cover"
        />
      </div>
      <figcaption className="py-1.5 text-center text-[21px] leading-none" style={{ ...SCRAWL, color: INK }}>
        {photo.caption}
      </figcaption>
    </figure>
  );
}

export function Sticky({
  children,
  color = "#fdf08a",
  width,
}: {
  children: ReactNode;
  color?: string;
  width: number;
}) {
  return (
    <div
      className="relative px-4 pb-4 pt-5"
      style={{
        width,
        background: `linear-gradient(180deg, ${color}, ${color} 85%, rgba(0,0,0,0.04))`,
        boxShadow: "0 4px 10px rgba(40,30,10,0.22), 0 1px 2px rgba(40,30,10,0.15)",
      }}
    >
      {children}
    </div>
  );
}
