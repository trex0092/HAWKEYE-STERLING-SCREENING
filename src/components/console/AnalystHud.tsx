"use client";

import type { Operator } from "@/lib/data/operators";

// Animated "AI analyst" HUD — radar rings + persona avatar + telemetry. Uses
// the active analyst's own accent (not the global --ac), per the handoff.

export function AnalystHud({
  analyst,
  threat,
  caseLabel,
  duty,
  uptime,
}: {
  analyst: Operator;
  threat: { t: string; c: string };
  caseLabel: string;
  duty: string;
  uptime: string;
}) {
  const ac = analyst.ac;
  const b = `2px solid rgba(${ac},0.7)`;

  return (
    <div
      style={{
        position: "relative",
        flex: "none",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 13,
        background: `radial-gradient(ellipse at 50% 32%,rgba(${ac},0.12),#0B0F18 72%)`,
        overflow: "hidden",
        padding: "14px 14px 13px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          width: 16,
          height: 16,
          borderTop: b,
          borderLeft: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 16,
          height: 16,
          borderTop: b,
          borderRight: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          width: 16,
          height: 16,
          borderBottom: b,
          borderLeft: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          width: 16,
          height: 16,
          borderBottom: b,
          borderRight: b,
        }}
      />

      <div style={{ position: "absolute", top: 14, left: 16, textAlign: "left" }}>
        <div style={{ fontSize: 8.5, letterSpacing: "0.12em", color: "#828DA4" }}>THREAT</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: threat.c }}>
          {threat.t}
        </div>
      </div>
      <div style={{ position: "absolute", top: 14, right: 16, textAlign: "right" }}>
        <div style={{ fontSize: 8.5, letterSpacing: "0.12em", color: "#828DA4" }}>CASE</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em", color: "#A3ADC0" }}>
          {caseLabel}
        </div>
      </div>

      <div
        style={{ position: "relative", width: 152, height: 152, flex: "none", margin: "8px 0 2px" }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 152,
            height: 152,
            borderRadius: "50%",
            background: `conic-gradient(from 0deg,transparent,rgba(${ac},0.3) 55deg,transparent 120deg)`,
            animation: "spin 3.8s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 152,
            height: 152,
            borderRadius: "50%",
            border: `1px solid rgba(${ac},0.18)`,
            animation: "spin 26s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 128,
            height: 128,
            borderRadius: "50%",
            border: `1.5px dashed rgba(${ac},0.4)`,
            animation: "spinRev 18s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 112,
            height: 112,
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid rgba(${ac},0.75)`,
            boxShadow: `0 0 22px rgba(${ac},0.4),inset 0 0 24px rgba(0,0,0,0.5)`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#070A11",
              backgroundImage: `url('${analyst.img}')`,
              backgroundSize: "cover",
              backgroundPosition: analyst.pos,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 1,
            background: `linear-gradient(90deg,transparent,rgba(${ac},0.4),transparent)`,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.24em",
          color: `rgb(${ac})`,
          animation: "hudGlow 2.4s ease-in-out infinite",
          marginTop: 4,
        }}
      >
        ● {duty}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 21,
          color: "#fff",
          marginTop: 3,
          letterSpacing: "0.02em",
        }}
      >
        {analyst.name}
      </div>
      <div style={{ fontSize: 11.5, color: "#A3ADC0", marginTop: 1, letterSpacing: "0.04em" }}>
        {analyst.role}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 9,
          paddingTop: 9,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          width: "100%",
          justifyContent: "center",
          fontSize: 9.5,
          letterSpacing: "0.06em",
        }}
      >
        <span style={{ color: "#646F86" }}>
          NET <b style={{ color: "#4FD6A0", fontWeight: 700 }}>SECURE</b>
        </span>
        <span style={{ color: "#646F86" }}>
          PROC <b style={{ color: "#A3ADC0", fontWeight: 700 }}>ZX-77·16C</b>
        </span>
        <span style={{ color: "#646F86" }}>
          UP <b style={{ color: "#A3ADC0", fontWeight: 700 }}>{uptime}</b>
        </span>
      </div>
    </div>
  );
}
