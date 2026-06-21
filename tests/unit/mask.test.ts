import { describe, it, expect } from "vitest";
import { maskName, maskId, maskEmail, maskValue } from "@/lib/mask";

describe("maskName", () => {
  it("keeps initials only", () => {
    expect(maskName("John Smith")).toBe("J··· S····");
  });
  it("handles empty input", () => {
    expect(maskName("  ")).toBe("");
  });
});

describe("maskId", () => {
  it("keeps the last 4 by default", () => {
    expect(maskId("AB1234567")).toBe("·····4567");
  });
  it("fully masks a short id", () => {
    expect(maskId("abc")).toBe("···");
  });
});

describe("maskEmail", () => {
  it("keeps first local char and domain", () => {
    expect(maskEmail("jane.doe@acme.com")).toBe("j·······@acme.com");
  });
});

describe("maskValue", () => {
  it("treats values with @ as emails", () => {
    expect(maskValue("a@b.com")).toContain("@b.com");
  });
  it("treats other values as names", () => {
    expect(maskValue("Jane Doe")).toBe("J··· D··");
  });
});
