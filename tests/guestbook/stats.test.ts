import { describe, expect, it } from "vitest";

import { formatReasonShares } from "@/lib/guestbook";

const zero = { recruiter: 0, classmate: 0, friend_family: 0, engineer: 0, wandering: 0 };

describe("formatReasonShares", () => {
  it("formats shares, largest first, omitting zeros", () => {
    expect(formatReasonShares({ recruiter: 4, classmate: 3, friend_family: 0, engineer: 2, wandering: 1 }, 10)).toBe(
      "40% recruiters · 30% classmates · 20% fellow engineers · 10% wanderers",
    );
  });

  it("breaks ties in reason order and rounds", () => {
    expect(formatReasonShares({ ...zero, wandering: 1, friend_family: 1, recruiter: 1 }, 3)).toBe(
      "33% recruiters · 33% friends & family · 33% wanderers",
    );
  });

  it("is empty when there are no notes", () => {
    expect(formatReasonShares(zero, 0)).toBe("");
  });
});
