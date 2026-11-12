import { englishDataset, englishRecommendedTransformers, RegExpMatcher } from "obscenity";

import {
  NO_COLLEGE,
  REASONS,
  type CleanNote,
  type NoCollege,
  type NoteInput,
  type Reason,
  type ValidationResult,
} from "./guestbook-types";

/* ───────────────────────────────────────────────────────────────────────────
   Validation and the public-field filter for a guestbook note. Pure: no I/O,
   so it is unit tested directly. Only the public fields (name and one-liner)
   are filtered; private feedback is only length-checked.
   ─────────────────────────────────────────────────────────────────────────── */

const MAX_NAME = 40;
const MAX_REASON_NOTE = 120;
const MAX_FEEDBACK = 1000;

const PROFANITY = "Transmission blocked: language filter tripped.";
const LINKS = "Transmission blocked: no links on the wall.";

const profanity = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|xyz|ru|info|biz|me|ly|gg|app|dev)\b)/i;

/** Length in code points, matching Postgres char_length (an emoji counts as one). */
export function codePointLength(s: string): number {
  return [...s].length;
}

const blankToNull = (s: string) => (s === "" ? null : s);

export function validateNote(input: NoteInput, collegeExists: (id: string) => boolean): ValidationResult {
  const name = input.name.trim() || "Anonymous";
  const college = input.college.trim();
  const reason = input.reason.trim();
  const reasonNote = input.reasonNote.trim();
  const feedback = input.feedback.trim();

  if (codePointLength(name) > MAX_NAME) return { ok: false, field: "name", message: "Name is too long (40 max)." };

  const collegeNone = (NO_COLLEGE as readonly string[]).includes(college) ? (college as NoCollege) : null;
  if (!collegeNone && !(college && collegeExists(college))) {
    return { ok: false, field: "college", message: "Pick a college, or one of the not-on-the-map options." };
  }

  if (!(REASONS as readonly string[]).includes(reason)) {
    return { ok: false, field: "reason", message: "Pick why you're here." };
  }

  if (codePointLength(reasonNote) > MAX_REASON_NOTE) {
    return { ok: false, field: "reasonNote", message: "Keep it under 120 characters." };
  }
  if (codePointLength(feedback) > MAX_FEEDBACK) {
    return { ok: false, field: "feedback", message: "Keep it under 1,000 characters." };
  }

  for (const [field, value] of [["name", name], ["reasonNote", reasonNote]] as const) {
    if (profanity.hasMatch(value)) return { ok: false, field, message: PROFANITY };
  }
  for (const [field, value] of [["name", name], ["reasonNote", reasonNote]] as const) {
    if (LINK.test(value)) return { ok: false, field, message: LINKS };
  }

  const note: CleanNote = {
    name,
    collegeId: collegeNone ? null : college,
    collegeNone,
    reason: reason as Reason,
    reasonNote: blankToNull(reasonNote),
    feedback: blankToNull(feedback),
  };
  return { ok: true, note };
}
