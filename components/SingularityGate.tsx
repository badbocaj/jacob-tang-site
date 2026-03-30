"use client";

import { useEffect, useRef, useState } from "react";

// ─── CONFIGURATION ─────────────────────────────────────────────────────────────
const SKILLS_DATABASE = [
  "DFM",
  "Structures",
  "MATLAB",
  "Python",
  "SolidWorks",
  "FEA",
  "GD&T",
  "Propulsion",
  "Heat Transfer",
  "CAD",
];

// ─── TIMING (seconds) ─────────────────────────────────────────────────────────
const T_FADE_IN      = 0.45;
const T_PHASE2_START = 1.5;
const T_PHASE3_START = 3.0;
const T_FLASH_IN     = 0.32;
const T_FLASH_OUT    = 0.55;

// ─── PARTICLE TYPE ─────────────────────────────────────────────────────────────
interface Particle {
  text: string;
  // Spherical orbit (Phase 1)
  theta: number;
  phi: number;
  orbitRadius: number;
  rotSpeed: number;
  thetaDrift: number;
  // World-space position + velocity (Phase 2 physics)
  x: number;
  y: number;
  vx: number;
  vy: number;
  collapsed: boolean;
  // Rendering
  baseSize: number;
  baseOpacity: number;
  stretchFactor: number;
  // ── Smooth transition helpers ──────────────────────────────────────────
  // lastScale: depth scale stored at the end of Phase 1 so Phase 2 can
  //            lerp the font size from its depth-adjusted value back to base,
  //            eliminating the size-snap at the phase boundary.
  lastScale: number;
  // currentRotation: canvas rotation angle, blended toward the center-facing
  //                  direction proportional to speed. Starts at 0 (horizontal)
  //                  so text doesn't snap-rotate on the first Phase-2 frame.
  currentRotation: number;
}

