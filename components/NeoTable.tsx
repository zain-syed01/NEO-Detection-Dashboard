"use client";

import { HazardBadge } from "@/components/HazardBadge";
import {
  formatDiameterKm,
  formatDistanceKmCompact,
  formatThreatScore,
  formatVelocityKmS,
} from "@/lib/format";
import type { NeoObject } from "@/lib/types";

type NeoTableProps = {
  objects: NeoObject[];
  selectedId?: string | null;
  onSelect?: (neo: NeoObject) => void;
  loading?: boolean;
};

/**
 * NEO table. Sorting is owned by the API / FiltersBar.
 */
export function NeoTable({
  objects,
  selectedId,
  onSelect,
  loading,
}: NeoTableProps) {
  if (loading) {
    return (
      <div className="panel-surface space-y-2 p-4" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-sm bg-zinc-900/80"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }

  if (!objects.length) {
    return (
      <div className="panel-surface p-6 text-sm text-zinc-500">
        No near-Earth objects match the current filters. Widen the date range or
        clear the hazard / miss-distance filters.
      </div>
    );
  }

  return (
    <div className="panel-surface overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-zinc-950/90 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">Name</th>
            <th className="px-3 py-2.5 font-medium">Approach</th>
            <th className="px-3 py-2.5 font-medium">Miss (km)</th>
            <th className="px-3 py-2.5 font-medium">Velocity</th>
            <th className="px-3 py-2.5 font-medium">Diameter</th>
            <th className="px-3 py-2.5 font-medium">Threat</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
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
                className={`border-t border-zinc-900/90 hover:bg-zinc-900/70 ${
                  selected ? "bg-zinc-900/90" : ""
                } ${neo.isPotentiallyHazardous ? "hazard-row" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <td className="px-3 py-2 text-zinc-100">{neo.name}</td>
                <td className="px-3 py-2 font-mono text-zinc-400">
                  {neo.closeApproachDate}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {formatDistanceKmCompact(neo.missDistanceKm)}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {formatVelocityKmS(neo.relativeVelocityKmS)}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-300">
                  {formatDiameterKm(neo.estimatedDiameterKm)}
                </td>
                <td className="px-3 py-2 font-mono text-cyan-200">
                  {formatThreatScore(neo.threatScore)}
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
