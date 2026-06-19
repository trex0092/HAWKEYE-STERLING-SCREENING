"use client";

export interface BriefItem {
  k: string;
  v: string;
  c?: string;
}

export function ModuleBrief({
  title,
  items,
  note,
}: {
  title: string;
  items: BriefItem[];
  note: string;
}) {
  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#646F86",
          marginBottom: 11,
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 16px" }}>
        {items.map((b) => (
          <div key={b.k}>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#646F86",
                marginBottom: 3,
              }}
            >
              {b.k}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.02em",
                color: b.c ?? "#DCE1EC",
              }}
            >
              {b.v}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 15,
          padding: "12px 13px",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 9,
          background: "#0B101A",
          fontSize: 12,
          color: "#A3ADC0",
          lineHeight: 1.55,
          letterSpacing: "0.02em",
        }}
      >
        {note}
      </div>
    </div>
  );
}
