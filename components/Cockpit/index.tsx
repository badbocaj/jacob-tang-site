"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, User } from "lucide-react";

import { CityBackdrop } from "./CityBackdrop";
import { CanopyFrame } from "./CanopyFrame";
import { VisorOverlay } from "./VisorOverlay";
import { HudNav } from "./HudNav";
import { SkyView } from "./SkyView";
import { StatusCluster } from "./StatusCluster";
import { ProfilePanel } from "./ProfilePanel";
import { Reticle, usePreciseCursor } from "./Reticle";
import { Brackets } from "./HudPrimitives";
import { NAV_TABS, PROFILE, type NavTab } from "./data";

/* ───────────────────────────────────────────────────────────────────────────
   THE COCKPIT

   Three states, all automatic — no click gate:
     dormant  one beat of unpowered flight deck so the boot reads as a change
     booting  visor sweeps down and locks, systems flash into existence
     online   full HUD

   Navigation has two routes. The primary one is the sky: hold the arrow keys
   to pitch the nose up, and the city drops away to an asteroid field where
   every rock is a channel — put the reticle on one and click to shoot it. The
   fallback is QUICK NAV, an off-by-default switch on the glass that drops the
   old channel bar back down for anyone who just wants a link.

   The subject profile is not on screen by default. It lives behind the
   PILOT INFO switch on the dash, so the default view is the city and the
   instruments rather than a wall of text.

   Depth is faked with three parallax planes driven off one pointer position.
   The world plane leads the pointer; the HUD plane trails it in the opposite
   direction, which is what makes the glass feel like it sits between you and
   the city rather than painted onto it.
   ─────────────────────────────────────────────────────────────────────────── */

type Phase = "dormant" | "booting" | "online";

/** How long the deck sits unpowered before the visor drops on its own. */
const IGNITION_MS = 480;
const BOOT_MS = 1500;
const CHANNEL_MS = 540;
const SNAP = { type: "spring", stiffness: 400, damping: 20 } as const;

/** Look rates, in units of full travel per second. */
const PITCH_RATE = 0.9;
const YAW_RATE = 0.8;
/** Hysteresis on fire control, so a rock cannot flicker in and out of arming. */
const SKY_ARM = 0.3;
const SKY_DISARM = 0.12;

