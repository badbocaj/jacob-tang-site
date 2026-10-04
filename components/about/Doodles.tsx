import type { CSSProperties, ReactNode } from "react";
import { INK, PEN_RED } from "./Paper";

/* ───────────────────────────────────────────────────────────────────────────
   Margin doodles. Same kid in every one of them — round head, black mop of
   hair — so the book reads as one person drawing himself over and over.

   Everything is plain SVG run through one shared roughen filter (defined in
   <JournalDefs/>), which knocks the ruler-straight edges off.
   ─────────────────────────────────────────────────────────────────────────── */

const PAPER_FILL = "#fdfbf3";

export function JournalDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="jt-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="2.2" />
        </filter>
      </defs>
    </svg>
  );
}

function Sketch({
  viewBox,
  label,
  className,
  style,
  children,
}: {
  viewBox: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className} style={{ overflow: "visible", ...style }}>
      <g
        filter="url(#jt-rough)"
        fill="none"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

/** The recurring character. `look` nudges the eyes sideways. */
function Me({
  x,
  y,
  r = 17,
  look = 0,
  shades = false,
}: {
  x: number;
  y: number;
  r?: number;
  look?: number;
  shades?: boolean;
}) {
  const hair = `M${x - r - 1} ${y + 1}
    C${x - r - 2} ${y - r - 9} ${x + r + 2} ${y - r - 9} ${x + r + 1} ${y + 1}
    L${x + r - 3} ${y - 5} L${x + r - 7} ${y - 1} L${x + 4} ${y - 6} L${x} ${y - 1}
    L${x - 5} ${y - 6} L${x - 9} ${y - 1} L${x - r + 2} ${y - 5} Z`;

  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={PAPER_FILL} />
      <path d={hair} fill={INK} strokeWidth={1.4} />
      {shades ? (
        <g fill={INK} stroke="none">
          <ellipse cx={x - 6 + look} cy={y + 3} rx={5.5} ry={4} />
          <ellipse cx={x + 6 + look} cy={y + 3} rx={5.5} ry={4} />
        </g>
      ) : (
        <g fill={INK} stroke="none">
          <circle cx={x - 5 + look} cy={y + 3} r={1.8} />
          <circle cx={x + 5 + look} cy={y + 3} r={1.8} />
        </g>
      )}
      <path d={`M${x - 3 + look} ${y + 10} q3 2.5 6 0`} strokeWidth={2} />
    </g>
  );
}

function Label({ x, y, size = 13, rotate = 0, color = INK, children }: {
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  color?: string;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor="middle"
      fill={color}
      stroke="none"
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      style={{ fontFamily: "var(--ff-journal), var(--ff-hand), cursive" }}
    >
      {children}
    </text>
  );
}

// ─── Work ───────────────────────────────────────────────────────────────────

export function DoodlePointer({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 150 190" label="Doodle of Jacob pointing at the portfolio" className={className}>
      <Me x={90} y={40} look={-3} />
      <path d="M90 57 L90 122" />
      <path d="M90 122 L76 172 l-10 1 M90 122 L104 172 l10 1" />
      <path d="M90 78 L108 108" />
      <path d="M90 78 L58 66 L44 56 l-7 -4" />
      <path d="M30 42 l-6 -7 M26 54 l-9 -1 M34 32 l-2 -9" strokeWidth={1.8} />
    </Sketch>
  );
}

export function DoodleTinkerer({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 260 180" label="Doodle of Jacob fixing a climate control unit with a wrench" className={className}>
      <path d="M14 172 H250" />
      {/* the unit */}
      <rect x={150} y={60} width={90} height={110} rx={4} fill={PAPER_FILL} />
      <path d="M162 78 h66 M162 90 h66 M162 102 h66" strokeWidth={1.8} />
      <circle cx={174} cy={138} r={11} fill={PAPER_FILL} />
      <path d="M174 138 l6 -6" strokeWidth={2} />
      <rect x={196} y={128} width={34} height={20} rx={2} />
      <Label x={213} y={143} size={14}>72°?</Label>
      <path d="M168 50 q6 -6 0 -12 q-6 -6 0 -12 M196 50 q6 -6 0 -12 q-6 -6 0 -12 M224 50 q6 -6 0 -12 q-6 -6 0 -12" strokeWidth={1.8} />
      {/* me */}
      <Me x={70} y={46} look={3} />
      <path d="M70 63 L72 122" />
      <path d="M72 122 L58 170 l-10 1 M72 122 L88 170 l10 1" />
      <path d="M70 82 L52 108" />
      <path d="M70 82 L104 94 L136 86" />
      <path d="M131 80 a8 8 0 1 0 12 -3" />
      {/* sweating it */}
      <path d="M42 26 q-4 6 0 8 q4 -2 0 -8 Z M34 42 q-4 6 0 8 q4 -2 0 -8 Z" strokeWidth={1.6} />
    </Sketch>
  );
}

// ─── Outdoors ───────────────────────────────────────────────────────────────

