import { describe, it, expect } from "vitest";
import { OPERATORS, operatorById } from "@/lib/data/operators";

describe("OPERATORS", () => {
  it("has the 14 analyst personas with unique ids", () => {
    expect(OPERATORS).toHaveLength(14);
    const ids = OPERATORS.map((o) => o.id);
    expect(new Set(ids).size).toBe(14);
  });

  it("each persona is well-formed", () => {
    for (const o of OPERATORS) {
      expect(o.name.length).toBeGreaterThan(0);
      expect(o.role.length).toBeGreaterThan(0);
      expect(o.img).toBe(`/personas/persona-${o.id}.webp`);
      expect(o.ac).toMatch(/^\d{1,3},\d{1,3},\d{1,3}$/);
      expect(o.pos).toMatch(/%/);
    }
  });

  it("resolves by id and falls back to the first persona", () => {
    expect(operatorById("talon").name).toBe("Talon");
    expect(operatorById(undefined).id).toBe(OPERATORS[0]!.id);
    expect(operatorById("does-not-exist").id).toBe(OPERATORS[0]!.id);
  });
});
