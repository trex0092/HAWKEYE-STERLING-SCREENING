"use client";

import type { Subject } from "@/lib/types";

export interface ComparePanelProps {
  subjectA: Subject;
  subjectB: Subject;
  onClose: () => void;
  onSelect: (id: string) => void;
}

interface CompareRow {
  key: string;
  label: string;
  a: string;
  b: string;
}

function fieldValue(s: Subject, key: string): string {
  switch (key) {
    case "id":
      return s.id;
    case "country":
      return s.country;
    case "entityType":
      return s.entityType;
    case "riskScore":
      return String(s.riskScore);
    case "status":
      return s.status;
    case "cddPosture":
      return s.cddPosture;
    case "listCoverage":
      return s.listCoverage.length > 0 ? s.listCoverage.join(", ") : "—";
    case "pepTier":
      return s.pep?.tier ?? "—";
    case "mostSerious":
      return s.mostSerious;
    case "slaNotify":
      return s.slaNotify;
    default:
      return "—";
  }
}

const ROW_DEFS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "id", label: "ID" },
  { key: "country", label: "Country" },
  { key: "entityType", label: "Entity type" },
  { key: "riskScore", label: "Risk score" },
  { key: "status", label: "Status" },
  { key: "cddPosture", label: "CDD posture" },
  { key: "listCoverage", label: "List coverage" },
  { key: "pepTier", label: "PEP tier" },
  { key: "mostSerious", label: "Most serious" },
  { key: "slaNotify", label: "SLA notify" },
];

export function ComparePanel({ subjectA, subjectB, onClose, onSelect }: ComparePanelProps) {
  const rows: CompareRow[] = ROW_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    a: fieldValue(subjectA, def.key),
    b: fieldValue(subjectB, def.key),
  }));

  return (
    <aside className="h-full overflow-y-auto border-l border-hair-2 bg-bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-12 font-semibold text-ink-0">Compare</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close compare panel"
          className="rounded-lg px-1.5 py-0.5 text-12 text-ink-3 transition hover:bg-bg-1 hover:text-ink-1"
        >
          ✕
        </button>
      </div>

      {/* Name header row */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelect(subjectA.id)}
          className="truncate rounded-lg border border-hair-2 bg-bg-1 px-2 py-1.5 text-left text-12 font-medium text-ink-0 transition hover:bg-bg-2"
          title={subjectA.name}
        >
          {subjectA.name}
        </button>
        <button
          type="button"
          onClick={() => onSelect(subjectB.id)}
          className="truncate rounded-lg border border-hair-2 bg-bg-1 px-2 py-1.5 text-left text-12 font-medium text-ink-0 transition hover:bg-bg-2"
          title={subjectB.name}
        >
          {subjectB.name}
        </button>
      </div>

      <div className="divide-y divide-hair">
        {rows.map((row) => {
          const differs = row.a !== row.b;
          return (
            <div
              key={row.key}
              className={"grid grid-cols-2 gap-2 py-1.5 " + (differs ? "bg-amber-dim/40" : "")}
            >
              <div className="col-span-2 text-10 uppercase tracking-wide-3 text-ink-3">
                {row.label}
              </div>
              <div className={"break-words text-11 " + (differs ? "text-amber" : "text-ink-2")}>
                {row.a}
              </div>
              <div className={"break-words text-11 " + (differs ? "text-amber" : "text-ink-2")}>
                {row.b}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
