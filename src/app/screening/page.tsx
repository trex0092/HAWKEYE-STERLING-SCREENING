"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type {
  Subject,
  SubjectStatus,
  CDDPosture,
  EntityType,
  BadgeTone,
  SanctionSource,
} from "@/lib/types";
import { SUBJECTS } from "@/lib/data/subjects";
import { operatorById } from "@/lib/data/operators";
import {
  META,
  WALLETS,
  VESSELS,
  AUDIT,
  COUNTRY_CODES,
  type ModuleKey,
  type SanctionSourceRow,
  type MediaHit,
  type AuditRow,
} from "@/lib/data/console-datasets";
import {
  accentRgb,
  analystForType,
  fmtClock,
  fmtUptime,
  threatLabel,
  severityWord,
  draftRisk,
  type RegisterSortKey,
} from "@/lib/console/derive";
import { readAuditLog, writeAuditEvent } from "@/lib/audit";
import { fetchJson } from "@/lib/api/fetchWithRetry";

import { Header } from "@/components/console/Header";
import { ActionBar } from "@/components/console/ActionBar";
import { NavRail } from "@/components/console/NavRail";
import { AnalystHud } from "@/components/console/AnalystHud";
import { SubjectRegister } from "@/components/console/SubjectRegister";
import { CasesTable } from "@/components/console/CasesTable";
import { AuditTimeline } from "@/components/console/AuditTimeline";
import { SettingsPanel } from "@/components/console/SettingsPanel";
import { SubjectDetail } from "@/components/console/SubjectDetail";
import { ModuleBrief, type BriefItem } from "@/components/console/ModuleBrief";
import { IntakeModal } from "@/components/console/IntakeModal";
import { EMPTY_DRAFT, type ConsoleSettings, type Density, type Draft } from "@/components/console/types";

// Country display name → ISO code, sourced from the full console country list.
const CC: Record<string, string> = COUNTRY_CODES;

// Shape (subset) of the /api/quick-screen response the intake flow consumes.
interface QuickScreenResult {
  live?: boolean;
  pep?: boolean;
  sanctioned?: boolean;
  lists?: string[];
  topScore?: number;
  reasoning?: { decision?: "clear" | "review" | "escalate" | "block" };
  hits?: { candidateName: string; listId: string; score: number; programs?: string[] }[];
  adverseMedia?: {
    live: boolean;
    negativeCount: number;
    totalCount: number;
    score: number;
  };
}

const STATUS_BY_DECISION: Record<string, SubjectStatus> = {
  clear: "active",
  review: "review",
  escalate: "escalated",
  block: "escalated",
};

const VALID_LISTS = new Set<SanctionSource>([
  "OFAC",
  "UN",
  "EU",
  "UK",
  "EOCN",
  "AU",
  "CH",
  "CA",
  "JP",
  "FATF",
  "INTERPOL",
  "WB",
  "ADB",
]);

const TYPE_LABEL: Record<Draft["type"], string> = {
  individual: "Individual",
  entity: "Entity",
};

const ENTITY_TYPE: Record<Draft["type"], EntityType> = {
  individual: "individual",
  entity: "other",
};

function withAnalysts(list: Subject[]): Subject[] {
  return list.map((s) => ({ ...s, analyst: s.analyst ?? analystForType(s.entityType) }));
}

function auditColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes("escalat")) return "#FF6B6B";
  if (a.includes("clear")) return "#4FD6A0";
  if (a.includes("review") || a.includes("snooze")) return "#FFAE57";
  return "#7FB3E8";
}

function avgRisk(subjects: Subject[]): number {
  if (!subjects.length) return 0;
  return Math.round(subjects.reduce((a, s) => a + s.riskScore, 0) / subjects.length);
}

function slaUnder24(s: Subject): boolean {
  const m = /(\d+)h/.exec(s.slaNotify);
  const g = m?.[1];
  return g ? parseInt(g, 10) < 24 : false;
}