const LOOK_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function Cockpit() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("dormant");
  const [engaging, setEngaging] = useState<NavTab | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickNav, setQuickNav] = useState(false);
  const [skyArmed, setSkyArmed] = useState(false);
  const [hasLooked, setHasLooked] = useState(false);

  const preciseCursor = usePreciseCursor();
  const booted = phase !== "dormant";

  // ── Parallax ─────────────────────────────────────────────────────────────
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 20, mass: 0.7 });
  const sy = useSpring(py, { stiffness: 90, damping: 20, mass: 0.7 });

  const cityX = useTransform(sx, (v) => v * 40);
  const cityY = useTransform(sy, (v) => v * 26);
  const frameX = useTransform(sx, (v) => v * 17);
  const frameY = useTransform(sy, (v) => v * 11);
  const hudX = useTransform(sx, (v) => v * -11);
  const hudY = useTransform(sy, (v) => v * -7);
  const worldRotY = useTransform(sx, (v) => v * 5);
  const worldRotX = useTransform(sy, (v) => v * -3.5);

  // ── Look axis ────────────────────────────────────────────────────────────
  // Arrow keys drive a persistent camera attitude: pitch stays where you left
  // it so you can let go of the keyboard and reach for the trigger. Both live
  // as motion values, so slewing never re-renders the tree — only crossing the
  // arming threshold does.
  const pitch = useMotionValue(0);
  const yaw = useMotionValue(0);
  /** The city falls away below as the nose comes up. */
  const cityDrop = useTransform(pitch, [0, 1], ["0vh", "100vh"]);
  /** The canopy pitches with you, but only a little — it is bolted to you. */
  const canopyDrop = useTransform(pitch, [0, 1], [0, 34]);
  /** The name plate owns the glass at rest and gets out of the way of the sky. */
  const plateOpacity = useTransform(pitch, [0, 0.22], [1, 0]);
  const plateY = useTransform(pitch, [0, 0.22], [0, -24]);

  /** Mouse / touch route into the sky — same camera the arrow keys drive. */
  const lookUp = useCallback(() => {
    setHasLooked(true);
    animate(pitch, 1, { type: "spring", stiffness: 60, damping: 16 });
  }, [pitch]);
  const lookDown = useCallback(() => {
    animate(pitch, 0, { type: "spring", stiffness: 70, damping: 18 });
    animate(yaw, 0, { type: "spring", stiffness: 70, damping: 18 });
  }, [pitch, yaw]);

  const heldRef = useRef<Set<string>>(new Set());
  const armedRef = useRef(false);

  useEffect(() => {
    if (!booted) return;

    const held = heldRef.current;
    const onDown = (e: KeyboardEvent) => {
      if (!LOOK_KEYS.has(e.key)) return;
      // Otherwise the page fights the camera for the arrow keys.
      e.preventDefault();
      held.add(e.key);
      setHasLooked(true);
    };
    const onUp = (e: KeyboardEvent) => held.delete(e.key);
    const onBlur = () => held.clear();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      held.clear();
    };
  }, [booted]);

  useAnimationFrame((_, delta) => {
    const held = heldRef.current;
    if (!booted) return;

    const dt = Math.min(delta, 50) / 1000;
    const up = held.has("ArrowUp") ? 1 : 0;
    const down = held.has("ArrowDown") ? 1 : 0;
    const left = held.has("ArrowLeft") ? 1 : 0;
    const right = held.has("ArrowRight") ? 1 : 0;

    if (up || down) {
      pitch.set(clamp(pitch.get() + (up - down) * PITCH_RATE * dt, 0, 1));
    }
    if (left || right) {
      yaw.set(clamp(yaw.get() + (right - left) * YAW_RATE * dt, -1, 1));
    }

    // Only cross the React boundary on an actual state change — this runs 60
    // times a second and the rest of it never re-renders anything.
    const p = pitch.get();
    const next = armedRef.current ? p > SKY_DISARM : p > SKY_ARM;
    if (next !== armedRef.current) {
      armedRef.current = next;
      setSkyArmed(next);
    }
  });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width) * 2 - 1);
      py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    [px, py],
  );

  const resetPointer = useCallback(() => {
    px.set(0);
    py.set(0);
  }, [px, py]);

  // ── Boot sequence ────────────────────────────────────────────────────────
  // Ignition is automatic. The dormant beat exists only so the visor drop
  // reads as a transition rather than the page opening mid-animation.
  useEffect(() => {
    if (phase !== "dormant") return;
    const id = window.setTimeout(() => setPhase("booting"), IGNITION_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "booting") return;
    const id = window.setTimeout(() => setPhase("online"), BOOT_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Warm the routes the channel bar can reach.
  useEffect(() => {
    if (!booted) return;
    for (const t of NAV_TABS) router.prefetch(t.href);
  }, [booted, router]);

  // Escape stows the pilot dossier.
  useEffect(() => {
    if (!profileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profileOpen]);

  // ── Channel selection ────────────────────────────────────────────────────
  // OVERRIDE routes like any other channel. /personalized runs its own
  // clearance check on arrival, so gating it here as well would just be two
  // locks on the same door.
  const handleSelect = useCallback(
    (tab: NavTab) => {
      if (engaging) return;
      setEngaging(tab);
      window.setTimeout(() => router.push(tab.href), CHANNEL_MS);
    },
    [engaging, router],
  );

  const openDossier = useCallback(() => {
    const about = NAV_TABS.find((t) => t.id === "about");
    if (about) handleSelect(about);
  }, [handleSelect]);

  const engagingId = useMemo(() => engaging?.id ?? null, [engaging]);

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className={`relative h-[100svh] w-full overflow-hidden bg-black select-none ${
        booted && preciseCursor ? "cockpit-root--reticle" : ""
      }`}
      style={{ perspective: "1400px" }}
    >
      {/* ══ WORLD PLANE ═════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: worldRotX, rotateY: worldRotY, transformStyle: "preserve-3d" }}
      >
        <motion.div className="absolute inset-0" style={{ y: cityDrop }}>
          <motion.div className="absolute inset-[-5%]" style={{ x: cityX, y: cityY }}>
            <CityBackdrop powered={booted} />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ══ SKY ═════════════════════════════════════════════════════════════
          Kept out of the rotated world plane on purpose: the trigger works in
          screen space, and a 5° tilt between the reticle and the rocks would
          be felt long before it was seen. */}
      {booted && (
        <SkyView
          pitch={pitch}
          yaw={yaw}
          active={skyArmed && !engaging}
          busy={Boolean(engaging)}
          onEngage={handleSelect}
        />
      )}

      {/* ══ CANOPY ══════════════════════════════════════════════════════════
          In front of the sky — you are still looking through your own glass. */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ y: canopyDrop }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ x: frameX, y: frameY }}
        >
          <CanopyFrame powered={booted} />
        </motion.div>
      </motion.div>

      {/* ══ VISOR + HUD PLANE ═══════════════════════════════════════════════ */}
      {booted && (
        // pointer-events-none is load-bearing: this plane covers the whole
        // viewport, so without it every click lands here instead of on the
        // asteroid underneath. Interactive chrome inside opts back in.
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ x: hudX, y: hudY }}
        >
          <VisorOverlay booting={phase === "booting"} />

          {/* HUD chrome sits above the visor plate */}
          <div className="pointer-events-none absolute inset-0 z-40">
            {/* ── Top rail ──────────────────────────────────────────────── */}
            <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-4 px-4 pt-4 sm:flex-nowrap sm:px-8 sm:pt-6">
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SNAP, delay: 0.5 }}
                className="font-mono text-xs uppercase tracking-label"
              >
                <div className="text-cyan-100/80">JT-01 // FLIGHT DECK</div>
              </motion.div>

              {/* ── Quick nav ──────────────────────────────────────────────
                  Off by default: the intended way through this page is the
                  sky. This is the fire exit, and it drops the old channel bar
                  down under the switch when you flip it. */}
              <motion.div
                className="pointer-events-auto order-last flex w-full flex-col items-center sm:order-none sm:w-auto"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SNAP, delay: 0.55 }}
              >
                <QuickNavCheckbox
                  checked={quickNav}
                  onChange={() => setQuickNav((v) => !v)}
                />

                <AnimatePresence initial={false}>
                  {quickNav && (
                    <motion.div
                      key="quicknav"
                      className="overflow-visible"
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <div className="pt-2">
                        <HudNav onSelect={handleSelect} engagingId={engagingId} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...SNAP, delay: 0.6 }}
                className="hidden sm:block"
              >
                <StatusCluster />
              </motion.div>
            </div>

            {/* ── Name plate ────────────────────────────────────────────────
                The one thing on the glass at rest. Everything else on the
                deck is either a way out or decoration, so it stays quiet. */}
            <motion.div
              className="absolute inset-x-0 top-[22%] flex justify-center px-6"
              style={{ opacity: plateOpacity, y: plateY }}
            >
              <motion.div
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...SNAP, delay: 0.7 }}
              >
                <span className="font-mono text-xs uppercase tracking-label text-amber-300/80">
                  PILOT ON DECK
                </span>
                <h1
                  className="wide m-0 mt-3 font-display text-4xl font-bold uppercase tracking-tight text-cyan-50 sm:text-6xl"
                  style={{ textShadow: "0 0 32px rgba(34,211,238,0.35)" }}
                >
                  {PROFILE.name}
                </h1>
                <p className="m-0 mt-3 font-mono text-xs uppercase leading-relaxed tracking-label text-cyan-200/60">
                  <span className="block">Mechanical engineer</span>
                  <span className="block">Structures · testing · propulsion</span>
                </p>
              </motion.div>
            </motion.div>

            {/* ── Bottom-centre: dash cluster ───────────────────────────────
                Two controls and nothing else: go look at the sky, or read
                about the pilot. */}
            <motion.div
              className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SNAP, delay: 0.74 }}
            >
              <LookControl
                armed={skyArmed}
                nudged={hasLooked}
                onUp={lookUp}
                onDown={lookDown}
              />

              <PilotInfoSwitch
                active={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ══ PILOT DOSSIER ═══════════════════════════════════════════════════
          Its own layer, outside the parallax HUD plane, so it sits above the
          instruments and the sky's fire-control overlays (z-70) instead of
          blending into them. The scrim dims and blurs everything behind it so
          the panel reads as the only thing on the glass. Only the channel
          transition (z-80) and the reticle cursor (z-100) paint over it. */}
      <AnimatePresence>
        {booted && profileOpen && (
          <motion.div
            key="dossier"
            role="dialog"
            aria-modal="true"
            aria-label="Pilot dossier"
            className="absolute inset-0 z-[75] flex items-center justify-center px-4 py-10 sm:px-10 sm:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Stow pilot dossier"
              onClick={() => setProfileOpen(false)}
              className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-md"
            />
            <ProfilePanel
              onOpenDossier={openDossier}
              onClose={() => setProfileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ CHANNEL TRANSITION ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {engaging && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            <motion.div
              className="absolute inset-x-0 top-0 bg-black"
              initial={{ height: "0%" }}
              animate={{ height: "52%" }}
              transition={{ duration: CHANNEL_MS / 1000, ease: [0.7, 0, 0.3, 1] }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 bg-black"
              initial={{ height: "0%" }}
              animate={{ height: "52%" }}
              transition={{ duration: CHANNEL_MS / 1000, ease: [0.7, 0, 0.3, 1] }}
            />
            {/* OVERRIDE keeps its emergency character on the way out — the
                strobe is the warning, the clearance check happens on landing. */}
            {engaging.locked && (
              <div
                className="cockpit-strobe absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 50%, transparent 28%, rgba(220,38,38,0.8) 100%)",
                }}
              />
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono text-xs uppercase tracking-label"
                style={{
                  color: engaging.locked ? "#fecaca" : "#a5f3fc",
                  textShadow: engaging.locked
                    ? "0 0 18px rgba(248,113,113,0.85)"
                    : "0 0 18px rgba(34,211,238,0.8)",
                }}
              >
                {engaging.locked
                  ? "OVERRIDE ENGAGED :: LVL-5 CLEARANCE REQUIRED"
                  : `OPENING CHANNEL :: ${engaging.label}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Reticle enabled={booted && preciseCursor} />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   QUICK NAV — a real checkbox, dressed as an armament switch.

   The input itself is kept in the DOM (screen-reader- and keyboard-operable,
   space toggles it); the lit box next to it is what you actually see. Checked,
   the channel bar drops out from under it.
   ─────────────────────────────────────────────────────────────────────────── */

function QuickNavCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  const line = checked ? "rgba(251,191,36,0.9)" : "rgba(34,211,238,0.45)";

  return (
    <motion.label
      data-hud-target
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={SNAP}
      className="group relative flex cursor-pointer items-center gap-2.5 px-3.5 py-2"
      style={{
        border: `1px solid ${line}`,
        background: checked
          ? "linear-gradient(180deg, rgba(62,40,4,0.85), rgba(22,13,2,0.9))"
          : "linear-gradient(180deg, rgba(6,22,34,0.82), rgba(2,8,15,0.9))",
        boxShadow: checked
          ? "0 0 26px rgba(251,191,36,0.35), inset 0 1px 0 rgba(253,230,138,0.3)"
          : "inset 0 1px 0 rgba(165,243,252,0.14)",
      }}
    >
      <Brackets size={checked ? 12 : 8} color={line} offset={checked ? 4 : 0} />

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      {/* The lamp that stands in for the box */}
      <span
        className="relative block h-3.5 w-3.5 shrink-0 transition-colors duration-200 peer-focus-visible:ring-1 peer-focus-visible:ring-cyan-200"
        style={{
          border: `1px solid ${line}`,
          background: checked ? "rgba(251,191,36,0.22)" : "rgba(2,10,18,0.8)",
          boxShadow: checked ? "0 0 12px rgba(251,191,36,0.6) inset" : "none",
        }}
      >
        <AnimatePresence initial={false}>
          {checked && (
            <motion.span
              className="absolute inset-[2px] block bg-amber-300"
              style={{ boxShadow: "0 0 10px rgba(251,191,36,0.9)" }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={SNAP}
            />
          )}
        </AnimatePresence>
      </span>

      <span
        className="font-mono text-xs uppercase tracking-label transition-colors duration-200"
        style={{
          color: checked ? "#fef3c7" : "rgba(165,243,252,0.8)",
          textShadow: checked ? "0 0 12px rgba(251,191,36,0.7)" : "none",
        }}
      >
        QUICK NAV
      </span>

      <motion.span
        animate={{ rotate: checked ? 0 : -90 }}
        transition={SNAP}
        className="block"
      >
        <ChevronDown
          className="h-3.5 w-3.5"
          strokeWidth={2.5}
          style={{ color: checked ? "#fde68a" : "rgba(103,232,249,0.6)" }}
        />
      </motion.span>
    </motion.label>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   The way into the sky — and back out.

   A real button, so mouse and touch get there too; the arrow keys still work
   and are shown as the shortcut. Before the first look the ↑ key blinks. Once
   the sky is up, the same strip says how to fire and how to come back down.
   ─────────────────────────────────────────────────────────────────────────── */

function LookControl({
  armed,
  nudged,
  onUp,
  onDown,
}: {
  armed: boolean;
  nudged: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  const key = armed ? "↓" : "↑";

  return (
    <motion.button
      type="button"
      data-hud-target
      onClick={armed ? onDown : onUp}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={SNAP}
      className="pointer-events-auto flex items-center gap-2.5 px-2 py-1 font-mono text-xs uppercase tracking-label outline-none focus-visible:ring-1 focus-visible:ring-cyan-200"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center border text-xs leading-none ${
          !nudged && !armed ? "cockpit-prompt" : ""
        }`}
        style={{
          borderColor: "rgba(251,191,36,0.7)",
          color: "#fde68a",
          background: "rgba(2,10,18,0.75)",
        }}
      >
        {key}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={armed ? "armed" : "deck"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-cyan-100/80"
          style={{ textShadow: "0 0 10px rgba(34,211,238,0.45)" }}
        >
          {armed ? "Click a rock to open it · back to deck" : "Look up · every rock is a page"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   PILOT INFO — the one physical switch on the desk.

   Styled as a lit dash button rather than a HUD tab: it has a bezel, an inner
   shadow so it reads as recessed into the glareshield, and a status LED that
   pulses while stowed so the eye finds it without the dossier being open.
   ─────────────────────────────────────────────────────────────────────────── */

function PilotInfoSwitch({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const line = active ? "rgba(251,191,36,0.9)" : "rgba(34,211,238,0.5)";

  return (
    <motion.button
      type="button"
      data-hud-target
      onClick={onClick}
      aria-pressed={active}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={SNAP}
      className="group pointer-events-auto relative px-5 py-2.5 outline-none"
      style={{
        border: `1px solid ${line}`,
        background: active
          ? "linear-gradient(180deg, rgba(62,40,4,0.88), rgba(22,13,2,0.92))"
          : "linear-gradient(180deg, rgba(6,22,34,0.88), rgba(2,8,15,0.92))",
        boxShadow: active
          ? "0 0 32px rgba(251,191,36,0.45), inset 0 1px 0 rgba(253,230,138,0.35), inset 0 -7px 16px rgba(0,0,0,0.65)"
          : "0 0 22px rgba(34,211,238,0.2), inset 0 1px 0 rgba(165,243,252,0.2), inset 0 -7px 16px rgba(0,0,0,0.65)",
      }}
    >
      <Brackets size={11} color={line} offset={4} />

      <span className="flex items-center gap-2.5">
        {/* Status LED */}
        <span
          className={`block h-2 w-2 rounded-full ${active ? "" : "cockpit-prompt"}`}
          style={{
            background: active ? "#fbbf24" : "#22d3ee",
            boxShadow: active
              ? "0 0 10px rgba(251,191,36,0.95)"
              : "0 0 8px rgba(34,211,238,0.8)",
          }}
        />

        <User
          className="h-3.5 w-3.5 shrink-0"
          strokeWidth={2.5}
          style={{ color: active ? "#fde68a" : "#a5f3fc" }}
        />

        <span
          className="font-mono text-xs uppercase tracking-label transition-colors duration-200"
          style={{
            color: active ? "#fef3c7" : "#cffafe",
            textShadow: active
              ? "0 0 12px rgba(251,191,36,0.75)"
              : "0 0 10px rgba(34,211,238,0.5)",
          }}
        >
          PILOT INFO
        </span>
      </span>
    </motion.button>
  );
}
