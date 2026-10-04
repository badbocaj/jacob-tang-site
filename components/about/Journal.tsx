"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { JournalDefs } from "./Doodles";
import { JournalContext, PAGES, SPREADS } from "./pages";
import { BlankLeaf, PAGE_H, PAGE_W, Paper, PRINT, SCRAWL } from "./Paper";

/* ───────────────────────────────────────────────────────────────────────────
   THE JOURNAL — a flip book.

   Wide screens get the open book: two pages, and a leaf that swings over the
   spine to turn. Narrow screens get one page at a time, turning away to the
   left like a notepad. Both are the same machinery:

     base   the pages lying flat — already showing the destination where the
            turning leaf will uncover it
     leaf   one sheet, front and back, rotating about its bound edge

   The book is laid out at a fixed size (two 520×720 sheets) and scaled to
   fit, so the collage on each page never reflows.
   ─────────────────────────────────────────────────────────────────────────── */

type Mode = "spread" | "single";

interface Flip {
  to: number;
  dir: 1 | -1;
}

const COVER = 14;
const TAB_H = 34;
/** Below this much width the book closes down to one page at a time. */
const SINGLE_BELOW = 860;
/** Room kept under the open book for the back / next row and its hint. */
const CONTROLS_H = 96;
const TURN = { duration: 0.9, ease: [0.645, 0.045, 0.355, 1] as const };

const LAST = PAGES.length - 1;

function renderPage(i: number): ReactNode {
  const Page = PAGES[i];
  return (
    <Paper index={i}>
      <Page />
    </Paper>
  );
}

/** The first page of whichever spread `page` sits in. */
const spreadStart = (page: number) => page - (page % 2);

