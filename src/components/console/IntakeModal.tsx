"use client";

import type { CSSProperties } from "react";
import type { Draft, DraftType } from "./types";
import { COUNTRIES, ID_TYPES } from "@/lib/data/console-datasets";
import { draftRisk, riskColor } from "@/lib/console/derive";

const label: CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#828DA4",
  display: "block",
  marginBottom: 6,
};

const input: CSSProperties = {
  width: "100%",
  background: "#0B101A",
  border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 7,
  color: "#EDEFF4",
  padding: "9px 11px",
  // 16px keeps mobile Safari from auto-zooming when a field is focused.
  fontSize: 16,
  fontFamily: "'Arial Narrow',sans-serif",
  outline: "none",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const select: CSSProperties = { ...input, cursor: "pointer" };

// Two- and three-column rows collapse to fewer columns as the modal narrows on
// phones, instead of squeezing fixed tracks into unreadable widths.
const grid2: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
};
const grid3: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
  gap: 14,
};

export function IntakeModal({
  draft,
  onChange,
  onClose,
  onRun,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  onClose: () => void;
  onRun: () => void;
}) {
  const projRisk = draftRisk(draft);
  // Gender only applies to individuals; disable it for entities.
  const genderDisabled = draft.type !== "individual";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(8px, 3vw, 24px)",
        background: "rgba(4,6,11,0.74)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="font-narrow"
        style={{
          position: "relative",
          width: 600,
          maxWidth: "100%",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          border: "1px solid rgba(var(--ac),0.32)",
          borderRadius: 14,
          background: "#0B0F18",
          boxShadow: "0 26px 70px rgba(0,0,0,0.6),0 0 30px rgba(var(--ac),0.12)",
          color: "#EDEFF4",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(180,92,255,0.6),rgba(var(--ac),0.5),transparent)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "18px 20px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgb(var(--ac))",
              }}
            >
              Screening Intake
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 23,
                color: "#fff",
                letterSpacing: "0.02em",
                marginTop: 2,
              }}
            >
              New Subject
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "#A3ADC0",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 15 }}>
          <div>
            <label style={label}>Legal entity name</label>
            <input
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Registered legal name"
              style={input}
            />
          </div>

          <div style={grid2}>
            <div>
              <label style={label}>Entity type</label>
              <select
                value={draft.type}
                onChange={(e) => onChange({ type: e.target.value as DraftType })}
                style={select}
              >
                <option value="individual">Individual</option>
                <option value="entity">Entity</option>
              </select>
            </div>
            <div>
              <label style={label}>Gender</label>
              <div style={{ display: "flex", gap: 6, opacity: genderDisabled ? 0.4 : 1 }}>
                {(["Male", "Female"] as const).map((g) => {
                  const on = !genderDisabled && draft.gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      disabled={genderDisabled}
                      onClick={() => onChange({ gender: g })}
                      style={{
                        flex: 1,
                        fontSize: 12.5,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        padding: "9px 0",
                        borderRadius: 7,
                        cursor: genderDisabled ? "not-allowed" : "pointer",
                        color: on ? "rgb(var(--ac))" : "#A3ADC0",
                        background: on ? "rgba(var(--ac),0.12)" : "transparent",
                        border: `1px solid ${on ? "rgba(var(--ac),0.5)" : "rgba(255,255,255,0.13)"}`,
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label style={label}>Alternative names</label>
            <input
              value={draft.altNames}
              onChange={(e) => onChange({ altNames: e.target.value })}
              placeholder="aka / also-known-as (comma separated)"
              style={input}
            />
          </div>

          <div style={grid2}>
            <div>
              <label style={label}>Date of birth / registration</label>
              <input
                value={draft.dob}
                onChange={(e) => onChange({ dob: e.target.value })}
                placeholder="DD / MM / YYYY"
                style={input}
              />
            </div>
            <div>
              <label style={label}>Country</label>
              <select
                value={draft.country}
                onChange={(e) => onChange({ country: e.target.value })}
                style={select}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgb(var(--ac))",
                marginBottom: 9,
              }}
            >
              Identification Number
            </div>
            <div style={grid3}>
              <div>
                <label style={label}>ID number</label>
                <input
                  value={draft.idNumber}
                  onChange={(e) => onChange({ idNumber: e.target.value })}
                  placeholder="Document no."
                  style={input}
                />
              </div>
              <div>
                <label style={label}>ID type</label>
                <select
                  value={draft.idType}
                  onChange={(e) => onChange({ idType: e.target.value })}
                  style={select}
                >
                  {ID_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={label}>Issuing country</label>
                <select
                  value={draft.issuingCountry}
                  onChange={(e) => onChange({ issuingCountry: e.target.value })}
                  style={select}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "13px 15px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              background: "#0B101A",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#828DA4",
                }}
              >
                Projected risk
              </div>
              <div style={{ fontSize: 11.5, color: "#646F86", marginTop: 2 }}>
                Pre-screen estimate from intake profile
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{ fontWeight: 700, fontSize: 30, lineHeight: 1, color: riskColor(projRisk) }}
              >
                {projRisk}
              </div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#646F86",
                  marginTop: 2,
                }}
              >
                /100
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 9,
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ fontSize: 11, color: "#646F86", letterSpacing: "0.02em" }}>
            A case is opened and assigned to an AI analyst on run.
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "8px 15px",
                borderRadius: 7,
                cursor: "pointer",
                background: "transparent",
                color: "#A3ADC0",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onRun}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "8px 17px",
                borderRadius: 7,
                cursor: "pointer",
                background: "rgba(180,92,255,0.16)",
                color: "#C895FF",
                border: "1px solid rgba(180,92,255,0.6)",
                boxShadow: "0 0 14px rgba(180,92,255,0.3)",
              }}
            >
              ▶ Run screening
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
