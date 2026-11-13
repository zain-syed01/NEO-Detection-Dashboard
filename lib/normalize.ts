/**
 * Flatten nested NeoWs JSON into dashboard-friendly NeoObject records.
 */

import type { CloseApproach, NasaNeoFeedResponse, NasaNeoRaw, NeoObject } from "@/lib/types";
import { computeThreatScore } from "@/lib/rank";

function pickPrimaryApproach(approaches: CloseApproach[]): CloseApproach | null {
  if (!approaches.length) return null;
  // Prefer Earth approaches; fall back to the first entry.
  return (
    approaches.find((a) => a.orbiting_body.toLowerCase() === "earth") ??
    approaches[0]
  );
}

function average(min: number, max: number): number {
  return (min + max) / 2;
}

/**
 * Map a single raw NeoWs object into a NeoObject.
 * Returns null when close-approach data is missing or unusable.
 */
export function normalizeNeo(raw: NasaNeoRaw): NeoObject | null {
  const approach = pickPrimaryApproach(raw.close_approach_data ?? []);
  if (!approach) return null;

  const missDistanceKm = Number(approach.miss_distance.kilometers);
  const relativeVelocityKmS = Number(
    approach.relative_velocity.kilometers_per_second,
  );
  const minKm = raw.estimated_diameter.kilometers.estimated_diameter_min;
  const maxKm = raw.estimated_diameter.kilometers.estimated_diameter_max;

  if (
    !Number.isFinite(missDistanceKm) ||
    !Number.isFinite(relativeVelocityKmS) ||
    !Number.isFinite(minKm) ||
    !Number.isFinite(maxKm)
  ) {
    return null;
  }

  const estimatedDiameterKm = average(minKm, maxKm);
  const isPotentiallyHazardous = Boolean(raw.is_potentially_hazardous_asteroid);

  const partial = {
    isPotentiallyHazardous,
    missDistanceKm,
    relativeVelocityKmS,
    estimatedDiameterKm,
  };

  return {
    id: raw.id,
    name: raw.name,
    nasaJplUrl: raw.nasa_jpl_url,
    absoluteMagnitude: raw.absolute_magnitude_h,
    isPotentiallyHazardous,
    isSentryObject: Boolean(raw.is_sentry_object),
    estimatedDiameterKm,
    estimatedDiameterMinKm: minKm,
    estimatedDiameterMaxKm: maxKm,
    closeApproachDate: approach.close_approach_date,
    missDistanceKm,
    relativeVelocityKmS,
    threatScore: computeThreatScore(partial),
  };
}

/** Flatten all dated buckets from a NeoWs feed response. */
export function normalizeNeoFeed(feed: NasaNeoFeedResponse): NeoObject[] {
  const objects: NeoObject[] = [];
  const buckets = feed.near_earth_objects ?? {};

  for (const date of Object.keys(buckets)) {
    for (const raw of buckets[date] ?? []) {
      const neo = normalizeNeo(raw);
      if (neo) objects.push(neo);
    }
  }

  return objects;
}
