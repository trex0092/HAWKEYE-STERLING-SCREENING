// ── Attribute-based access control (ABAC) ────────────────────────────────────
// Complements the static role matrix in `rbac.ts` with *dynamic* checks on the
// attributes of the subject, the resource, and the environment — e.g. "an
// analyst may only screen subjects in their own jurisdiction", or "a record
// classified `restricted` needs a matching clearance". Pure and offline-safe:
// no I/O, never throws. RBAC answers "may this role do X at all?"; ABAC answers
// "given these attributes, is this specific access allowed right now?". Use them
// together — RBAC first (coarse), ABAC second (fine-grained).

import type { Identity } from "./rbac";

export type AttrValue = string | number | boolean;
export type Attributes = Record<string, AttrValue | AttrValue[]>;

export interface AbacRequest {
  /** Who/what is asking — typically RBAC identity attrs plus jurisdiction/clearance/env. */
  subject: Attributes;
  /** The thing being accessed — e.g. its jurisdiction and classification. */
  resource: Attributes;
}

export interface AbacPolicy {
  /**
   * Attribute keys whose subject value must satisfy the resource value. A scalar
   * must be equal; if either side is an array the rule passes when they
   * intersect (e.g. subject jurisdictions ⊇ resource jurisdiction).
   */
  matchAttrs?: string[];
  /**
   * Ordered classification levels, lowest → highest (e.g. ["public","internal",
   * "confidential","restricted"]). The subject's clearance must be at least the
   * resource's classification.
   */
  classificationLevels?: string[];
  /** Subject key holding the clearance level (default "clearance"). */
  subjectClearanceKey?: string;
  /** Resource key holding the classification level (default "classification"). */
  resourceClassificationKey?: string;
  /** When set, subject.env must be one of these values. */
  allowEnv?: string[];
  /** Subject key holding the environment (default "env"). */
  subjectEnvKey?: string;
}

export interface AbacDecision {
  allow: boolean;
  /** Human-readable reason(s) a request was denied; empty when allowed. */
  reasons: string[];
}

function toArray(v: AttrValue | AttrValue[] | undefined): AttrValue[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** True when the two attribute values share at least one element (or are equal). */
function intersects(
  a: AttrValue | AttrValue[] | undefined,
  b: AttrValue | AttrValue[] | undefined,
): boolean {
  const as = toArray(a);
  const bs = toArray(b);
  if (as.length === 0 || bs.length === 0) return false;
  return as.some((x) => bs.includes(x));
}

/**
 * Evaluate an ABAC request against a policy. Returns `allow:true` only when every
 * configured rule passes; otherwise lists the failing rules in `reasons`.
 */
export function evaluateAbac(req: AbacRequest, policy: AbacPolicy): AbacDecision {
  const reasons: string[] = [];
  const subject = req.subject ?? {};
  const resource = req.resource ?? {};

  for (const key of policy.matchAttrs ?? []) {
    if (!intersects(subject[key], resource[key])) {
      reasons.push(`attribute "${key}" mismatch (subject vs resource)`);
    }
  }

  if (policy.classificationLevels && policy.classificationLevels.length > 0) {
    const subjKey = policy.subjectClearanceKey ?? "clearance";
    const resKey = policy.resourceClassificationKey ?? "classification";
    const order = policy.classificationLevels;
    const subjLevel = order.indexOf(String(subject[subjKey] ?? ""));
    const resLevel = order.indexOf(String(resource[resKey] ?? ""));
    if (resLevel === -1) {
      reasons.push(`resource classification "${String(resource[resKey])}" is not a known level`);
    } else if (subjLevel === -1 || subjLevel < resLevel) {
      reasons.push(
        `clearance "${String(subject[subjKey])}" below required classification "${String(
          resource[resKey],
        )}"`,
      );
    }
  }

  if (policy.allowEnv && policy.allowEnv.length > 0) {
    const envKey = policy.subjectEnvKey ?? "env";
    const env = String(subject[envKey] ?? "");
    if (!policy.allowEnv.includes(env)) {
      reasons.push(`environment "${env}" not in allow-list`);
    }
  }

  return { allow: reasons.length === 0, reasons };
}

/** Convenience: build a subject attribute bag from an RBAC identity + extra attrs. */
export function subjectFromIdentity(identity: Identity, extra: Attributes = {}): Attributes {
  return { actor: identity.actor, role: identity.role, ...extra };
}
