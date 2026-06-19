import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/quick-screen/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/quick-screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/quick-screen", () => {
  it("returns a well-formed verdict", async () => {
    const res = await post({
      subject: { name: "Boris Volkov", entityType: "individual", jurisdiction: "RU" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.topScore).toBeGreaterThanOrEqual(0);
    expect(data.topScore).toBeLessThanOrEqual(99);
    expect(["critical", "high", "medium", "low"]).toContain(data.severity);
    expect(Array.isArray(data.hits)).toBe(true);
    expect(data.reasoning.factors.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same name", async () => {
    const a = await (await post({ subject: { name: "Acme Holdings" } })).json();
    const b = await (await post({ subject: { name: "Acme Holdings" } })).json();
    expect(a.topScore).toBe(b.topScore);
  });

  it("never throws on an empty body", async () => {
    const res = await POST(new Request("http://localhost/api/quick-screen", { method: "POST" }));
    expect(res.status).toBe(200);
  });

  it("fabricates nothing without a live list source", async () => {
    // No SANCTIONS_LIVE in test → no live source → must claim no findings.
    const data = await (await post({ subject: { name: "Ozcan Halac" } })).json();
    expect(data.live).toBe(false);
    expect(data.sanctioned).toBe(false);
    expect(data.pep).toBe(false);
    expect(data.lists).toEqual([]);
    expect(data.hits).toEqual([]);
    expect(data.topScore).toBe(0);
  });
});
