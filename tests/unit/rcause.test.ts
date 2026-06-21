import { describe, it, expect } from "vitest";
import { analyseOverrides, type OverrideRecord } from "@/lib/rcause";

const records: OverrideRecord[] = [
  {
    caseId: "C1",
    analyst: "ember",
    systemDecision: "block",
    analystDecision: "review",
    overridden: true,
    reason: "False positive — common-name collision, DOB mismatch.",
  },
  {
    caseId: "C2",
    analyst: "ember",
    systemDecision: "block",
    analystDecision: "review",
    overridden: true,
    reason: "Not a match; common name homonym.",
  },
  {
    caseId: "C3",
    analyst: "sterling",
    systemDecision: "escalate",
    analystDecision: "escalate",
    overridden: false,
    reason: "Concur — sanctions hit confirmed.",
  },
];

describe("analyseOverrides", () => {
  it("computes the override rate", () => {
    const s = analyseOverrides(records);
    expect(s.total).toBe(3);
    expect(s.overrides).toBe(2);
    expect(s.overrideRate).toBe(0.67);
  });

  it("counts decision-change directions for overrides only", () => {
    const s = analyseOverrides(records);
    expect(s.byDirection["block→review"]).toBe(2);
    expect(s.byDirection["escalate→escalate"]).toBeUndefined();
  });

  it("mines recurring themes from override reasons", () => {
    const s = analyseOverrides(records);
    const themes = s.themes.map((t) => t.theme);
    expect(themes).toContain("false-positive");
    expect(themes).toContain("name-collision");
    expect(s.themes.find((t) => t.theme === "name-collision")?.count).toBe(2);
  });

  it("is safe on empty input", () => {
    expect(analyseOverrides([]).overrideRate).toBe(0);
  });
});
