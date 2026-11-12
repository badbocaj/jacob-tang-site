"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { LeagueRank } from "@/lib/riot";
import {
  CURRENTLY_WORKING_ON,
  FUEL,
  GAMES,
  HEADING,
  MOTTO,
  PILOT,
  PORTFOLIO,
  PORTRAITS,
  SPECS,
  SPORTS,
  TIMELINE,
} from "./data";
import { PARTS, RocketDefs, type PartKey } from "./RocketParts";

/* ───────────────────────────────────────────────────────────────────────────
   EXPLODED VIEW

   The rocket arrives assembled. Scrolling the first PIN pixels takes it apart:
   the stack is held in place on screen while each part travels from where it
   docks to where it sits in the page, and the callouts fade in beside them.
   After that the page scrolls normally, one part at a time.

   Nothing about the travel is hard-coded. Each part's docking distance is
   measured from the laid-out page, so it holds at any width — on a phone the
   callouts stack under their parts and the same mechanics apply.
   ─────────────────────────────────────────────────────────────────────────── */

/** Scroll distance, in px, over which the rocket comes apart. */
const PIN = 600;

const LABEL = "font-mono text-xs uppercase tracking-label";
const ACCENT_TEXT = "text-[#ff6a3d]";

// ─── Callout pieces ──────────────────────────────────────────────────────────

function CalloutTitle({ children }: { children: ReactNode }) {
  return <h2 className="wide m-0 font-display text-2xl font-bold uppercase leading-tight text-[#f3ead7]">{children}</h2>;
}

function Status({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs uppercase tracking-wider text-stone-400"> · {children}</span>;
}

function OffDuty({ name, href, children }: { name: string; href?: string; children: ReactNode }) {
  return (
    <div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`-my-2 inline-flex items-center gap-1.5 py-2 font-semibold ${ACCENT_TEXT} underline decoration-dashed underline-offset-4 hover:decoration-solid`}
        >
          {name}
          <span aria-hidden>↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <span className="block font-semibold text-[#f3ead7]">{name}</span>
      )}
      {href ? <span className="block">{children}</span> : children}
    </div>
  );
}

const payloadLink =
  "inline-flex min-h-11 items-center border px-4 font-mono text-xs uppercase tracking-label no-underline transition-colors";

