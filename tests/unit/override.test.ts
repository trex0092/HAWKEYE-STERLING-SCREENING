import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/override/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/override", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/override (oversight feedback loop)", () => {
  it("requires a documented reason", async () => {
    const res = await post({
      caseId: "C1",
      analyst: "ember",
      systemDecision: "block",
      analystDecision: "review",
    });
    expect(res.status).toBe(422);
  });

  it("rejects an invalid verdict value", async () => {
    const res = await post({
      caseId: "C1",
      analyst: "ember",
      systemDecision: "block",
      analystDecision: "maybe",
      reason: "x",
    });
    expect(res.status).toBe(422);
  });

  it("records an override and flags it as overridden", async () => {
    const res = await post({
      caseId: "C1",
      analyst: "ember",
      systemDecision: "block",
      analystDecision: "review",
      reason: "False positive — common-name collision, verified DOB mismatch.",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.overridden).toBe(true);
    expect(typeof data.recordedAt).toBe("string");
  });

  it("records an agreement (no override) when decisions match", async () => {
    const data = await (
      await post({
        caseId: "C1",
        analyst: "ember",
        systemDecision: "escalate",
        analystDecision: "escalate",
        reason: "Concur with the system; adverse media confirmed.",
      })
    ).json();
    expect(data.overridden).toBe(false);
  });
});
