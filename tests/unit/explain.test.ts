import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/explain/route";
import { resetRateLimits } from "@/lib/auth/rate-limit";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/explain (deterministic explainability)", () => {
  beforeEach(() => resetRateLimits());

  it("explains a score with its band and ranks factors by contribution", async () => {
    const res = await post({
      name: "Acme Trading LLC",
      score: 82,
      factors: [
        { label: "PEP exposure", weight: 70, detail: "yes" },
        { label: "Sanctions exposure", weight: 80, detail: "OFAC" },
      ],
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.decision).toBe("escalate");
    expect(data.topFactors[0].label).toBe("Sanctions exposure");
    expect(data.explanation).toContain("escalate");
  });

  it("clamps the score and defaults the name", async () => {
    const data = await (await post({ score: 999 })).json();
    expect(data.score).toBe(100);
    expect(data.decision).toBe("block");
    expect(data.name).toBe("subject");
  });
});
