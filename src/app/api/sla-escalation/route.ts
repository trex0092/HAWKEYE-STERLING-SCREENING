import { NextResponse } from "next/server";
import { evaluateSla, type CasePriority } from "@/lib/sla";

// ── SLA-breach escalation ────────────────────────────────────────────────────
// Given a batch of open cases (id, priority, openedAt), deterministically reports
// which have breached their review SLA and where each must escalate (L2 / MLRO).
// Pure evaluation over the request — no DB — so it is reproducible and testable.
// The Daily Compliance Brief / case views call this to surface overdue work.

const PRIORITIES: ReadonlyArray<CasePriority> = ["critical", "high", "medium", "low"];

interface CaseInput {
  caseId?: string;
  priority?: string;
  openedAt?: string;
}

interface Body {
  cases?: CaseInput[];
}

function asPriority(v: string | undefined): CasePriority {
  const p = (v ?? "").trim().toLowerCase();
  return (PRIORITIES as ReadonlyArray<string>).includes(p) ? (p as CasePriority) : "medium";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const cases = Array.isArray(body.cases) ? body.cases : [];

  const evaluated = cases.map((c) => {
    const caseId = (c.caseId ?? "").trim() || "unknown";
    const priority = asPriority(c.priority);
    const openedAt = (c.openedAt ?? "").trim();
    const sla = evaluateSla(openedAt || new Date().toISOString(), priority);
    return { caseId, ...sla };
  });

  const breaches = evaluated.filter((e) => e.breached);

  return NextResponse.json({
    ok: true,
    total: evaluated.length,
    breachedCount: breaches.length,
    escalateToMlro: breaches.filter((b) => b.escalateTo === "MLRO").map((b) => b.caseId),
    escalateToL2: breaches.filter((b) => b.escalateTo === "L2").map((b) => b.caseId),
    cases: evaluated,
    evaluatedAt: new Date().toISOString(),
  });
}
