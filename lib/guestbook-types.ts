/* ───────────────────────────────────────────────────────────────────────────
   GUESTBOOK — shared types. See docs/superpowers/specs/2026-11-11-guestbook-design.md
   ─────────────────────────────────────────────────────────────────────────── */

export const REASONS = ["recruiter", "classmate", "friend_family", "engineer", "wandering"] as const;
export type Reason = (typeof REASONS)[number];

/** Chip labels on the form and the wall. */
export const REASON_LABELS: Record<Reason, string> = {
  recruiter: "Recruiter",
  classmate: "Classmate",
  friend_family: "Friend/family",
  engineer: "Fellow engineer",
  wandering: "Just wandering",
};

/** The two "not on the map" answers to "what college?". */
export const NO_COLLEGE = ["outside_us", "not_listed"] as const;
export type NoCollege = (typeof NO_COLLEGE)[number];

/** Raw form values, as strings straight off the form. */
export interface NoteInput {
  name: string;
  /** A college id (IPEDS UNITID) or one of NO_COLLEGE. */
  college: string;
  reason: string;
  reasonNote: string;
  feedback: string;
}

/** A note that passed validation, ready to insert. */
export interface CleanNote {
  name: string;
  collegeId: string | null;
  collegeNone: NoCollege | null;
  reason: Reason;
  reasonNote: string | null;
  feedback: string | null;
}

export type ValidationResult =
  | { ok: true; note: CleanNote }
  | { ok: false; field: keyof NoteInput; message: string };

/** What the public wall may see. Never carries feedback or the IP hash. */
export interface PublicNote {
  id: number;
  createdAt: Date;
  name: string;
  collegeId: string | null;
  collegeNone: NoCollege | null;
  reason: Reason;
  reasonNote: string | null;
}

export interface AdminNote extends PublicNote {
  feedback: string | null;
}

export interface GuestbookStats {
  total: number;
  schools: number;
  byReason: Record<Reason, number>;
}

export interface MapEntry {
  collegeId: string;
  names: string[];
}
