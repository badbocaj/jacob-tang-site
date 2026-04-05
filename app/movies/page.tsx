'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Data ─────────────────────────────────────────────────────────────────────
const CASES = [
  { id: 'all-reviews',  label: 'All Reviews',      img: '/movies/all-reviews.jpg'  },
  { id: 'favorite',     label: 'Favorite Movie',    img: '/movies/favorite.jpg'     },
  { id: 'origin',       label: 'The Origin Story',  img: '/movies/origin.jpg'       },
  { id: 'on-my-mind',   label: 'On My Mind',        img: '/movies/on-my-mind.jpg'   },
] as const

// Deterministic star positions — avoids hydration mismatches
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id:  i,
  x:   ((i * 7919 + 1013) % 10000) / 100,
  y:   ((i * 6271 + 2017) % 10000) / 100,
  r:   (i % 4) * 0.55 + 0.35,
  o:   ((i * 3 + 2) % 6 + 1) / 17,
}))

// ─── Sub-components ───────────────────────────────────────────────────────────

function VaultDial() {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const angle = i * 10
    const rad   = ((angle - 90) * Math.PI) / 180
    const major  = i % 9 === 0
    const medium = i % 3 === 0
    const r1 = major ? 69 : medium ? 73 : 77
    return {
      i,
      x1: Number((100 + r1 * Math.cos(rad)).toFixed(3)),
      y1: Number((100 + r1 * Math.sin(rad)).toFixed(3)),
      x2: Number((100 + 86 * Math.cos(rad)).toFixed(3)),
      y2: Number((100 + 86 * Math.sin(rad)).toFixed(3)),
      stroke: major ? '#7090e0' : medium ? '#3a4e90' : '#1e2a55',
      sw: major ? 2.5 : medium ? 1.5 : 1,
    }
  })

  return (
    <svg
      viewBox="0 0 200 200"
      width="100%"
      height="100%"
      style={{ filter: 'drop-shadow(0 0 28px rgba(70,120,255,0.5)) drop-shadow(0 0 8px rgba(50,90,220,0.35))' }}
    >
      <defs>
        <radialGradient id="dialFace" cx="38%" cy="32%" r="65%">
          <stop offset="0%"   stopColor="#3a4e78" />
          <stop offset="50%"  stopColor="#1c2645" />
          <stop offset="100%" stopColor="#080f22" />
        </radialGradient>
        <radialGradient id="hubGrad" cx="35%" cy="35%">
          <stop offset="0%"   stopColor="#90a8f0" />
          <stop offset="100%" stopColor="#2c40b0" />
        </radialGradient>
        <radialGradient id="bezel" cx="50%" cy="50%" r="50%">
          <stop offset="80%"  stopColor="#0f1628" />
          <stop offset="100%" stopColor="#1c2848" />
        </radialGradient>
      </defs>

      {/* Outer bezel ring */}
      <circle cx="100" cy="100" r="97" fill="url(#bezel)" stroke="#253060" strokeWidth="2" />
      <circle cx="100" cy="100" r="90" fill="none"         stroke="#182040" strokeWidth="0.75" />

      {/* Tick marks */}
      {ticks.map(t => (
        <line
          key={t.i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.stroke} strokeWidth={t.sw} strokeLinecap="round"
        />
      ))}

      {/* Dial face */}
      <circle cx="100" cy="100" r="68" fill="url(#dialFace)" />
      <circle cx="100" cy="100" r="67" fill="none" stroke="#2a3870" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="51" fill="none" stroke="#18254a" strokeWidth="0.75" />

      {/* Crosshair etching */}
      <line x1="53"  y1="100" x2="147" y2="100" stroke="#18254a" strokeWidth="0.5" opacity="0.55" />
      <line x1="100" y1="53"  x2="100" y2="147" stroke="#18254a" strokeWidth="0.5" opacity="0.55" />
      <line x1="68"  y1="68"  x2="74"  y2="74"  stroke="#18254a" strokeWidth="0.5" opacity="0.4" />
      <line x1="132" y1="68"  x2="126" y2="74"  stroke="#18254a" strokeWidth="0.5" opacity="0.4" />
      <line x1="68"  y1="132" x2="74"  y2="126" stroke="#18254a" strokeWidth="0.5" opacity="0.4" />
      <line x1="132" y1="132" x2="126" y2="126" stroke="#18254a" strokeWidth="0.5" opacity="0.4" />

      {/* Center hub */}
      <circle cx="100" cy="100" r="14" fill="url(#hubGrad)" />
      <circle cx="100" cy="100" r="14" fill="none" stroke="#6080d8" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="5.5" fill="#c0d0ff" opacity="0.95" />

      {/* Top pointer */}
      <polygon points="100,7 95.5,20 104.5,20" fill="#8090e0" />
      <polygon points="100,7 95.5,20 104.5,20" fill="none" stroke="#a0b8f8" strokeWidth="0.5" />
    </svg>
  )
}

