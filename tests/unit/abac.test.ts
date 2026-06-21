import { describe, it, expect } from "vitest";
import { evaluateAbac, subjectFromIdentity } from "@/lib/auth/abac";

const LEVELS = ["public", "internal", "confidential", "restricted"];

describe("evaluateAbac", () => {
  it("allows when every rule passes", () => {
    const d = evaluateAbac(
      {
        subject: { jurisdiction: "GB", clearance: "confidential", env: "prod" },
        resource: { jurisdiction: "GB", classification: "internal" },
      },
      {
        matchAttrs: ["jurisdiction"],
        classificationLevels: LEVELS,
        allowEnv: ["prod"],
      },
    );
    expect(d.allow).toBe(true);
    expect(d.reasons).toEqual([]);
  });

  it("denies a jurisdiction mismatch", () => {
    const d = evaluateAbac(
      { subject: { jurisdiction: "GB" }, resource: { jurisdiction: "US" } },
      { matchAttrs: ["jurisdiction"] },
    );
    expect(d.allow).toBe(false);
    expect(d.reasons[0]).toMatch(/jurisdiction/);
  });

  it("passes a match when subject holds the value in an array", () => {
    const d = evaluateAbac(
      { subject: { jurisdiction: ["GB", "US"] }, resource: { jurisdiction: "US" } },
      { matchAttrs: ["jurisdiction"] },
    );
    expect(d.allow).toBe(true);
  });

  it("denies when clearance is below the resource classification", () => {
    const d = evaluateAbac(
      { subject: { clearance: "internal" }, resource: { classification: "restricted" } },
      { classificationLevels: LEVELS },
    );
    expect(d.allow).toBe(false);
    expect(d.reasons[0]).toMatch(/clearance/);
  });

  it("denies an environment outside the allow-list", () => {
    const d = evaluateAbac({ subject: { env: "dev" }, resource: {} }, { allowEnv: ["prod"] });
    expect(d.allow).toBe(false);
    expect(d.reasons[0]).toMatch(/environment/);
  });

  it("builds a subject bag from an RBAC identity", () => {
    const subj = subjectFromIdentity({ actor: "sterling", role: "mlro" }, { jurisdiction: "GB" });
    expect(subj).toMatchObject({ actor: "sterling", role: "mlro", jurisdiction: "GB" });
  });
});
