import { describe, it, expect, beforeEach } from "vitest";
import { hashText, recordLlmCall, readLlmLog, clearLlmLog } from "@/lib/ai/llm-log";

describe("llm-log (drift observability)", () => {
  beforeEach(() => clearLlmLog());

  it("hashText is stable, differs on change, and is 8 hex chars", () => {
    expect(hashText("abc")).toBe(hashText("abc"));
    expect(hashText("abc")).not.toBe(hashText("abd"));
    expect(hashText("abc")).toMatch(/^[0-9a-f]{8}$/);
  });

  it("records a call and reads it back with a timestamp", () => {
    recordLlmCall({
      task: "classifyAdverseMedia",
      model: "m",
      promptHash: "h",
      outcome: "ok",
      ms: 5,
    });
    const log = readLlmLog();
    expect(log.length).toBe(1);
    expect(log[0]!.task).toBe("classifyAdverseMedia");
    expect(typeof log[0]!.ts).toBe("string");
  });

  it("caps the log at 500 entries", () => {
    for (let i = 0; i < 600; i++) {
      recordLlmCall({ task: "t", model: "m", promptHash: "h", outcome: "ok", ms: 1 });
    }
    expect(readLlmLog().length).toBe(500);
  });
});
