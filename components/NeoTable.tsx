"use client";

import { HazardBadge } from "@/components/HazardBadge";
import type { NeoObject } from "@/lib/types";

type NeoTableProps = {
  objects: NeoObject[];
  selectedId?: string | null;
  onSelect?: (neo: NeoObject) => void;
  loading?: boolean;
};

function formatKm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

/**
 * Sortable-looking NEO table. Sorting is owned by the API / FiltersBar.
 */
export function NeoTable({
  objects,
  selectedId,
  onSelect,
  loading,
}: NeoTableProps) {
  if (loading) {
    return (
      <div className="border border-zinc-800 p-6 text-sm text-zinc-500">
        Loading close-approach data…
      </div>
    );
  }

  if (!objects.length) {
    return (
      <div className="border border-zinc-800 p-6 text-sm text-zinc-500">
        No near-Earth objects match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Approach</th>
            <th className="px-3 py-2 font-medium">Miss (km)</th>
            <th className="px-3 py-2 font-medium">Velocity</th>
            <th className="px-3 py-2 font-medium">Diameter</th>
            <th className="px-3 py-2 font-medium">Threat</th>
            <th className="px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {objects.map((neo) => {
            const selected = neo.id === selectedId;
            return (
              <tr
                key={neo.id}
                tabIndex={0}
                onClick={() => onSelect?.(neo)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(neo);
                  }
                }}
                className={`cursor-pointer border-t border-zinc-900 hover:bg-zinc-900/80 ${
                  selected ? "bg-zinc-900" : ""
                } ${neo.isPotentiallyHazardous ? "hazard-row" : ""}`}
              >
                <td className="px-3 py-2 text-zinc-100">{neo.name}</td>
                <td className="px-3 py-2 font-mono text-zinc-400">
                  {neo.closeApproachDate}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {formatKm(neo.missDistanceKm)}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {neo.relativeVelocityKmS.toFixed(2)} km/s
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {neo.estimatedDiameterKm.toFixed(3)} km
                </td>
                <td className="px-3 py-2 font-mono text-cyan-200">
                  {neo.threatScore.toFixed(1)}
                </td>
                <td className="px-3 py-2">
                  <HazardBadge hazardous={neo.isPotentiallyHazardous} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
