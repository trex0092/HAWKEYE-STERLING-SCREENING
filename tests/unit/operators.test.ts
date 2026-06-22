import { describe, it, expect } from "vitest";
import { OPERATORS, operatorById } from "@/lib/data/operators";

describe("OPERATORS", () => {
  it("ships empty — no seed analyst roster", () => {
    expect(OPERATORS).toHaveLength(0);
  });
});

describe("operatorById", () => {
  it("returns undefined for any id when the roster is empty", () => {
    expect(operatorById("talon")).toBeUndefined();
    expect(operatorById("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an undefined id", () => {
    expect(operatorById(undefined)).toBeUndefined();
  });
});
