import { describe, it, expect, afterEach } from "vitest";
import { POST } from "@/app/api/override/route";

function post(body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return POST(
    new Request("http://localhost/api/override", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

const FULL = {
  caseId: "C1",
  analyst: "ember",
  systemDecision: "block",
  analystDecision: "review",
  reason: "False positive — verified DOB mismatch.",
};

afterEach(() => {
  delete process.env.HAWKEYE_RBAC_STRICT;
});

describe("POST /api/override (RBAC / zero-trust)", () => {
  it("rejects an anonymous caller under strict mode with 401", async () => {
    process.env.HAWKEYE_RBAC_STRICT = "1";
    const res = await post(FULL);
    expect(res.status).toBe(401);
  });

  it("allows an analyst (has case.disposition) in non-strict mode", async () => {
    const res = await post(FULL, { "x-hawkeye-actor": "ember", "x-hawkeye-role": "analyst" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("rejects an auditor (lacks case.disposition) with 403", async () => {
    const res = await post(FULL, { "x-hawkeye-actor": "brass", "x-hawkeye-role": "auditor" });
    expect(res.status).toBe(403);
  });
});
