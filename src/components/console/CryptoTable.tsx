"use client";

import type { WalletRow } from "@/lib/data/console-datasets";
import { riskColor } from "@/lib/console/derive";
import { EmptyState } from "./EmptyState";

const COLS = "minmax(170px,1.4fr) 70px 120px 110px 64px 150px";

export function CryptoTable({ wallets }: { wallets: WalletRow[] }) {
  if (wallets.length === 0) {
    return (
      <EmptyState
        title="No wallets monitored"
        hint="Add a crypto entity to track wallet and VASP exposure."
        icon="◈"
      />
    );
  }
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 11,
        background: "#0B0F18",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLS,
          alignItems: "center",
          gap: 9,
          padding: "9px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 10,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: "#646F86",
        }}
      >
        <span>Wallet / VASP</span>
        <span>Chain</span>
        <span>Address</span>
        <span>Exposure</span>
        <span>Risk</span>
        <span>Flag</span>
      </div>
      {wallets.map((w, i) => (
        <div
          key={`${w.addr}-${i}`}
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            alignItems: "center",
            gap: 9,
            padding: "11px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              color: "#E3E7EF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.01em",
            }}
          >
            {w.label}
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#7FB3E8",
              border: "1px solid rgba(91,155,216,0.3)",
              background: "rgba(91,155,216,0.1)",
              borderRadius: 4,
              padding: "2px 6px",
              width: "fit-content",
            }}
          >
            {w.chain}
          </span>
          <span style={{ fontSize: 12, color: "#A3ADC0", letterSpacing: "0.02em" }}>{w.addr}</span>
          <span style={{ fontSize: 13, color: "#E3E7EF" }}>{w.exposure}</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: riskColor(w.risk) }}>{w.risk}</span>
          <span style={{ fontSize: 11.5, color: "#FFB169", letterSpacing: "0.02em" }}>
            {w.flag}
          </span>
        </div>
      ))}
    </div>
  );
}
