import { describe, expect, it } from "vitest";

import { dotRadius, nationPath, projectPoint, statesPath, toMapDots } from "@/lib/us-map";

describe("projectPoint", () => {
  it("puts USC in southern California", () => {
    const p = projectPoint(34.0224, -118.2851)!;
    expect(p.x).toBeLessThan(220);
    expect(p.y).toBeGreaterThan(280);
    expect(p.y).toBeLessThan(450);
  });

  it("puts UH Manoa in the Hawaii inset", () => {
    const p = projectPoint(21.2969, -157.8171)!;
    expect(p.x).toBeLessThan(420);
    expect(p.y).toBeGreaterThan(480);
  });

  it("returns null outside the US", () => {
    expect(projectPoint(48.8566, 2.3522)).toBeNull();
  });
});

describe("dotRadius", () => {
  it("grows with the square root, capped", () => {
    expect(dotRadius(1)).toBe(5.5);
    expect(dotRadius(4)).toBe(8);
    expect(dotRadius(100)).toBe(14);
  });
});

describe("toMapDots", () => {
  it("drops unknown colleges", () => {
    expect(toMapDots([{ collegeId: "nope", names: ["x"] }])).toEqual([]);
  });

  it("projects known colleges with label, names and radius", () => {
    const [dot] = toMapDots([{ collegeId: "123961", names: ["Maya", "Dev"] }]);
    expect(dot).toMatchObject({ collegeId: "123961", label: "University of Southern California", names: ["Maya", "Dev"] });
    expect(dot.r).toBe(dotRadius(2));
    expect(dot.x).toBeLessThan(220);
  });
});

describe("outline paths", () => {
  it("are non-empty SVG paths", () => {
    expect(nationPath).toMatch(/^M/);
    expect(statesPath).toMatch(/^M/);
  });
});
