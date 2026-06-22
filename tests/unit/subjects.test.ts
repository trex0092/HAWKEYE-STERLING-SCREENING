import { describe, it, expect } from "vitest";
import { SUBJECTS, QUEUE_FILTERS } from "@/lib/data/subjects";

describe("subjects seed", () => {
  it("ships empty — the console starts with a clean register", () => {
    expect(SUBJECTS).toHaveLength(0);
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
