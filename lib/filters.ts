/**
 * Helpers for syncing dashboard filters with the URL query string.
 */

import type { FiltersBarValues, NeoSortKey } from "@/lib/types";

const SORT_KEYS: NeoSortKey[] = [
  "threatScore",
  "missDistanceKm",
  "relativeVelocityKmS",
  "estimatedDiameterKm",
  "closeApproachDate",
  "name",
];

function isSortKey(value: string): value is NeoSortKey {
  return (SORT_KEYS as string[]).includes(value);
}

export function filtersFromSearchParams(
  params: URLSearchParams,
  fallback: FiltersBarValues,
): FiltersBarValues {
  const sortRaw = params.get("sort");
  return {
    startDate: params.get("start") || fallback.startDate,
    endDate: params.get("end") || fallback.endDate,
    sort: sortRaw && isSortKey(sortRaw) ? sortRaw : fallback.sort,
    hazardousOnly: params.get("hazardous") === "true",
    maxMissKm: params.get("maxMissKm") ?? "",
  };
}

export function filtersToSearchParams(values: FiltersBarValues): URLSearchParams {
  const params = new URLSearchParams();
  params.set("start", values.startDate);
  params.set("end", values.endDate);
  params.set("sort", values.sort);
  if (values.hazardousOnly) params.set("hazardous", "true");
  if (values.maxMissKm.trim()) params.set("maxMissKm", values.maxMissKm.trim());
  return params;
}
