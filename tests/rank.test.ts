import { describe, expect, it } from "vitest";

import { normalizeNeo } from "@/lib/normalize";
import {
  computeThreatScore,
  filterNeos,
  rankNeos,
  sortNeos,
} from "@/lib/rank";
import { makeRawNeo } from "@/tests/fixtures";

function neo(opts: Parameters<typeof makeRawNeo>[0]) {
  const normalized = normalizeNeo(makeRawNeo(opts));
  if (!normalized) throw new Error("fixture failed to normalize");
  return normalized;
}

describe("computeThreatScore", () => {
  it("scores PHA higher than an otherwise identical non-PHA", () => {
    const base = {
      missDistanceKm: 1_000_000,
      relativeVelocityKmS: 20,
      estimatedDiameterKm: 0.25,
    };
    const clear = computeThreatScore({
      ...base,
      isPotentiallyHazardous: false,
    });
    const pha = computeThreatScore({ ...base, isPotentiallyHazardous: true });
    expect(pha).toBeGreaterThan(clear);
  });

  it("increases when miss distance shrinks", () => {
    const far = computeThreatScore({
      isPotentiallyHazardous: false,
      missDistanceKm: 4_000_000,
      relativeVelocityKmS: 15,
      estimatedDiameterKm: 0.2,
    });
    const near = computeThreatScore({
      isPotentiallyHazardous: false,
      missDistanceKm: 100_000,
      relativeVelocityKmS: 15,
      estimatedDiameterKm: 0.2,
    });
    expect(near).toBeGreaterThan(far);
  });
});

describe("filterNeos / sortNeos / rankNeos", () => {
  const sample = [
    neo({ id: "1", name: "Far", missKm: "5000000", hazardous: false, velocity: "10" }),
    neo({ id: "2", name: "Close PHA", missKm: "200000", hazardous: true, velocity: "25" }),
    neo({ id: "3", name: "Mid", missKm: "800000", hazardous: false, velocity: "18" }),
  ];

  it("keeps only hazardous objects when requested", () => {
    const filtered = filterNeos(sample, { hazardousOnly: true });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });

  it("applies maxMissKm ceiling", () => {
    const filtered = filterNeos(sample, {
      hazardousOnly: false,
      maxMissKm: 1_000_000,
    });
    expect(filtered.map((o) => o.id).sort()).toEqual(["2", "3"]);
  });

  it("sorts by miss distance ascending", () => {
    const sorted = sortNeos(sample, "missDistanceKm");
    expect(sorted.map((o) => o.id)).toEqual(["2", "3", "1"]);
  });

  it("ranks hazardous-first by threat score by default path", () => {
    const ranked = rankNeos(sample, {
      sort: "threatScore",
      hazardousOnly: false,
    });
    expect(ranked[0].id).toBe("2");
  });
});
