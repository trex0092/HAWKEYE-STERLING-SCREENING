// ── Role-based access control (RBAC) ─────────────────────────────────────────
// Lightweight, offline-capable RBAC for the screening console. This demo has no
// auth server, so identity is taken from request context (an x-hawkeye-actor
// header, or a named actor in a payload) and resolved to a role. The RULES are
// real and enforced server-side — a caller without the right permission is
// rejected, never silently allowed; only the identity *source* is demo-grade.
//
// Set HAWKEYE_RBAC_STRICT=1 for a production posture: an unknown/anonymous
// caller is rejected (401). Unset (default), an anonymous caller resolves to the
// least-privileged "analyst" role so the offline demo keeps working — mirroring
// the graceful-degradation pattern of the four-eyes and audit-sign routes.

export type Role = "analyst" | "mlro" | "auditor" | "admin";

export type Permission =
  "screen.run" | "case.disposition" | "signoff.hard-outcome" | "audit.export" | "config.manage";

const ROLES: ReadonlyArray<Role> = ["analyst", "mlro", "auditor", "admin"];

const ROLE_PERMISSIONS: Record<Role, ReadonlyArray<Permission>> = {
  analyst: ["screen.run", "case.disposition"],
  mlro: ["screen.run", "case.disposition", "signoff.hard-outcome", "audit.export"],
  auditor: ["audit.export"],
  admin: [
    "screen.run",
    "case.disposition",
    "signoff.hard-outcome",
    "audit.export",
    "config.manage",
  ],
};

// Default role assignments map onto the existing operator personas
// (src/lib/data/operators.ts). Everyone else defaults to "analyst".
const DEFAULT_ROLE_BY_ACTOR: Record<string, Role> = {
  sterling: "mlro", // Entity Risk Assessment lead
  sentinel: "mlro", // Sanctions Evasion & Watchlists
  brass: "auditor", // Records & Audit
};

export interface Identity {
  actor: string;
  role: Role;
}

function isRole(v: string): v is Role {
  return (ROLES as ReadonlyArray<string>).includes(v);
}

/** Resolve a role for an actor, honouring an explicit role hint when valid. */
export function roleForActor(actor: string, explicit?: string): Role {
  const hint = (explicit ?? "").trim().toLowerCase();
  if (isRole(hint)) return hint;
  return DEFAULT_ROLE_BY_ACTOR[actor.trim().toLowerCase()] ?? "analyst";
}

/** Does a role hold a permission? */
export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm);
}

/** Resolve identity from request headers. Null only in strict mode with no actor. */
export function identityFromRequest(req: Request): Identity | null {
  const actor = (req.headers.get("x-hawkeye-actor") ?? "").trim();
  const role = req.headers.get("x-hawkeye-role") ?? undefined;
  if (!actor) {
    if (process.env.HAWKEYE_RBAC_STRICT === "1") return null;
    return { actor: "anonymous", role: "analyst" };
  }
  return { actor, role: roleForActor(actor, role) };
}

export interface AuthzResult {
  ok: boolean;
  status: number;
  identity?: Identity;
  error?: string;
}

/** Authorize a request for a permission using header-derived identity. */
export function authorize(req: Request, perm: Permission): AuthzResult {
  const identity = identityFromRequest(req);
  if (!identity) {
    return { ok: false, status: 401, error: "Authentication required: no identity on request." };
  }
  if (!can(identity.role, perm)) {
    return {
      ok: false,
      status: 403,
      error: `Role "${identity.role}" lacks permission "${perm}".`,
    };
  }
  return { ok: true, status: 200, identity };
}
