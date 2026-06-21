import { describe, it, expect } from "vitest";
import { tokenize, tokenizeAll } from "@/lib/tokenize";

describe("tokenize", () => {
  it("is deterministic for the same value + salt", () => {
    expect(tokenize("Jane Doe", "s1")).toBe(tokenize("Jane Doe", "s1"));
  });

  it("produces the tok_<16 hex> shape", () => {
    expect(tokenize("Jane Doe")).toMatch(/^tok_[0-9a-f]{16}$/);
  });

  it("varies by salt (context scoping)", () => {
    expect(tokenize("Jane Doe", "tenantA")).not.toBe(tokenize("Jane Doe", "tenantB"));
  });

  it("varies by value", () => {
    expect(tokenize("Jane Doe", "s")).not.toBe(tokenize("John Doe", "s"));
  });

  it("returns empty for empty input", () => {
    expect(tokenize("")).toBe("");
  });

  it("tokenizes a list", () => {
    const out = tokenizeAll(["a", "b"], "s");
    expect(out).toHaveLength(2);
    expect(out[0]).not.toBe(out[1]);
  });
});
