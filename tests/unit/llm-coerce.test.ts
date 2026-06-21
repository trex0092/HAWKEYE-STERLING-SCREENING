import { describe, it, expect } from "vitest";
import { coerceClassification, coerceReasoning } from "@/lib/ai/coerce";

// Red-team the untrusted-output guardrails directly (no API key / network).
describe("coerceClassification (untrusted LLM output)", () => {
  it("returns null for non-object input", () => {
    expect(coerceClassification(null)).toBeNull();
    expect(coerceClassification("negative")).toBeNull();
    expect(coerceClassification(42)).toBeNull();
  });

  it("defaults an unknown sentiment to the cautious 'negative'", () => {
    expect(coerceClassification({ sentiment: "spicy", category: "x" })!.sentiment).toBe("negative");
  });

  it("passes through positive / neutral", () => {
    expect(coerceClassification({ sentiment: "positive", category: "Award" })!.sentiment).toBe(
      "positive",
    );
    expect(coerceClassification({ sentiment: "neutral", category: "News" })!.sentiment).toBe(
      "neutral",
    );
  });

  it("forces an empty category to 'News'", () => {
    expect(coerceClassification({ sentiment: "neutral", category: "" })!.category).toBe("News");
  });
});

describe("coerceReasoning (untrusted LLM output)", () => {
  it("returns null for non-object input", () => {
    expect(coerceReasoning(undefined)).toBeNull();
  });

  it("forces an off-whitelist decision to 'review'", () => {
    expect(coerceReasoning({ decision: "DROP TABLE", score: 50 })!.decision).toBe("review");
  });

  it("rounds and clamps the score to 0-100", () => {
    expect(coerceReasoning({ decision: "block", score: 9999 })!.score).toBe(100);
    expect(coerceReasoning({ decision: "clear", score: -5 })!.score).toBe(0);
    expect(coerceReasoning({ decision: "clear", score: 73.6 })!.score).toBe(74);
  });

  it("coerces a non-finite score to 0 and non-array factors to []", () => {
    const r = coerceReasoning({ decision: "review", score: "high", factors: "x" })!;
    expect(r.score).toBe(0);
    expect(r.factors).toEqual([]);
  });

  it("stringifies injected non-string fields — nothing exotic reaches a typed field", () => {
    const r = coerceReasoning({
      decision: "escalate",
      score: 80,
      summary: { a: 1 },
      factors: [1, true],
    })!;
    expect(typeof r.summary).toBe("string");
    expect(r.factors).toEqual(["1", "true"]);
  });
});
