interface NavItem {
  key: string;
  label: string;
  glyph: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: "screening", label: "Screening", glyph: "🎯", active: true },
  { key: "cases", label: "Cases", glyph: "🗂️" },
  { key: "sanctions", label: "Sanctions", glyph: "🛑" },
  { key: "adverse-media", label: "Adverse Media", glyph: "📰" },
  { key: "crypto", label: "Crypto", glyph: "🪙" },
  { key: "vessels", label: "Vessels", glyph: "🚢" },
  { key: "audit-log", label: "Audit Log", glyph: "📜" },
  { key: "settings", label: "Settings", glyph: "⚙️" },
];

export function Sidebar() {
  return (
    <nav className="flex h-full w-full flex-col gap-0.5 border-r border-hair-2 bg-bg-panel p-2">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-current={item.active ? "page" : undefined}
          className={
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-12 transition " +
            (item.active
              ? "bg-brand-dim text-ink-0"
              : "text-ink-2 hover:bg-bg-1")
          }
        >
          <span className="text-12 leading-none">{item.glyph}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
