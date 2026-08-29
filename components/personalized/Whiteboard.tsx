"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eraser, PenLine, RotateCcw, Trash2 } from "lucide-react";
import { HazardStripe, PanelLabel, Scanlines } from "./chrome";

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — the whiteboard. Whoever is logged in draws and writes here;
// strokes persist in their own browser, keyed to their friend id.
//
// Geometry is stored normalized against canvas WIDTH (both axes, plus the
// brush size) so a resize scales the drawing instead of distorting it.
// ─────────────────────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  color: string;
  size: number;
  erase: boolean;
  points: Point[];
}

const COLORS = [
  { hex: "#4ade80", name: "phosphor" },
  { hex: "#22d3ee", name: "coolant" },
  { hex: "#fbbf24", name: "caution" },
  { hex: "#f472b6", name: "plasma" },
  { hex: "#e5e5e5", name: "chalk" },
];

const SIZES = [3, 7, 16];

const storageKey = (friendId: string) => `personalized_whiteboard::${friendId}`;

function round(n: number) {
  return Math.round(n * 10000) / 10000;
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  width: number
) {
  const lineWidth = Math.max(1, stroke.size * width);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = lineWidth;

  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * width, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    const x = p.x * width;
    const y = p.y * width;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

export default function Whiteboard({
  friendId,
  friendName,
}: {
  friendId: string;
  friendName: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeRef = useRef<Stroke | null>(null);
  const lastPointRef = useRef<Point | null>(null);

  const [color, setColor] = useState(COLORS[0].hex);
  const [size, setSize] = useState(SIZES[1]);
  const [erasing, setErasing] = useState(false);
  const [count, setCount] = useState(0);
  const [saved, setSaved] = useState(true);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const ctx = () => canvasRef.current?.getContext("2d") ?? null;
  const cssWidth = () => canvasRef.current?.getBoundingClientRect().width ?? 1;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = ctx();
    if (!canvas || !context) return;
    const { width, height } = canvas.getBoundingClientRect();
    context.clearRect(0, 0, width, height);
    strokesRef.current.forEach((s) => drawStroke(context, s, width));
    context.globalCompositeOperation = "source-over";
  }, []);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(
        storageKey(friendId),
        JSON.stringify(strokesRef.current)
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [friendId]);

  // Load whatever this friend drew last time.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(friendId));
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      strokesRef.current = Array.isArray(parsed) ? (parsed as Stroke[]) : [];
    } catch {
      strokesRef.current = [];
    }
    setCount(strokesRef.current.length);
    redraw();
  }, [friendId, redraw]);

  // Keep the backing store matched to the element box and device pixel ratio.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const context = canvas.getContext("2d");
      context?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [redraw]);

  const toNormalized = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: round((e.clientX - rect.left) / rect.width),
      y: round((e.clientY - rect.top) / rect.width),
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = toNormalized(e);
    const stroke: Stroke = {
      color,
      size: round(size / cssWidth()),
      erase: erasing,
      points: [point],
    };
    activeRef.current = stroke;
    lastPointRef.current = point;
    setSaved(false);
    setConfirmWipe(false);

    const context = ctx();
    if (context) drawStroke(context, stroke, cssWidth());
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = activeRef.current;
    const context = ctx();
    const previous = lastPointRef.current;
    if (!stroke || !context || !previous) return;

    const point = toNormalized(e);
    stroke.points.push(point);
    lastPointRef.current = point;

    // Only paint the new segment — a full redraw per move event is wasteful.
    const width = cssWidth();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = stroke.erase
      ? "destination-out"
      : "source-over";
    context.strokeStyle = stroke.color;
    context.lineWidth = Math.max(1, stroke.size * width);
    context.beginPath();
    context.moveTo(previous.x * width, previous.y * width);
    context.lineTo(point.x * width, point.y * width);
    context.stroke();
    context.globalCompositeOperation = "source-over";
  };

  const handleUp = () => {
    const stroke = activeRef.current;
    activeRef.current = null;
    lastPointRef.current = null;
    if (!stroke) return;
    strokesRef.current.push(stroke);
    setCount(strokesRef.current.length);
    persist();
  };

  const undo = () => {
    if (!strokesRef.current.length) return;
    strokesRef.current.pop();
    setCount(strokesRef.current.length);
    redraw();
    persist();
  };

  const wipe = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      setTimeout(() => setConfirmWipe(false), 3000);
      return;
    }
    strokesRef.current = [];
    setCount(0);
    setConfirmWipe(false);
    redraw();
    persist();
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Composite onto the panel background so the PNG isn't transparent.
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const context = out.getContext("2d");
    if (!context) return;
    context.fillStyle = "#050505";
    context.fillRect(0, 0, out.width, out.height);
    context.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = `whiteboard-${friendId}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  const toolButton =
    "flex items-center gap-1.5 border px-2 py-1 font-mono text-xs uppercase tracking-label transition-colors duration-150";

  return (
    <div className="relative flex flex-col overflow-hidden border border-green-500/30 bg-zinc-950 shadow-[0_0_60px_rgba(34,197,94,0.08)] lg:h-[74vh]">
      <HazardStripe position="top" />
      <Scanlines />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
          <PanelLabel icon={<PenLine size={14} className="text-green-400" />}>
            open surface
          </PanelLabel>
          <span className="font-mono text-xs uppercase tracking-label text-green-500/35">
            {friendName.split(" ")[0]} has write access
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => {
              const active = !erasing && color === c.hex;
              return (
                <button
                  key={c.hex}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => {
                    setColor(c.hex);
                    setErasing(false);
                  }}
                  style={{ backgroundColor: c.hex }}
                  className={`h-5 w-5 rounded-full transition-transform duration-150 ${
                    active
                      ? "scale-110 ring-2 ring-white/80 ring-offset-2 ring-offset-zinc-950"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                aria-label={`brush ${s}`}
                onClick={() => setSize(s)}
                className={`flex h-6 w-6 items-center justify-center border transition-colors duration-150 ${
                  size === s
                    ? "border-green-400/70 bg-green-500/15"
                    : "border-green-500/20 hover:border-green-500/50"
                }`}
              >
                <span
                  className="rounded-full bg-green-300"
                  style={{ width: s, height: s }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => setErasing((v) => !v)}
            className={`${toolButton} ${
              erasing
                ? "border-green-400/70 bg-green-500/15 text-green-300"
                : "border-green-500/25 text-green-500/60 hover:text-green-300"
            }`}
          >
            <Eraser size={12} />
            erase
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={count === 0}
              className={`${toolButton} border-green-500/25 text-green-500/60 hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-30`}
            >
              <RotateCcw size={12} />
              undo
            </button>
            <button
              onClick={wipe}
              disabled={count === 0}
              className={`${toolButton} ${
                confirmWipe
                  ? "border-red-500/60 bg-red-500/10 text-red-400"
                  : "border-green-500/25 text-green-500/60 hover:text-red-400"
              } disabled:cursor-not-allowed disabled:opacity-30`}
            >
              <Trash2 size={12} />
              {confirmWipe ? "confirm wipe" : "wipe"}
            </button>
            <button
              onClick={download}
              disabled={count === 0}
              className={`${toolButton} border-green-500/25 text-green-500/60 hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-30`}
            >
              <Download size={12} />
              save png
            </button>
          </div>
        </div>

        {/* Surface */}
        <div
          ref={wrapRef}
          className="relative mx-4 mb-3 min-h-[320px] flex-1 border border-green-500/20 bg-black/60 sm:mx-6 lg:min-h-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            className="absolute inset-0 touch-none cursor-crosshair"
          />
          {count === 0 && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-xs uppercase tracking-label text-green-500/25">
              surface clear — draw something
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-4 pb-4 font-mono text-xs uppercase tracking-label sm:px-6">
          <span className="text-green-500/35">strokes :: {count}</span>
          <span className={saved ? "text-green-500/35" : "text-amber-500/60"}>
            {saved ? "autosaved local" : "unsaved"}
          </span>
        </div>
      </div>

      <HazardStripe position="bottom" />
    </div>
  );
}
