"use client";

import type { SortKey, Subject, TableColumnKey } from "@/lib/types";

export interface ScreeningTableProps {
  subjects: Subject[];
  columns: Record<TableColumnKey, boolean>;
  selectedRowIds: ReadonlySet<string>;
  onToggleRow: (id: string) => void;
  onToggleAllRows: (allOn: boolean) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: SortKey) => void;
  pendingIds: ReadonlySet<string>;
  errorIds: ReadonlySet<string>;
  compareIds: ReadonlySet<string>;
  onToggleCompare: (id: string) => void;
}

function riskColor(score: number): string {
  if (score >= 85) return "bg-red";
  if (score >= 60) return "bg-amber";
  if (score >= 40) return "bg-orange";
  return "bg-green";
}

const STATUS_STYLE: Record<Subject["status"], string> = {
  active: "bg-bg-2 text-ink-1 border-hair-2",
  review: "bg-amber-dim text-amber border-amber/30",
  escalated: "bg-red-dim text-red border-red/30",
  cleared: "bg-green-dim text-green border-green/30",
};

const CDD_STYLE: Record<Subject["cddPosture"], string> = {
  SDD: "text-ink-2",
  CDD: "text-ink-1",
  EDD: "text-amber",
};

const BADGE_TONE: Record<Subject["badgeTone"], string> = {
  violet: "bg-brand-dim text-brand",
  red: "bg-red-dim text-red",
  amber: "bg-amber-dim text-amber",
  green: "bg-green-dim text-green",
  brand: "bg-brand-dim text-brand",
};

interface SortHeaderProps {
  label: string;
  col: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: SortKey) => void;
  className?: string;
}
function SortHeader({ label, col, sortKey, sortDir, onSortChange, className }: SortHeaderProps) {
  const active = sortKey === col;
  return (
    <th className={`px-3 py-2 text-10 font-semibold uppercase tracking-wide-3 text-ink-3 ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => onSortChange(col)}
        className={`inline-flex items-center gap-1 hover:text-ink-1 transition-colors ${active ? "text-ink-1" : ""}`}
      >
        {label}
        {active && <span className="font-mono">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </button>
    </th>
  );
}

export function ScreeningTable({
  subjects,
  columns,
  selectedRowIds,
  onToggleRow,
  onToggleAllRows,
  selectedId,
  onSelect,
  onDelete,
  sortKey,
  sortDir,
  onSortChange,
  pendingIds,
  errorIds,
  compareIds,
  onToggleCompare,
}: ScreeningTableProps) {
  const allSelected = subjects.length > 0 && subjects.every((s) => selectedRowIds.has(s.id));

  return (
    <div className="bg-bg-panel border border-hair-2 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-12">
          <thead className="bg-bg-1 border-b border-hair-2">
            <tr>
              <th className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="accent-brand"
                  checked={allSelected}
                  onChange={(e) => onToggleAllRows(e.target.checked)}
                />
              </th>
              <SortHeader
                label="Subject"
                col="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSortChange={onSortChange}
                className="text-left"
              />
              {columns.risk && (
                <SortHeader label="Risk" col="riskScore" sortKey={sortKey} sortDir={sortDir} onSortChange={onSortChange} className="text-left w-[160px]" />
              )}
              {columns.status && (
                <SortHeader label="Status" col="status" sortKey={sortKey} sortDir={sortDir} onSortChange={onSortChange} className="text-left w-[110px]" />
              )}
              {columns.cdd && (
                <SortHeader label="CDD" col="cddPosture" sortKey={sortKey} sortDir={sortDir} onSortChange={onSortChange} className="text-left w-[70px]" />
              )}
              {columns.sla && (
                <SortHeader label="SLA" col="slaNotify" sortKey={sortKey} sortDir={sortDir} onSortChange={onSortChange} className="text-left w-[90px]" />
              )}
              {columns.lists && (
                <th className="px-3 py-2 text-10 font-semibold uppercase tracking-wide-3 text-ink-3 text-left w-[150px]">Lists</th>
              )}
              {columns.snooze && (
                <th className="px-3 py-2 text-10 font-semibold uppercase tracking-wide-3 text-ink-3 text-left w-[110px]">Snooze</th>
              )}
              <th className="px-3 py-2 w-[90px]" />
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {subjects.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-ink-3 text-12">
                  No subjects match the current filters.
                </td>
              </tr>
            )}
            {subjects.map((s) => {
              const isSelected = s.id === selectedId;
              const isPending = pendingIds.has(s.id);
              const isError = errorIds.has(s.id);
              const inCompare = compareIds.has(s.id);
              const isSnoozed = Boolean(s.snoozedUntil);
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-brand-dim/50" : "hover:bg-bg-1"
                  }`}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.name}`}
                      className="accent-brand"
                      checked={selectedRowIds.has(s.id)}
                      onChange={() => onToggleRow(s.id)}
                    />
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-10 font-mono ${BADGE_TONE[s.badgeTone]}`}>
                        {s.badge}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-ink-0 truncate">{s.name}</span>
                          {isError && (
                            <span className="text-10 text-red border border-red/30 bg-red-dim rounded px-1">error</span>
                          )}
                        </div>
                        <div className="text-10 text-ink-3 truncate">
                          {s.id} · {s.country} · {s.type}
                        </div>
                      </div>
                    </div>
                  </td>

                  {columns.risk && (
                    <td className="px-3 py-2">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1.5 text-11 text-brand">
                          <span className="animate-pulse font-mono">●</span> Screening…
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded bg-bg-2 overflow-hidden">
                            <div className={`h-full ${riskColor(s.riskScore)}`} style={{ width: `${s.riskScore}%` }} />
                          </div>
                          <span className="text-11 font-mono text-ink-1 w-6">{s.riskScore}</span>
                        </div>
                      )}
                    </td>
                  )}

                  {columns.status && (
                    <td className="px-3 py-2">
                      <span className={`text-10 font-semibold uppercase px-1.5 py-0.5 rounded border ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  )}

                  {columns.cdd && (
                    <td className={`px-3 py-2 text-11 font-semibold ${CDD_STYLE[s.cddPosture]}`}>{s.cddPosture}</td>
                  )}

                  {columns.sla && <td className="px-3 py-2 text-11 font-mono text-ink-2">{s.slaNotify}</td>}

                  {columns.lists && (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {s.listCoverage.length === 0 ? (
                          <span className="text-10 text-ink-3">—</span>
                        ) : (
                          s.listCoverage.map((l) => (
                            <span key={l} className="text-10 font-mono bg-bg-2 border border-hair-2 rounded px-1 text-ink-2">
                              {l}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  )}

                  {columns.snooze && (
                    <td className="px-3 py-2 text-10 text-ink-3">
                      {isSnoozed ? new Date(s.snoozedUntil as string).toLocaleDateString() : "—"}
                    </td>
                  )}

                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Compare"
                        onClick={() => onToggleCompare(s.id)}
                        className={`text-11 px-1.5 py-0.5 rounded border transition-colors ${
                          inCompare ? "border-brand/40 text-brand bg-brand-dim" : "border-hair-2 text-ink-3 hover:text-ink-1"
                        }`}
                      >
                        ⇔
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => onDelete(s.id)}
                        className="text-11 px-1.5 py-0.5 rounded border border-hair-2 text-ink-3 hover:text-red hover:border-red/30 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