export function DoodlePickleball({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 260 190" label="Doodle of Jacob lunging for a pickleball" className={className}>
      <path d="M8 176 H252" />
      {/* net */}
      <path d="M182 176 V124 M250 176 V124 M182 124 H250" />
      <path
        d="M194 126 V176 M206 126 V176 M218 126 V176 M230 126 V176 M242 126 V176 M182 137 H250 M182 150 H250 M182 163 H250"
        strokeWidth={1.2}
      />
      <Me x={70} y={50} look={3} />
      <path d="M70 67 L76 122" />
      <path d="M76 122 L54 170 l-11 2 M76 122 L104 150 L112 172 l10 0" />
      <path d="M72 86 L48 100" />
      <path d="M72 86 L104 72 L112 66" />
      <ellipse cx={122} cy={56} rx={11} ry={14} transform="rotate(35 122 56)" fill={PAPER_FILL} />
      <circle cx={160} cy={36} r={7} fill={PAPER_FILL} />
      <g fill={INK} stroke="none">
        <circle cx={157.5} cy={34} r={1.2} />
        <circle cx={162} cy={37} r={1.2} />
        <circle cx={158.5} cy={39.5} r={1.2} />
      </g>
      <path d="M146 30 h-11 M146 40 h-13" strokeWidth={1.6} />
    </Sketch>
  );
}

export function DoodleGolf({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 260 190" label="Doodle of Jacob hitting a golf ball into a tree" className={className}>
      <path d="M8 176 H252" />
      {/* the tree that always wins */}
      <path d="M216 176 V112 M230 176 V112" />
      <path
        d="M200 114 q-15 -6 -6 -22 q-6 -18 14 -22 q8 -16 26 -6 q18 -6 20 12 q14 8 2 22 q2 16 -20 14 q-14 8 -36 2 Z"
        fill={PAPER_FILL}
      />
      <circle cx={228} cy={80} r={5} fill={PAPER_FILL} />
      <path d="M98 172 Q150 -6 224 76" strokeWidth={1.7} strokeDasharray="5 7" />
      <Label x={196} y={34} size={17} rotate={-8}>fore...?</Label>
      {/* me, admiring it */}
      <Me x={70} y={52} look={3} />
      <path d="M70 69 L68 124" />
      <path d="M68 124 L56 174 l-10 1 M68 124 L84 160 L86 174" />
      <path d="M70 86 L90 58 M70 86 L86 62" />
      <path d="M90 58 L46 30 l-6 7" />
    </Sketch>
  );
}

export function DoodleHiker({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 260 200" label="Doodle of Jacob hiking uphill with a trekking pole" className={className}>
      <path d="M0 120 L50 64 L80 92 L130 30 L170 76 L200 52 L260 108" strokeWidth={1.8} />
      <path d="M118 44 l6 5 l6 -7 l6 7 l6 -5" strokeWidth={1.6} />
      <circle cx={226} cy={26} r={11} />
      <path d="M226 6 v-5 M246 26 h5 M240 12 l4 -4 M212 12 l-4 -4" strokeWidth={1.6} />
      <path d="M0 196 L260 150" />
      <rect x={99} y={110} width={16} height={30} rx={5} fill={PAPER_FILL} />
      <Me x={118} y={92} look={3} />
      <path d="M118 109 L122 152" />
      <path d="M122 152 L108 177 l-9 0 M122 152 L136 160 L140 171 l9 -2" />
      <path d="M119 120 L106 140" />
      <path d="M119 120 L140 134" />
      <path d="M140 128 L150 169" strokeWidth={2} />
    </Sketch>
  );
}

// ─── Games ──────────────────────────────────────────────────────────────────

export function DoodleGamer({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 260 190" label="Doodle of Jacob gaming at his desk at 3 AM" className={className}>
      {/* moon */}
      <path d="M36 14 a15 15 0 1 0 16 24 a12 12 0 1 1 -16 -24 Z" />
      <path d="M70 18 v8 M66 22 h8 M18 52 v6 M15 55 h6" strokeWidth={1.4} />
      <Label x={40} y={78} size={15}>3:07 AM</Label>
      {/* desk */}
      <path d="M20 128 H250 M30 128 V182 M240 128 V182" />
      <rect x={150} y={52} width={88} height={60} rx={3} fill={PAPER_FILL} />
      <Label x={194} y={88} size={17} color={PEN_RED}>DEFEAT</Label>
      <path d="M194 112 V122 M180 124 H208" />
      <path d="M146 46 l-8 -8 M242 46 l8 -8 M194 44 v-10" strokeWidth={1.4} />
      <rect x={128} y={119} width={46} height={7} rx={2} />
      {/* chair */}
      <path d="M52 74 L56 150 M56 138 H100 M78 138 V180 M62 182 H94" />
      {/* me, leaning in */}
      <Me x={98} y={62} look={4} />
      <path d="M94 79 L86 134" />
      <path d="M86 134 L120 136 L118 180 l9 1" />
      <path d="M92 94 L132 118" />
    </Sketch>
  );
}

