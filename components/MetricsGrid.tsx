import { formatDiameterKm, formatDistanceKm, formatVelocityKmS } from "@/lib/format";
import type { NeoMetrics } from "@/lib/types";

type MetricsGridProps = {
  metrics: NeoMetrics;
  loading?: boolean;
};

type Card = {
  label: string;
  value: string;
  hint: string;
  accent?: "hazard" | "accent";
};

/**
 * Top mission-control KPI strip.
 */
export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  const cards: Card[] = [
    {
      label: "Total Tracked",
      value: loading ? "…" : String(metrics.totalTracked),
      hint: "Objects in selected window",
    },
    {
      label: "Closest Miss",
      value: loading ? "…" : formatDistanceKm(metrics.closestMissKm),
      hint: metrics.closestMissName ?? "No approaches yet",
      accent: "accent",
    },
    {
      label: "Hazard Count",
      value: loading ? "…" : String(metrics.hazardousCount),
      hint: "NASA PHA flag",
      accent: metrics.hazardousCount > 0 ? "hazard" : undefined,
    },
    {
      label: "Max Velocity",
      value: loading ? "…" : formatVelocityKmS(metrics.maxVelocityKmS),
      hint: loading
        ? "Scanning feed"
        : `Largest Ø ${formatDiameterKm(metrics.largestDiameterKm)}`,
    },
  ];

  return (
    <section
      aria-label="Mission metrics"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className={`panel-surface relative overflow-hidden px-4 py-3 ${
            card.accent === "hazard" ? "ring-1 ring-red-500/40" : ""
          }`}
        >
          <div
            className={`absolute inset-x-0 top-0 h-px ${
              card.accent === "hazard"
                ? "bg-gradient-to-r from-transparent via-red-400/70 to-transparent"
                : card.accent === "accent"
                  ? "bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"
                  : "bg-gradient-to-r from-transparent via-zinc-600/60 to-transparent"
            }`}
          />
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            {card.label}
          </p>
          <p
            className={`mt-2 font-mono text-xl sm:text-2xl ${
              card.accent === "hazard"
                ? "text-red-200"
                : card.accent === "accent"
                  ? "text-cyan-100"
                  : "text-zinc-50"
            }`}
          >
            {card.value}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
            {card.hint}
          </p>
        </article>
      ))}
    </section>
  );
}
