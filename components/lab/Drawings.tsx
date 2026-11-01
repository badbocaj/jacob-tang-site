/* ───────────────────────────────────────────────────────────────────────────
   Line drawings for the Lab — one per project.

   Everything strokes in currentColor, so the same drawing reads as pencil on
   paper by day and as chalk-light on the night sky once the switch is off.
   ─────────────────────────────────────────────────────────────────────────── */

export type DrawingKey = "drivetrain" | "aircraft" | "engine" | "terminal" | "browser" | "pantry";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const LABEL = {
  fill: "currentColor",
  stroke: "none",
  fontSize: 9,
  fontFamily: "var(--ff-mono), monospace",
  letterSpacing: "0.12em",
  opacity: 0.6,
};

/** Spur gear outline, centred on (cx, cy). */
function gearPath(cx: number, cy: number, teeth: number, rOuter: number, rRoot: number): string {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [rRoot, a],
      [rOuter, a + step * 0.15],
      [rOuter, a + step * 0.45],
      [rRoot, a + step * 0.6],
    ] as const;
    for (const [r, ang] of corners) {
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(1)} ${(cy + r * Math.sin(ang)).toFixed(1)}`);
    }
  }
  return `M${pts.join(" L")} Z`;
}

export function Drawing({ kind, className = "" }: { kind: DrawingKey; className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden>
      {kind === "drivetrain" && (
        <g {...STROKE}>
          {/* motor */}
          <rect x="22" y="96" width="70" height="48" rx="6" />
          <path d="M34 96 V144 M46 96 V144 M58 96 V144" strokeOpacity="0.35" />
          <path d="M92 120 H112" />
          {/* gear pair */}
          <path d={gearPath(138, 120, 14, 28, 23)} />
          <circle cx="138" cy="120" r="5" />
          <path d={gearPath(190, 120, 9, 19, 14.5)} />
          <circle cx="190" cy="120" r="4" />
          {/* to the pump + pressure vessel */}
          <path d="M209 120 H226" />
          <rect x="226" y="58" width="72" height="124" rx="34" />
          <circle cx="262" cy="96" r="13" />
          <path d="M262 96 L270 88" />
          <path d="M226 150 H298" strokeOpacity="0.35" strokeDasharray="4 4" />
          <text {...LABEL} x="22" y="168">MOTOR</text>
          <text {...LABEL} x="140" y="168" textAnchor="middle">REDUCTION</text>
          <text {...LABEL} x="262" y="202" textAnchor="middle">PRESSURE</text>
        </g>
      )}

      {kind === "aircraft" && (
        <g {...STROKE}>
          {/* wing, plan view: very long, very thin */}
          <path d="M12 104 Q160 92 308 104 L308 114 Q160 108 12 114 Z" />
          {Array.from({ length: 15 }, (_, i) => {
            const x = 28 + i * 19;
            return <path key={i} d={`M${x} 102 V111`} strokeOpacity="0.35" />;
          })}
          {/* pod + boom + tail */}
          <path d="M146 92 Q160 70 174 92 L172 132 Q160 140 148 132 Z" />
          <path d="M160 140 V206" />
          <path d="M134 206 H186" />
          <path d="M160 196 V214" />
          {/* prop at the nose */}
          <path d="M146 66 L174 62" />
          <circle cx="160" cy="64" r="2.5" />
          <text {...LABEL} x="12" y="134">SPAR + RIBS</text>
          <text {...LABEL} x="192" y="210">TAIL</text>
        </g>
      )}

      {kind === "engine" && (
        <g {...STROKE}>
          <path d="M126 36 H194 V96 Q194 106 180 112 L176 116 Q214 148 228 210 H92 Q106 148 144 116 L140 112 Q126 106 126 96 Z" />
          <path d="M116 36 H204 M120 28 H200" />
          <path d="M140 16 V28 M180 16 V28" />
          <path d="M160 116 V210" strokeDasharray="8 4 2 4" strokeOpacity="0.35" />
          {/* cooling channels */}
          <path d="M134 44 V100 M186 44 V100" strokeOpacity="0.4" strokeDasharray="3 3" />
          <path d="M244 116 H256 M244 210 H256 M250 116 V210" strokeOpacity="0.5" />
          <text {...LABEL} x="260" y="166">BELL</text>
          <text {...LABEL} x="214" y="40">INJECTOR</text>
          <text {...LABEL} x="34" y="78">CHAMBER</text>
          <path d="M84 75 H124" strokeOpacity="0.4" />
        </g>
      )}

      {kind === "terminal" && (
        <g {...STROKE}>
          <rect x="30" y="34" width="260" height="172" rx="10" />
          <path d="M30 58 H290" />
          <circle cx="46" cy="46" r="3.5" />
          <circle cx="60" cy="46" r="3.5" />
          <circle cx="74" cy="46" r="3.5" />
          <text {...LABEL} x="48" y="86" opacity={0.85}>$ maiia --run</text>
          <path d="M48 104 H196" strokeOpacity="0.45" />
          <path d="M48 120 H232" strokeOpacity="0.45" />
          <path d="M48 136 H170" strokeOpacity="0.45" />
          <path d="M48 152 H210" strokeOpacity="0.45" />
          <rect x="48" y="166" width="9" height="14" fill="currentColor" stroke="none" className="animate-pulse" />
        </g>
      )}

      {kind === "browser" && (
        <g {...STROKE}>
          <rect x="22" y="30" width="276" height="180" rx="10" />
          <path d="M22 54 H298" />
          <rect x="70" y="38" width="180" height="9" rx="4.5" strokeOpacity="0.5" />
          <text {...LABEL} x="160" y="45.5" textAnchor="middle" fontSize={7}>tangjacob.com</text>
          {/* half day, half night inside the window */}
          <path d="M160 54 V210" strokeOpacity="0.35" />
          <circle cx="104" cy="96" r="14" />
          <path d="M104 72 V76 M104 116 V120 M80 96 H84 M124 96 H128" strokeOpacity="0.6" />
          <path d="M224 84 a14 14 0 1 0 14 22 a11 11 0 1 1 -14 -22 Z" />
          <circle cx="252" cy="80" r="1.4" fill="currentColor" />
          <circle cx="198" cy="118" r="1.2" fill="currentColor" />
          <circle cx="270" cy="128" r="1.2" fill="currentColor" />
          {/* the switch, very meta */}
          <rect x="146" y="150" width="28" height="42" rx="4" />
          <rect x="153" y="157" width="14" height="16" rx="2" />
        </g>
      )}

      {kind === "pantry" && (
        <g {...STROKE}>
          {/* shelf */}
          <path d="M20 172 H300" />
          <path d="M36 172 V184 M284 172 V184" strokeOpacity="0.5" />
          {/* three jars: have / low / gone */}
          {[
            { x: 52, fill: 0.85, label: "HAVE" },
            { x: 136, fill: 0.3, label: "LOW" },
            { x: 220, fill: 0, label: "GONE" },
          ].map((j) => {
            const top = 84, bottom = 172, h = bottom - top - 10;
            const level = bottom - 4 - h * j.fill;
            return (
              <g key={j.label}>
                <rect x={j.x} y={top - 10} width="48" height="10" rx="2" />
                <path d={`M${j.x + 2} ${top} H${j.x + 46} Q${j.x + 50} ${top} ${j.x + 50} ${top + 8} V${bottom - 2} H${j.x - 2} V${top + 8} Q${j.x - 2} ${top} ${j.x + 2} ${top} Z`} />
                {j.fill > 0 && (
                  <path d={`M${j.x + 2} ${level} H${j.x + 46} V${bottom - 4} H${j.x + 2} Z`} fill="currentColor" fillOpacity="0.14" strokeOpacity="0.5" />
                )}
                <text {...LABEL} x={j.x + 24} y={bottom + 26} textAnchor="middle">{j.label}</text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}
