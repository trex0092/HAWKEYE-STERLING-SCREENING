import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/screening/bulk-rescreen/route";

describe("POST /api/screening/bulk-rescreen", () => {
  it("returns rescreen counts and well-formed hits", async () => {
    const subjects = Array.from({ length: 6 }, (_, i) => ({
      id: `HS-${i}`,
      name: `Subject ${i}`,
    }));
    const res = await POST(
      new Request("http://localhost/api/screening/bulk-rescreen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subjects }),
      }),
    );
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.rescreened).toBe(6);
    expect(typeof data.summary).toBe("string");
    for (const h of data.newHits) {
      expect(["critical", "high", "medium", "low"]).toContain(h.severity);
      expect(typeof h.subjectName).toBe("string");
    }
  });

  it("handles an empty portfolio", async () => {
    const res = await POST(
      new Request("http://localhost/api/screening/bulk-rescreen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subjects: [] }),
      }),
    );
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.rescreened).toBe(0);
  });
});
