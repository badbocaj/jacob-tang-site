// ─────────────────────────────────────────────────────────────────────────────
// DOODLE — hand-drawn SVG path helpers
//
// Everything on /professional is drawn with these so the whole facility looks
// like one marker sketch. The wobble is baked into the path data rather than
// applied with an SVG displacement filter: a filter would have to re-run every
// frame on an animating group, and this costs nothing at runtime.
//
// All randomness is seeded, so the server and the client generate identical
// path strings and hydration stays quiet.
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic PRNG (mulberry32). Same seed always yields the same squiggle. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

/**
 * Rounds a coordinate to 2dp before it reaches an attribute.
 *
 * This is a hydration guard, not just tidiness. `Math.sin`/`cos`/`exp` are
 * implementation-dependent in ECMAScript, so Node and the browser can disagree
 * in the last bits and emit a different `d` string for the same drawing. Every
 * number that ends up in markup must go through here.
 */
export const r2 = (v: number) => Math.round(v * 100) / 100;

const n = r2;

/**
 * Converts a point list into a smooth path using Catmull-Rom -> cubic Bezier.
 * This is what keeps a wobbly line looking drawn rather than jagged.
 */
function smooth(pts: Pt[], closed: boolean): string {
  if (pts.length < 2) return "";
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${n(p[1][0])} ${n(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += ` C ${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(x2)} ${n(y2)}`;
  }
  return closed ? d + " Z" : d;
}

/**
 * A hand-drawn line. Wanders off the straight path between the endpoints and
 * overshoots slightly at each end, the way a marker stroke does.
 */
export function dLine(x1: number, y1: number, x2: number, y2: number, seed = 1, amp = 2.2): string {
  const r = mulberry32(seed);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  // Overshoot the ends a touch so corners don't meet perfectly.
  const o1 = (r() - 0.5) * amp * 1.6;
  const o2 = (r() - 0.5) * amp * 1.6;
  const sx = x1 - ux * o1;
  const sy = y1 - uy * o1;
  const ex = x2 + ux * o2;
  const ey = y2 + uy * o2;

  const steps = Math.max(2, Math.min(6, Math.round(len / 42)));
  const pts: Pt[] = [[sx, sy]];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const off = (r() - 0.5) * 2 * amp;
    pts.push([sx + (ex - sx) * t + px * off, sy + (ey - sy) * t + py * off]);
  }
  pts.push([ex, ey]);
  return smooth(pts, false);
}

/** A hand-drawn polyline (or polygon when `closed`). */
export function dPoly(points: Pt[], seed = 1, amp = 2.2, closed = false): string {
  const r = mulberry32(seed);
  const out: Pt[] = points.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
  return smooth(out, closed);
}

/** A hand-drawn rectangle. Corners never quite line up. */
export function dRect(x: number, y: number, w: number, h: number, seed = 1, amp = 2.2): string {
  return dPoly(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    seed,
    amp,
    true
  );
}

/** A hand-drawn circle. Radius breathes a little all the way round. */
export function dCircle(cx: number, cy: number, rad: number, seed = 1, amp = 2.2): string {
  const r = mulberry32(seed);
  const steps = Math.max(8, Math.round(rad / 3));
  const pts: Pt[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = rad + (r() - 0.5) * 2 * amp;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smooth(pts, true);
}

/** A hand-drawn arc from `a0` to `a1` radians (used for domes, smiles, hoses). */
export function dArc(
  cx: number,
  cy: number,
  rad: number,
  a0: number,
  a1: number,
  seed = 1,
  amp = 2.2
): string {
  const r = mulberry32(seed);
  const span = a1 - a0;
  const steps = Math.max(4, Math.round((Math.abs(span) * rad) / 10));
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + span * (i / steps);
    const rr = rad + (r() - 0.5) * 2 * amp;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smooth(pts, false);
}

/**
 * A hand-drawn curve through three points — the shape every hose, cable and
 * conveyor sag in the facility is built from.
 */
export function dCurve(a: Pt, ctrl: Pt, b: Pt, seed = 1, amp = 2, steps = 8): string {
  const r = mulberry32(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * a[0] + 2 * mt * t * ctrl[0] + t * t * b[0];
    const y = mt * mt * a[1] + 2 * mt * t * ctrl[1] + t * t * b[1];
    const j = i === 0 || i === steps ? 0 : (r() - 0.5) * 2 * amp;
    pts.push([x + j, y + j]);
  }
  return smooth(pts, false);
}

/**
 * Samples a quadratic curve into separate x and y arrays.
 *
 * Framer keyframes these directly to send droplets down a hose or parts down a
 * belt. Sampling beats CSS `offset-path` here because it works identically in
 * every browser and needs no layout support.
 */
export function curvePoints(
  a: Pt,
  ctrl: Pt,
  b: Pt,
  count = 14
): { xs: number[]; ys: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const mt = 1 - t;
    xs.push(n(mt * mt * a[0] + 2 * mt * t * ctrl[0] + t * t * b[0]));
    ys.push(n(mt * mt * a[1] + 2 * mt * t * ctrl[1] + t * t * b[1]));
  }
  return { xs, ys };
}

/**
 * Evenly spaced values — for rollers, buttons, floor ribs, track ties.
 * Rounded, because several callers interpolate these straight into `style` and
 * `d` strings and every number in markup has to be hydration-stable.
 */
export function spread(count: number, from: number, to: number): number[] {
  if (count <= 1) return [r2(from)];
  const step = (to - from) / (count - 1);
  return Array.from({ length: count }, (_, i) => r2(from + step * i));
}
