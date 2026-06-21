import { describe, it, expect } from "vitest";
import { roleForActor, can, authorize, identityFromRequest } from "@/lib/auth/rbac";

function reqWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/x", { headers });
}

describe("rbac", () => {
  it("maps known personas to roles, others to analyst", () => {
    expect(roleForActor("sterling")).toBe("mlro");
    expect(roleForActor("brass")).toBe("auditor");
    expect(roleForActor("ember")).toBe("analyst");
  });

  it("honours a valid explicit role hint and ignores an invalid one", () => {
    expect(roleForActor("ember", "admin")).toBe("admin");
    expect(roleForActor("ember", "bogus")).toBe("analyst");
  });

  it("enforces the permission matrix", () => {
    expect(can("analyst", "signoff.hard-outcome")).toBe(false);
    expect(can("mlro", "signoff.hard-outcome")).toBe(true);
    expect(can("auditor", "audit.export")).toBe(true);
    expect(can("auditor", "screen.run")).toBe(false);
  });

  it("resolves an anonymous caller to analyst (non-strict default)", () => {
    expect(identityFromRequest(reqWith({}))?.role).toBe("analyst");
  });

  it("authorize: denies analyst audit.export (403), allows an auditor", () => {
    expect(authorize(reqWith({}), "audit.export").status).toBe(403);
    const ok = authorize(reqWith({ "x-hawkeye-actor": "brass" }), "audit.export");
    expect(ok.ok).toBe(true);
    expect(ok.identity?.role).toBe("auditor");
  });
});
