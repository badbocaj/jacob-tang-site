"use client";

import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared terminal chrome for /personalized — the login panel and both
// authenticated panels are cut from the same sheet metal.
// ─────────────────────────────────────────────────────────────────────────────

export function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
      }}
    />
  );
}

export function HazardStripe({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={position === "top" ? "h-2 w-full" : "h-1 w-full"}
      style={{
        background:
          "repeating-linear-gradient(45deg, #16a34a, #16a34a 10px, #0a0a0a 10px, #0a0a0a 20px)",
      }}
    />
  );
}

/** The eyebrow that sits at the top of every panel. */
export function PanelLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-mono text-xs text-green-500/70 tracking-label uppercase">
        {children}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Decrypt-on-reveal. Values in the dossier resolve out of glyph noise, one
// character at a time, as though the record is being pulled off tape.
// The animation writes straight to the DOM node — re-rendering the tree once
// per glyph frame would be a lot of React for a text effect.
// ─────────────────────────────────────────────────────────────────────────────

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*+=-<>/\\";

function scramble(text: string, revealed: number) {
  return text
    .split("")
    .map((ch, i) => {
      if (i < revealed || ch === " ") return ch;
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join("");
}

export function DecryptText({
  text,
  delay = 0,
  speed = 22,
  className,
}: {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }

    el.textContent = "";
    let revealed = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(() => {
      interval = setInterval(() => {
        revealed += 1;
        el.textContent = scramble(text, revealed);
        if (revealed >= text.length && interval) clearInterval(interval);
      }, speed);
    }, delay);

    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, speed]);

  // Server-rendered as the plain value; the effect takes over on mount.
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
