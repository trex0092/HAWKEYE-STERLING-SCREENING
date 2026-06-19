import { describe, it, expect } from "vitest";
import { lookupKnownPEP } from "@/lib/data/known-entities";

describe("lookupKnownPEP", () => {
  it("matches a known head of state", () => {
    const pep = lookupKnownPEP("Vladimir Putin");
    expect(pep).not.toBeNull();
    expect(pep?.tier).toBe("tier_1");
    expect(pep?.jurisdiction).toBe("RU");
  });

  it("is case- and whitespace-insensitive", () => {
    expect(lookupKnownPEP("  VLADIMIR   PUTIN ")).not.toBeNull();
  });

  it("reduces extra middle tokens to first + last", () => {
    expect(lookupKnownPEP("Vladimir V. Putin")).not.toBeNull();
  });

  it("returns null for unknown or empty names", () => {
    expect(lookupKnownPEP("Jane Ordinary")).toBeNull();
    expect(lookupKnownPEP("")).toBeNull();
  });
});
