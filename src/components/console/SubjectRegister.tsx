"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import type { Subject } from "@/lib/types";
import type { Density } from "./types";
import {
  listChip,
  riskColor,
  riskGlow,
  slaColor,
  slaHours,
  sortRows,
  statusTone,
  cddTone,
  type RegisterSortKey,
} from "@/lib/console/derive";

const COLS = "minmax(190px,1.6fr) 116px 96px 50px 74px 132px";

function StatTile({
  tint,
  label,
  value,
  sub,
  subColor,
}: {
  tint: string;
  label: string;
  value: React.ReactNode;
  sub: string;
  subColor?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 11,
        background: "#0B0F18",
        padding: "13px 14px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg,transparent,${tint},transparent)`,
        }}
      />
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: tint,
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 30,
          color: "#fff",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 6,
          color: subColor ?? "#828DA4",
          letterSpacing: "0.04em",
        }}
      >
        {sub}
      </div>
    </div>
  );
}

const inputBox: CSSProperties = {
  background: "#0B101A",
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: 7,
  color: "#EDEFF4",
  padding: "7px 9px",
  fontSize: 12.5,
  fontFamily: "'Arial Narrow',sans-serif",
  outline: "none",
};

export function SubjectRegister({
  subjects,
  selectedId,
  sortKey,
  density,
  sourcesLive,
  onSortChange,
  onSelect,
}: {
  subjects: Subject[];
  selectedId: string | null;
  sortKey: RegisterSortKey;
  density: Density;
  sourcesLive: boolean;
  onSortChange: (k: RegisterSortKey) => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const rowPad = density === "Compact" ? 6 : 9;

  const inQueue = subjects.filter((s) => s.status !== "cleared").length;
  const critical = subjects.filter((s) => s.riskScore >= 85).length;
  const slaRisk = subjects.filter(
    (s) => slaHours(s.slaNotify) < 24 && s.status !== "cleared",
  ).length;
  const avg = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + s.riskScore, 0) / subjects.length)
    : 0;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          (s.aliases ?? []).some((a) => a.toLowerCase().includes(q)),
      )
    : subjects;
  const rows = sortRows(filtered, sortKey);

  return (
    <div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}
      >
        <StatTile
          tint="rgba(79,214,160,0.7)"
          label="In Queue"
          value={inQueue}
          sub="subjects in scope"
        />
        <StatTile
          tint="rgba(255,107,107,0.7)"
          label="Critical"
          value={critical}
          sub="most serious: critical"
          subColor="#FF8A8A"
        />
        <StatTile tint="rgba(255,174,87,0.7)" label="SLA Risk" value={slaRisk} sub="breach < 24h" />
        <StatTile
          tint="rgba(127,179,232,0.7)"
          label="Avg Risk"
          value={
            <>
              {avg}
              <span style={{ fontSize: 14, color: "#646F86", fontWeight: 400 }}>/100</span>
            </>
          }
          sub="portfolio mean"
        />
      </div>

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          background: "#0B0F18",
          padding: "9px 14px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 13, color: "#7FB3E8" }}>🛡</span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: "#EDEFF4" }}>
          Intelligence Sources
        </span>
        <span style={{ fontSize: 12, color: "#646F86" }}>— what the screening engine captures</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: sourcesLive ? "#4FD6A0" : "#828DA4",
          }}
        >
          {sourcesLive ? "● live" : "▾ show"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#0B101A",
            border: "1px solid rgba(255,255,255,0.11)",
            borderRadius: 7,
            padding: "7px 11px",
            color: "#4A5468",
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 13, color: "#828DA4" }}>⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, ID, country, alias…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#EDEFF4",
              fontSize: 13,
              fontFamily: "'Arial Narrow',sans-serif",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#646F86",
          }}
        >
          Sort
        </span>
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as RegisterSortKey)}
          style={{ ...inputBox, cursor: "pointer" }}
        >
          <option value="risk">Risk score</option>
          <option value="name">Name</option>
          <option value="sla">SLA</option>
          <option value="status">Status</option>
        </select>
        <button
          type="button"
          style={{ ...inputBox, color: "#A3ADC0", cursor: "pointer", letterSpacing: "0.04em" }}
        >
          ⊞ Columns
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 12,
          fontSize: 11,
          color: "#646F86",
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.12em" }}>Saved:</span>
        <span>No saved searches yet.</span>
        <span style={{ marginLeft: 2, color: "#7FB3E8", cursor: "pointer" }}>＋ Save current</span>
      </div>

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
          <span>Subject</span>
          <span>Risk{sortKey === "risk" ? " ▼" : ""}</span>
          <span>Status</span>
          <span>CDD</span>
          <span>SLA</span>
          <span>Lists</span>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: "40px 16px", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#A3ADC0", marginBottom: 4 }}>
              {subjects.length === 0 ? "No subjects yet" : "No matches"}
            </div>
            <div style={{ fontSize: 12, color: "#646F86" }}>
              {subjects.length === 0
                ? "Add a subject with + New to begin screening."
                : "Try a different search."}
            </div>
          </div>
        )}
        {rows.map((s) => {
          const sel = s.id === selectedId;
          const st = statusTone(s.status);
          const cd = cddTone(s.cddPosture);
          const lists = s.listCoverage.length ? s.listCoverage : ["—"];
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                alignItems: "center",
                gap: 9,
                padding: `${rowPad}px 16px`,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer",
                background: sel ? "rgba(var(--ac),0.07)" : "transparent",
                borderLeft: sel ? "2px solid rgb(var(--ac))" : "2px solid transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.04em",
                    color: "rgb(var(--ac))",
                    border: "1px solid rgba(var(--ac),0.3)",
                    background: "rgba(var(--ac),0.08)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    flexShrink: 0,
                  }}
                >
                  {s.id}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#EDEFF4",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      color: "#646F86",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.meta}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: "0.02em",
                      color: riskColor(s.riskScore),
                    }}
                  >
                    {s.riskScore}
                  </span>
                  <span style={{ fontSize: 9.5, color: "#646F86" }}>/100</span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      width: `${s.riskScore}%`,
                      background: riskColor(s.riskScore),
                      boxShadow: `0 0 8px ${riskGlow(s.riskScore)}`,
                    }}
                  />
                </div>
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 5,
                    color: st.c,
                    background: st.bg,
                    border: `1px solid ${st.bd}`,
                  }}
                >
                  {s.status}
                </span>
              </div>
              <div>
                <span
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: cd.c }}
                >
                  {s.cddPosture}
                </span>
              </div>
              <div>
                <span
                  style={{ fontSize: 11.5, letterSpacing: "0.03em", color: slaColor(s.slaNotify) }}
                >
                  {s.slaNotify}
                </span>
              </div>
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
    </div>
  );
}
