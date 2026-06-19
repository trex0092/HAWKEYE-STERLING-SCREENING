"use client";

import type { CDDPosture } from "@/lib/types";

export interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
  onApplyCdd: (posture: CDDPosture) => void;
  onMarkCleared: () => void;
  onAssign: (operator: string) => void;
  onSnoozeUntil: (iso: string, reason: string) => void;
  onDelete: () => void;
}

const CDD_POSTURES: CDDPosture[] = ["CDD", "EDD", "SDD"];

export function BulkActionsBar({
  selectedIds,
  onClear,
  onApplyCdd,
  onMarkCleared,
  onAssign,
  onSnoozeUntil,
  onDelete,
}: BulkActionsBarProps) {
  if (selectedIds.length === 0) {
    return null;
  }

  const ghost =
    "rounded-lg border border-hair-2 px-2 py-1 text-11 text-ink-2 transition hover:bg-bg-1";

  const handleAssign = (): void => {
    const operator = window.prompt("Assign selected subjects to operator:");
    if (operator && operator.trim().length > 0) {
      onAssign(operator.trim());
    }
  };

  const handleSnooze = (): void => {
    const iso = new Date(Date.now() + 7 * 864e5).toISOString();
    onSnoozeUntil(iso, "bulk snooze 7d");
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-brand/30 bg-bg-2 px-3 py-2">
      <span className="text-11 font-medium text-ink-0">
        {selectedIds.length} selected
      </span>

      <span className="mx-1 h-4 w-px bg-hair-2" />

      <span className="text-10 uppercase tracking-wide-3 text-ink-3">CDD:</span>
      {CDD_POSTURES.map((posture) => (
        <button
          key={posture}
          type="button"
          onClick={() => onApplyCdd(posture)}
          className={ghost}
        >
          {posture}
        </button>
      ))}

      <span className="mx-1 h-4 w-px bg-hair-2" />

      <button type="button" onClick={onMarkCleared} className={ghost}>
        Mark cleared
      </button>
      <button type="button" onClick={handleAssign} className={ghost}>
        Assign…
      </button>
      <button type="button" onClick={handleSnooze} className={ghost}>
        Snooze 7d
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg border border-red/30 px-2 py-1 text-11 text-red transition hover:bg-red-dim"
      >
        Delete
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-11 text-ink-3 transition hover:text-ink-1"
        aria-label="Clear selection"
      >
        ✕ Clear
      </button>
    </div>
  );
}
