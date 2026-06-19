interface ComtradeRow {
  hsCode: string;
  partner: string;
  valueAED: string;
  flow: "Import" | "Export";
}

const MOCK_ROWS: ComtradeRow[] = [
  { hsCode: "7108.12", partner: "Switzerland", valueAED: "412,900,000", flow: "Import" },
  { hsCode: "2709.00", partner: "India", valueAED: "1,284,500,000", flow: "Export" },
  { hsCode: "8542.31", partner: "Singapore", valueAED: "96,300,000", flow: "Import" },
  { hsCode: "7102.39", partner: "Belgium", valueAED: "538,100,000", flow: "Export" },
];

export function ComtradePanel() {
  return (
    <div className="rounded-xl border border-hair-2 bg-bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-12 font-semibold text-ink-0">
          🌐 UN Comtrade — Trade-Flow Analysis
        </h3>
        <span className="rounded border border-hair px-1.5 py-0.5 font-mono text-10 uppercase tracking-wide-3 text-ink-3">
          Offline
        </span>
      </div>

      <p className="mt-1 text-11 text-fg-muted">
        Live Comtrade data is disabled in this environment. The figures below are
        static mock samples for layout only.
      </p>

      <table className="mt-3 w-full border-collapse text-11">
        <thead>
          <tr className="text-left text-10 uppercase tracking-wide-3 text-ink-3">
            <th className="border-b border-hair-2 py-1.5 pr-3 font-medium">HS code</th>
            <th className="border-b border-hair-2 py-1.5 pr-3 font-medium">Partner</th>
            <th className="border-b border-hair-2 py-1.5 pr-3 font-medium">Value AED</th>
            <th className="border-b border-hair-2 py-1.5 font-medium">Flow</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ROWS.map((row) => (
            <tr key={row.hsCode} className="text-ink-2">
              <td className="border-b border-hair py-1.5 pr-3 font-mono text-ink-1">
                {row.hsCode}
              </td>
              <td className="border-b border-hair py-1.5 pr-3">{row.partner}</td>
              <td className="border-b border-hair py-1.5 pr-3 font-mono">
                {row.valueAED}
              </td>
              <td className="border-b border-hair py-1.5">
                <span
                  className={
                    "rounded px-1.5 py-0.5 text-10 " +
                    (row.flow === "Export"
                      ? "bg-green-dim text-green"
                      : "bg-brand-dim text-brand")
                  }
                >
                  {row.flow}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
