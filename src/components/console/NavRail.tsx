"use client";

import type { ModuleKey } from "@/lib/data/console-datasets";

const NAV: { key: ModuleKey; label: string }[] = [
  { key: "screening", label: "Screening" },
  { key: "cases", label: "Cases" },
  { key: "sanctions", label: "Sanctions" },
  { key: "media", label: "Adverse Media" },
  { key: "crypto", label: "Crypto" },
  { key: "vessels", label: "Vessels" },
  { key: "audit", label: "Audit Log" },
  { key: "settings", label: "Settings" },
];

export function NavRail({
  active,
  onSelect,
}: {
  active: ModuleKey;
  onSelect: (key: ModuleKey) => void;
}) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 50,
        height: "calc(100vh - 50px)",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: "rgba(9,12,19,0.4)",
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#646F86",
          padding: "3px 11px 7px",
        }}
      >
        Modules
      </div>
      {NAV.map((n) => {
        const on = n.key === active;
        return (
          <a
            key={n.key}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelect(n.key);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: on ? 700 : 400,
              color: on ? "#EDEFF4" : "#A3ADC0",
              textDecoration: "none",
              padding: "8px 11px",
              borderRadius: 7,
              background: on ? "rgba(var(--ac),0.1)" : "transparent",
              border: on ? "1px solid rgba(var(--ac),0.45)" : "1px solid transparent",
              boxShadow: on ? "0 0 14px rgba(var(--ac),0.15)" : "none",
            }}
          >
            <span
              style={{
                width: 4,
                height: 15,
                borderRadius: 99,
                background: on ? "rgb(var(--ac))" : "transparent",
                flex: "none",
              }}
            />
            {n.label}
          </a>
        );
      })}
      <div
        style={{
          marginTop: "auto",
          padding: 11,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(11,15,24,0.6)",
        }}
      >
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#646F86",
            marginBottom: 5,
          }}
        >
          List version
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#EDEFF4", letterSpacing: "0.04em" }}>
          2026.06.18
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 5,
            fontSize: 11,
            letterSpacing: "0.06em",
            color: "#4FD6A0",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#3BC48F",
              boxShadow: "0 0 7px #3BC48F",
            }}
          />
          IN SYNC
        </div>
      </div>
    </nav>
  );
}
