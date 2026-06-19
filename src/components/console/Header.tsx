"use client";

// Sticky console header — HS mark + wordmark, search pill, alerts pill,
// live clock and the operator avatar. Faithful to the design handoff (50px).

export function Header({ clock, alerts }: { clock: string; alerts: number }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 20px",
        height: 50,
        borderBottom: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(8,11,18,0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            border: "1.5px solid rgba(var(--ac),0.6)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 11,
            color: "#fff",
            boxShadow: "0 0 13px rgba(var(--ac),0.35)",
            flexShrink: 0,
          }}
        >
          HS
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.08em",
            color: "#EDEFF4",
            whiteSpace: "nowrap",
          }}
        >
          HAWKEYE STERLING
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "#828DA4",
            textTransform: "uppercase",
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            paddingLeft: 10,
            whiteSpace: "nowrap",
          }}
        >
          Screening Console
        </span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 11 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 7,
            padding: "5px 10px",
            width: 236,
            color: "#646F86",
            fontSize: 12.5,
          }}
        >
          <span style={{ fontSize: 13, color: "#828DA4" }}>⌕</span>
          <span style={{ flex: 1 }}>Search subjects, lists, cases…</span>
          <span
            style={{
              fontSize: 10,
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 3,
              padding: "0 5px",
              color: "#828DA4",
            }}
          >
            /
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            letterSpacing: "0.08em",
            color: "#FF8A8A",
            background: "rgba(255,87,87,0.1)",
            border: "1px solid rgba(255,87,87,0.35)",
            borderRadius: 999,
            padding: "3px 10px",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#FF6B6B",
              boxShadow: "0 0 8px #FF6B6B",
              animation: "pulseDot 2s ease-in-out infinite",
            }}
          />
          {alerts} ALERTS
        </div>
        <span
          style={{ fontSize: 13, color: "#A3ADC0", letterSpacing: "0.08em", whiteSpace: "nowrap" }}
        >
          {clock}
        </span>
        <div
          style={{
            width: 27,
            height: 27,
            borderRadius: "50%",
            border: "1px solid rgba(var(--ac),0.5)",
            background: "rgba(var(--ac),0.12)",
            display: "grid",
            placeItems: "center",
            fontWeight: 700,
            fontSize: 11,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          OP
        </div>
      </div>
    </header>
  );
}
