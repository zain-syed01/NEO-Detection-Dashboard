/**
 * Zod schemas for query validation and light NeoWs payload checks.
 */

import { z } from "zod";

export const neoSortKeySchema = z.enum([
  "threatScore",
  "missDistanceKm",
  "relativeVelocityKmS",
  "estimatedDiameterKm",
  "closeApproachDate",
  "name",
]);

export const neosQuerySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sort: neoSortKeySchema.optional().default("threatScore"),
  hazardous: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  maxMissKm: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    }),
});

const diameterRangeSchema = z.object({
  estimated_diameter_min: z.number(),
  estimated_diameter_max: z.number(),
});

const closeApproachSchema = z.object({
  close_approach_date: z.string(),
  close_approach_date_full: z.string().optional().default(""),
  epoch_date_close_approach: z.number().optional().default(0),
  relative_velocity: z.object({
    kilometers_per_second: z.string(),
    kilometers_per_hour: z.string().optional().default(""),
    miles_per_hour: z.string().optional().default(""),
  }),
  miss_distance: z.object({
    astronomical: z.string().optional().default(""),
    lunar: z.string().optional().default(""),
    kilometers: z.string(),
    miles: z.string().optional().default(""),
  }),
  orbiting_body: z.string(),
});

export const nasaNeoRawSchema = z.object({
  id: z.string(),
  neo_reference_id: z.string().optional().default(""),
  name: z.string(),
  nasa_jpl_url: z.string(),
  absolute_magnitude_h: z.number(),
  estimated_diameter: z.object({
    kilometers: diameterRangeSchema,
    meters: diameterRangeSchema.optional(),
    miles: diameterRangeSchema.optional(),
    feet: diameterRangeSchema.optional(),
  }),
  is_potentially_hazardous_asteroid: z.boolean(),
  is_sentry_object: z.boolean().optional(),
  close_approach_data: z.array(closeApproachSchema),
});

export const nasaNeoFeedSchema = z.object({
  element_count: z.number().optional().default(0),
  near_earth_objects: z.record(z.string(), z.array(z.unknown())),
});
