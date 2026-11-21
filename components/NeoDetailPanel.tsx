import { HazardBadge } from "@/components/HazardBadge";
import { WatchlistButton } from "@/components/WatchlistButton";
import {
  formatDiameterKm,
  formatDistanceKm,
  formatMissRelativeToMoon,
  formatThreatScore,
  formatVelocityKmS,
} from "@/lib/format";
import type { NeoObject } from "@/lib/types";

type NeoDetailPanelProps = {
  neo: NeoObject | null;
};

/**
 * Side detail panel for a selected near-Earth object.
 */
export function NeoDetailPanel({ neo }: NeoDetailPanelProps) {
  if (!neo) {
    return (
      <aside className="panel-surface flex min-h-72 items-center p-4 text-sm text-zinc-500">
        Select an object from the table or chart to inspect close-approach
        details.
      </aside>
    );
  }

  return (
    <aside
      className={`panel-surface p-4 ${
        neo.isPotentiallyHazardous ? "hazard-panel" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Selected object
          </p>
          <h2 className="mt-1 text-lg text-zinc-50">{neo.name}</h2>
        </div>
        <HazardBadge hazardous={neo.isPotentiallyHazardous} />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500">Close approach</dt>
          <dd className="font-mono text-zinc-200">{neo.closeApproachDate}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Miss distance</dt>
          <dd className="font-mono text-zinc-200">
            {formatDistanceKm(neo.missDistanceKm)}
            <span className="ml-2 text-xs text-zinc-500">
              ({formatMissRelativeToMoon(neo.missDistanceKm)})
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Relative velocity</dt>
          <dd className="font-mono text-zinc-200">
            {formatVelocityKmS(neo.relativeVelocityKmS)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Estimated diameter</dt>
          <dd className="font-mono text-zinc-200">
            {formatDiameterKm(neo.estimatedDiameterMinKm)} –{" "}
            {formatDiameterKm(neo.estimatedDiameterMaxKm)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Threat score</dt>
          <dd className="font-mono text-cyan-200">
            {formatThreatScore(neo.threatScore)} / 100
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Absolute magnitude (H)</dt>
          <dd className="font-mono text-zinc-200">
            {neo.absoluteMagnitude.toFixed(2)}
          </dd>
        </div>
      </dl>

      <a
        href={neo.nasaJplUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm text-cyan-300 underline-offset-2 hover:underline"
      >
        Open NASA JPL entry
      </a>

      <WatchlistButton neo={neo} />
    </aside>
  );
}