export default function Journal({ portfolioReady }: { portfolioReady: boolean }) {
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<{ mode: Mode; scale: number } | null>(null);
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<Flip | null>(null);

  const rot = useMotionValue(0);
  const mode = layout?.mode ?? "spread";

  // ── Fit to screen ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      const next: Mode = width < SINGLE_BELOW ? "single" : "spread";
      const bookW = (next === "spread" ? PAGE_W * 2 : PAGE_W) + COVER * 2;
      const bookH = PAGE_H + COVER * 2 + TAB_H;

      let scale = width / bookW;
      // The open book should fit the viewport whole, page controls included;
      // the phone page can scroll, but only vertically.
      if (next === "spread") {
        const top = el.getBoundingClientRect().top + window.scrollY;
        scale = Math.max(0.6, Math.min(scale, (window.innerHeight - top - CONTROLS_H) / bookH));
      }
      scale = Math.max(0.4, Math.min(scale, 1.1));

      setLayout((prev) =>
        prev && prev.mode === next && Math.abs(prev.scale - scale) < 0.001 ? prev : { mode: next, scale },
      );
    };

    measure();
    // Webfonts change the header's height, which moves the book without
    // resizing it — so the observer alone would miss it.
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // ── Turning ──────────────────────────────────────────────────────────────
  const turnTo = useCallback(
    (target: number) => {
      if (flip) return;
      let to = Math.max(0, Math.min(LAST, target));
      if (mode === "spread") to = spreadStart(to);
      const from = mode === "spread" ? spreadStart(page) : page;
      if (to === from) return;

      if (reduceMotion) {
        setPage(to);
        return;
      }

      const dir = to > from ? 1 : -1;
      // On the phone, turning back drops the previous page in from where it
      // was turned away to — so the leaf starts face-down on the left.
      rot.set(mode === "single" && dir === -1 ? -180 : 0);
      setFlip({ to, dir });
    },
    [flip, mode, page, reduceMotion, rot],
  );

  useEffect(() => {
    if (!flip) return;
    const end = mode === "spread" ? (flip.dir === 1 ? -180 : 180) : flip.dir === 1 ? -180 : 0;
    const controls = animate(rot, end, {
      ...TURN,
      onComplete: () => {
        setPage(flip.to);
        setFlip(null);
        rot.set(0);
      },
    });
    return () => controls.stop();
  }, [flip, mode, rot]);

  const next = useCallback(() => turnTo((mode === "spread" ? spreadStart(page) : page) + (mode === "spread" ? 2 : 1)), [mode, page, turnTo]);
  const prev = useCallback(() => turnTo((mode === "spread" ? spreadStart(page) : page) - (mode === "spread" ? 2 : 1)), [mode, page, turnTo]);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // ── Deep links: /about#games opens on the games spread ───────────────────
  useEffect(() => {
    const fromHash = () => {
      const i = SPREADS.findIndex((s) => `#${s.id}` === window.location.hash);
      if (i >= 0) setPage(i * 2);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const spreadIndex = Math.floor(page / 2);
  useEffect(() => {
    const hash = `#${SPREADS[spreadIndex].id}`;
    if (window.location.hash === hash) return;
    // The first spread is the front door — keep its URL clean.
    const url = spreadIndex === 0 ? window.location.pathname : hash;
    window.history.replaceState(null, "", url);
  }, [spreadIndex]);

  // ── What is lying flat, and what is turning ──────────────────────────────
  const atStart = (mode === "spread" ? spreadStart(page) : page) === 0;
  const atEnd = mode === "spread" ? spreadStart(page) + 1 >= LAST : page >= LAST;
  const activeSpread = Math.floor((flip ? flip.to : page) / 2);

  const bookW = (mode === "spread" ? PAGE_W * 2 : PAGE_W) + COVER * 2;
  const bookH = PAGE_H + COVER * 2 + TAB_H;
  const scale = layout?.scale ?? 1;

  let flat: ReactNode;
  let leaf: ReactNode = null;

  if (mode === "spread") {
    const cur = spreadStart(page);
    const to = flip ? flip.to : cur;
    const left = flip && flip.dir === -1 ? to : cur;
    const right = flip && flip.dir === 1 ? to + 1 : cur + 1;

    flat = (
      <>
        <Slot x={0}>{renderPage(left)}</Slot>
        <Slot x={PAGE_W}>{renderPage(right)}</Slot>
      </>
    );

    if (flip) {
      leaf =
        flip.dir === 1 ? (
          <Leaf x={PAGE_W} hinge="left" rot={rot} front={renderPage(cur + 1)} back={renderPage(to)} />
        ) : (
          <Leaf x={0} hinge="right" rot={rot} front={renderPage(cur)} back={renderPage(to + 1)} />
        );
    }
  } else {
    const under = flip && flip.dir === 1 ? flip.to : page;
    flat = <Slot x={0}>{renderPage(under)}</Slot>;

    if (flip) {
      const turning = flip.dir === 1 ? page : flip.to;
      leaf = <Leaf x={0} hinge="left" rot={rot} front={renderPage(turning)} back={<BlankLeaf />} />;
    }
  }

  return (
    <JournalContext.Provider value={{ portfolioReady }}>
      <JournalDefs />

      <div ref={frameRef} className="w-full">
        <motion.div
          className="relative mx-auto"
          style={{
            width: bookW * scale,
            height: bookH * scale,
            opacity: layout ? 1 : 0,
            touchAction: "pan-y",
          }}
          onPanEnd={(_, info) => {
            if (Math.abs(info.offset.x) < 60 || Math.abs(info.offset.x) < Math.abs(info.offset.y)) return;
            if (info.offset.x < 0) next();
            else prev();
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: bookW, height: bookH, transform: `scale(${scale})` }}
          >
            {/* Index tabs */}
            <div className="absolute left-0 right-0 top-0 flex items-end justify-end gap-1.5 pr-10" style={{ height: TAB_H + 4 }}>
              {SPREADS.map((s, i) => {
                const active = i === activeSpread;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => turnTo(i * 2)}
                    aria-current={active ? "page" : undefined}
                    className="flex cursor-pointer items-center border-2 border-b-0 px-4 pb-1 text-[19px] uppercase leading-none tracking-wide transition-[height] duration-200 hover:h-[38px]! focus-visible:h-[38px]! focus-visible:outline-none"
                    style={{
                      ...PRINT,
                      background: s.tab,
                      borderColor: "#3b2a14",
                      color: "#1f2328",
                      borderRadius: "10px 10px 0 0",
                      height: active ? TAB_H + 4 : TAB_H - 4,
                      boxShadow: active ? "0 -2px 8px rgba(0,0,0,0.25)" : "none",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Cover board */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: TAB_H,
                bottom: 0,
                background: "linear-gradient(135deg, #b98c55, #9c6f3b)",
                border: "2px solid #5b3d1c",
                borderRadius: 10,
                boxShadow: "0 28px 60px rgba(0,0,0,0.6), 0 8px 18px rgba(0,0,0,0.45)",
              }}
            />

            {/* Pages */}
            <div
              className="absolute"
              style={{
                left: COVER,
                top: TAB_H + COVER,
                width: bookW - COVER * 2,
                height: PAGE_H,
                perspective: 2600,
                boxShadow: "1px 1px 0 #e7e1d0, 2px 2px 0 #d8d0bb, 3px 3px 0 #e7e1d0, 4px 4px 0 #cfc6ae",
              }}
            >
              {flat}
              {leaf}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <nav aria-label="Journal pages" className="mx-auto mt-6 flex max-w-md items-center justify-between gap-4 px-2">
        <PageButton onClick={prev} disabled={atStart || Boolean(flip)}>
          ← back
        </PageButton>
        <span aria-live="polite" className="text-[22px] text-amber-100/70" style={SCRAWL}>
          {mode === "spread"
            ? `pages ${spreadStart(page) + 1}–${spreadStart(page) + 2} of ${PAGES.length}`
            : `page ${page + 1} of ${PAGES.length}`}
        </span>
        <PageButton onClick={next} disabled={atEnd || Boolean(flip)}>
          next →
        </PageButton>
      </nav>
      <p className="m-0 mt-2 text-center text-[19px] text-amber-100/35" style={SCRAWL}>
        {mode === "spread" ? "← → arrow keys turn pages" : "swipe to turn pages"}
      </p>
    </JournalContext.Provider>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────

function Slot({ x, children }: { x: number; children: ReactNode }) {
  return (
    <div className="absolute top-0" style={{ left: x, width: PAGE_W, height: PAGE_H }}>
      {children}
    </div>
  );
}

function Leaf({
  x,
  hinge,
  rot,
  front,
  back,
}: {
  x: number;
  hinge: "left" | "right";
  rot: MotionValue<number>;
  front: ReactNode;
  back: ReactNode;
}) {
  // Each face darkens as it tips away from the reader, peaking edge-on.
  const frontShade = useTransform(rot, (v) => Math.min(Math.abs(v), 90) / 90 * 0.35);
  const backShade = useTransform(rot, (v) => Math.min(180 - Math.abs(v), 90) / 90 * 0.35);

  const face = "absolute inset-0 overflow-hidden";
  const hidden = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

  return (
    <motion.div
      aria-hidden
      className="absolute top-0 z-20"
      style={{
        left: x,
        width: PAGE_W,
        height: PAGE_H,
        rotateY: rot,
        transformOrigin: hinge === "left" ? "left center" : "right center",
        transformStyle: "preserve-3d",
      }}
    >
      <div className={face} style={hidden}>
        {front}
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: frontShade }} />
      </div>
      <div className={face} style={{ ...hidden, transform: "rotateY(180deg)" }}>
        {back}
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: backShade }} />
      </div>
    </motion.div>
  );
}

function PageButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.08, rotate: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="cursor-pointer px-3 py-1 text-[26px] leading-none text-amber-50 disabled:cursor-default disabled:opacity-25"
      style={PRINT}
    >
      {children}
    </motion.button>
  );
}
