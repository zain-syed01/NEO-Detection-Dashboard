import type { NasaNeoFeedResponse, NasaNeoRaw } from "@/lib/types";

export function makeRawNeo(
  overrides: Partial<NasaNeoRaw> & {
    missKm?: string;
    velocity?: string;
    hazardous?: boolean;
    diameterMin?: number;
    diameterMax?: number;
    approachBody?: string;
  } = {},
): NasaNeoRaw {
  const {
    missKm = "1000000",
    velocity = "20",
    hazardous = false,
    diameterMin = 0.1,
    diameterMax = 0.2,
    approachBody = "Earth",
    ...rest
  } = overrides;

  return {
    id: rest.id ?? "1",
    neo_reference_id: rest.neo_reference_id ?? "1",
    name: rest.name ?? "(2024 AA1)",
    nasa_jpl_url: rest.nasa_jpl_url ?? "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1",
    absolute_magnitude_h: rest.absolute_magnitude_h ?? 22,
    estimated_diameter: rest.estimated_diameter ?? {
      kilometers: {
        estimated_diameter_min: diameterMin,
        estimated_diameter_max: diameterMax,
      },
      meters: {
        estimated_diameter_min: diameterMin * 1000,
        estimated_diameter_max: diameterMax * 1000,
      },
      miles: {
        estimated_diameter_min: diameterMin * 0.621,
        estimated_diameter_max: diameterMax * 0.621,
      },
      feet: {
        estimated_diameter_min: diameterMin * 3280,
        estimated_diameter_max: diameterMax * 3280,
      },
    },
    is_potentially_hazardous_asteroid:
      rest.is_potentially_hazardous_asteroid ?? hazardous,
    is_sentry_object: rest.is_sentry_object ?? false,
    close_approach_data: rest.close_approach_data ?? [
      {
        close_approach_date: "2026-11-18",
        close_approach_date_full: "2026-Nov-18 12:00",
        epoch_date_close_approach: 1,
        relative_velocity: {
          kilometers_per_second: velocity,
          kilometers_per_hour: String(Number(velocity) * 3600),
          miles_per_hour: "0",
        },
        miss_distance: {
          astronomical: "0.01",
          lunar: "4",
          kilometers: missKm,
          miles: "0",
        },
        orbiting_body: approachBody,
      },
    ],
  };
}

export function makeFeed(objectsByDate: Record<string, NasaNeoRaw[]>): NasaNeoFeedResponse {
  const element_count = Object.values(objectsByDate).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  return { element_count, near_earth_objects: objectsByDate };
}
