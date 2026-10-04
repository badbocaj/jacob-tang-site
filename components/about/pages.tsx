"use client";

import { createContext, useContext, type ComponentType } from "react";
import { Download, ExternalLink } from "lucide-react";
import {
  CURRENTLY_WORKING_ON,
  GAMES,
  HIKING_PHOTOS,
  PORTFOLIO,
  PORTRAITS,
  SPORTS,
  TIMELINE,
} from "./data";
import {
  ArrowScrawl,
  DoodleGamer,
  DoodleGolf,
  DoodleHexes,
  DoodleHiker,
  DoodleKnight,
  DoodlePickleball,
  DoodlePointer,
  DoodleRocket,
  DoodleSelf,
  DoodleTinkerer,
} from "./Doodles";
import {
  At,
  DayHeader,
  Highlight,
  INK,
  InkButton,
  Note,
  NoteLink,
  PEN_BLUE,
  PEN_RED,
  Polaroid,
  PRINT,
  SCRAWL,
  Squiggle,
  Sticky,
  Tape,
  onLine,
} from "./Paper";

/* ───────────────────────────────────────────────────────────────────────────
   The eight pages, in reading order. Two per spread:

     1–2  WORK      portfolio PDF · currently working on
     3–4  OUTSIDE   pickleball + golf · hiking
     5–6  GAMES     league + chess · catan
     7–8  HISTORY   timeline · photos

   Words live in data.ts. This file is layout.
   ─────────────────────────────────────────────────────────────────────────── */

export const JournalContext = createContext({ portfolioReady: false });

const body = "m-0 text-[23px] leading-[32px]";

// ─── 1 · Work, left ─────────────────────────────────────────────────────────

function WorkLeft() {
  const { portfolioReady } = useContext(JournalContext);

  return (
    <>
      <DayHeader title="Monday" aside="(the serious page)" />

      <At x={38} y={onLine(0)} w={440}>
        <p className={body}>
          Every journal needs one page that could get you hired. This is that page.
        </p>
      </At>

      {/* The folder */}
      <At x={50} y={180} w={300} rotate={-3}>
        <div className="relative">
          <Tape rotate={4} style={{ left: "70%" }} />
          <div
            className="relative ml-3 inline-block border-2 border-b-0 px-4 pb-1 pt-1.5 text-[19px] leading-none"
            style={{ borderColor: INK, background: "#e6c47f", borderRadius: "8px 8px 0 0" }}
          >
            PORTFOLIO.pdf
          </div>
          <div
            className="relative -mt-0.5 h-[200px] border-2 px-5 pt-5"
            style={{
              borderColor: INK,
              background: "linear-gradient(170deg, #f0d395, #e2bd72)",
              borderRadius: "2px 10px 4px 6px",
              boxShadow: "0 5px 14px rgba(40,30,10,0.25)",
            }}
          >
            <p className="m-0 text-[30px] uppercase leading-none" style={PRINT}>
              Jacob Tang
            </p>
            <p className="m-0 mt-1 text-[24px] leading-tight" style={SCRAWL}>
              everything I&apos;ve built, in one PDF
            </p>
            <div className="mt-4 space-y-2" aria-hidden>
              <div className="h-[3px] w-[85%] rounded bg-black/15" />
              <div className="h-[3px] w-[70%] rounded bg-black/15" />
              <div className="h-[3px] w-[78%] rounded bg-black/15" />
            </div>

            {!portfolioReady && (
              <span
                className="absolute bottom-5 right-4 border-[3px] px-2 py-0.5 text-[22px] uppercase leading-none"
                style={{ ...PRINT, color: PEN_RED, borderColor: PEN_RED, rotate: "-12deg", opacity: 0.85 }}
              >
                Still printing
              </span>
            )}
          </div>
        </div>
      </At>

      <At x={50} y={432} w={330}>
        <div className="flex flex-wrap gap-3">
          <InkButton href={PORTFOLIO.href} external disabled={!portfolioReady}>
            open it <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
          </InkButton>
          <InkButton href={PORTFOLIO.href} download={PORTFOLIO.downloadAs} disabled={!portfolioReady}>
            download <Download className="h-4 w-4" strokeWidth={2.5} />
          </InkButton>
        </div>
      </At>

      <At x={340} y={470} w={150}>
        <DoodlePointer className="w-full" />
      </At>

      <At x={40} y={560} w={300}>
        <Note size={23}>want the whole work history?</Note>
        <div className="mt-2">
          <NoteLink href="/professional">it&apos;s a comic now</NoteLink>
        </div>
      </At>
    </>
  );
}

