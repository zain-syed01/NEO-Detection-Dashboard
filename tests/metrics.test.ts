import { describe, expect, it } from "vitest";

import { computeMetrics } from "@/lib/metrics";
import { normalizeNeo } from "@/lib/normalize";
import { makeRawNeo } from "@/tests/fixtures";

describe("computeMetrics", () => {
  it("returns empty metrics for an empty list", () => {
    expect(computeMetrics([])).toEqual({
      totalTracked: 0,
      closestMissKm: null,
      closestMissName: null,
      hazardousCount: 0,
      maxVelocityKmS: null,
      largestDiameterKm: null,
    });
  });

  it("aggregates closest miss, PHA count, and extremes", () => {
    const objects = [
      normalizeNeo(
        makeRawNeo({
          id: "a",
          name: "Alpha",
          missKm: "900000",
          velocity: "12",
          diameterMin: 0.1,
          diameterMax: 0.2,
          hazardous: false,
        }),
      )!,
      normalizeNeo(
        makeRawNeo({
          id: "b",
          name: "Beta",
          missKm: "100000",
          velocity: "30",
          diameterMin: 0.5,
          diameterMax: 0.7,
          hazardous: true,
        }),
      )!,
      normalizeNeo(
        makeRawNeo({
          id: "c",
          name: "Gamma",
          missKm: "400000",
          velocity: "18",
          diameterMin: 0.05,
          diameterMax: 0.1,
          hazardous: true,
        }),
      )!,
    ];

    const metrics = computeMetrics(objects);
    expect(metrics.totalTracked).toBe(3);
    expect(metrics.hazardousCount).toBe(2);
    expect(metrics.closestMissKm).toBe(100000);
    expect(metrics.closestMissName).toBe("Beta");
    expect(metrics.maxVelocityKmS).toBe(30);
    expect(metrics.largestDiameterKm).toBeCloseTo(0.6);
  });
});
