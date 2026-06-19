import { describe, it, expect } from "vitest";
import { caughtErrorMessage } from "@/lib/client/error-utils";

describe("caughtErrorMessage", () => {
  it("returns the Error message", () => {
    expect(caughtErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("returns a non-empty string input", () => {
    expect(caughtErrorMessage("oops", "fallback")).toBe("oops");
  });

  it("reads a message property from an object", () => {
    expect(caughtErrorMessage({ message: "obj-msg" }, "fallback")).toBe("obj-msg");
  });

  it("falls back for unknown / empty shapes", () => {
    expect(caughtErrorMessage(null, "fallback")).toBe("fallback");
    expect(caughtErrorMessage(123, "fallback")).toBe("fallback");
    expect(caughtErrorMessage("   ", "fallback")).toBe("fallback");
  });
});