export default function SingularityGate() {
  const [visible, setVisible]   = useState(true);
  const canvasRef               = useRef<HTMLCanvasElement>(null);
  const [flash, setFlash]       = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Responsive canvas ────────────────────────────────────────────────
    const syncSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    syncSize();
    window.addEventListener("resize", syncSize);

    const cx    = () => canvas.width  / 2;
    const cy    = () => canvas.height / 2;
    const baseR = () => Math.min(canvas.width, canvas.height) * 0.27;

    // ── Particle initialisation ──────────────────────────────────────────
    const particles: Particle[] = SKILLS_DATABASE.map((text) => ({
      text,
      theta:           Math.acos(2 * Math.random() - 1),
      phi:             Math.random() * Math.PI * 2,
      orbitRadius:     baseR() * (0.6 + Math.random() * 0.5),
      rotSpeed:        (0.22 + Math.random() * 0.45) * (Math.random() > 0.5 ? 1 : -1),
      thetaDrift:      (Math.random() - 0.5) * 0.4,
      x: cx(), y: cy(),
      vx: 0, vy: 0,
      collapsed:       false,
      baseSize:        12 + Math.floor(Math.random() * 5),
      baseOpacity:     0.5 + Math.random() * 0.5,
      stretchFactor:   1,
      lastScale:       1,       // will be set correctly by the first Phase-1 frame
      currentRotation: 0,       // starts horizontal; blends toward center as speed builds
    }));

    // ── Sphere → screen projection ───────────────────────────────────────
    const project = (p: Particle, elapsed: number) => {
      const phi3d  = p.phi   + elapsed * p.rotSpeed;
      const theta3 = p.theta + p.thetaDrift * elapsed * 0.06;
      const sx     = p.orbitRadius * Math.sin(theta3) * Math.cos(phi3d);
      const sy     = p.orbitRadius * Math.cos(theta3);
      const sz     = p.orbitRadius * Math.sin(theta3) * Math.sin(phi3d);
      const fov    = Math.min(canvas.width, canvas.height) * 0.65;
      const scale  = fov / (fov + sz + p.orbitRadius);
      return { x: cx() + sx * scale, y: cy() + sy * scale, scale };
    };

    // ── Loop state ───────────────────────────────────────────────────────
    let startTs   = 0;
    let mainRaf   = 0;
    let flashRaf  = 0;
    let phase3Lit = false;

    // ── Main render loop ─────────────────────────────────────────────────
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;

      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);

      /* ══════════════════════════════════════════════════════════════════
       *  PHASE 1 — Orbiting data cloud  (0 → T_PHASE2_START)
       * ══════════════════════════════════════════════════════════════════ */
      if (t < T_PHASE2_START) {
        const fadeIn = Math.min(t / T_FADE_IN, 1);

        for (const p of particles) {
          const { x, y, scale } = project(p, t);

          // Store current 2D pos AND depth scale — Phase 2 reads both.
          p.x         = x;
          p.y         = y;
          p.lastScale = scale;

          const alpha    = p.baseOpacity * fadeIn * Math.max(0.18, scale);
          const fontSize = Math.round(p.baseSize * Math.max(0.5, scale));

          ctx.save();
          ctx.globalAlpha  = Math.min(alpha, 1);
          ctx.font         = `${fontSize}px "Roboto Mono", "Courier New", monospace`;
          ctx.fillStyle    = "#00FFFF";
          ctx.shadowColor  = "#00FFFF";
          ctx.shadowBlur   = 16 * scale;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, x, y);
          ctx.restore();
        }
      }

      /* ══════════════════════════════════════════════════════════════════
       *  PHASE 2 — Gravitational collapse + spaghettification
       *            (T_PHASE2_START → T_PHASE3_START)
       *
       *  Smooth transition strategy
       *  ──────────────────────────
       *  • Font size: lerps from depth-adjusted (lastScale) → base over
       *    the first 30% of Phase 2 so there is no size-snap.
       *  • Rotation: blended toward the center-facing angle proportional to
       *    current speed. At v≈0 the text stays horizontal; it only rotates
       *    into the inward orientation as gravity actually builds velocity.
       *  • Stretch / y-compression: stretchFactor only grows once speed
       *    clears a small dead-zone (0.4 px/frame), and sy is exactly 1
       *    when sx = 1, removing the Phase-1 frame compression glitch.
       * ══════════════════════════════════════════════════════════════════ */
      if (t >= T_PHASE2_START && t < T_PHASE3_START) {
        const progress  = (t - T_PHASE2_START) / (T_PHASE3_START - T_PHASE2_START);
        const gravForce = 0.015 * Math.exp(progress * 4.8);

        // Singularity core glow
        const coreR = 6 + progress * 75;
        const coreA = progress * 0.92;
        const coreG = ctx.createRadialGradient(cx(), cy(), 0, cx(), cy(), coreR);
        coreG.addColorStop(0,    `rgba(255,255,255,${coreA.toFixed(3)})`);
        coreG.addColorStop(0.3,  `rgba(80,255,255,${(coreA * 0.7).toFixed(3)})`);
        coreG.addColorStop(0.65, `rgba(0,255,255,${(coreA * 0.25).toFixed(3)})`);
        coreG.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.save();
        ctx.fillStyle = coreG;
        ctx.fillRect(cx() - coreR, cy() - coreR, coreR * 2, coreR * 2);
        ctx.restore();

        for (const p of particles) {
          if (p.collapsed) continue;

          const dx   = cx() - p.x;
          const dy   = cy() - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 5) { p.collapsed = true; continue; }

          // ── Physics ─────────────────────────────────────────────────
          const nx    = dx / dist;
          const ny    = dy / dist;
          const accel = gravForce / (dist * 0.013 + 0.04);
          p.vx += nx * accel;
          p.vy += ny * accel;
          p.x  += p.vx;
          p.y  += p.vy;

          const speed = Math.hypot(p.vx, p.vy);

          // ── Rotation blend ──────────────────────────────────────────
          // Angle that points the text's long axis toward the singularity.
          const targetAngle = Math.atan2(cy() - p.y, cx() - p.x);
          // Shortest-path angle difference (handles -π/+π wrap)
          let dAngle = targetAngle - p.currentRotation;
          if (dAngle >  Math.PI) dAngle -= Math.PI * 2;
          if (dAngle < -Math.PI) dAngle += Math.PI * 2;
          // Blend rate is proportional to speed — stays 0 at rest, ramps up
          const rotBlend = Math.min(speed * 0.10, 0.45);
          p.currentRotation += dAngle * rotBlend;

          // ── Stretch factor ───────────────────────────────────────────
          // Dead zone: no stretch until speed > 0.4 px/frame so the first
          // few frames coming out of the orbit look normal.
          const effectiveSpeed = Math.max(0, speed - 0.4);
          p.stretchFactor = 1 + effectiveSpeed * 0.22;

          // ── Font size ────────────────────────────────────────────────
          // Lerp from depth-adjusted size (lastScale) to base over the
          // first 30 % of Phase 2, then hold at base.
          const sizeLerp    = Math.min(progress / 0.30, 1);
          const liveScale   = p.lastScale + (1 - p.lastScale) * sizeLerp;
          const fontSize    = Math.round(p.baseSize * Math.max(0.5, liveScale));

          // ── Alpha ────────────────────────────────────────────────────
          const maxDist = Math.min(W, H) * 0.32;
          const fadeOut = Math.pow(Math.min(dist / maxDist, 1), 0.75);
          const alpha   = p.baseOpacity * fadeOut;
          if (alpha < 0.01) continue;

          // ── Draw ─────────────────────────────────────────────────────
          const sx = p.stretchFactor;
          // sy = 1 when sx = 1 (no compression until stretching begins)
          const sy = sx > 1.001
            ? Math.max(0.04, 1 / (sx * 0.55))
            : 1;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.currentRotation);
          ctx.scale(sx, sy);
          ctx.globalAlpha  = alpha;
          ctx.font         = `${fontSize}px "Roboto Mono", "Courier New", monospace`;
          ctx.fillStyle    = "#00FFFF";
          ctx.shadowColor  = "#00FFFF";
          ctx.shadowBlur   = 10;
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, 0, 0);
          ctx.restore();
        }
      }

      /* ══════════════════════════════════════════════════════════════════
       *  PHASE 3 — Flash in → Flash out → unmount
       * ══════════════════════════════════════════════════════════════════ */
      if (t >= T_PHASE3_START && !phase3Lit) {
        phase3Lit = true;

        let flashInStart  = 0;
        let flashOutStart = 0;

        const animateFlashIn = (fts: number) => {
          if (!flashInStart) flashInStart = fts;
          const fp = Math.min((fts - flashInStart) / (T_FLASH_IN * 1000), 1);
          setFlash(fp);

          if (fp < 1) {
            flashRaf = requestAnimationFrame(animateFlashIn);
          } else {
            // Peak white — now fade back out to reveal the page
            const animateFlashOut = (ots: number) => {
              if (!flashOutStart) flashOutStart = ots;
              const op = 1 - Math.min((ots - flashOutStart) / (T_FLASH_OUT * 1000), 1);
              setFlash(op);
              if (op > 0) {
                flashRaf = requestAnimationFrame(animateFlashOut);
              } else {
                setVisible(false); // gate unmounts, page is revealed
              }
            };
            flashRaf = requestAnimationFrame(animateFlashOut);
          }
        };

        flashRaf = requestAnimationFrame(animateFlashIn);
      }

      if (t < T_PHASE3_START + T_FLASH_IN + T_FLASH_OUT + 0.1) {
        mainRaf = requestAnimationFrame(tick);
      }
    };

    mainRaf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(mainRaf);
      cancelAnimationFrame(flashRaf);
      window.removeEventListener("resize", syncSize);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ zIndex: 9999, background: "#000000" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-white"
        style={{ opacity: flash, willChange: "opacity" }}
      />
    </div>
  );
}
