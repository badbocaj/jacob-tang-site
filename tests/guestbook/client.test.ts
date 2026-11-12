import { describe, expect, it, vi } from "vitest";

import { COMMS_DOWN_MESSAGE, settleSubmit } from "@/lib/guestbook-client";

describe("settleSubmit", () => {
  it("passes a server answer through", async () => {
    const ok = { status: "success", message: "hi", collegeId: null } as const;
    expect(await settleSubmit(() => Promise.resolve(ok))).toBe(ok);
  });

  it("turns a failed request into the comms-down error instead of throwing", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await settleSubmit(() => Promise.reject(new TypeError("Failed to fetch")))).toEqual({
      status: "error",
      message: COMMS_DOWN_MESSAGE,
    });
    expect(COMMS_DOWN_MESSAGE).toBe("Comms down, try again in a minute.");
  });
});
