import type { NeoMetrics } from "@/lib/types";

type MetricsGridProps = {
  metrics: NeoMetrics;
  loading?: boolean;
};

function formatKm(value: number | null): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} M km`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} k km`;
  return `${value.toFixed(0)} km`;
}

/**
 * Top mission-control KPI strip.
 */
export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  const cards = [
    {
      label: "Total Tracked",
      value: loading ? "…" : String(metrics.totalTracked),
      hint: "Objects in selected window",
    },
    {
      label: "Closest Miss",
      value: loading ? "…" : formatKm(metrics.closestMissKm),
      hint: metrics.closestMissName ?? "No approaches yet",
    },
    {
      label: "Hazard Count",
      value: loading ? "…" : String(metrics.hazardousCount),
      hint: "NASA PHA flag",
    },
  ];

  return (
    <section
      aria-label="Mission metrics"
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="border border-zinc-800 bg-zinc-950/80 px-4 py-3"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
            {card.label}
          </p>
          <p className="mt-2 font-mono text-2xl text-zinc-50">{card.value}</p>
          <p className="mt-1 truncate text-sm text-zinc-500">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
