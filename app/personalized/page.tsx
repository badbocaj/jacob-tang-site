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
import { HazardStripe, Scanlines } from "@/components/personalized/chrome";
import DossierPanel from "@/components/personalized/DossierPanel";
import Whiteboard from "@/components/personalized/Whiteboard";

const STORAGE_KEY = "authenticated_friend";

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
        <p className="font-mono text-lg sm:text-xl text-red-500 uppercase text-center px-6">
          ACCESS DENIED
        </p>
        <p className="font-mono text-xs text-red-400/70 tracking-label uppercase">
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
        <p className="font-mono text-lg sm:text-xl text-green-400 uppercase text-center px-6">
          ACCESS GRANTED
        </p>
        <p className="font-mono text-xs text-green-400/70 tracking-label uppercase">
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
          <span className="font-mono text-xs text-green-500/70 tracking-label uppercase">
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
              <p className="font-mono text-sm text-green-400 tracking-label uppercase mb-3">
                &gt; IDENTIFY YOURSELF
              </p>
              <div className="flex items-center gap-2 border border-green-500/30 bg-black/60 px-3 py-2">
                <ChevronRight size={14} className="text-green-500/60 shrink-0" />
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="full name"
                  className="w-full bg-transparent font-mono text-sm text-green-300 placeholder:text-green-800 outline-none tracking-label"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full font-mono text-xs uppercase tracking-label py-2.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors duration-150"
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
              <p className="font-mono text-xs text-zinc-600 tracking-label uppercase mb-1">
                identity confirmed :: {candidate.name}
              </p>
              <p className="font-mono text-sm text-green-400 tracking-label uppercase mb-3">
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
                  className="w-full bg-transparent font-mono text-sm text-green-300 placeholder:text-green-800 outline-none tracking-label"
                />
              </div>
              <button
                type="submit"
                className="mt-4 w-full font-mono text-xs uppercase tracking-label py-2.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 transition-colors duration-150"
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
// AUTHENTICATED VIEW — standardized two-panel layout.
//   LEFT  :: the archive record I author for this person.
//   RIGHT :: the whiteboard they own.
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
      className="w-full max-w-[1600px] mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-label text-green-500/50">
            clearance level :: friend
          </p>
          <h1 className="font-mono text-xl uppercase text-green-400 sm:text-2xl">
            {friend.title}
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-label text-zinc-600 transition-colors duration-150 hover:text-red-400"
        >
          <LogOut size={12} />
          switch profile
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DossierPanel friend={friend} />
        <Whiteboard friendId={friend.id} friendName={friend.name} />
      </div>
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
    <div
      className={`min-h-screen bg-[#050505] px-4 sm:px-6 ${
        authFriend
          ? "flex items-start justify-center pb-16 pt-28"
          : "flex items-center justify-center py-28"
      }`}
    >
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
        <p className="font-mono text-xs text-green-500/40 tracking-label uppercase animate-pulse">
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
