import { NextResponse } from "next/server";
import { authorize } from "@/lib/auth/rbac";

// ── Four-eyes (maker-checker) control ────────────────────────────────────────
// Enforces the core dual-control rule: the person who made a decision (`maker`)
// can never be the one who approves/rejects it (`checker`). This runs in-process
// from the request payload — an offline demo has no auth/session/DB — but the
// rule itself is real: a request that violates separation of duties is rejected,
// never silently accepted.

type Decision = "approve" | "reject";
const DECISIONS: ReadonlyArray<Decision> = ["approve", "reject"];

interface FourEyesBody {
  caseId?: string;
  maker?: string;
  checker?: string;
  decision?: string;
  comment?: string;
}

function norm(v: string | undefined): string {
  return (v ?? "").trim();
}

export async function POST(req: Request) {
  const authz = authorize(req, "case.disposition");
  if (!authz.ok) {
    return NextResponse.json({ ok: false, error: authz.error }, { status: authz.status });
  }

  const body = (await req.json().catch(() => ({}))) as FourEyesBody;

  const caseId = norm(body.caseId);
  const maker = norm(body.maker);
  const checker = norm(body.checker);
  const decision = norm(body.decision).toLowerCase();

  if (!caseId) {
    return NextResponse.json({ ok: false, error: "caseId is required." }, { status: 422 });
  }
  if (!maker) {
    return NextResponse.json(
      { ok: false, error: "maker (original decision-maker) is required." },
      { status: 422 },
    );
  }
  if (!checker) {
    return NextResponse.json(
      { ok: false, error: "checker (approver) is required for four-eyes review." },
      { status: 422 },
    );
  }
  if (!DECISIONS.includes(decision as Decision)) {
    return NextResponse.json(
      { ok: false, error: 'decision must be "approve" or "reject".' },
      { status: 422 },
    );
  }

  // The control: a maker may not check their own work (case-insensitive).
  if (maker.toLowerCase() === checker.toLowerCase()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Four-eyes violation: the checker must be a different person from the maker. Self-approval is not permitted.",
      },
      { status: 422 },
    );
  }

  const approved = decision === "approve";
  return NextResponse.json({
    ok: true,
    caseId,
    maker,
    checker,
    decision,
    approved,
    ...(body.comment ? { comment: String(body.comment) } : {}),
    recordedAt: new Date().toISOString(),
  });
}
