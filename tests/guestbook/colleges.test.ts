import { describe, expect, it } from "vitest";

import { collegeExists, getCollege, NO_COLLEGE_OPTIONS, searchCollegeOptions } from "@/lib/colleges";

describe("searchCollegeOptions", () => {
  it("finds Purdue by prefix", () => {
    expect(searchCollegeOptions("purdue")[0].label).toMatch(/^Purdue University/);
  });

  it("finds both USCs by alias", () => {
    const values = searchCollegeOptions("usc").map((o) => o.value);
    expect(values).toContain("123961");
    expect(values).toContain("218663");
  });

  it("always ends with the two not-on-the-map options", () => {
    expect(searchCollegeOptions("purdue").slice(-2)).toEqual(NO_COLLEGE_OPTIONS);
    expect(NO_COLLEGE_OPTIONS).toEqual([
      { value: "outside_us", label: "Outside the US" },
      { value: "not_listed", label: "Didn't go / not listed" },
    ]);
  });

  it("returns only the not-on-the-map options for an empty query", () => {
    expect(searchCollegeOptions("")).toEqual(NO_COLLEGE_OPTIONS);
    expect(searchCollegeOptions("   ")).toEqual(NO_COLLEGE_OPTIONS);
  });

  it("does not throw on punctuation", () => {
    for (const q of ["(", "st. john's", "a", "*", "\\"]) expect(() => searchCollegeOptions(q)).not.toThrow();
  });

  it("caps college matches at the limit", () => {
    expect(searchCollegeOptions("university")).toHaveLength(8 + 2);
    expect(searchCollegeOptions("university", 3)).toHaveLength(3 + 2);
  });

  it("ranks prefix matches above word-start and substring matches", () => {
    const labels = searchCollegeOptions("tech").map((o) => o.label);
    const firstNonPrefix = labels.findIndex((l) => !l.toLowerCase().startsWith("tech"));
    const lastPrefix = labels.slice(0, -2).findLastIndex((l) => l.toLowerCase().startsWith("tech"));
    expect(lastPrefix).toBeLessThan(firstNonPrefix);
  });

  it("shows city and state as the sub line", () => {
    expect(searchCollegeOptions("purdue")[0].sub).toBe("West Lafayette, IN");
  });
});

describe("getCollege / collegeExists", () => {
  it("knows real ids and rejects unknown ones", () => {
    expect(collegeExists("123961")).toBe(true);
    expect(getCollege("123961")?.name).toBe("University of Southern California");
    expect(collegeExists("nope")).toBe(false);
    expect(getCollege("nope")).toBeUndefined();
  });
});
