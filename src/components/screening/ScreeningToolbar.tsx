"use client";

import { forwardRef } from "react";
import type { SortKey, TableColumnKey } from "@/lib/types";
import { ColumnChooser } from "@/components/screening/ColumnChooser";

export interface ScreeningToolbarProps {
  query: string;
  onQueryChange: (v: string) => void;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: SortKey) => void;
  columns: Record<TableColumnKey, boolean>;
  onColumnsChange: (next: Record<TableColumnKey, boolean>) => void;
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "riskScore", label: "Risk score" },
  { value: "name", label: "Name" },
  { value: "slaNotify", label: "SLA" },
  { value: "status", label: "Status" },
  { value: "cddPosture", label: "CDD" },
];

export const ScreeningToolbar = forwardRef<HTMLInputElement, ScreeningToolbarProps>(
  function ScreeningToolbar(
    { query, onQueryChange, sortKey, sortDir, onSortChange, columns, onColumnsChange },
    ref,
  ) {
    return (
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3 text-12">
            ⌕
          </span>
          <input
            ref={ref}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name, ID, country, alias…  (press / to focus)"
            className="w-full bg-bg-1 border border-hair-2 rounded-lg pl-7 pr-3 py-1.5 text-12 text-ink-0 placeholder:text-ink-3 focus:outline-none focus:border-brand/60"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-10 uppercase tracking-wide-3 text-ink-3">Sort</span>
          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="bg-bg-1 border border-hair-2 rounded px-2 py-1.5 text-11 text-ink-1 focus:outline-none focus:border-brand/60"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onSortChange(sortKey)}
            title={`Toggle direction (${sortDir})`}
            className="text-11 px-2 py-1.5 rounded border border-hair-2 text-ink-2 hover:bg-bg-1 transition-colors font-mono"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <ColumnChooser columns={columns} onColumnsChange={onColumnsChange} />
      </div>
    );
  },
);
