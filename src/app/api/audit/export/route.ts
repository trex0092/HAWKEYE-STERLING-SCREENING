import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { authorize } from "@/lib/auth/rbac";
import { maskValue } from "@/lib/mask";

// ── Audit-log export ─────────────────────────────────────────────────────────
// Produces a portable, integrity-stamped export of the audit trail for a
// compliance reviewer. RBAC-gated: only a role with the "audit.export"
// permission (auditor / mlro / admin) may call it. The client holds the log
// (localStorage), so it POSTs the entries; we normalise them, emit CSV, and
// stamp a SHA-256 over the content so any later tampering is detectable.

interface AuditEntryInput {
  ts?: string;
  actor?: string;
  action?: string;
  target?: string;
}

interface Body {
  entries?: AuditEntryInput[];
  /** When true, redact PII (actor/target) before emitting + hashing the CSV. */
  mask?: boolean;
}

function csvCell(v: string): string {
  // Quote and escape per RFC 4180 when the value contains a comma, quote or newline.
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function POST(req: Request) {
  const authz = authorize(req, "audit.export");
  if (!authz.ok) {
    return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const entries = Array.isArray(body.entries) ? body.entries : [];
  const masked = body.mask === true;

  const rows = entries.map((e) => ({
    ts: String(e.ts ?? ""),
    actor: masked ? maskValue(String(e.actor ?? "")) : String(e.actor ?? ""),
    action: String(e.action ?? ""),
    target: masked ? maskValue(String(e.target ?? "")) : String(e.target ?? ""),
  }));

  const header = "ts,actor,action,target";
  const csv = [
    header,
    ...rows.map((r) => [r.ts, r.actor, r.action, r.target].map(csvCell).join(",")),
  ].join("\n");

  const contentHash = createHash("sha256").update(csv).digest("hex");

  return NextResponse.json({
    ok: true,
    count: rows.length,
    format: "csv",
    csv,
    algo: "SHA-256",
    contentHash,
    masked,
    exportedBy: authz.identity?.actor,
    exportedAt: new Date().toISOString(),
  });
}
