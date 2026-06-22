import { describe, it, expect } from "vitest";
import { lookupKnownPEP } from "@/lib/data/known-entities";

describe("lookupKnownPEP", () => {
  it("ships empty — no seed PEPs are auto-flagged", () => {
    expect(lookupKnownPEP("Vladimir Putin")).toBeNull();
    expect(lookupKnownPEP("  VLADIMIR   PUTIN ")).toBeNull();
  });

  it("returns null for unknown or empty names", () => {
    expect(lookupKnownPEP("Jane Ordinary")).toBeNull();
    expect(lookupKnownPEP("")).toBeNull();
  });
});
