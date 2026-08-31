"use client";

import type { CSSProperties } from "react";

/* ───────────────────────────────────────────────────────────────────────────
   The shape the whole HUD is built from. Keeping it here stops six components
   from each inventing their own slightly-different corner.
   ─────────────────────────────────────────────────────────────────────────── */

interface BracketsProps {
  /** Arm length in px. */
  size?: number;
  color?: string;
  /** Pushes the corners outward — the hover "expansion" tell. */
  offset?: number;
  thickness?: number;
  className?: string;
}

export function Brackets({
  size = 10,
  color = "rgba(34,211,238,0.85)",
  offset = 0,
  thickness = 1,
  className = "",
}: BracketsProps) {
  const corners = [
    { key: "tl", style: { top: -offset, left: -offset, borderTopWidth: thickness, borderLeftWidth: thickness } },
    { key: "tr", style: { top: -offset, right: -offset, borderTopWidth: thickness, borderRightWidth: thickness } },
    { key: "bl", style: { bottom: -offset, left: -offset, borderBottomWidth: thickness, borderLeftWidth: thickness } },
    { key: "br", style: { bottom: -offset, right: -offset, borderBottomWidth: thickness, borderRightWidth: thickness } },
  ];

  return (
    <span
      className={`pointer-events-none absolute inset-0 transition-all duration-200 ${className}`}
      aria-hidden
    >
      {corners.map((c) => (
        <span
          key={c.key}
          className="absolute block border-solid transition-all duration-200"
          style={
            {
              width: size,
              height: size,
              borderColor: color,
              borderWidth: 0,
              ...c.style,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
