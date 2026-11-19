/**
 * Ranking / filtering helpers for near-Earth objects.
 *
 * Threat score is a transparent 0–100 composite so interviewers can
 * walk through the weighting without mystery ML.
 */

import type { NeoFilters, NeoObject, NeoSortKey } from "@/lib/types";

type ThreatInputs = {
  isPotentiallyHazardous: boolean;
  missDistanceKm: number;
  relativeVelocityKmS: number;
  estimatedDiameterKm: number;
};

/** Soft caps used when normalizing continuous fields into 0–1. */
const MISS_DISTANCE_SOFT_CAP_KM = 5_000_000; // ~ lunar distance ballpark for scoring
const VELOCITY_SOFT_CAP_KM_S = 40;
const DIAMETER_SOFT_CAP_KM = 1;

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Higher score = more noteworthy for the dashboard.
 * Weights (sum ≈ 1): PHA flag 0.35, closeness 0.30, velocity 0.20, size 0.15.
 */
export function computeThreatScore(neo: ThreatInputs): number {
  const pha = neo.isPotentiallyHazardous ? 1 : 0;
  const closeness = 1 - clamp01(neo.missDistanceKm / MISS_DISTANCE_SOFT_CAP_KM);
  const speed = clamp01(neo.relativeVelocityKmS / VELOCITY_SOFT_CAP_KM_S);
  const size = clamp01(neo.estimatedDiameterKm / DIAMETER_SOFT_CAP_KM);

  const score = pha * 0.35 + closeness * 0.3 + speed * 0.2 + size * 0.15;
  return Math.round(score * 1000) / 10; // one decimal, 0–100
}

export function filterNeos(
  objects: NeoObject[],
  filters: Pick<NeoFilters, "hazardousOnly" | "maxMissKm">,
): NeoObject[] {
  return objects.filter((neo) => {
    if (filters.hazardousOnly && !neo.isPotentiallyHazardous) return false;
    if (
      filters.maxMissKm != null &&
      Number.isFinite(filters.maxMissKm) &&
      neo.missDistanceKm > filters.maxMissKm
    ) {
      return false;
    }
    return true;
  });
}

function compareBy(a: NeoObject, b: NeoObject, key: NeoSortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "closeApproachDate":
      return a.closeApproachDate.localeCompare(b.closeApproachDate);
    case "threatScore":
      return b.threatScore - a.threatScore; // high first
    case "missDistanceKm":
      return a.missDistanceKm - b.missDistanceKm; // close first
    case "relativeVelocityKmS":
      return b.relativeVelocityKmS - a.relativeVelocityKmS;
    case "estimatedDiameterKm":
      return b.estimatedDiameterKm - a.estimatedDiameterKm;
    default:
      return 0;
  }
}

export function sortNeos(objects: NeoObject[], sort: NeoSortKey): NeoObject[] {
  return [...objects].sort((a, b) => compareBy(a, b, sort));
}

/** Apply filter then sort. */
export function rankNeos(
  objects: NeoObject[],
  filters: Pick<NeoFilters, "sort" | "hazardousOnly" | "maxMissKm">,
): NeoObject[] {
  return sortNeos(filterNeos(objects, filters), filters.sort);
}
