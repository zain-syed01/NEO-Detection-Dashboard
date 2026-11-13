import type { NeoObject } from "@/lib/types";
import { HazardBadge } from "@/components/HazardBadge";

type NeoDetailPanelProps = {
  neo: NeoObject | null;
};

/**
 * Side detail panel for a selected near-Earth object.
 */
export function NeoDetailPanel({ neo }: NeoDetailPanelProps) {
  if (!neo) {
    return (
      <aside className="border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-zinc-500">
        Select an object from the table or chart to inspect close-approach
        details.
      </aside>
    );
  }

  return (
    <aside className="border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
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
            {neo.missDistanceKm.toLocaleString()} km
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Relative velocity</dt>
          <dd className="font-mono text-zinc-200">
            {neo.relativeVelocityKmS.toFixed(3)} km/s
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Estimated diameter</dt>
          <dd className="font-mono text-zinc-200">
            {neo.estimatedDiameterMinKm.toFixed(3)} –{" "}
            {neo.estimatedDiameterMaxKm.toFixed(3)} km
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Threat score</dt>
          <dd className="font-mono text-cyan-200">
            {neo.threatScore.toFixed(1)} / 100
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
    </aside>
  );
}
