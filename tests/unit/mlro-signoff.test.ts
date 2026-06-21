import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/mlro-signoff/route";

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/mlro-signoff", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/mlro-signoff (hard-outcome gate)", () => {
  it("rejects a signer who is not an MLRO (403)", async () => {
    const res = await post({ caseId: "C1", outcome: "block", mlro: "ember", rationale: "x" });
    expect(res.status).toBe(403);
  });

  it("requires a documented rationale", async () => {
    const res = await post({ caseId: "C1", outcome: "block", mlro: "sterling" });
    expect(res.status).toBe(422);
  });

  it("rejects a non-hard outcome", async () => {
    const res = await post({ caseId: "C1", outcome: "clear", mlro: "sterling", rationale: "x" });
    expect(res.status).toBe(422);
  });

  it("enforces separation of duties (analyst !== mlro)", async () => {
    const res = await post({
      caseId: "C1",
      outcome: "block",
      analyst: "sterling",
      mlro: "sterling",
      rationale: "x",
    });
    expect(res.status).toBe(422);
  });

  it("finalizes a valid MLRO sign-off", async () => {
    const res = await post({
      caseId: "C1",
      outcome: "escalate",
      analyst: "ember",
      mlro: "sterling",
      rationale: "Confirmed adverse media; EDD required.",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.finalized).toBe(true);
    expect(data.signerRole).toBe("mlro");
    expect(typeof data.recordedAt).toBe("string");
  });
});