function DoorPanel({ side }: { side: 'left' | 'right' }) {
  const isLeft  = side === 'left'
  const bolts   = [0.12, 0.28, 0.44, 0.60, 0.76, 0.92]
  const grooves = [0.20, 0.38, 0.56, 0.74]

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{
        background: isLeft
          ? 'linear-gradient(to right, #090e1d, #141e36, #0f1728)'
          : 'linear-gradient(to left,  #090e1d, #141e36, #0f1728)',
      }}
    >
      {/* Structural horizontal grooves */}
      {grooves.map(pos => (
        <div key={pos} className="absolute left-0 right-0" style={{
          top: `${pos * 100}%`,
          height: 1.5,
          background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, transparent, rgba(40,60,120,0.5) 25%, rgba(50,75,140,0.3) 70%, transparent)`,
        }} />
      ))}

      {/* Vertical inner panel lines */}
      {[0.18, 0.45, 0.72].map(x => (
        <div key={x} className="absolute top-0 bottom-0" style={{
          [isLeft ? 'right' : 'left']: `${x * 100}%`,
          width: 1,
          background: `linear-gradient(to bottom, transparent, rgba(30,50,100,0.3) 20%, rgba(30,50,100,0.3) 80%, transparent)`,
        }} />
      ))}

      {/* Rivet bolts along seam edge */}
      {bolts.map(y => (
        <div key={y} className="absolute rounded-full" style={{
          [isLeft ? 'right' : 'left']: 18,
          top: `${y * 100}%`,
          width: 9, height: 9,
          transform: 'translate(50%, -50%)',
          background: 'radial-gradient(circle at 33% 33%, #4e62a2, #15203e)',
          border: '1px solid #303e72',
          boxShadow: '0 0 5px rgba(50,70,150,0.25)',
        }} />
      ))}

      {/* Seam glow edge */}
      <div
        className={`absolute top-0 bottom-0 ${isLeft ? 'right-0' : 'left-0'}`}
        style={{
          width: 3,
          background: isLeft
            ? 'linear-gradient(to right, #1e2e60, #3a4e90)'
            : 'linear-gradient(to left,  #1e2e60, #3a4e90)',
          boxShadow: isLeft
            ? '2px 0 14px rgba(60,90,200,0.3)'
            : '-2px 0 14px rgba(60,90,200,0.3)',
        }}
      />

      {/* Panel sheen */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isLeft
          ? 'linear-gradient(to right, rgba(255,255,255,0.02) 0%, transparent 40%)'
          : 'linear-gradient(to left,  rgba(255,255,255,0.02) 0%, transparent 40%)',
      }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  // Animation state machine:
  // dialDone=false → dial spins 720°
  // dialDone=true  → doors slide + container scales → setShowVault(false)
  // showVault=false → AnimatePresence exit (fade) → trophy room fades in
  const [dialDone,   setDialDone]   = useState(false)
  const [showVault,  setShowVault]  = useState(true)
  const [hovered,    setHovered]    = useState<string | null>(null)

  return (
    <div className="relative w-full overflow-hidden" style={{ background: '#05070a', height: 'calc(100dvh - 64px)', marginTop: '64px' }}>

      {/* ════════════════════════════════════════════════════════════
          TROPHY ROOM  (always in DOM; fades in when vault exits)
      ════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative w-full h-full flex flex-col items-center"
        animate={{ opacity: !showVault ? 1 : 0 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
      >
        {/* Cosmic nebula layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse 100% 70% at 50% 95%, rgba(6,20,70,0.75) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse 45% 40% at 18% 70%, rgba(18,4,55,0.38) 0%, transparent 60%)' }} />
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse 45% 40% at 82% 70%, rgba(4,14,65,0.38) 0%, transparent 60%)' }} />
          <div style={{ position:'absolute', inset:0,
            background:'radial-gradient(ellipse 55% 30% at 50% 50%, rgba(10,25,80,0.25) 0%, transparent 65%)' }} />
        </div>

        {/* Ambient star field */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {STARS.slice(0, 65).map(s => (
            <div
              key={s.id}
              className="absolute rounded-full"
              style={{
                left:`${s.x}%`, top:`${s.y}%`,
                width:`${s.r}px`, height:`${s.r}px`,
                background:'white', opacity: s.o * 0.5,
              }}
            />
          ))}
        </div>

        {/* Floor atmospheric glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background:'linear-gradient(to top, rgba(4,12,45,0.65) 0%, transparent 100%)' }}
        />

        {/* Header */}
        <div className="relative z-10 pt-8 pb-4 text-center px-6">
          <p
            className="font-mono text-[8px] uppercase mb-4"
            style={{ color:'#1e2e62', letterSpacing:'0.65em' }}
          >
            ◈ COSMIC VAULT — SECTOR 7 ◈
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-none"
            style={{ textShadow:'0 0 70px rgba(55,95,215,0.38)' }}
          >
            The Trophy Room
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-28"
              style={{ background:'linear-gradient(to right, transparent, rgba(45,75,175,0.5))' }} />
            <p
              className="font-mono text-[9px] uppercase"
              style={{ color:'#283e85', letterSpacing:'0.4em' }}
            >
              CINEMATIC ARCHIVES
            </p>
            <div className="h-px flex-1 max-w-28"
              style={{ background:'linear-gradient(to left, transparent, rgba(45,75,175,0.5))' }} />
          </div>
        </div>

        {/* Trophy Cases */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 pb-8">
          <div className="flex gap-4 md:gap-6 lg:gap-10 items-end flex-wrap justify-center">
            {CASES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 60 }}
                animate={!showVault ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ delay: 0.4 + i * 0.13, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col items-center cursor-default select-none"
                onMouseEnter={() => setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* ── Spotlight cone ── */}
                <div className="relative flex-shrink-0" style={{ width: 148, height: 178 }}>
                  <motion.div
                    className="absolute inset-0"
                    style={{ clipPath:'polygon(37% 0%, 63% 0%, 100% 100%, 0% 100%)' }}
                    animate={{ opacity: hovered === c.id ? 1 : 0.38 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background:'linear-gradient(to bottom, rgba(175,220,255,0.52) 0%, rgba(85,150,255,0.05) 100%)',
                      }}
                    />
                  </motion.div>

                  {/* Light source bulb */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{ marginTop: -5, width: 8, height: 8 }}
                    animate={{
                      background: hovered === c.id
                        ? 'rgba(235,248,255,1)'
                        : 'rgba(190,220,255,0.6)',
                      boxShadow: hovered === c.id
                        ? '0 0 14px 7px rgba(140,205,255,0.65)'
                        : '0 0 7px 3px rgba(120,180,255,0.28)',
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* ── Movie cover (levitates on hover) ── */}
                <motion.div
                  animate={{ y: hovered === c.id ? -16 : 0 }}
                  transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    filter: hovered === c.id
                      ? 'drop-shadow(0 20px 36px rgba(0,148,255,0.62)) drop-shadow(0 0 14px rgba(0,120,230,0.4))'
                      : 'drop-shadow(0 10px 22px rgba(0,0,0,0.88))',
                    transition: 'filter 0.45s ease',
                  }}
                >
                  {/* Display case frame */}
                  <div style={{
                    width: 130, height: 194,
                    border: '1.5px solid rgba(42,72,158,0.52)',
                    borderRadius: 3,
                    background: '#050a18',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {/* Movie image */}
                    <img
                      src={c.img}
                      alt={c.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ opacity: 0.9 }}
                    />
                    {/* Glass sheen overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background:'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
                    }} />
                    {/* Bottom shadow vignette */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none" style={{
                      background:'linear-gradient(to top, rgba(0,0,0,0.42), transparent)',
                    }} />
                  </div>
                </motion.div>

                {/* ── Pedestal ── */}
                {/* Top tier */}
                <div style={{
                  width: 148, height: 9,
                  background: 'linear-gradient(180deg, #192640, #0d1828)',
                  borderRadius: '2px 2px 0 0',
                  border: '1px solid rgba(38,62,132,0.52)',
                  borderBottom: 'none',
                }} />
                {/* Base tier */}
                <div style={{
                  width: 163, height: 7,
                  background: 'linear-gradient(180deg, #0d1828, #070e1c)',
                  borderRadius: '0 0 2px 2px',
                  border: '1px solid rgba(28,48,108,0.42)',
                  borderTop: 'none',
                  boxShadow: '0 6px 22px rgba(0,0,0,0.72)',
                }} />

                {/* ── Label ── */}
                <motion.p
                  className="mt-5 font-mono text-[9px] uppercase text-center"
                  style={{ letterSpacing:'0.3em' }}
                  animate={{ color: hovered === c.id ? '#88bcff' : '#2b3e72' }}
                  transition={{ duration: 0.35 }}
                >
                  {c.label}
                </motion.p>

                {/* Floor glow under pedestal */}
                <motion.div
                  className="absolute -bottom-5"
                  style={{
                    width: 118, height: 8,
                    left: '50%', transform: 'translateX(-50%)',
                    background: 'radial-gradient(ellipse, rgba(28,75,180,0.28) 0%, transparent 70%)',
                    filter: 'blur(5px)',
                  }}
                  animate={{ opacity: hovered === c.id ? 1 : 0.28 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════
          VAULT OVERLAY  (covers everything; exits when open)
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showVault && (
          <motion.div
            className="fixed inset-0 z-[60] overflow-hidden"
            style={{ background: '#05070a' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: 'easeInOut' }}
          >
            {/* Full star field */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {STARS.map(s => (
                <div
                  key={s.id}
                  className="absolute rounded-full"
                  style={{
                    left:`${s.x}%`, top:`${s.y}%`,
                    width:`${s.r}px`, height:`${s.r}px`,
                    background:'white', opacity: s.o,
                  }}
                />
              ))}
            </div>

            {/* Deep space nebula glow centered on vault */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background:'radial-gradient(ellipse 72% 52% at 50% 50%, rgba(10,32,108,0.58) 0%, transparent 75%)',
            }} />

            {/* ── VAULT CONTAINER  (zooms outward as doors open) ── */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={dialDone ? { scale: 3.4 } : { scale: 1 }}
              transition={{ duration: 1.22, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              onAnimationComplete={() => {
                // Only act when the scale-up animation has completed
                if (dialDone) setShowVault(false)
              }}
            >
              {/* Left door panel */}
              <motion.div
                className="absolute top-0 bottom-0 left-0"
                style={{ right: '50%' }}
                animate={dialDone ? { x: '-100%' } : { x: 0 }}
                transition={{ duration: 1.27, ease: [0.76, 0, 0.24, 1] }}
              >
                <DoorPanel side="left" />
              </motion.div>

              {/* Right door panel */}
              <motion.div
                className="absolute top-0 bottom-0 right-0"
                style={{ left: '50%' }}
                animate={dialDone ? { x: '100%' } : { x: 0 }}
                transition={{ duration: 1.27, ease: [0.76, 0, 0.24, 1] }}
              >
                <DoorPanel side="right" />
              </motion.div>

              {/* Center seam glow */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: 2,
                  background: 'rgba(58,88,200,0.42)',
                  boxShadow: '0 0 18px 7px rgba(38,68,185,0.3)',
                }}
              />

              {/* ── DIAL ── */}
              <motion.div
                className="relative z-10"
                style={{ width: 190, height: 190 }}
                animate={
                  dialDone
                    ? { opacity: 0, scale: 0.45 }
                    : { rotate: 720, opacity: 1, scale: 1 }
                }
                transition={
                  !dialDone
                    ? { duration: 2.0, ease: [0.42, 0, 0.58, 1] }
                    : { duration: 0.3,  ease: 'easeIn' }
                }
                onAnimationComplete={() => {
                  // Only set dialDone=true once (when dial finishes spinning)
                  if (!dialDone) setDialDone(true)
                }}
              >
                <VaultDial />
              </motion.div>
            </motion.div>

            {/* Vault footer label */}
            <div className="absolute bottom-7 left-0 right-0 flex justify-center pointer-events-none">
              <p
                className="font-mono text-[8px] uppercase"
                style={{ color:'rgba(33,50,118,0.55)', letterSpacing:'0.55em' }}
              >
                COSMIC VAULT — SECTOR 7 — AUTHORIZED ACCESS ONLY
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
