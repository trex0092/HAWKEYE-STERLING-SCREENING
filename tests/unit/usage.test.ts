import { describe, it, expect } from "vitest";
import { summariseAudit, summariseLlm } from "@/lib/usage";
import type { AuditEntry } from "@/lib/audit";
import type { LlmLogEntry } from "@/lib/ai/llm-log";

const audit: AuditEntry[] = [
  { ts: "t1", actor: "ember", action: "Screened", target: "A" },
  { ts: "t2", actor: "ember", action: "Escalated", target: "B" },
  { ts: "t3", actor: "sterling", action: "Screened", target: "C" },
];

const llm: LlmLogEntry[] = [
  {
    ts: "t1",
    task: "classifyAdverseMedia",
    model: "claude-opus-4-8",
    promptHash: "1",
    outcome: "ok",
    ms: 100,
  },
  {
    ts: "t2",
    task: "classifyAdverseMedia",
    model: "claude-opus-4-8",
    promptHash: "2",
    outcome: "error",
    ms: 200,
  },
  {
    ts: "t3",
    task: "screeningReasoning",
    model: "claude-opus-4-8",
    promptHash: "3",
    outcome: "rejected",
    ms: 50,
  },
];

describe("summariseAudit", () => {
  it("counts events per actor and action", () => {
    const s = summariseAudit(audit);
    expect(s.totalEvents).toBe(3);
    expect(s.uniqueActors).toBe(2);
    expect(s.byActor.ember).toBe(2);
    expect(s.byAction.Screened).toBe(2);
  });

  it("is safe on empty input", () => {
    expect(summariseAudit([]).totalEvents).toBe(0);
  });
});

describe("summariseLlm", () => {
  it("counts calls per task, model and outcome", () => {
    const s = summariseLlm(llm);
    expect(s.totalCalls).toBe(3);
    expect(s.byTask.classifyAdverseMedia).toBe(2);
    expect(s.byModel["claude-opus-4-8"]).toBe(3);
    expect(s.byOutcome).toEqual({ ok: 1, rejected: 1, error: 1 });
  });
});
