import { describe, expect, it } from "vitest";

import { nextActiveDot, type DotEvent } from "@/lib/map-dot-state";

const run = (events: [string, DotEvent][], start: string | null = null) =>
  events.reduce<string | null>((active, [dot, e]) => nextActiveDot(active, dot, e), start);

describe("nextActiveDot", () => {
  it("a phone tap (enter → focus → click) leaves the popup open", () => {
    expect(run([["purdue", "enter"], ["purdue", "focus"], ["purdue", "click"]])).toBe("purdue");
  });

  it("a mouse click on an already-hovered dot keeps it open", () => {
    expect(run([["purdue", "enter"], ["purdue", "click"]])).toBe("purdue");
  });

  it("tapping somewhere else (blur) closes it", () => {
    expect(run([["purdue", "focus"], ["purdue", "click"], ["purdue", "blur"]])).toBe(null);
  });

  it("moving the mouse away closes it", () => {
    expect(run([["purdue", "enter"], ["purdue", "leave"]])).toBe(null);
  });

  it("leaving one dot doesn't close another dot's popup", () => {
    expect(run([["usc", "leave"]], "purdue")).toBe("purdue");
  });

  it("tapping a second dot switches to it", () => {
    expect(run([["purdue", "click"], ["usc", "enter"], ["purdue", "blur"], ["usc", "focus"], ["usc", "click"]])).toBe("usc");
  });
});
