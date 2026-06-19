import type { JSX } from "react";

export interface ScreeningReasoningFactor {
  label: string;
  weight: number;
  detail?: string;
}

export interface ScreeningReasoning {
  summary: string;
  decision: "clear" | "review" | "escalate" | "block";
  score: number;
  factors: ScreeningReasoningFactor[];
  recommendation?: string;
}

const DECISION_STYLE: Record<ScreeningReasoning["decision"], string> = {
  clear: "bg-green-dim text-green border-green/30",
  review: "bg-amber-dim text-amber border-amber/30",
  escalate: "bg-red-dim text-red border-red/30",
  block: "bg-red-dim text-red border-red/30",
};

export function ScreeningReasoningPanel({
  reasoning,
}: {
  reasoning: ScreeningReasoning;
}): JSX.Element {
  return (
    <div className="bg-bg-panel border border-hair-2 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-11 font-semibold uppercase tracking-wide-3 text-ink-2">
          🧠 AI reasoning
        </span>
        <span
          className={`text-10 font-bold uppercase px-2 py-0.5 rounded border ${DECISION_STYLE[reasoning.decision]}`}
        >
          {reasoning.decision}
        </span>
        <span className="ml-auto text-11 font-mono text-ink-2">
          score {reasoning.score}/100
        </span>
      </div>

      <p className="text-12 text-ink-1 leading-relaxed mb-3">{reasoning.summary}</p>

      <div className="space-y-1.5">
        {reasoning.factors.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span className="text-11 text-ink-2 w-40 shrink-0 truncate">{f.label}</span>
            <div className="flex-1 h-1.5 rounded bg-bg-2 overflow-hidden">
              <div
                className="h-full bg-brand"
                style={{ width: `${Math.max(0, Math.min(100, f.weight))}%` }}
              />
            </div>
            <span className="text-10 font-mono text-ink-3 w-8 text-right">{f.weight}</span>
            {f.detail && <span className="text-10 text-ink-3 w-48 truncate">{f.detail}</span>}
          </div>
        ))}
      </div>

      {reasoning.recommendation && (
        <p className="mt-3 text-11 text-ink-2 border-t border-hair pt-2">
          <span className="font-semibold text-ink-1">Recommendation:</span>{" "}
          {reasoning.recommendation}
        </p>
      )}
    </div>
  );
}
