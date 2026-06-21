import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/audit/export/route";

function post(body: unknown, headers: Record<string, string> = {}): Promise<Response> {
  return POST(
    new Request("http://localhost/api/audit/export", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/audit/export", () => {
  it("denies an unauthorized caller (analyst) with 403", async () => {
    const res = await post({ entries: [] });
    expect(res.status).toBe(403);
  });

  it("exports CSV + SHA-256 content hash for an auditor", async () => {
    const res = await post(
      {
        entries: [
          { ts: "2026-06-21T00:00:00Z", actor: "ember", action: "Escalated", target: "X, Y" },
        ],
      },
      { "x-hawkeye-actor": "brass" },
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.count).toBe(1);
    expect(data.csv).toContain("ts,actor,action,target");
    expect(data.csv).toContain('"X, Y"'); // RFC-4180 escaped
    expect(data.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(data.exportedBy).toBe("brass");
  });
});
