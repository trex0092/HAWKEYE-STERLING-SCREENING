import { NextResponse } from "next/server";
import { can, roleForActor } from "@/lib/auth/rbac";

// ── MLRO sign-off gate ───────────────────────────────────────────────────────
// A hard outcome (escalate / block) cannot be treated as FINAL until an MLRO
// signs off with a documented rationale. Like the four-eyes route, this enforces
// a real control in-process from the request: authorization is derived from the
// named signer's role (so it works offline — use an MLRO persona such as
// "sterling"), and a sign-off that fails any check is rejected, never accepted.

type Outcome = "escalate" | "block";
const HARD: ReadonlyArray<Outcome> = ["escalate", "block"];

interface SignoffBody {
  caseId?: string;
  outcome?: string;
  analyst?: string;
  mlro?: string;
  rationale?: string;
}

function norm(v: string | undefined): string {
  return (v ?? "").trim();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as SignoffBody;

  const caseId = norm(body.caseId);
  const outcome = norm(body.outcome).toLowerCase();
  const analyst = norm(body.analyst);
  const mlro = norm(body.mlro);
  const rationale = norm(body.rationale);

  if (!caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 422 });
  }
  if (!HARD.includes(outcome as Outcome)) {
    return NextResponse.json(
      { ok: false, error: 'outcome must be "escalate" or "block" for MLRO sign-off.' },
      { status: 422 },
    );
  }
  if (!mlro) {
    return NextResponse.json(
      { ok: false, error: "mlro (the signing officer) is required for a hard outcome." },
      { status: 422 },
    );
  }
  if (!rationale) {
    return NextResponse.json(
      { ok: false, error: "A documented rationale is mandatory for MLRO sign-off." },
      { status: 422 },
    );
  }

  // The control: the signer must actually hold the MLRO permission. Authorization
  // is derived from the named actor so the gate works offline (no auth server).
  const signerRole = roleForActor(mlro);
  if (!can(signerRole, "signoff.hard-outcome")) {
    return NextResponse.json(
      {
        ok: false,
        error: `"${mlro}" (role: ${signerRole}) is not authorized to sign off a hard outcome. An MLRO is required.`,
      },
      { status: 403 },
    );
  }

  // Separation of duties: the MLRO may not sign off their own analyst decision.
  if (analyst && analyst.toLowerCase() === mlro.toLowerCase()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Separation of duties: the signing MLRO must differ from the deciding analyst.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    caseId,
    outcome,
    finalized: true,
    ...(analyst ? { analyst } : {}),
    mlro,
    signerRole,
    rationale,
    recordedAt: new Date().toISOString(),
  });
}
