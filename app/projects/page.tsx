"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Config ───────────────────────────────────────────────────────────────────

const PROJECT_COUNT = 3;
const TARGET_PROJECT = "MAIIA";
const PING_COORDS = [
  { r: 0.4, theta: 45 },
  { r: 0.8, theta: 135 },
  { r: 0.5, theta: 280 },
];

// ─── Internal constants ───────────────────────────────────────────────────────

const TARGET_IDX = PING_COORDS.length - 1;
// 280° / 1.7°per-frame ≈ 165f = 2.75s scan + 0.7s lock + 0.5s expand ≈ 4.0s total
const SWEEP_SPEED = 1.7;
const LOCK_THRESHOLD = 2;

type Phase = "scanning" | "locked" | "expanding";

interface PingState {
  active: boolean;
  opacity: number;
  pulsePhase: number;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────

function normalizeAngle(a: number): number {
  return ((a % 360) + 360) % 360;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

function drawBase(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number) {
  for (let i = 1; i <= 4; i++) {
    const r = (R * i) / 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (i === 4) {
      ctx.strokeStyle = "rgba(34,211,238,0.55)";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(34,211,238,0.35)";
    } else {
      ctx.strokeStyle = "rgba(34,211,238,0.14)";
      ctx.lineWidth = 0.7;
      ctx.shadowBlur = 0;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (i < 4) {
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(34,211,238,0.28)";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i * 25}km`, cx + r + 5, cy - 3);
    }
  }

  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = "rgba(34,211,238,0.1)";
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
  ctx.setLineDash([]);

  for (const deg of [45, 135, 225, 315]) {
    const rad = toRad(deg);
    ctx.setLineDash([2, 9]);
    ctx.strokeStyle = "rgba(34,211,238,0.06)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(rad), cy + R * Math.sin(rad));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  for (let i = 0; i < 72; i++) {
    const deg = i * 5;
    const rad = toRad(deg);
    const major = i % 9 === 0;
    const inner = R * (major ? 0.92 : 0.965);
    ctx.beginPath();
    ctx.moveTo(cx + inner * Math.cos(rad), cy + inner * Math.sin(rad));
    ctx.lineTo(cx + R * Math.cos(rad), cy + R * Math.sin(rad));
    ctx.strokeStyle = major ? "rgba(34,211,238,0.55)" : "rgba(34,211,238,0.2)";
    ctx.lineWidth = major ? 1.5 : 0.5;
    ctx.stroke();
  }

  const dist = R + 20;
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "rgba(34,211,238,0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", cx, cy - dist);
  ctx.fillText("E", cx + dist, cy);
  ctx.fillText("S", cx, cy + dist);
  ctx.fillText("W", cx - dist, cy);

  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(34,211,238,0.9)";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#22d3ee";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawSweep(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, angleDeg: number) {
  const angleRad = toRad(angleDeg);
  const trailRad = toRad(70);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  grad.addColorStop(0, "rgba(34,211,238,0.22)");
  grad.addColorStop(0.55, "rgba(34,211,238,0.1)");
  grad.addColorStop(1, "rgba(34,211,238,0)");

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, angleRad - trailRad, angleRad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + R * Math.cos(angleRad), cy + R * Math.sin(angleRad));
  ctx.strokeStyle = "rgba(34,211,238,0.92)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 14;
  ctx.shadowColor = "#22d3ee";
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawPing(ctx: CanvasRenderingContext2D, px: number, py: number, opacity: number, pulsePhase: number) {
  const pulse = (Math.sin(pulsePhase) + 1) / 2;
  const ringR = 5 + pulse * 11;

  ctx.beginPath();
  ctx.arc(px, py, ringR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(34,211,238,${opacity * 0.55 * (1 - pulse * 0.85)})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255,255,255,${opacity * 0.7})`;
  ctx.shadowBlur = 12 * opacity;
  ctx.shadowColor = "#22d3ee";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(34,211,238,${opacity})`;
  ctx.shadowBlur = 16 * opacity;
  ctx.shadowColor = "#22d3ee";
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawTargetBracket(ctx: CanvasRenderingContext2D, px: number, py: number, frame: number) {
  const sz = 17;
  const arm = 8;
  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.09);

  ctx.strokeStyle = `rgba(34,211,238,${pulse})`;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#22d3ee";

  ctx.beginPath(); ctx.moveTo(px - sz + arm, py - sz); ctx.lineTo(px - sz, py - sz); ctx.lineTo(px - sz, py - sz + arm); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + sz - arm, py - sz); ctx.lineTo(px + sz, py - sz); ctx.lineTo(px + sz, py - sz + arm); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px - sz, py + sz - arm); ctx.lineTo(px - sz, py + sz); ctx.lineTo(px - sz + arm, py + sz); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + sz - arm, py + sz); ctx.lineTo(px + sz, py + sz); ctx.lineTo(px + sz, py + sz - arm); ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.lineCap = "butt";

