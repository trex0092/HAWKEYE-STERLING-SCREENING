import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/sla-escalation/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/sla-escalation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/sla-escalation", () => {
  it("flags breached cases and routes them to the right tier", async () => {
    const old = new Date(Date.now() - 100 * 3_600_000).toISOString(); // 100h
    const fresh = new Date().toISOString();
    const res = await post({
      cases: [
        { caseId: "A", priority: "high", openedAt: old },
        { caseId: "B", priority: "low", openedAt: fresh },
      ],
    });
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.total).toBe(2);
    expect(data.breachedCount).toBe(1);
    expect(data.escalateToMlro).toContain("A");
  });

  it("handles an empty / malformed body without throwing", async () => {
    const res = await post({});
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.total).toBe(0);
  });
});
