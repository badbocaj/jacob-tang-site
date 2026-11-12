import { describe, expect, it } from "vitest";

import { clientIpFrom, hashIp } from "@/lib/guestbook-ip";

const h = (xff?: string) => new Headers(xff === undefined ? {} : { "x-forwarded-for": xff });

describe("clientIpFrom", () => {
  it("takes the first entry of x-forwarded-for", () => {
    expect(clientIpFrom(h("1.2.3.4, 10.0.0.1"))).toBe("1.2.3.4");
  });
  it("trims spaces", () => {
    expect(clientIpFrom(h(" 1.2.3.4 "))).toBe("1.2.3.4");
  });
  it("falls back to 127.0.0.1 when empty or missing", () => {
    expect(clientIpFrom(h(""))).toBe("127.0.0.1");
    expect(clientIpFrom(h(" , 10.0.0.1"))).toBe("127.0.0.1");
    expect(clientIpFrom(h())).toBe("127.0.0.1");
  });
});

describe("hashIp", () => {
  it("is 64 hex chars and stable", () => {
    const a = hashIp("1.2.3.4", "secret");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp("1.2.3.4", "secret")).toBe(a);
  });
  it("changes with the secret and the ip", () => {
    const a = hashIp("1.2.3.4", "secret");
    expect(hashIp("1.2.3.4", "other")).not.toBe(a);
    expect(hashIp("1.2.3.5", "secret")).not.toBe(a);
  });
});
