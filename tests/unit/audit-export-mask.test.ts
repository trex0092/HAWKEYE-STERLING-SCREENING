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

const entries = [
  { ts: "2026-06-21T00:00:00Z", actor: "John Smith", action: "Escalated", target: "Jane Doe" },
];

describe("POST /api/audit/export — PII masking", () => {
  it("redacts actor/target when mask:true", async () => {
    const res = await post({ entries, mask: true }, { "x-hawkeye-actor": "brass" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.masked).toBe(true);
    expect(data.csv).not.toContain("John Smith");
    expect(data.csv).not.toContain("Jane Doe");
    expect(data.csv).toContain("J···");
  });

  it("leaves values intact by default (backward compatible)", async () => {
    const res = await post({ entries }, { "x-hawkeye-actor": "brass" });
    const data = await res.json();
    expect(data.masked).toBe(false);
    expect(data.csv).toContain("John Smith");
  });
});
