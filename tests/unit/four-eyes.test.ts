import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/four-eyes/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/four-eyes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/four-eyes (maker-checker)", () => {
  it("rejects self-approval (maker === checker)", async () => {
    const res = await post({
      caseId: "HS-1",
      maker: "ember",
      checker: "ember",
      decision: "approve",
    });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(String(data.error).toLowerCase()).toContain("four-eyes");
  });

  it("rejects self-approval case-insensitively", async () => {
    const res = await post({
      caseId: "HS-1",
      maker: "Ember",
      checker: " ember ",
      decision: "reject",
    });
    expect(res.status).toBe(422);
  });

  it("rejects a missing checker", async () => {
    const res = await post({ caseId: "HS-1", maker: "ember", decision: "approve" });
    expect(res.status).toBe(422);
  });

  it("rejects an invalid decision", async () => {
    const res = await post({
      caseId: "HS-1",
      maker: "ember",
      checker: "sterling",
      decision: "maybe",
    });
    expect(res.status).toBe(422);
  });

  it("accepts a distinct checker and records the approval", async () => {
    const res = await post({
      caseId: "HS-1",
      maker: "ember",
      checker: "sterling",
      decision: "approve",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.approved).toBe(true);
    expect(data.maker).toBe("ember");
    expect(data.checker).toBe("sterling");
    expect(typeof data.recordedAt).toBe("string");
  });
});
