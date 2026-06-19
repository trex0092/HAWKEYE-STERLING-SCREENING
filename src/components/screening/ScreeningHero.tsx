export interface ScreeningHeroProps {
  inQueue: number;
  critical: number;
  slaRisk: number;
  avgRisk: number;
}

interface StatCard {
  key: string;
  label: string;
  value: string;
  valueClass: string;
}

export function ScreeningHero({
  inQueue,
  critical,
  slaRisk,
  avgRisk,
}: ScreeningHeroProps) {
  const cards: StatCard[] = [
    {
      key: "in-queue",
      label: "In queue",
      value: String(inQueue),
      valueClass: "text-ink-0",
    },
    {
      key: "critical",
      label: "Critical",
      value: String(critical),
      valueClass: "text-red",
    },
    {
      key: "sla-risk",
      label: "SLA risk",
      value: String(slaRisk),
      valueClass: "text-amber",
    },
    {
      key: "avg-risk",
      label: "Avg risk",
      value: `${avgRisk}/100`,
      valueClass: "text-ink-0",
    },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-hair-2 bg-bg-panel p-4"
        >
          <div className="text-10 uppercase tracking-wide-3 text-ink-3">
            {card.label}
          </div>
          <div className={"mt-1 text-2xl font-semibold " + card.valueClass}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
