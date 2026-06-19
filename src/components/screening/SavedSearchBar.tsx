"use client";

import { useEffect, useState } from "react";
import type { FilterKey, SavedSearch, SubjectStatus } from "@/lib/types";

const STORAGE_KEY = "hawkeye.saved-searches.v1";

export interface SavedSearchActive {
  query: string;
  filter: FilterKey;
  statusFilter: SubjectStatus | "all";
  minRisk: number;
}

export interface SavedSearchBarProps {
  active: SavedSearchActive;
  appliedId: string | null;
  onApply: (s: SavedSearch) => void;
}

function loadSaved(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedSearch[];
  } catch {
    return [];
  }
}

function persist(items: SavedSearch[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function SavedSearchBar({ active, appliedId, onApply }: SavedSearchBarProps) {
  const [items, setItems] = useState<SavedSearch[]>([]);

  useEffect(() => {
    setItems(loadSaved());
  }, []);

  const handleSave = (): void => {
    const label = active.query || (active.filter !== "all" ? active.filter : "") || "Search";
    const next: SavedSearch = {
      id: `ss_${Date.now().toString(36)}`,
      label,
      ...(active.query ? { query: active.query } : {}),
      ...(active.filter ? { filter: active.filter } : {}),
      ...(active.statusFilter ? { statusFilter: active.statusFilter } : {}),
      ...(active.minRisk ? { minRisk: active.minRisk } : {}),
    };
    const updated = [...items, next];
    setItems(updated);
    persist(updated);
  };

  const handleDelete = (id: string): void => {
    const updated = items.filter((s) => s.id !== id);
    setItems(updated);
    persist(updated);
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-10 uppercase tracking-wide-3 text-ink-3">Saved:</span>

      {items.length === 0 ? (
        <span className="text-11 text-fg-muted">No saved searches yet.</span>
      ) : (
        items.map((s) => {
          const isActive = s.id === appliedId;
          return (
            <span
              key={s.id}
              className={
                "flex items-center gap-1 rounded-lg border px-2 py-1 text-11 transition " +
                (isActive
                  ? "border-brand/30 bg-brand-dim text-ink-0"
                  : "border-hair-2 bg-bg-1 text-ink-2 hover:bg-bg-2")
              }
            >
              <button
                type="button"
                onClick={() => onApply(s)}
                className="max-w-[160px] truncate"
                title={s.label}
              >
                {s.label}
              </button>
              <button
                type="button"
                aria-label={`Delete saved search ${s.label}`}
                onClick={() => handleDelete(s.id)}
                className="text-ink-3 transition hover:text-red"
              >
                ✕
              </button>
            </span>
          );
        })
      )}

      <button
        type="button"
        onClick={handleSave}
        className="rounded-lg border border-hair-2 px-2 py-1 text-11 text-ink-2 transition hover:bg-bg-1"
      >
        ＋ Save current
      </button>
    </div>
  );
}
