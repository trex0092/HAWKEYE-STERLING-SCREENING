"use client";

import { useState } from "react";
import type { TableColumnKey } from "@/lib/types";

const STORAGE_KEY = "hawkeye.screening-columns.v1";

export const DEFAULT_COLUMNS: Record<TableColumnKey, boolean> = {
  risk: true,
  status: true,
  cdd: true,
  sla: true,
  lists: true,
  snooze: false,
};

const COLUMN_LABELS: Record<TableColumnKey, string> = {
  risk: "Risk",
  status: "Status",
  cdd: "CDD",
  sla: "SLA",
  lists: "Lists",
  snooze: "Snooze",
};

export function loadColumnVisibility(): Record<TableColumnKey, boolean> {
  if (typeof window === "undefined") return { ...DEFAULT_COLUMNS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_COLUMNS };
    const parsed = JSON.parse(raw) as Partial<Record<TableColumnKey, boolean>>;
    const merged: Record<TableColumnKey, boolean> = { ...DEFAULT_COLUMNS };
    for (const key of Object.keys(DEFAULT_COLUMNS) as TableColumnKey[]) {
      if (typeof parsed[key] === "boolean") merged[key] = parsed[key] as boolean;
    }
    return merged;
  } catch {
    return { ...DEFAULT_COLUMNS };
  }
}

export function persistColumnVisibility(next: Record<TableColumnKey, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / disabled storage — ignore */
  }
}

export interface ColumnChooserProps {
  columns: Record<TableColumnKey, boolean>;
  onColumnsChange: (next: Record<TableColumnKey, boolean>) => void;
}

export function ColumnChooser({ columns, onColumnsChange }: ColumnChooserProps) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(COLUMN_LABELS) as TableColumnKey[];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-11 px-2.5 py-1.5 rounded border border-hair-2 text-ink-2 hover:bg-bg-1 transition-colors"
      >
        ⊞ Columns
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-hair-2 bg-bg-panel p-1.5 shadow-xl">
            {keys.map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-12 text-ink-1 hover:bg-bg-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={columns[key]}
                  onChange={(e) =>
                    onColumnsChange({ ...columns, [key]: e.target.checked })
                  }
                  className="accent-brand"
                />
                {COLUMN_LABELS[key]}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
