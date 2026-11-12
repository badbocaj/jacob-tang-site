import { describe, expect, it } from "vitest";

import { checkPassword, createSessionToken, SESSION_MS, verifySessionToken } from "@/lib/admin-auth";

const SECRET = "s3cret-for-tests";
const NOW = 1_800_000_000_000;

describe("checkPassword", () => {
  it("accepts the right password", () => expect(checkPassword("hunter2", "hunter2")).toBe(true));
  it("rejects a wrong password", () => expect(checkPassword("hunter3", "hunter2")).toBe(false));
  it("rejects different lengths without throwing", () => {
    expect(checkPassword("", "hunter2")).toBe(false);
    expect(checkPassword("hunter2-and-more", "hunter2")).toBe(false);
  });
});

describe("session tokens", () => {
  it("a fresh token verifies until it expires", () => {
    const token = createSessionToken(SECRET, NOW);
    expect(verifySessionToken(token, SECRET, NOW)).toBe(true);
    expect(verifySessionToken(token, SECRET, NOW + SESSION_MS - 1)).toBe(true);
    expect(verifySessionToken(token, SECRET, NOW + SESSION_MS + 1)).toBe(false);
  });

  it("rejects a token signed with another secret", () => {
    expect(verifySessionToken(createSessionToken("other", NOW), SECRET, NOW)).toBe(false);
  });

  it("rejects a token whose expiry was edited", () => {
    const [exp, sig] = createSessionToken(SECRET, NOW).split(".");
    expect(verifySessionToken(`${Number(exp) + 1_000_000}.${sig}`, SECRET, NOW)).toBe(false);
  });

  it("returns false for malformed tokens without throwing", () => {
    for (const t of ["abc", "123.", ".sig", "", "1.2.3", "NaN.abcd", undefined]) {
      expect(verifySessionToken(t, SECRET, NOW)).toBe(false);
    }
  });
});
