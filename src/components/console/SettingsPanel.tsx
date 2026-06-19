"use client";

import type { ConsoleSettings, Density } from "./types";
import { ACCENT_NAMES, accentRgb } from "@/lib/console/derive";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 38,
        height: 21,
        borderRadius: 99,
        border: `1px solid ${on ? "rgba(var(--ac),0.6)" : "rgba(255,255,255,0.14)"}`,
        background: on ? "rgba(var(--ac),0.25)" : "rgba(255,255,255,0.06)",
        position: "relative",
        cursor: "pointer",
        flex: "none",
        transition: "all .2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          left: on ? 20 : 3,
          width: 15,
          height: 15,
          borderRadius: "50%",
          background: on ? "rgb(var(--ac))" : "#828DA4",
          transition: "all .2s",
        }}
      />
    </button>
  );
}

interface Row {
  key: keyof ConsoleSettings;
  label: string;
  desc: string;
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Integrations",
    rows: [
      { key: "sync", label: "Asana case sync", desc: "Push escalated cases to Asana" },
      {
        key: "chainAnalytics",
        label: "Chain analytics API",
        desc: "Crypto wallet exposure scoring",
      },
      { key: "mediaScan", label: "Adverse-media feed", desc: "Free Google-News negative news" },
      {
        key: "autoEscalate",
        label: "Auto-escalate ≥ 85",
        desc: "Escalate critical composite risk",
      },
    ],
  },
  {
    title: "Notifications & Security",
    rows: [
      { key: "emailAlerts", label: "Email alerts", desc: "Notify on new critical hits" },
      { key: "twoFactor", label: "Two-factor auth", desc: "Require 2FA for this operator" },
    ],
  },
];

const BANDS = [
  { l: "CDD", c: "91,155,216", range: "0 – 39" },
  { l: "SDD", c: "255,148,52", range: "40 – 69" },
  { l: "EDD", c: "255,87,87", range: "70 – 100" },
];

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 11,
  background: "#0B0F18",
} as const;

export function SettingsPanel({
  settings,
  onToggle,
  accent,
  onAccent,
  density,
  onDensity,
  gridLines,
  onGridToggle,
}: {
  settings: ConsoleSettings;
  onToggle: (key: keyof ConsoleSettings) => void;
  accent: string;
  onAccent: (a: string) => void;
  density: Density;
  onDensity: (d: Density) => void;
  gridLines: boolean;
  onGridToggle: () => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
      {GROUPS.map((g) => (
        <div key={g.title} style={{ ...cardStyle, padding: "6px 16px 10px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#828DA4",
              padding: "13px 0 6px",
            }}
          >
            {g.title}
          </div>
          {g.rows.map((r) => (
            <div
              key={r.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 0",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#E3E7EF", letterSpacing: "0.01em" }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 11, color: "#646F86", letterSpacing: "0.02em" }}>
                  {r.desc}
                </div>
              </div>
              <Toggle on={settings[r.key]} onClick={() => onToggle(r.key)} />
            </div>
          ))}
        </div>
      ))}

      <div style={{ ...cardStyle, padding: "6px 16px 14px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#828DA4",
            padding: "13px 0 8px",
          }}
        >
          Risk Score Bands
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BANDS.map((b) => (
            <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: `rgb(${b.c})`,
                  width: 46,
                }}
              >
                {b.l}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  background: `linear-gradient(90deg,rgba(${b.c},0.6),rgba(${b.c},0.25))`,
                }}
              />
              <span style={{ fontSize: 11, color: "#828DA4", width: 54, textAlign: "right" }}>
                {b.range}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, padding: "6px 16px 14px" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#828DA4",
            padding: "13px 0 8px",
          }}
        >
          Appearance
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ flex: 1, fontSize: 13.5, color: "#E3E7EF" }}>Accent</div>
          <div style={{ display: "flex", gap: 7 }}>
            {ACCENT_NAMES.map((a) => (
              <button
                key={a}
                type="button"
                title={a}
                onClick={() => onAccent(a)}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: `rgb(${accentRgb(a)})`,
                  border: accent === a ? "2px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                  boxShadow: accent === a ? `0 0 10px rgba(${accentRgb(a)},0.6)` : "none",
                }}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ flex: 1, fontSize: 13.5, color: "#E3E7EF" }}>Density</div>
          <div style={{ display: "flex", gap: 5 }}>
            {(["Comfortable", "Compact"] as Density[]).map((d) => {
              const on = density === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDensity(d)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "6px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: on ? "rgb(var(--ac))" : "#A3ADC0",
                    background: on ? "rgba(var(--ac),0.12)" : "transparent",
                    border: `1px solid ${on ? "rgba(var(--ac),0.5)" : "rgba(255,255,255,0.13)"}`,
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 0",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ flex: 1, fontSize: 13.5, color: "#E3E7EF" }}>Grid lines</div>
          <Toggle on={gridLines} onClick={onGridToggle} />
        </div>
      </div>
    </div>
  );
}
