/**
 * Aggregate KPI metrics for the mission-control header strip.
 */

import type { NeoMetrics, NeoObject } from "@/lib/types";

export function computeMetrics(objects: NeoObject[]): NeoMetrics {
  if (!objects.length) {
    return {
      totalTracked: 0,
      closestMissKm: null,
      closestMissName: null,
      hazardousCount: 0,
      maxVelocityKmS: null,
      largestDiameterKm: null,
    };
  }

  let closest = objects[0];
  let maxVelocity = objects[0];
  let largest = objects[0];
  let hazardousCount = 0;

  for (const neo of objects) {
    if (neo.isPotentiallyHazardous) hazardousCount += 1;
    if (neo.missDistanceKm < closest.missDistanceKm) closest = neo;
    if (neo.relativeVelocityKmS > maxVelocity.relativeVelocityKmS) {
      maxVelocity = neo;
    }
    if (neo.estimatedDiameterKm > largest.estimatedDiameterKm) {
      largest = neo;
    }
  }

  return {
    totalTracked: objects.length,
    closestMissKm: closest.missDistanceKm,
    closestMissName: closest.name,
    hazardousCount,
    maxVelocityKmS: maxVelocity.relativeVelocityKmS,
    largestDiameterKm: largest.estimatedDiameterKm,
  };
}
