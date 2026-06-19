import { describe, it, expect } from "vitest";
import { SUBJECTS, QUEUE_FILTERS } from "@/lib/data/subjects";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("seed subject corpus", () => {
  it("has unique, well-formed HS-##### ids", () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^HS-\d{5}$/);
  });

  it("exercises every queue filter", () => {
    expect(SUBJECTS.some((s) => s.riskScore >= 85)).toBe(true); // critical
    expect(SUBJECTS.some((s) => s.cddPosture === "EDD")).toBe(true); // edd
    expect(SUBJECTS.some((s) => s.pep != null)).toBe(true); // pep
    expect(SUBJECTS.some((s) => s.status === "cleared")).toBe(true); // closed
    expect(SUBJECTS.some((s) => s.listCoverage.length >= 4)).toBe(true); // sanctions
    expect(SUBJECTS.some((s) => s.assignedTo === "analyst-A")).toBe(true); // mine
    expect(
      SUBJECTS.some((s) => s.openedAt != null && Date.now() - Date.parse(s.openedAt) <= DAY_MS),
    ).toBe(true); // a24
  });
});

describe("QUEUE_FILTERS", () => {
  it("defines the nine filters in order", () => {
    expect(QUEUE_FILTERS.map((f) => f.key)).toEqual([
      "all",
      "critical",
      "sanctions",
      "edd",
      "pep",
      "sla",
      "a24",
      "mine",
      "closed",
    ]);
  });
});
