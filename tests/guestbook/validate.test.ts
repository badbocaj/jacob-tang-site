import { describe, expect, it } from "vitest";

import type { NoteInput } from "@/lib/guestbook-types";
import { validateNote } from "@/lib/guestbook-validate";

const exists = (id: string) => id === "123961";
const base: NoteInput = { name: "Maya", college: "123961", reason: "recruiter", reasonNote: "", feedback: "" };
const note = (patch: Partial<NoteInput>) => validateNote({ ...base, ...patch }, exists);

const PROFANITY = "Transmission blocked: language filter tripped.";
const LINKS = "Transmission blocked: no links on the wall.";

describe("validateNote", () => {
  it("accepts a minimal note and nulls blank optionals", () => {
    expect(validateNote(base, exists)).toEqual({
      ok: true,
      note: { name: "Maya", collegeId: "123961", collegeNone: null, reason: "recruiter", reasonNote: null, feedback: null },
    });
  });

  it("defaults blank and whitespace-only names to Anonymous", () => {
    for (const name of ["", "   "]) {
      const r = note({ name });
      expect(r.ok && r.note.name).toBe("Anonymous");
    }
  });

  it("trims every field", () => {
    const r = note({ name: "  Maya  ", reasonNote: "  hi ", feedback: "  nice  " });
    expect(r).toMatchObject({ ok: true, note: { name: "Maya", reasonNote: "hi", feedback: "nice" } });
  });

  it("stores whitespace-only optionals as null", () => {
    const r = note({ reasonNote: "   ", feedback: "\n\t " });
    expect(r).toMatchObject({ ok: true, note: { reasonNote: null, feedback: null } });
  });

  it("counts code points: 40 emoji pass, 41 fail", () => {
    expect(note({ name: "🚀".repeat(40) }).ok).toBe(true);
    expect(note({ name: "🚀".repeat(41) })).toEqual({ ok: false, field: "name", message: "Name is too long (40 max)." });
  });

  it("accepts outside_us and not_listed as the college", () => {
    expect(note({ college: "outside_us" })).toMatchObject({ ok: true, note: { collegeId: null, collegeNone: "outside_us" } });
    expect(note({ college: "not_listed" })).toMatchObject({ ok: true, note: { collegeId: null, collegeNone: "not_listed" } });
  });

  it("rejects an unknown or missing college", () => {
    for (const college of ["999", ""]) {
      expect(note({ college })).toEqual({
        ok: false,
        field: "college",
        message: "Pick a college, or one of the not-on-the-map options.",
      });
    }
  });

  it("rejects an unknown reason", () => {
    expect(note({ reason: "spy" })).toEqual({ ok: false, field: "reason", message: "Pick why you're here." });
  });

  it("enforces the 120 and 1000 limits", () => {
    expect(note({ reasonNote: "a".repeat(120) }).ok).toBe(true);
    expect(note({ reasonNote: "a".repeat(121) })).toEqual({
      ok: false,
      field: "reasonNote",
      message: "Keep it under 120 characters.",
    });
    expect(note({ feedback: "a".repeat(1000) }).ok).toBe(true);
    expect(note({ feedback: "a".repeat(1001) })).toEqual({
      ok: false,
      field: "feedback",
      message: "Keep it under 1,000 characters.",
    });
  });

  it("blocks profanity in name and one-liner, incl. swaps", () => {
    expect(note({ name: "sh1t head" })).toEqual({ ok: false, field: "name", message: PROFANITY });
    expect(note({ reasonNote: "this is fucking cool" })).toEqual({ ok: false, field: "reasonNote", message: PROFANITY });
  });

  it("does not filter private feedback", () => {
    expect(note({ feedback: "this site is shit, see www.better.io" }).ok).toBe(true);
  });

  it("blocks links in public fields", () => {
    for (const reasonNote of ["see www.spam.io", "https://x.co", "buy.com now"]) {
      expect(note({ reasonNote })).toEqual({ ok: false, field: "reasonNote", message: LINKS });
    }
    expect(note({ name: "spam.net" })).toEqual({ ok: false, field: "name", message: LINKS });
  });

  it("allows dotted text that is not a link", () => {
    expect(note({ reasonNote: "U.S. citizen, Ph.D. student" }).ok).toBe(true);
  });
});
