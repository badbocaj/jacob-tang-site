"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, LogOut, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import {
  PERSONALIZED_FRIENDS,
  PersonalizedFriend,
  findFriendByName,
  checkAnswer,
} from "@/data/personalized";

const STORAGE_KEY = "authenticated_friend";

// ─────────────────────────────────────────────────────────────────────────────
// CRT scanline overlay — reused pattern from the rest of the site
// ─────────────────────────────────────────────────────────────────────────────

function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
      }}
    />
  );
}

function HazardStripe({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={position === "top" ? "h-2 w-full" : "h-1 w-full"}
      style={{
        background:
          "repeating-linear-gradient(45deg, #16a34a, #16a34a 10px, #0a0a0a 10px, #0a0a0a 20px)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS DENIED — glitch overlay
// ─────────────────────────────────────────────────────────────────────────────

function AccessDenied({ reason }: { reason: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        animate={{
          x: [0, -6, 5, -3, 0],
          filter: [
            "hue-rotate(0deg) saturate(1)",
            "hue-rotate(20deg) saturate(3)",
            "hue-rotate(-10deg) saturate(2)",
            "hue-rotate(0deg) saturate(1)",
          ],
        }}
        transition={{ duration: 0.4, repeat: 2 }}
        className="flex flex-col items-center gap-2"
      >
        <ShieldAlert size={40} className="text-red-500" />
        <p className="font-mono text-lg sm:text-xl text-red-500 tracking-[0.15em] uppercase text-center px-6">
          ACCESS DENIED
        </p>
        <p className="font-mono text-[11px] text-red-400/70 tracking-[0.25em] uppercase">
          {reason}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS GRANTED — celebration overlay
// ─────────────────────────────────────────────────────────────────────────────

function AccessGranted({ name }: { name: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 16 }}
        className="flex flex-col items-center gap-2"
      >
        <Sparkles size={40} className="text-green-400" />
        <p className="font-mono text-lg sm:text-xl text-green-400 tracking-[0.15em] uppercase text-center px-6">
          ACCESS GRANTED
        </p>
        <p className="font-mono text-[11px] text-green-400/70 tracking-[0.25em] uppercase">
          welcome back, {name.split(" ")[0]}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN TERMINAL
// ─────────────────────────────────────────────────────────────────────────────

type LoginStage = "name" | "question";

function LoginTerminal({
  onAuthenticated,
}: {
  onAuthenticated: (friend: PersonalizedFriend) => void;
}) {
  const [stage, setStage] = useState<LoginStage>("name");
  const [nameInput, setNameInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [candidate, setCandidate] = useState<PersonalizedFriend | null>(null);
  const [denied, setDenied] = useState<string | null>(null);
  const [granted, setGranted] = useState<PersonalizedFriend | null>(null);

  const triggerDenied = useCallback((reason: string) => {
    setDenied(reason);
    setTimeout(() => setDenied(null), 1300);
  }, []);

  const handleNameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const match = findFriendByName(nameInput);
    if (match) {
      setCandidate(match);
      setStage("question");
    } else {
      triggerDenied("IMPOSTER DETECTED");
    }
    setNameInput("");
  };

  const handleAnswerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    if (checkAnswer(candidate, answerInput)) {
      localStorage.setItem(STORAGE_KEY, candidate.id);
      setGranted(candidate);
      setTimeout(() => onAuthenticated(candidate), 1500);
    } else {
      triggerDenied("VERIFICATION FAILED");
      setStage("name");
      setCandidate(null);
    }
    setAnswerInput("");
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-zinc-950 border border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.08)] overflow-hidden">
      <HazardStripe position="top" />
      <Scanlines />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Terminal size={16} className="text-green-400" />
          <span className="font-mono text-[11px] text-green-500/70 tracking-[0.3em] uppercase">
            restricted access terminal
          </span>
        </div>

        <AnimatePresence mode="wait">
          {stage === "name" && (
            <motion.form
              key="name"
              onSubmit={handleNameSubmit}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-mono text-sm text-green-400 tracking-widest uppercase mb-3">
                &gt; IDENTIFY YOURSELF
              </p>
              <div className="flex items-center gap-2 border border-green-500/30 bg-black/60 px-3 py-2">
                <ChevronRight size={14} className="text-green-500/60 shrink-0" />
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="full name"
                  className="w-full bg-transparent font-mono text-sm text-green-300 placeholder:text-green-800 outline-none tracking-wide"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full font-mono text-[11px] uppercase tracking-widest py-2.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors duration-150"
              >
                [ TRANSMIT ]
              </button>
            </motion.form>
          )}

          {stage === "question" && candidate && (
            <motion.form
              key="question"
              onSubmit={handleAnswerSubmit}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-mono text-[11px] text-zinc-600 tracking-widest uppercase mb-1">
                identity confirmed :: {candidate.name}
              </p>
              <p className="font-mono text-sm text-green-400 tracking-widest uppercase mb-3">
                &gt; SECURITY VERIFICATION
              </p>
              <p className="text-zinc-300 text-sm mb-3">{candidate.question}</p>
              <div className="flex items-center gap-2 border border-green-500/30 bg-black/60 px-3 py-2">
                <ChevronRight size={14} className="text-green-500/60 shrink-0" />
                <input
                  autoFocus
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="answer"
                  className="w-full bg-transparent font-mono text-sm text-green-300 placeholder:text-green-800 outline-none tracking-wide"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full font-mono text-[11px] uppercase tracking-widest py-2.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors duration-150"
              >
                [ VERIFY ]
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <HazardStripe position="bottom" />

      <AnimatePresence>
        {denied && <AccessDenied reason={denied} />}
        {granted && <AccessGranted name={granted.name} />}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED VIEW
// ─────────────────────────────────────────────────────────────────────────────

function AuthenticatedView({
  friend,
  onLogout,
}: {
  friend: PersonalizedFriend;
  onLogout: () => void;
}) {
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto bg-zinc-950 border border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.08)] overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <HazardStripe position="top" />
      <Scanlines />

      <div className="relative z-10 p-6 sm:p-10">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-[10px] text-green-500/50 tracking-[0.3em] uppercase mb-1">
              clearance level :: friend
            </p>
            <h1 className="font-mono text-xl sm:text-2xl text-green-400 tracking-wide uppercase">
              {friend.title}
            </h1>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] text-zinc-600 hover:text-red-400 uppercase tracking-widest transition-colors duration-150"
          >
            <LogOut size={12} />
            switch profile
          </button>
        </div>

        <div className="border-l-2 border-green-500/30 pl-4 mb-8">
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {friend.letter}
          </p>
        </div>

        <p className="font-mono text-[10px] text-green-500/50 tracking-[0.3em] uppercase mb-3">
          shared memory log
        </p>
        <ul className="space-y-2">
          {friend.memories.map((memory, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.1 + i * 0.08 }}
              className="font-mono text-[13px] text-zinc-400 flex items-start gap-2"
            >
              <span className="text-green-500/60 shrink-0">&gt;</span>
              {memory}
            </motion.li>
          ))}
        </ul>
      </div>

      <HazardStripe position="bottom" />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function PersonalizedPage() {
  const [hydrated, setHydrated] = useState(false);
  const [authFriend, setAuthFriend] = useState<PersonalizedFriend | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const match = PERSONALIZED_FRIENDS.find((f) => f.id === storedId);
      if (match) setAuthFriend(match);
    }
    setHydrated(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthFriend(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-28">
      {/* Blueprint grid background, matching the rest of the site */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {!hydrated ? (
        <p className="font-mono text-[11px] text-green-500/40 tracking-[0.3em] uppercase animate-pulse">
          booting secure link...
        </p>
      ) : authFriend ? (
        <AuthenticatedView friend={authFriend} onLogout={handleLogout} />
      ) : (
        <LoginTerminal onAuthenticated={setAuthFriend} />
      )}
    </div>
  );
}
