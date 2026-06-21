import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/rbac";

// ── Analyst override capture (oversight feedback loop) ───────────────────────
// Records when an analyst overrides the system's suggested verdict, with a
// MANDATORY reason. This closes the human-oversight feedback loop: overrides +
// rationale are the signal a periodic review uses to recalibrate thresholds and
// prompts. Enforced in-process from the request (no DB in this demo); a sign-off
// that lacks a reason or uses an invalid verdict is rejected, never accepted.
//
// RBAC-gated (zero-trust): recording a disposition override needs the
// "case.disposition" permission, mirroring the other privileged routes. Under
// HAWKEYE_RBAC_STRICT an anonymous caller is rejected (401); otherwise an
// anonymous caller resolves to the least-privileged "analyst" role, which holds
// the permission, so the offline demo keeps working.

type Verdict = "clear" | "review" | "escalate" | "block";
const VERDICTS: ReadonlyArray<Verdict> = ["clear", "review", "escalate", "block"];

interface OverrideBody {
  caseId?: string;
  analyst?: string;
  systemDecision?: string;
  analystDecision?: string;
  reason?: string;
}

function norm(v: string | undefined): string {
  return (v ?? "").trim();
}

export async function POST(req: Request) {
  const authz = authorize(req, "case.disposition");
  if (!authz.ok) {
    return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });
  }

  const body = (await req.json().catch(() => ({}))) as OverrideBody;

  const caseId = norm(body.caseId);
  const analyst = norm(body.analyst);
  const systemDecision = norm(body.systemDecision).toLowerCase();
  const analystDecision = norm(body.analystDecision).toLowerCase();
  const reason = norm(body.reason);

  if (!caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 422 });
  }
  if (!analyst) {
    return NextResponse.json({ ok: false, error: "analyst is required." }, { status: 422 });
  }
  if (!VERDICTS.includes(systemDecision as Verdict)) {
    return NextResponse.json(
      { ok: false, error: "systemDecision must be clear | review | escalate | block." },
      { status: 422 },
    );
  }
  if (!VERDICTS.includes(analystDecision as Verdict)) {
    return NextResponse.json(
      { ok: false, error: "analystDecision must be clear | review | escalate | block." },
      { status: 422 },
    );
  }
  if (!reason) {
    return NextResponse.json(
      { ok: false, error: "A documented reason is mandatory when recording an override." },
      { status: 422 },
    );
  }

  const overridden = systemDecision !== analystDecision;

  return NextResponse.json({
    ok: true,
    caseId,
    analyst,
    systemDecision,
    analystDecision,
    overridden,
    reason,
    recordedAt: new Date().toISOString(),
  });
}
