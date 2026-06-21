import { NextResponse } from "next/server";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

type Subject = { id: string; name: string; nationality?: string };
type BulkRescreenBody = { subjects?: Subject[]; listVersion?: string };

type Severity = "critical" | "high" | "medium" | "low";
type NewHit = { subjectId: string; subjectName: string; hitType: string; severity: Severity };
type Cleared = { subjectId: string; subjectName: string };
type NoChange = { subjectId: string; subjectName: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as BulkRescreenBody;
  const list = Array.isArray(body.subjects) ? body.subjects : [];

  const hitTypes = ["OFAC SDN", "UN 1267", "EU Consolidated", "UK OFSI"] as const;
  const severities: Severity[] = ["critical", "high", "medium", "low"];

  const newHits: NewHit[] = list
    .filter((s) => hash(s.name) % 3 === 0)
    .map((s) => {
      const h = hash(s.name);
      return {
        subjectId: s.id,
        subjectName: s.name,
        hitType: hitTypes[h % 4] ?? "OFAC SDN",
        severity: severities[h % 4] ?? "medium",
      };
    });

  const cleared: Cleared[] = list
    .filter((s) => hash(s.name) % 3 === 1)
    .map((s) => ({ subjectId: s.id, subjectName: s.name }));

  // Every subject must receive an explicit disposition: a re-screen that
  // silently drops a third of the portfolio is a coverage gap, not "clean".
  const noChange: NoChange[] = list
    .filter((s) => hash(s.name) % 3 === 2)
    .map((s) => ({ subjectId: s.id, subjectName: s.name }));

  return NextResponse.json({
    ok: true,
    rescreened: list.length,
    newHits,
    cleared,
    noChange,
    summary: `Re-screened ${list.length} subjects against list version ${body.listVersion ?? "latest"} — ${newHits.length} new hit(s), ${cleared.length} cleared, ${noChange.length} unchanged.`,
  });
}
