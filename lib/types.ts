/**
 * Shared types for NASA NeoWs feed data and the dashboard's normalized model.
 */

/** Diameter range as returned by NeoWs (min/max estimates). */
export type DiameterRange = {
  estimated_diameter_min: number;
  estimated_diameter_max: number;
};

/** One close-approach entry from NeoWs. */
export type CloseApproach = {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
};

/** Raw near-Earth object shape from the NeoWs feed (fields we care about). */
export type NasaNeoRaw = {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: DiameterRange;
    meters: DiameterRange;
    miles: DiameterRange;
    feet: DiameterRange;
  };
  is_potentially_hazardous_asteroid: boolean;
  is_sentry_object?: boolean;
  close_approach_data: CloseApproach[];
};

/** NeoWs /feed response envelope. */
export type NasaNeoFeedResponse = {
  element_count: number;
  near_earth_objects: Record<string, NasaNeoRaw[]>;
};

/** Normalized NEO used across the UI and ranking logic. */
export type NeoObject = {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitude: number;
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  /** Average estimated diameter in kilometers. */
  estimatedDiameterKm: number;
  estimatedDiameterMinKm: number;
  estimatedDiameterMaxKm: number;
  closeApproachDate: string;
  /** Miss distance in kilometers. */
  missDistanceKm: number;
  /** Relative velocity in km/s. */
  relativeVelocityKmS: number;
  /** 0–100 composite threat score from ranking logic. */
  threatScore: number;
};

export type NeoSortKey =
  | "threatScore"
  | "missDistanceKm"
  | "relativeVelocityKmS"
  | "estimatedDiameterKm"
  | "closeApproachDate"
  | "name";

export type NeoFilters = {
  startDate: string;
  endDate: string;
  sort: NeoSortKey;
  hazardousOnly: boolean;
  maxMissKm?: number;
};

export type NeoMetrics = {
  totalTracked: number;
  closestMissKm: number | null;
  closestMissName: string | null;
  hazardousCount: number;
  maxVelocityKmS: number | null;
  largestDiameterKm: number | null;
};

export type NeosApiResponse = {
  metrics: NeoMetrics;
  objects: NeoObject[];
  meta: {
    startDate: string;
    endDate: string;
    fetchedAt: string;
    elementCount: number;
  };
};
