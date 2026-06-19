"use client";

import type { VesselRow } from "@/lib/data/console-datasets";
import { listChip, riskColor, vesselStatusTone } from "@/lib/console/derive";

const COLS = "minmax(150px,1.3fr) 92px 96px 110px 110px 56px 96px";

export function VesselsTable({ vessels }: { vessels: VesselRow[] }) {
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
        <span>Vessel</span>
        <span>IMO</span>
        <span>Flag</span>
        <span>Status</span>
        <span>Last port</span>
        <span>Risk</span>
        <span>Lists</span>
      </div>
      {vessels.map((v) => {
        const tone = vesselStatusTone(v.status);
        const lists = v.lists.length ? v.lists : ["—"];
        return (
          <div
            key={v.imo}
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              alignItems: "center",
              gap: 9,
              padding: "11px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#EDEFF4",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v.name}
              </div>
              <div style={{ fontSize: 11, color: "#646F86" }}>{v.type}</div>
            </div>
            <span style={{ fontSize: 12, color: "#A3ADC0" }}>{v.imo}</span>
            <span style={{ fontSize: 12, color: "#C9D2E2" }}>{v.flag}</span>
            <div>
              <span
                style={{
                  display: "inline-flex",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  padding: "3px 8px",
                  borderRadius: 5,
                  color: tone.c,
                  background: tone.bg,
                  border: `1px solid ${tone.bd}`,
                }}
              >
                {v.status}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "#A3ADC0" }}>{v.lastPort}</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: riskColor(v.risk) }}>
              {v.risk}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {lists.map((l, i) => {
                const c = listChip(l);
                return (
                  <span
                    key={`${l}-${i}`}
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.06em",
                      color: c.c,
                      background: c.bg,
                      border: `1px solid ${c.bd}`,
                      borderRadius: 4,
                      padding: "1px 5px",
                    }}
                  >
                    {c.t}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
