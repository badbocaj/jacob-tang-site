import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicNote } from "@/lib/guestbook-types";
import { submitNoteCore, type SubmitDeps } from "@/lib/guestbook-submit";

const SUCCESS = "Transmission received. You are now part of the permanent record.";
const IP = "a".repeat(64);

const saved: PublicNote = {
  id: 1,
  createdAt: new Date(0),
  name: "Maya",
  collegeId: "123961",
  collegeNone: null,
  reason: "recruiter",
  reasonNote: null,
};

function makeDeps(over: Partial<SubmitDeps> = {}): SubmitDeps {
  return {
    collegeExists: (id) => id === "123961",
    countRecentByIp: vi.fn().mockResolvedValue(0),
    insertNote: vi.fn().mockResolvedValue(saved),
    now: () => 10_000,
    ...over,
  };
}

function form(over: Record<string, string> = {}): FormData {
  const f = new FormData();
  const fields = {
    name: "Maya",
    college: "123961",
    reason: "recruiter",
    reasonNote: "",
    feedback: "",
    website: "",
    renderedAt: "1000",
    ...over,
  };
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

describe("submitNoteCore", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

  it("saves a valid note and returns the success copy", async () => {
    const deps = makeDeps();
    expect(await submitNoteCore(form(), IP, deps)).toEqual({ status: "success", message: SUCCESS, collegeId: "123961" });
    expect(deps.insertNote).toHaveBeenCalledOnce();
    expect(deps.insertNote).toHaveBeenCalledWith(expect.objectContaining({ name: "Maya", reason: "recruiter" }), IP);
  });

  it("fakes success for a filled honeypot without saving", async () => {
    const deps = makeDeps();
    expect(await submitNoteCore(form({ website: "x" }), IP, deps)).toMatchObject({ status: "success", message: SUCCESS });
    expect(deps.insertNote).not.toHaveBeenCalled();
  });

  it("fakes success when submitted under 3 s", async () => {
    const deps = makeDeps();
    expect(await submitNoteCore(form({ renderedAt: "8000" }), IP, deps)).toMatchObject({ status: "success" });
    expect(deps.insertNote).not.toHaveBeenCalled();
  });

  it("fakes success when renderedAt is missing or junk", async () => {
    for (const renderedAt of ["", "abc"]) {
      const deps = makeDeps();
      expect(await submitNoteCore(form({ renderedAt }), IP, deps)).toMatchObject({ status: "success" });
      expect(deps.insertNote).not.toHaveBeenCalled();
    }
    const deps = makeDeps();
    const f = form();
    f.delete("renderedAt");
    expect(await submitNoteCore(f, IP, deps)).toMatchObject({ status: "success" });
    expect(deps.insertNote).not.toHaveBeenCalled();
  });

  it("returns validation errors with the field", async () => {
    const deps = makeDeps();
    expect(await submitNoteCore(form({ reason: "spy" }), IP, deps)).toEqual({
      status: "error",
      field: "reason",
      message: "Pick why you're here.",
    });
    expect(deps.insertNote).not.toHaveBeenCalled();
  });

  it("blocks the 4th note in an hour", async () => {
    const deps = makeDeps({ countRecentByIp: vi.fn().mockResolvedValue(3) });
    expect(await submitNoteCore(form(), IP, deps)).toEqual({ status: "error", message: "Easy, cadet. Try again in a bit." });
    expect(deps.insertNote).not.toHaveBeenCalled();
  });

  it("maps DB failures to the comms-down copy", async () => {
    const down = { status: "error", message: "Comms down, try again in a minute." };
    expect(await submitNoteCore(form(), IP, makeDeps({ insertNote: vi.fn().mockRejectedValue(new Error("x")) }))).toEqual(down);
    expect(await submitNoteCore(form(), IP, makeDeps({ countRecentByIp: vi.fn().mockRejectedValue(new Error("x")) }))).toEqual(
      down,
    );
  });
});
