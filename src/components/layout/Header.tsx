export function Header() {
  return (
    <header className="flex items-center gap-4 border-b border-hair-2 bg-bg-panel px-4 py-3">
      {/* Left: brand wordmark */}
      <div className="flex items-baseline gap-2">
        <span className="text-12 font-semibold tracking-wide-3 text-ink-0">HAWKEYE</span>
        <span className="text-10 uppercase tracking-wide-3 text-ink-3">Sterling Screening</span>
      </div>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-3">
        {/* Search hint chip */}
        <div className="hidden items-center gap-2 rounded-lg border border-hair-2 bg-bg-1 px-3 py-1.5 text-11 text-ink-3 md:flex">
          <span className="text-ink-2">⌕</span>
          <span>Search subjects, lists, cases…</span>
          <span className="rounded border border-hair px-1 font-mono text-10 text-ink-3">/</span>
        </div>

        {/* Bell with dot */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg px-1.5 py-1 text-12 transition hover:bg-bg-1"
        >
          <span>🔔</span>
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red" />
        </button>

        {/* Operator avatar */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-line bg-brand-dim text-10.5 font-semibold text-ink-0">
          OP
        </div>
      </div>
    </header>
  );
}
