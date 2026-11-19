import { describe, expect, it } from "vitest";

import { normalizeNeo, normalizeNeoFeed } from "@/lib/normalize";
import { makeFeed, makeRawNeo } from "@/tests/fixtures";

describe("normalizeNeo", () => {
  it("flattens diameter, miss distance, and velocity into numbers", () => {
    const neo = normalizeNeo(
      makeRawNeo({
        missKm: "500000",
        velocity: "15.5",
        diameterMin: 0.2,
        diameterMax: 0.4,
        hazardous: true,
      }),
    );

    expect(neo).not.toBeNull();
    expect(neo!.missDistanceKm).toBe(500000);
    expect(neo!.relativeVelocityKmS).toBe(15.5);
    expect(neo!.estimatedDiameterKm).toBeCloseTo(0.3);
    expect(neo!.isPotentiallyHazardous).toBe(true);
    expect(neo!.threatScore).toBeGreaterThan(0);
  });

  it("returns null when close_approach_data is empty", () => {
    const neo = normalizeNeo(makeRawNeo({ close_approach_data: [] }));
    expect(neo).toBeNull();
  });

  it("prefers Earth approaches over other bodies", () => {
    const raw = makeRawNeo({
      close_approach_data: [
        {
          close_approach_date: "2026-11-17",
          close_approach_date_full: "",
          epoch_date_close_approach: 1,
          relative_velocity: {
            kilometers_per_second: "10",
            kilometers_per_hour: "",
            miles_per_hour: "",
          },
          miss_distance: {
            astronomical: "",
            lunar: "",
            kilometers: "9999999",
            miles: "",
          },
          orbiting_body: "Mars",
        },
        {
          close_approach_date: "2026-11-18",
          close_approach_date_full: "",
          epoch_date_close_approach: 2,
          relative_velocity: {
            kilometers_per_second: "12",
            kilometers_per_hour: "",
            miles_per_hour: "",
          },
          miss_distance: {
            astronomical: "",
            lunar: "",
            kilometers: "123456",
            miles: "",
          },
          orbiting_body: "Earth",
        },
      ],
    });

    const neo = normalizeNeo(raw);
    expect(neo!.missDistanceKm).toBe(123456);
    expect(neo!.closeApproachDate).toBe("2026-11-18");
  });
});

describe("normalizeNeoFeed", () => {
  it("flattens multiple date buckets", () => {
    const feed = makeFeed({
      "2026-11-18": [makeRawNeo({ id: "a", name: "A" })],
      "2026-11-19": [
        makeRawNeo({ id: "b", name: "B" }),
        makeRawNeo({ id: "c", name: "C", close_approach_data: [] }),
      ],
    });

    const objects = normalizeNeoFeed(feed);
    expect(objects.map((o) => o.id).sort()).toEqual(["a", "b"]);
  });
});