  ctx.font = `bold 10px monospace`;
  ctx.fillStyle = `rgba(34,211,238,${pulse})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#22d3ee";
  ctx.fillText(TARGET_PROJECT, px, py + sz + 6);
  ctx.shadowBlur = 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const sweepAngleRef = useRef(0);
  const pingsRef = useRef<PingState[]>(
    PING_COORDS.map(() => ({ active: false, opacity: 0, pulsePhase: 0 }))
  );
  const phaseRef = useRef<Phase>("scanning");
  const lockTriggeredRef = useRef(false);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);
  const redirectedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("scanning");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [expandRadius, setExpandRadius] = useState(0);

  const addLine = useCallback((line: string) => {
    setTerminalLines((prev) => [...prev, line]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      frameRef.current++;
      drawBase(ctx, cx, cy, R);

      if (phaseRef.current === "scanning") {
        sweepAngleRef.current = (sweepAngleRef.current + SWEEP_SPEED) % 360;

        PING_COORDS.forEach((ping, i) => {
          if (!pingsRef.current[i].active) {
            const diff = normalizeAngle(sweepAngleRef.current - ping.theta);
            if (diff < 4 && diff >= 0) {
              pingsRef.current[i].active = true;
            }
          }
        });

        if (!lockTriggeredRef.current) {
          const target = PING_COORDS[TARGET_IDX];
          const diff = normalizeAngle(sweepAngleRef.current - target.theta);
          if (diff < LOCK_THRESHOLD && diff >= 0 && pingsRef.current[TARGET_IDX].active) {
            lockTriggeredRef.current = true;
            phaseRef.current = "locked";
            setPhase("locked");
          }
        }

        drawSweep(ctx, cx, cy, R, sweepAngleRef.current);
      }

      pingsRef.current.forEach((ping, i) => {
        if (ping.active) {
          ping.pulsePhase += 0.07;
          if (ping.opacity < 1) ping.opacity = Math.min(1, ping.opacity + 0.05);
        }
        if (ping.opacity > 0) {
          const coord = PING_COORDS[i];
          const px = cx + coord.r * R * Math.cos(toRad(coord.theta));
          const py = cy + coord.r * R * Math.sin(toRad(coord.theta));
          drawPing(ctx, px, py, ping.opacity, ping.pulsePhase);
        }
      });

      if (phaseRef.current === "locked" || phaseRef.current === "expanding") {
        const coord = PING_COORDS[TARGET_IDX];
        const px = cx + coord.r * R * Math.cos(toRad(coord.theta));
        const py = cy + coord.r * R * Math.sin(toRad(coord.theta));
        drawTargetBracket(ctx, px, py, frameRef.current);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => addLine("> SCANNING_SECTOR..."), 300);
    const t2 = setTimeout(() => addLine(`> ${PROJECT_COUNT} SIGNATURES DETECTED.`), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [addLine]);

  useEffect(() => {
    if (phase !== "locked") return;
    addLine(`> LOCKING_ON: [${TARGET_PROJECT}] // INITIALIZING_DATA_STREAM...`);
    const t = setTimeout(() => {
      phaseRef.current = "expanding";
      setPhase("expanding");
    }, 700);
    return () => clearTimeout(t);
  }, [phase, addLine]);

  useEffect(() => {
    if (phase !== "expanding") return;
    let raf: number;
    const maxR = Math.hypot(window.innerWidth, window.innerHeight);
    let r = 0;
    const speed = maxR / 32;

    const step = () => {
      r = Math.min(r + speed, maxR + 20);
      setExpandRadius(r);
      if (r < maxR + 20) {
        raf = requestAnimationFrame(step);
      } else if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.push("/projects/maiia");
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, router]);

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 border-b border-cyan-400/10">
        <span className="font-mono text-xs text-cyan-400/40 tracking-label uppercase">
          SECTOR_SCAN :: ACTIVE
        </span>
        <span className="font-mono text-xs text-cyan-400/25 tracking-label">
          {phase === "scanning" ? "SWEEPING..." : phase === "locked" ? "TARGET ACQUIRED" : "ENGAGING..."}
        </span>
      </div>

      {phase === "expanding" && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: expandRadius * 2,
            height: expandRadius * 2,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(34,211,238,0.95) 40%, rgba(34,211,238,0) 100%)",
            boxShadow: "0 0 100px rgba(34,211,238,0.7), 0 0 40px rgba(255,255,255,0.5)",
          }}
        />
      )}

      <div className="absolute bottom-8 left-8 z-10 space-y-1">
        {terminalLines.map((line, i) => {
          const isLockLine = line.startsWith("> LOCKING_ON");
          const isOld = i < terminalLines.length - 1 && !isLockLine;
          return (
            <div
              key={i}
              className={
                isLockLine
                  ? "font-mono text-xs text-white animate-pulse"
                  : isOld
                  ? "font-mono text-xs text-cyan-400/45"
                  : "font-mono text-xs text-cyan-300"
              }
              style={{
                textShadow: isLockLine
                  ? "0 0 14px rgba(255,255,255,0.9)"
                  : "0 0 10px rgba(34,211,238,0.7)",
              }}
            >
              {line}
            </div>
          );
        })}
        {phase === "scanning" && (
          <span
            className="inline-block w-[7px] h-[12px] bg-cyan-400"
            style={{ animation: "pulse 0.9s step-start infinite" }}
          />
        )}
      </div>
    </div>
  );
}
