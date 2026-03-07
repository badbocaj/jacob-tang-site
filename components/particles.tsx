"use client";

import { useEffect, useMemo, useRef } from "react";

export type ParticlesProps = {
  particleColors?: string[];
  particleCount?: number;
  /** Percentage of min(viewportWidth, viewportHeight) used as hover influence radius. */
  particleSpread?: number;
  /** Base drift speed scalar. */
  speed?: number;
  /**
   * Interpreted as a scale factor for star radius in pixels.
   * Values around 40-80 tend to look good for "stars".
   */
  particleBaseSize?: number;
  moveParticlesOnHover?: boolean;
  alphaParticles?: boolean;
  disableRotation?: boolean;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;
  r: number;
  color: string;
  a: number;
};

export default function Particles({
  particleColors = ["#ffffff"],
  particleCount = 250,
  particleSpread = 15,
  speed = 0.05,
  particleBaseSize = 60,
  moveParticlesOnHover = true,
  alphaParticles = true,
  disableRotation = false,
  className,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const colors = useMemo(
    () => (particleColors.length ? particleColors : ["#ffffff"]),
    [particleColors],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent?.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      height = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const baseR = Math.max(0.15, particleBaseSize / 100);
      particles = Array.from({ length: particleCount }, (_, i) => {
        const z = Math.random();
        const dir = Math.random() * Math.PI * 2;
        const mag = (0.25 + z) * (0.6 + Math.random() * 0.8);
        const r = baseR * (0.8 + z * 2.0);
        const a = alphaParticles ? 0.25 + z * 0.75 : 1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(dir) * mag,
          vy: Math.sin(dir) * mag,
          z,
          r,
          color: colors[i % colors.length],
          a,
        };
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
      pointerRef.current.active = true;
    };

    const onPointerLeave = () => {
      pointerRef.current.active = false;
    };

    let last = performance.now();
    const tick = (now: number) => {
      const dtMs = Math.min(48, Math.max(0, now - last));
      last = now;
      const dt = dtMs / 16.6667; // normalized ~frames

      ctx.clearRect(0, 0, width, height);

      const p = pointerRef.current;
      const minDim = Math.min(width, height);
      const hoverRadius = (Math.max(0, particleSpread) / 100) * minDim;
      const hoverRadius2 = hoverRadius * hoverRadius;

      const cx = width / 2;
      const cy = height / 2;
      const rot = !disableRotation ? 0.0006 * dt : 0;
      const cos = rot ? Math.cos(rot) : 1;
      const sin = rot ? Math.sin(rot) : 0;

      for (const s of particles) {
        // drift
        const drift = speed * (0.6 + s.z * 1.4);
        s.x += s.vx * drift * dt * 6;
        s.y += s.vy * drift * dt * 6;

        // optional slow rotation around center
        if (rot) {
          const dx = s.x - cx;
          const dy = s.y - cy;
          s.x = cx + dx * cos - dy * sin;
          s.y = cy + dx * sin + dy * cos;
        }

        // hover interaction
        if (moveParticlesOnHover && p.active && hoverRadius > 0) {
          const dx = s.x - p.x;
          const dy = s.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < hoverRadius2) {
            const t = 1 - d2 / hoverRadius2;
            // gentle repulsion, stronger for closer particles
            s.x += (dx / (Math.sqrt(d2) + 0.0001)) * t * (0.25 + s.z) * 1.2;
            s.y += (dy / (Math.sqrt(d2) + 0.0001)) * t * (0.25 + s.z) * 1.2;
          }
        }

        // wrap
        if (s.x < -10) s.x = width + 10;
        else if (s.x > width + 10) s.x = -10;
        if (s.y < -10) s.y = height + 10;
        else if (s.y > height + 10) s.y = -10;

        // draw
        ctx.globalAlpha = s.a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [
    alphaParticles,
    colors,
    disableRotation,
    moveParticlesOnHover,
    particleBaseSize,
    particleCount,
    particleSpread,
    speed,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}