// ─── 2 · Work, right ────────────────────────────────────────────────────────

function WorkRight() {
  return (
    <>
      <DayHeader title="Currently working on…" />

      <At x={40} y={onLine(0)} w={440}>
        <ul className="m-0 list-none p-0">
          {CURRENTLY_WORKING_ON.map((item, i) => (
            <li key={item.title} className="relative flex gap-3" style={{ marginBottom: i < 2 ? 32 : 0 }}>
              <span
                aria-hidden
                className="mt-[7px] block h-[18px] w-[18px] shrink-0 border-2"
                style={{ borderColor: INK, borderRadius: "3px 6px 2px 5px" }}
              />
              <div className="min-w-0 flex-1">
                <p className={`${body} text-[25px]`}>
                  <Highlight>{item.title}</Highlight>
                </p>
                <p className="m-0 text-[24px] leading-[32px]" style={{ ...SCRAWL, color: PEN_BLUE }}>
                  {item.note}
                </p>
              </div>
              <span
                className="absolute -right-1 top-0 text-[21px] leading-none"
                style={{ ...SCRAWL, color: PEN_RED, rotate: "-6deg" }}
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </At>

      <At x={130} y={470} w={300}>
        <DoodleTinkerer className="w-full" />
      </At>
      <At x={44} y={440} w={120} rotate={-4}>
        <Note size={22}>me, fixing the thing I just broke</Note>
        <ArrowScrawl className="ml-12 mt-1 h-9 w-16 rotate-[20deg]" color={PEN_BLUE} />
      </At>
    </>
  );
}

// ─── 3 · Outdoors, left ─────────────────────────────────────────────────────

function OutdoorsLeft() {
  return (
    <>
      <DayHeader title="Saturday" aside="(touching grass, as instructed)" />

      <At x={30} y={92} w={270}>
        <DoodlePickleball className="w-full" />
      </At>
      <At x={300} y={120} w={190}>
        <p className={`${body} text-[28px] uppercase`}>
          <Highlight color="rgba(134,239,172,0.7)">{SPORTS.pickleball.name}</Highlight>
        </p>
        <Note className="mt-2" size={25}>
          {SPORTS.pickleball.note}
        </Note>
      </At>

      <Squiggle className="absolute left-12 top-[330px] h-3 w-[420px]" color="#9ca3af" />

      <At x={40} y={410} w={200}>
        <p className={`${body} text-[28px] uppercase`}>
          <Highlight color="rgba(134,239,172,0.7)">{SPORTS.golf.name}</Highlight>
        </p>
        <Note className="mt-2" size={25}>
          {SPORTS.golf.note}
        </Note>
      </At>
      <At x={225} y={400} w={270}>
        <DoodleGolf className="w-full" />
      </At>
    </>
  );
}

// ─── 4 · Outdoors, right ────────────────────────────────────────────────────

function OutdoorsRight() {
  const [big, mid, small] = HIKING_PHOTOS;

  return (
    <>
      <DayHeader title={SPORTS.hiking.name} aside="(the long way up)" />

      <At x={34} y={92} w={250} rotate={-4} z={2}>
        <Polaroid photo={big} width={250} ratio={0.78} tape={-6} />
      </At>
      <At x={290} y={120} w={196} rotate={5} z={1}>
        <Polaroid photo={mid} width={196} ratio={0.9} tape={3} />
      </At>
      <At x={250} y={345} w={226} rotate={-2} z={3}>
        <Polaroid photo={small} width={226} ratio={0.72} tape={-2} />
      </At>

      <At x={14} y={380} w={240}>
        <DoodleHiker className="w-full" />
      </At>

      <At x={44} y={608} w={420}>
        <Note size={26}>{SPORTS.hiking.note}</Note>
        <div className="mt-2.5">
          <NoteLink href="/travel">more trails in the travel log</NoteLink>
        </div>
      </At>
    </>
  );
}

// ─── 5 · Games, left ────────────────────────────────────────────────────────

/** A value Jacob hasn't filled in yet reads as a dare rather than a gap. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-[20px] uppercase tracking-wide text-zinc-500">{label}:</span>
      <span className="text-[30px] leading-none" style={{ color: PEN_RED }}>
        {value || "???"}
      </span>
      {!value && (
        <span className="text-[21px]" style={{ ...SCRAWL, color: PEN_BLUE }}>
          (ask me)
        </span>
      )}
    </span>
  );
}

function GamesLeft() {
  const { league, chess } = GAMES;

  return (
    <>
      <DayHeader title="Sunday night" aside="(just one more game)" />

      <At x={40} y={onLine(1)} w={440}>
        <p className={`${body} text-[28px] uppercase`}>
          <Highlight color="rgba(147,197,253,0.7)">{league.name}</Highlight>
        </p>
        <div className="mt-1">
          <Stat label="rank" value={league.rank} />
        </div>
      </At>
      <At x={30} y={232} w={290}>
        <DoodleGamer className="w-full" />
      </At>
      <At x={330} y={282} w={160} rotate={4}>
        <Note size={24}>{league.note}</Note>
      </At>

      <Squiggle className="absolute left-12 top-[452px] h-3 w-[420px]" color="#9ca3af" />

      <At x={44} y={490} w={96}>
        <DoodleKnight className="w-full" />
      </At>
      <At x={160} y={496} w={320}>
        <p className={`${body} text-[28px] uppercase`}>
          <Highlight color="rgba(147,197,253,0.7)">{chess.name}</Highlight>
        </p>
        <div className="mt-1">
          <Stat label="elo" value={chess.elo} />
        </div>
        {chess.site && (
          <Note size={20} color="#71717a">
            {chess.site}
          </Note>
        )}
        <Note className="mt-2" size={23}>
          {chess.note}
        </Note>
      </At>
    </>
  );
}

// ─── 6 · Games, right ───────────────────────────────────────────────────────

function GamesRight() {
  const { catan } = GAMES;

  return (
    <>
      <DayHeader title={catan.name} aside="(friendships tested)" />

      <At x={130} y={100} w={330}>
        <DoodleHexes className="w-full" />
      </At>
      <At x={34} y={236} w={130} rotate={-6}>
        <Note size={24}>that&apos;s my road. don&apos;t.</Note>
      </At>
      <At x={160} y={196} w={100} rotate={-6}>
        <ArrowScrawl className="h-auto w-full" color={PEN_BLUE} />
      </At>

      <At x={44} y={onLine(11)} w={440}>
        <p className={`${body} text-[25px]`}>{catan.note}</p>
      </At>

      <At x={250} y={500} w={230} rotate={3}>
        <Sticky width={230}>
          <p className="m-0 text-[22px] uppercase leading-none" style={PRINT}>
            Challenge accepted?
          </p>
          <ul className="m-0 mt-3 list-none space-y-1.5 p-0 text-[22px] leading-none" style={SCRAWL}>
            {[GAMES.league.name, GAMES.chess.name, catan.name].map((g) => (
              <li key={g} className="flex items-center gap-2">
                <span className="text-[24px]" style={{ color: PEN_RED }}>✓</span>
                {g}
              </li>
            ))}
          </ul>
          <Note className="mt-2 text-right" size={20}>
            (bring snacks)
          </Note>
        </Sticky>
      </At>
    </>
  );
}

// ─── 7 · History, left ──────────────────────────────────────────────────────

function HistoryLeft() {
  const top = 162;
  const step = (628 - top) / Math.max(TIMELINE.length - 1, 1);
  const lastPast = TIMELINE.findIndex((s) => s.future);
  const solidEnd = lastPast === -1 ? TIMELINE.length - 1 : lastPast - 1;

  return (
    <>
      <At x={38} y={22} w={450}>
        <h2 className="m-0 text-[36px] uppercase leading-[1.05]" style={PRINT}>
          A short history
          <br />
          of Jacob
        </h2>
        <Note className="mt-1" size={24}>
          (abridged. very abridged.)
        </Note>
      </At>

      {/* The line itself: solid for what happened, dashed for what's next */}
      <svg aria-hidden className="absolute left-0 top-0 h-full w-full" style={{ overflow: "visible" }}>
        <line x1={64} x2={64} y1={top} y2={top + solidEnd * step} stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
        {solidEnd < TIMELINE.length - 1 && (
          <line
            x1={64}
            x2={64}
            y1={top + solidEnd * step}
            y2={top + (TIMELINE.length - 1) * step}
            stroke={INK}
            strokeWidth={2.4}
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
        )}
      </svg>

      <ol className="m-0 list-none p-0">
        {TIMELINE.map((stop, i) => {
          const y = top + i * step;
          return (
            <li key={`${stop.when}-${stop.what}`}>
              <span
                aria-hidden
                className="absolute h-4 w-4 rounded-full border-2"
                style={{
                  left: 56,
                  top: y - 8,
                  borderColor: INK,
                  background: stop.future ? "#fdfbf3" : stop.when === "Now" ? PEN_RED : INK,
                }}
              />
              <At x={86} y={y - 16} w={stop.future ? 250 : 390}>
                <p className="m-0 text-[17px] uppercase leading-none tracking-wider" style={{ color: PEN_RED }}>
                  {stop.when}
                </p>
                <p className="m-0 mt-1 text-[23px] leading-tight">
                  {stop.what}
                  {stop.where && (
                    <span className="text-[23px]" style={{ ...SCRAWL, color: PEN_BLUE }}>
                      {" "}@ {stop.where}
                    </span>
                  )}
                </p>
              </At>
              {stop.future && (
                <At x={420} y={y - 150} w={46} rotate={18}>
                  <DoodleRocket className="w-full" />
                </At>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ─── 8 · History, right ─────────────────────────────────────────────────────

function HistoryRight() {
  const [headshot, ...rest] = PORTRAITS;

  return (
    <>
      <At x={36} y={40} w={250} rotate={-3} z={2}>
        <Polaroid photo={headshot} width={250} ratio={1.25} tape={-3} priority />
      </At>

      {rest[0] && (
        <At x={286} y={300} w={204} rotate={4} z={1}>
          <Polaroid photo={rest[0]} width={204} ratio={1.3} tape={5} />
        </At>
      )}

      <At x={320} y={70} w={150} rotate={6}>
        <Note size={23}>exhibit A: the fit</Note>
        <ArrowScrawl className="-ml-4 mt-1 h-10 w-16 -scale-x-100 rotate-[25deg]" color={PEN_BLUE} />
      </At>

      <At x={62} y={438} w={110}>
        <DoodleSelf className="w-full" />
      </At>
      <At x={150} y={455} w={110} rotate={-4}>
        <ArrowScrawl className="h-8 w-14 -scale-x-100" color={PEN_BLUE} />
        <Note size={21}>artist&apos;s rendering</Note>
      </At>

      <At x={290} y={628} w={200}>
        <p className="m-0 text-right text-[30px] uppercase leading-none" style={PRINT}>
          The end
        </p>
        <Note className="text-right" size={22}>
          (for now)
        </Note>
      </At>
    </>
  );
}

// ─── Running order ──────────────────────────────────────────────────────────

export const PAGES: ComponentType[] = [
  WorkLeft,
  WorkRight,
  OutdoorsLeft,
  OutdoorsRight,
  GamesLeft,
  GamesRight,
  HistoryLeft,
  HistoryRight,
];

export interface Spread {
  id: string;
  label: string;
  tab: string;
}

/** One tab per spread. `id` is also the URL hash, so /about#games deep-links. */
export const SPREADS: Spread[] = [
  { id: "work", label: "Work", tab: "#fde68a" },
  { id: "outside", label: "Outside", tab: "#bbf7d0" },
  { id: "games", label: "Games", tab: "#bfdbfe" },
  { id: "history", label: "History", tab: "#fecaca" },
];
