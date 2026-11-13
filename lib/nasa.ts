/**
 * NASA NeoWs API client.
 * Docs: https://api.nasa.gov/ (NeoWs)
 */

import type { NasaNeoFeedResponse } from "@/lib/types";
import { validateFeedRange } from "@/lib/dates";

const NEOWS_FEED_URL = "https://api.nasa.gov/neo/rest/v1/feed";

export class NasaApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "NasaApiError";
    this.status = status;
  }
}

function getApiKey(): string {
  return process.env.NASA_API_KEY?.trim() || "DEMO_KEY";
}

/**
 * Fetch the NeoWs close-approach feed for a date range (max 7 days).
 */
export async function fetchNeoFeed(
  startDate: string,
  endDate: string,
): Promise<NasaNeoFeedResponse> {
  const rangeError = validateFeedRange(startDate, endDate);
  if (rangeError) {
    throw new NasaApiError(rangeError, 400);
  }

  const url = new URL(NEOWS_FEED_URL);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("api_key", getApiKey());

  const response = await fetch(url.toString(), {
    // Short revalidation helps stay within NASA rate limits during demos.
    next: { revalidate: 300 },
  });

  if (response.status === 429 || response.status === 403) {
    throw new NasaApiError(
      "NASA API rate limit reached or key rejected. Set NASA_API_KEY in .env.local.",
      response.status,
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new NasaApiError(
      `NeoWs request failed (${response.status}): ${body.slice(0, 200)}`,
      response.status,
    );
  }

  return (await response.json()) as NasaNeoFeedResponse;
}