function Callout({
  part,
  portfolioReady,
  leagueRank,
}: {
  part: PartKey;
  portfolioReady: boolean;
  leagueRank: LeagueRank | null;
}) {
  switch (part) {
    case "nose":
      return (
        <>
          <CalloutTitle>{HEADING.title}</CalloutTitle>
          <p className="m-0 max-w-[40ch] text-base leading-relaxed text-stone-300">{HEADING.note}</p>
        </>
      );

    case "capsule": {
      const headshot = PORTRAITS[0];
      return (
        <div className="flex items-start gap-4">
          <div className="relative h-32 w-26 shrink-0 border border-[#f3ead7]/50">
            <Image
              src={headshot.src}
              alt={headshot.alt}
              fill
              priority
              sizes="104px"
              className="object-cover object-[50%_28%]"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <CalloutTitle>{PILOT.title}</CalloutTitle>
            <p className="m-0 text-base leading-relaxed text-stone-300">{PILOT.note}</p>
          </div>
        </div>
      );
    }

    case "avionics":
      return (
        <>
          <CalloutTitle>Running processes</CalloutTitle>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-base leading-snug text-stone-300">
            {CURRENTLY_WORKING_ON.map((item) => (
              <li key={item.title}>
                <span className="font-semibold text-[#f3ead7]">{item.title}</span>
                <Status>{item.status}</Status>
                <br />
                {item.note}
              </li>
            ))}
          </ul>
        </>
      );

    case "quarters": {
      const { league, chess, catan, poker } = GAMES;
      // Live from Riot when the API answers; otherwise whatever's typed in data.ts.
      const rank = leagueRank?.label ?? (league.rank || "??? (ask me)");
      const elo = chess.elo || "??? (ask me)";
      return (
        <>
          <CalloutTitle>Off duty</CalloutTitle>
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm leading-snug text-stone-300">
            <OffDuty name={SPORTS.pickleball.name}>{SPORTS.pickleball.note}</OffDuty>
            <OffDuty name={league.name}>
              Rank: {rank}. {league.note}
            </OffDuty>
            <OffDuty name={SPORTS.golf.name}>{SPORTS.golf.note}</OffDuty>
            <OffDuty name={chess.name}>
              Elo: {elo}. {chess.note}
            </OffDuty>
            <OffDuty name={SPORTS.hiking.name}>{SPORTS.hiking.note}</OffDuty>
            <OffDuty name={catan.name}>{catan.note}</OffDuty>
            <OffDuty name={poker.name} href={poker.href}>
              {poker.note}
            </OffDuty>
          </div>
        </>
      );
    }

    case "cargo":
      return (
        <>
          <CalloutTitle>Payload</CalloutTitle>
          <p className="m-0 max-w-[40ch] text-base leading-relaxed text-stone-300">
            Everything I&apos;ve built, packed for delivery.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {portfolioReady ? (
              <a
                href={PORTFOLIO.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${payloadLink} border-[#ff6a3d] ${ACCENT_TEXT} hover:bg-[#ff6a3d]/12`}
              >
                Open portfolio.pdf
              </a>
            ) : (
              <span aria-disabled className={`${payloadLink} cursor-not-allowed border-stone-600 text-stone-400`}>
                Portfolio still loading
              </span>
            )}
            <Link href="/projects" className={`${payloadLink} border-[#f3ead7]/40 text-[#f3ead7] hover:border-[#f3ead7]`}>
              Projects →
            </Link>
            <Link
              href="/professional"
              className={`${payloadLink} border-[#f3ead7]/40 text-[#f3ead7] hover:border-[#f3ead7]`}
            >
              Service record →
            </Link>
          </div>
        </>
      );

    case "fuel":
      return (
        <>
          <CalloutTitle>What it runs on</CalloutTitle>
          <dl className="m-0 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3.5 gap-y-2.5 text-base leading-snug text-stone-300">
            {FUEL.map((f) => (
              <div key={f.tank} className="contents">
                <dt className="pt-0.5 font-mono text-xs uppercase tracking-wider text-stone-400">Tank {f.tank}</dt>
                <dd className="m-0">
                  <span className="font-semibold text-[#f3ead7]">{f.name}.</span> {f.note}
                </dd>
              </div>
            ))}
          </dl>
        </>
      );

    case "engines":
      return (
        <>
          <h2 className="wide m-0 font-display text-4xl font-extrabold uppercase leading-none text-[#f3ead7]">
            {MOTTO.lines.map((line, i) => (
              <span key={line} className={`block ${i === MOTTO.lines.length - 1 ? ACCENT_TEXT : ""}`}>
                {line}
              </span>
            ))}
          </h2>
          <p className="m-0 max-w-[38ch] text-base leading-relaxed text-stone-300">{MOTTO.note}</p>
        </>
      );
  }
}

// ─── One row of the stack ────────────────────────────────────────────────────

function PartRow({
  index,
  offset,
  progress,
  reveal,
  animated,
  register,
  children,
}: {
  index: number;
  /** How far this part sits from where it docks, in px (negative = up). */
  offset: number;
  progress: MotionValue<number>;
  reveal: MotionValue<number>;
  animated: boolean;
  register: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  const part = PARTS[index];
  const { Art } = part;
  // Odd-numbered parts call out to the left, even to the right.
  const left = index % 2 === 0;

  const dock = useMotionValue(offset);
  useEffect(() => dock.set(offset), [dock, offset]);
  const y = useTransform(() => (1 - progress.get()) * dock.get());

  const number = String(index + 1).padStart(2, "0");
  const leader = <span aria-hidden className="grow border-t border-dashed border-[#f3ead7]/45" />;
  const tag = (
    <span className={`${LABEL} whitespace-nowrap ${ACCENT_TEXT}`}>
      {number} · {part.name}
    </span>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-x-5 gap-y-4 py-4 lg:grid-cols-[minmax(0,1fr)_20rem_minmax(0,1fr)] lg:py-5">
      <motion.div
        ref={register}
        className={`relative mx-auto w-60 max-w-full lg:order-2 lg:w-80`}
        style={{ y: animated ? y : 0, zIndex: PARTS.length - index }}
      >
        <svg
          viewBox={`0 0 360 ${part.viewH}`}
          className="block h-auto w-full"
          role="img"
          aria-label={part.name}
        >
          <Art />
        </svg>
      </motion.div>

      <motion.section
        className={`flex min-w-0 flex-col gap-3 ${left ? "lg:order-1" : "lg:order-3"}`}
        style={{ opacity: animated ? reveal : 1 }}
      >
        <div className="flex items-center gap-3.5">
          {left ? (
            <>
              {tag}
              {leader}
            </>
          ) : (
            <>
              <span className="contents max-lg:hidden">{leader}</span>
              {tag}
              <span className="contents lg:hidden">{leader}</span>
            </>
          )}
        </div>
        {children}
      </motion.section>

      {/* Keeps the rocket in the middle column on wide screens. */}
      <div aria-hidden className={`hidden lg:block ${left ? "lg:order-3" : "lg:order-1"}`} />
    </div>
  );
}

// ─── Masthead and mission profile ────────────────────────────────────────────

function Masthead({ hint }: { hint: boolean }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-8">
      <div className="flex min-w-0 flex-1 basis-[420px] flex-col gap-3.5">
        <p className={`m-0 ${LABEL} ${ACCENT_TEXT}`}>JT-01 // About</p>
        <h1 className="wide m-0 font-display text-4xl font-extrabold uppercase leading-none text-[#f3ead7] sm:text-6xl">
          Jacob Tang
        </h1>
        <p className="m-0 font-mono text-sm uppercase tracking-label text-stone-400">
          Reusable mechanical engineer · exploded view
        </p>
        {hint && <p className={`m-0 mt-1.5 ${LABEL} ${ACCENT_TEXT}`}>Scroll to take it apart ↓</p>}
      </div>

      <div className="min-w-0 max-w-full basis-[340px] border border-[#f3ead7]/30 bg-[#16130f]/85 px-5 py-4.5">
        <p className={`m-0 mb-3 ${LABEL} text-stone-400`}>Key specifications</p>
        <dl className="m-0 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider">
          {SPECS.map((spec) => (
            <div key={spec.label} className="contents">
              <dt className="text-stone-400">{spec.label}</dt>
              <dd className={`m-0 ${spec.accent ? ACCENT_TEXT : "text-[#f3ead7]"}`}>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}

function MissionProfile() {
  return (
    <section className="flex flex-col gap-4.5">
      <div className="flex items-center gap-3.5">
        <h2 className={`m-0 ${LABEL} whitespace-nowrap font-normal ${ACCENT_TEXT}`}>Mission profile</h2>
        <span aria-hidden className="grow border-t border-dashed border-[#f3ead7]/45" />
      </div>
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 p-0">
        {TIMELINE.map((stop, i) => {
          const stage = TIMELINE.slice(0, i + 1).filter((s) => !s.future).length;
          const label = stop.future
            ? "Next burn"
            : `Stage ${stage} · ${stop.active ? "burning" : "separated"}`;
          const frame = stop.future
            ? "border-dashed border-[#f3ead7]/50"
            : stop.active
              ? "border-[#ff6a3d] bg-[#ff6a3d]/10"
              : "border-[#f3ead7]/30 bg-[#16130f]/85";
          return (
            <li key={`${stop.when}-${stop.what}`} className={`flex flex-col gap-2 border p-4 ${frame}`}>
              <span className={`font-mono text-xs uppercase tracking-wider ${stop.active ? ACCENT_TEXT : "text-stone-400"}`}>
                {label}
              </span>
              <span className="text-base font-semibold leading-snug text-[#f3ead7]">{stop.what}</span>
              <span className="text-sm leading-snug text-stone-300">
                {stop.future ? stop.where : `${stop.where} · ${stop.when.toLowerCase()}`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ─── The page body ───────────────────────────────────────────────────────────

export default function ExplodedView({
  portfolioReady,
  leagueRank,
}: {
  portfolioReady: boolean;
  leagueRank: LeagueRank | null;
}) {
  const reduceMotion = useReducedMotion();
  const partEls = useRef<(HTMLDivElement | null)[]>([]);
  // null until the page has been measured; then one docking distance per part.
  const [offsets, setOffsets] = useState<number[] | null>(null);

  // ── Measure how far each part is from docking with the one above ──────────
  const measure = useCallback(() => {
    const els = partEls.current;
    if (els.length < PARTS.length || els.some((el) => !el)) return;

    const next = [0];
    for (let i = 1; i < PARTS.length; i++) {
      const above = els[i - 1]!;
      const here = els[i]!;
      const aboveJoint = above.offsetTop + (PARTS[i - 1].bottom / PARTS[i - 1].viewH) * above.offsetHeight;
      const hereJoint = here.offsetTop + (PARTS[i].top / PARTS[i].viewH) * here.offsetHeight;
      next.push(Math.round(next[i - 1] + aboveJoint - hereJoint));
    }
    setOffsets((prev) => (prev && prev.every((v, i) => v === next[i]) ? prev : next));
  }, []);

  useEffect(() => {
    // Webfonts change the callouts' heights, which moves the parts.
    document.fonts?.ready.then(measure);
    // The observer also reports once as soon as it starts watching, which is
    // the first measurement.
    const ro = new ResizeObserver(measure);
    partEls.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // ── Scroll → progress ─────────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const raw = useTransform(scrollY, [0, PIN], [0, 1]);
  const progress = useSpring(raw, { stiffness: 400, damping: 40, restDelta: 0.001 });
  const reveal = useTransform(progress, [0.45, 0.9], [0, 1]);
  // Hold the stack still on screen while it comes apart.
  const hold = useTransform(scrollY, (v) => Math.min(Math.max(v, 0), PIN));

  const animated = !reduceMotion && offsets !== null;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-14">
      <RocketDefs />
      <Masthead hint={!reduceMotion} />

      <div style={{ paddingBottom: animated ? PIN : 0 }}>
        <motion.div
          className="relative flex flex-col"
          style={{ y: animated ? hold : 0 }}
          // Stay hidden until measured, so the rocket never flashes apart first.
          initial={false}
          animate={{ opacity: reduceMotion || offsets ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            aria-hidden
            className="absolute bottom-10 left-1/2 top-0 w-0 border-l border-dashed border-[#f3ead7]/40"
            style={{ opacity: animated ? reveal : 1 }}
          />
          {PARTS.map((part, i) => (
            <PartRow
              key={part.key}
              index={i}
              offset={offsets?.[i] ?? 0}
              progress={progress}
              reveal={reveal}
              animated={animated}
              register={(el) => {
                partEls.current[i] = el;
              }}
            >
              <Callout part={part.key} portfolioReady={portfolioReady} leagueRank={leagueRank} />
            </PartRow>
          ))}
        </motion.div>
      </div>

      <MissionProfile />
    </div>
  );
}