function walletExposure(wallets: typeof WALLETS): string {
  const total = wallets.reduce(
    (a, w) => a + (parseInt(w.exposure.replace(/[^0-9]/g, ""), 10) || 0),
    0,
  );
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(2)}M`;
  if (total >= 1_000) return `${Math.round(total / 1_000)}K`;
  return String(total);
}

export default function ScreeningConsole() {
  const [module, setModule] = useState<ModuleKey>("screening");
  const [subjects, setSubjects] = useState<Subject[]>(() => withAnalysts(SUBJECTS));
  const [selectedId, setSelectedId] = useState<string | null>(SUBJECTS[0]?.id ?? null);
  const [sortKey, setSortKey] = useState<RegisterSortKey>("risk");
  const [settings, setSettings] = useState<ConsoleSettings>({
    sync: true,
    autoEscalate: true,
    mediaScan: true,
    chainAnalytics: false,
    emailAlerts: true,
    twoFactor: true,
  });
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [now, setNow] = useState(() => Date.now());
  const [uptime, setUptime] = useState(5);

  const [accent, setAccent] = useState("Pink");
  const [density, setDensity] = useState<Density>("Compact");
  const [gridLines, setGridLines] = useState(true);

  const [sources, setSources] = useState<SanctionSourceRow[] | null>(null);
  const [sourcesLive, setSourcesLive] = useState(false);
  const [media, setMedia] = useState<MediaHit[] | null>(null);
  const [subjectMedia, setSubjectMedia] = useState<MediaHit[]>([]);
  const mediaCache = useRef<Map<string, MediaHit[]>>(new Map());
  const [realAudit, setRealAudit] = useState<AuditRow[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Live clock + uptime tick.
  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      setUptime((u) => u + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Hydrate appearance prefs.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hawkeye.console.prefs.v1");
      if (raw) {
        const p = JSON.parse(raw) as { accent?: string; density?: Density; gridLines?: boolean };
        if (p.accent) setAccent(p.accent);
        if (p.density) setDensity(p.density);
        if (typeof p.gridLines === "boolean") setGridLines(p.gridLines);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("hawkeye.console.prefs.v1", JSON.stringify({ accent, density, gridLines }));
    } catch {
      /* ignore */
    }
  }, [accent, density, gridLines]);

  // Sanctions sources + adverse-media feed (deterministic offline).
  useEffect(() => {
    let alive = true;
    void (async () => {
      const s = await fetchJson<{ sources: SanctionSourceRow[]; live: boolean }>("/api/sanctions/sources", {
        label: "sanctions/sources",
      });
      if (alive && s.ok && s.data) {
        setSources(s.data.sources);
        setSourcesLive(s.data.live);
      }
      const m = await fetchJson<{ hits: MediaHit[]; live: boolean }>("/api/adverse-media/news", {
        label: "adverse-media/news",
      });
      if (alive && m.ok && m.data) setMedia(m.data.hits);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // One-time reset for returning browsers: clear demo-era activity (audit log +
  // bell notifications) left in localStorage so the console opens clean. Guarded
  // by a version flag so activity the operator generates later is never wiped.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem("hawkeye.reset.v2")) return;
      localStorage.removeItem("hawkeye.audit-log.v1");
      localStorage.removeItem("hawkeye.bell-events.v1");
      localStorage.setItem("hawkeye.reset.v2", new Date().toISOString());
      window.dispatchEvent(new CustomEvent("hawkeye:audit-updated"));
    } catch {
      /* ignore */
    }
  }, []);

  // Mirror the persisted audit log into the timeline.
  useEffect(() => {
    const load = () => {
      const mapped: AuditRow[] = readAuditLog()
        .slice(0, 12)
        .map((e) => ({
          t: new Date(e.ts).toLocaleTimeString("en-GB", { hour12: false }),
          actor: e.actor,
          action: e.action,
          target: e.target,
          c: auditColor(e.action),
        }));
      setRealAudit(mapped);
    };
    load();
    window.addEventListener("hawkeye:audit-updated", load);
    return () => window.removeEventListener("hawkeye:audit-updated", load);
  }, []);

  // Fetch the selected subject's adverse media (cached per subject name) so the
  // Adverse Media tab + subject panel show that subject's real coverage.
  useEffect(() => {
    const subj = subjects.find((s) => s.id === selectedId);
    if (!subj) {
      setSubjectMedia([]);
      return;
    }
    const name = subj.name;
    const cached = mediaCache.current.get(name);
    if (cached) {
      setSubjectMedia(cached);
      return;
    }
    let alive = true;
    void (async () => {
      const r = await fetchJson<{ hits: MediaHit[]; live: boolean }>(
        `/api/adverse-media/news?subject=${encodeURIComponent(name)}`,
        { label: "adverse-media/news" },
      );
      if (alive && r.ok && r.data) {
        mediaCache.current.set(name, r.data.hits);
        setSubjectMedia(r.data.hits);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedId, subjects]);

  const meta = META[module];
  const selected = subjects.find((s) => s.id === selectedId) ?? subjects[0];
  const escalated = subjects.filter((s) => s.status === "escalated").length;

  const hudAnalyst = operatorById(module === "screening" ? selected?.analyst : meta.lead);
  const threat =
    module === "screening" && selected ? threatLabel(selected.riskScore) : { t: "MONITORING", c: "#7FB3E8" };
  const caseLabel = module === "screening" && selected ? selected.id : "OPS";

  const related = useMemo(() => {
    if (!selected) return [];
    return subjects.filter((s) => s.id !== selected.id && s.jurisdiction === selected.jurisdiction).slice(0, 3);
  }, [subjects, selected]);

  const auditRows = useMemo<AuditRow[]>(() => [...realAudit, ...AUDIT], [realAudit]);

  function patchSelected(patch: Partial<Subject>, action?: string) {
    if (!selected) return;
    const target = selected;
    setSubjects((prev) => prev.map((s) => (s.id === target.id ? { ...s, ...patch } : s)));
    if (action) writeAuditEvent("operator", action, `${target.id} · ${target.name}`);
  }

  function openCase(id: string) {
    setSelectedId(id);
    setModule("screening");
  }

  async function onSync() {
    const target = selected ?? subjects.find((s) => s.status === "escalated");
    if (!target) return;
    setSyncing(true);
    try {
      await fetchJson("/api/asana/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subjectId: target.id,
          name: target.name,
          risk: target.riskScore,
          status: target.status,
          caseId: `CS-${target.badge}`,
        }),
        label: "asana/sync",
      });
      writeAuditEvent("operator", "Synced to Asana", `${target.id} · ${target.name}`);
    } finally {
      setSyncing(false);
    }
  }

  function runIntake() {
    const nextBadge =
      Math.max(0, ...subjects.map((s) => parseInt(s.badge, 10)).filter((n) => Number.isFinite(n))) + 1;
    const id = `HS-${nextBadge}`;
    const risk = draftRisk(draft);
    const aliases = draft.altNames
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const jurisdiction =
      draft.country === "—" ? "—" : (CC[draft.country] || draft.country.slice(0, 2));
    const created: Subject = {
      id,
      badge: String(nextBadge),
      badgeTone: "brand" as BadgeTone,
      name: draft.name.trim() || "Unnamed subject",
      ...(aliases.length ? { aliases } : {}),
      meta: `New subject · ${draft.idType}${draft.idNumber ? ` ${draft.idNumber}` : ""}`,
      country: draft.country,
      jurisdiction,
      type: `${TYPE_LABEL[draft.type]} · Customer`,
      entityType: ENTITY_TYPE[draft.type],
      riskScore: risk,
      status: "review",
      cddPosture: "CDD",
      listCoverage: [],
      rca: { screened: false },
      exposureAED: "0",
      slaNotify: "+48h 00m",
      mostSerious: severityWord(risk).w,
      openedAgo: new Date().toLocaleDateString("en-GB"),
      openedAt: new Date().toISOString(),
      analyst: analystForType(draft.type),
    };
    setSubjects((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setModule("screening");
    setShowNew(false);
    setDraft(EMPTY_DRAFT);
    writeAuditEvent("operator", "Opened case", `${created.id} · ${created.name}`);

    // Screen against the free OpenSanctions / yente index (sanctions + PEP) and
    // patch the new subject with the REAL verdict only. When no live list source
    // is connected, the subject is marked "not screened" — never fabricated.
    void (async () => {
      const r = await fetchJson<QuickScreenResult>("/api/quick-screen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject: {
            name: created.name,
            aliases,
            entityType: created.entityType,
            jurisdiction,
          },
        }),
        label: "quick-screen",
      });
      if (!r.ok || !r.data) return;
      const v = r.data;
      const lists = v.live
        ? (v.lists ?? []).filter((c): c is SanctionSource => VALID_LISTS.has(c as SanctionSource))
        : [];
      const score = v.topScore ?? 0;
      const status = STATUS_BY_DECISION[v.reasoning?.decision ?? "review"] ?? "review";
      const amCount = v.adverseMedia?.negativeCount ?? 0;
      const amNote =
        amCount > 0 ? ` · ${amCount} adverse-media hit${amCount > 1 ? "s" : ""}` : "";
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === created.id
            ? {
                ...s,
                riskScore: score,
                status,
                listCoverage: lists,
                mostSerious: severityWord(score).w,
                rca: { screened: Boolean(v.live) },
                meta:
                  (v.live ? s.meta : `${s.meta} · not screened (no live list source)`) + amNote,
                ...(v.live && v.pep
                  ? { pep: { tier: "Match", rationale: "OpenSanctions PEP record" } }
                  : {}),
                ...(v.hits && v.hits.length
                  ? {
                      screeningHits: v.hits.map((h) => ({
                        name: h.candidateName,
                        list: h.listId.toUpperCase(),
                        score: h.score,
                        ...(h.programs && h.programs.length ? { programs: h.programs } : {}),
                      })),
                    }
                  : {}),
              }
            : s,
        ),
      );
      writeAuditEvent(
        "operator",
        v.live
          ? v.sanctioned
            ? "Sanctions hit on screen"
            : v.pep
              ? "PEP hit on screen"
              : amCount > 0
                ? "Adverse media hit on screen"
                : "Screened — clear"
          : amCount > 0
            ? "Adverse media hit — lists not screened"
            : "Not screened — no live list source",
        `${created.id} · ${created.name}${lists.length ? ` · ${lists.join("/")}` : ""}${amNote}`,
      );
    })();
  }

  const rootStyle = {
    "--ac": accentRgb(accent),
    position: "relative",
    minHeight: "100vh",
    background: "#070A11",
    color: "#EDEFF4",
  } as CSSProperties;

  return (
    <div className="console-root font-narrow" style={rootStyle}>
      <div
        style={{
          position: "fixed",
          inset: "-15%",
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 40% 50% at 22% 16%,rgba(var(--ac),0.08),transparent 60%),radial-gradient(ellipse 50% 55% at 86% 86%,rgba(91,155,216,0.06),transparent 60%)",
          animation: "drift 28s ease-in-out infinite alternate",
        }}
      />
      {gridLines && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.4,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      )}

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header clock={fmtClock(now)} alerts={escalated} />
        <ActionBar
          moduleTitle={meta.title}
          moduleCrumb={meta.crumb}
          syncing={syncing}
          onNew={() => setShowNew(true)}
          onRun={() => setModule("screening")}
          onCsv={() => exportCsv(subjects)}
          onSync={() => void onSync()}
        />

        <div style={{ display: "grid", gridTemplateColumns: "194px minmax(0,1fr) 416px", flex: 1, alignItems: "start" }}>
          <NavRail active={module} onSelect={setModule} />

          <div style={{ padding: "18px 20px 44px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "0.02em" }}>{meta.title}</div>
                <div style={{ fontSize: 12.5, color: "#828DA4", letterSpacing: "0.03em", marginTop: 2 }}>{meta.sub}</div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#4FD6A0",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3BC48F", boxShadow: "0 0 7px #3BC48F", animation: "pulseDot 2s ease-in-out infinite" }} />
                Live
              </div>
            </div>

            {module === "screening" && (
              <SubjectRegister
                subjects={subjects}
                selectedId={selectedId}
                sortKey={sortKey}
                density={density}
                sourcesLive={sourcesLive}
                onSortChange={setSortKey}
                onSelect={setSelectedId}
              />
            )}
            {module === "cases" && <CasesTable subjects={subjects} onOpen={openCase} />}
            {module === "audit" && <AuditTimeline rows={auditRows} />}
            {module === "settings" && (
              <SettingsPanel
                settings={settings}
                onToggle={(k) => setSettings((s) => ({ ...s, [k]: !s[k] }))}
                accent={accent}
                onAccent={setAccent}
                density={density}
                onDensity={setDensity}
                gridLines={gridLines}
                onGridToggle={() => setGridLines((g) => !g)}
              />
            )}
          </div>

          <aside
            style={{
              position: "sticky",
              top: 50,
              height: "calc(100vh - 50px)",
              overflowY: "auto",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(9,12,19,0.55)",
              padding: "16px 16px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 13,
            }}
          >
            <AnalystHud analyst={hudAnalyst} threat={threat} caseLabel={caseLabel} duty={meta.duty} uptime={fmtUptime(uptime)} />

            {module === "screening" && selected ? (
              <SubjectDetail
                subject={selected}
                related={related}
                adverseMediaHeadlines={subjectMedia}
                screeningHits={selected.screeningHits}
                onReassign={(id) => patchSelected({ analyst: id }, "Reassigned analyst")}
                onStatus={(s: SubjectStatus) => patchSelected({ status: s }, `Status → ${s}`)}
                onCdd={(c: CDDPosture) => patchSelected({ cddPosture: c }, `CDD posture → ${c}`)}
                onSnooze={() => patchSelected({ status: "review" }, "Snoozed (7d)")}
                onClear={() => patchSelected({ status: "cleared" }, "Marked cleared")}
                onNotes={(text) => patchSelected({ notes: text })}
                onSelectRelated={setSelectedId}
              />
            ) : (
              <ModuleBrief
                title={`${meta.title} Brief`}
                items={moduleBrief(module, subjects, sources, media, sourcesLive)}
                note={meta.note}
              />
            )}
          </aside>
        </div>
      </div>

      {showNew && (
        <IntakeModal
          draft={draft}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          onClose={() => setShowNew(false)}
          onRun={runIntake}
        />
      )}
    </div>
  );
}

function exportCsv(subjects: Subject[]) {
  const header = "id,name,country,risk,status,cdd,sla,lists";
  const lines = subjects.map(
    (s) =>
      `${s.id},"${s.name}",${s.country},${s.riskScore},${s.status},${s.cddPosture},${s.slaNotify},"${s.listCoverage.join("|")}"`,
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "screening-register.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function moduleBrief(
  module: ModuleKey,
  subjects: Subject[],
  sources: SanctionSourceRow[] | null,
  media: MediaHit[] | null,
  sourcesLive: boolean,
): BriefItem[] {
  const src = sources ?? [];
  const med = media ?? [];
  switch (module) {
    case "cases":
      return [
        { k: "Open cases", v: String(subjects.filter((s) => s.status === "escalated" || s.status === "review").length) },
        { k: "Escalated", v: String(subjects.filter((s) => s.status === "escalated").length), c: "#FF8A8A" },
        { k: "Avg risk", v: String(avgRisk(subjects)) },
        { k: "SLA < 24h", v: String(subjects.filter(slaUnder24).length), c: "#FFAE57" },
      ];
    case "sanctions":
      return [
        { k: "Sources", v: String(src.length) },
        { k: "Current", v: String(src.filter((s) => s.status === "current").length), c: "#4FD6A0" },
        { k: "Stale", v: String(src.filter((s) => s.status === "stale").length), c: "#FFAE57" },
        { k: "Feed", v: sourcesLive ? "Live" : "Seed", c: sourcesLive ? "#4FD6A0" : "#A3ADC0" },
      ];
    case "media":
      return [
        { k: "Hits", v: String(med.length) },
        { k: "Negative", v: String(med.filter((m) => m.sent === "negative").length), c: "#FF8A8A" },
        { k: "Sources", v: String(new Set(med.map((m) => m.source)).size) },
        { k: "Window", v: "30d" },
      ];
    case "crypto":
      return [
        { k: "Wallets", v: String(WALLETS.length) },
        { k: "High-risk", v: String(WALLETS.filter((w) => w.risk >= 60).length), c: "#FF9F45" },
        { k: "Chains", v: String(new Set(WALLETS.map((w) => w.chain)).size) },
        { k: "Exposure", v: walletExposure(WALLETS) },
      ];
    case "vessels":
      return [
        { k: "Vessels", v: String(VESSELS.length) },
        { k: "Detained", v: String(VESSELS.filter((v) => v.status === "Detained").length), c: "#FF8A8A" },
        { k: "Underway", v: String(VESSELS.filter((v) => v.status === "Underway").length), c: "#7FB3E8" },
        { k: "Flags", v: String(new Set(VESSELS.map((v) => v.flag)).size) },
      ];
    case "audit":
      return [
        { k: "Events", v: String(AUDIT.length) },
        { k: "Analysts", v: String(new Set(AUDIT.map((a) => a.actor)).size) },
        { k: "Syncs", v: String(AUDIT.filter((a) => a.action.toLowerCase().includes("sync")).length), c: "#4FD6A0" },
        { k: "Window", v: "24h" },
      ];
    case "settings":
      return [
        { k: "Integrations", v: "4" },
        { k: "Alerts", v: "On", c: "#4FD6A0" },
        { k: "2FA", v: "On", c: "#4FD6A0" },
        { k: "Operator", v: "OP" },
      ];
    default:
      return [];
  }
}
