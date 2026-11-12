import type { CleanNote, NoteInput, PublicNote } from "./guestbook-types";
import { validateNote } from "./guestbook-validate";

/* ───────────────────────────────────────────────────────────────────────────
   Submitting a note, minus the framework: bot trap → validation → rate limit
   → insert. The server action in app/guestbook/actions.ts wires in the real
   database; tests pass fakes.
   ─────────────────────────────────────────────────────────────────────────── */

export const SUCCESS_MESSAGE = "Transmission received. You are now part of the permanent record.";
export const COMMS_DOWN_MESSAGE = "Comms down, try again in a minute.";
const RATE_LIMITED = "Easy, cadet. Try again in a bit.";

const MIN_FILL_MS = 3000;
const MAX_PER_HOUR = 3;

export type SubmitState =
  | { status: "idle" }
  | { status: "success"; message: string; collegeId: string | null }
  | { status: "error"; field?: keyof NoteInput; message: string };

export interface SubmitDeps {
  collegeExists(id: string): boolean;
  countRecentByIp(ipHash: string): Promise<number>;
  insertNote(note: CleanNote, ipHash: string): Promise<PublicNote>;
  now(): number;
}

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
};

export async function submitNoteCore(form: FormData, ipHash: string, deps: SubmitDeps): Promise<SubmitState> {
  // Bots get a convincing "success" and nothing is saved, so they don't adapt.
  const renderedAt = Number(text(form, "renderedAt") || Number.NaN);
  const tooFast = !Number.isFinite(renderedAt) || deps.now() - renderedAt < MIN_FILL_MS;
  if (text(form, "website") !== "" || tooFast) {
    return { status: "success", message: SUCCESS_MESSAGE, collegeId: null };
  }

  const result = validateNote(
    {
      name: text(form, "name"),
      college: text(form, "college"),
      reason: text(form, "reason"),
      reasonNote: text(form, "reasonNote"),
      feedback: text(form, "feedback"),
    },
    deps.collegeExists,
  );
  if (!result.ok) return { status: "error", field: result.field, message: result.message };

  try {
    if ((await deps.countRecentByIp(ipHash)) >= MAX_PER_HOUR) return { status: "error", message: RATE_LIMITED };
    const saved = await deps.insertNote(result.note, ipHash);
    return { status: "success", message: SUCCESS_MESSAGE, collegeId: saved.collegeId };
  } catch (err) {
    console.error("[guestbook] submit failed", err);
    return { status: "error", message: COMMS_DOWN_MESSAGE };
  }
}
