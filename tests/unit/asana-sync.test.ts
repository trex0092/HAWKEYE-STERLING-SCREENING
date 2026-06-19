import { describe, it, expect } from "vitest";
import { GET, POST } from "@/app/api/asana/sync/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/asana/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/asana/sync (no token)", () => {
  it("returns a deterministic mock task when ASANA_ACCESS_TOKEN is unset", async () => {
    const res = await post({
      subjectId: "HS-10001",
      name: "Boris Volkov",
      risk: 96,
      status: "escalated",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mocked).toBe(true);
    expect(String(data.taskGid)).toContain("mock-HS-10001");
  });

  it("tolerates an empty body", async () => {
    const res = await post({});
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.mocked).toBe(true);
  });
});

describe("GET /api/asana/sync", () => {
  it("reports configured=false without a token", async () => {
    const res = GET();
    const data = await res.json();
    expect(data.configured).toBe(false);
  });
});
