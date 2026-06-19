"use client";

export interface ModuleActionBarProps {
  asanaModule: string;
  asanaLabel: string;
  onCsv: () => void;
  onRun: () => void;
  onAdd: () => void;
  onSync: () => void;
}

export function ModuleActionBar({
  asanaModule,
  asanaLabel,
  onCsv,
  onRun,
  onAdd,
  onSync,
}: ModuleActionBarProps) {
  const ghost =
    "rounded-lg border border-hair-2 px-2.5 py-1 text-11 text-ink-2 transition hover:bg-bg-1";

  return (
    <div
      data-module={asanaModule}
      className="flex items-center gap-2 border-b border-hair-2 bg-bg-panel px-4 py-2"
    >
      <span className="text-11 text-ink-3">{asanaLabel}</span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-brand px-2.5 py-1 text-11 font-medium text-white transition hover:opacity-90"
        >
          + New
        </button>
        <button type="button" onClick={onRun} className={ghost}>
          ▶ Run
        </button>
        <button type="button" onClick={onCsv} className={ghost}>
          ⭳ CSV
        </button>
        <button type="button" onClick={onSync} className={ghost}>
          ⟳ Sync
        </button>
      </div>
    </div>
  );
}