export function DoodleKnight({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 100 130" label="Doodle of a chess knight" className={className}>
      <rect x={22} y={110} width={56} height={14} rx={3} fill={PAPER_FILL} />
      <rect x={30} y={99} width={40} height={11} rx={2} fill={PAPER_FILL} />
      <path
        d="M34 99 C32 82 36 70 44 60 L30 58 C22 57 18 48 24 42 L44 24 L48 10 L56 21 C72 25 82 44 78 70 C76 84 70 92 68 99 Z"
        fill={PAPER_FILL}
      />
      <circle cx={47} cy={33} r={2} fill={INK} stroke="none" />
      <path d="M62 27 q8 8 10 18 M68 50 q4 8 4 16" strokeWidth={1.6} />
    </Sketch>
  );
}

const HEX_R = 36;
function hexPoints(cx: number, cy: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 90) * Math.PI) / 180;
    return `${(cx + HEX_R * Math.cos(a)).toFixed(1)},${(cy + HEX_R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const HEXES = [
  { cx: 56, cy: 50, n: 6 },
  { cx: 118.4, cy: 50, n: 8 },
  { cx: 87.2, cy: 104, n: 5 },
  { cx: 149.6, cy: 104, n: 11, wood: true },
];

function Tree({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y - 8} L${x - 6} ${y + 4} H${x + 6} Z M${x} ${y + 4} v4`} strokeWidth={1.6} />;
}

export function DoodleHexes({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 200 150" label="Doodle of Catan tiles with a settlement and a road" className={className}>
      {HEXES.map((h) => (
        <polygon key={`${h.cx}-${h.cy}`} points={hexPoints(h.cx, h.cy)} fill={PAPER_FILL} />
      ))}
      <Tree x={130} y={100} />
      <Tree x={169} y={100} />
      <Tree x={150} y={126} />
      {HEXES.map((h) => (
        <g key={`t-${h.cx}`}>
          <circle cx={h.cx} cy={h.cy} r={11} fill={PAPER_FILL} />
          <Label x={h.cx} y={h.cy + 5} size={15} color={h.n === 6 || h.n === 8 ? PEN_RED : INK}>
            {h.n}
          </Label>
        </g>
      ))}
      <path d="M87.2 68 L118.4 86" strokeWidth={6} />
      <path d="M79 74 V63 L87.2 55 L95.4 63 V74 Z" fill={PAPER_FILL} />
    </Sketch>
  );
}

// ─── History ────────────────────────────────────────────────────────────────

export function DoodleRocket({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 70 150" label="Doodle of a rocket" className={className}>
      <path d="M35 8 C50 24 52 50 50 96 H20 C18 50 20 24 35 8 Z" fill={PAPER_FILL} />
      <circle cx={35} cy={46} r={7} />
      <path d="M21 70 H49" strokeWidth={1.8} />
      <path d="M20 78 L8 104 L20 98 M50 78 L62 104 L50 98" />
      <path d="M26 96 L24 104 H46 L44 96" />
      <path d="M28 108 q7 26 7 34 q0 -8 7 -34" stroke={PEN_RED} />
    </Sketch>
  );
}

export function DoodleSelf({ className }: { className?: string }) {
  return (
    <Sketch viewBox="0 0 150 240" label="Self-portrait doodle of Jacob in aviators and a long leather coat" className={className}>
      <path d="M75 62 V70" />
      {/* the coat */}
      <path d="M50 70 L100 70 L112 162 L38 162 Z" fill={PAPER_FILL} />
      <path d="M62 70 L75 104 L88 70 M62 70 L55 86 L66 88 M88 70 L95 86 L84 88" />
      <path d="M43 130 H107" strokeWidth={1.8} />
      <circle cx={75} cy={116} r={2.2} />
      <circle cx={75} cy={142} r={2.2} />
      <path d="M48 96 l10 -8 M46 112 l12 -10 M92 104 l12 -10 M94 120 l12 -10" strokeWidth={1.2} />
      {/* sleeves */}
      <path d="M50 72 L34 142 l9 2 L56 94" fill={PAPER_FILL} />
      <path d="M100 72 L114 112 L90 102" fill={PAPER_FILL} />
      {/* legs + slides */}
      <path d="M56 162 L54 212 H68 L70 162 M82 162 L82 212 H96 L96 162" fill={PAPER_FILL} />
      <path d="M48 218 h24 M78 218 h24" strokeWidth={4.5} />
      <Me x={75} y={42} r={20} shades />
    </Sketch>
  );
}

/** A loose hand-drawn arrow, left-to-right. Flip/rotate it with CSS. */
export function ArrowScrawl({ className, color = INK }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 80 50" className={className} aria-hidden style={{ overflow: "visible" }}>
      <path
        d="M4 40 C 20 10, 50 6, 72 18 M72 18 l-11 -5 M72 18 l-7 10"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
