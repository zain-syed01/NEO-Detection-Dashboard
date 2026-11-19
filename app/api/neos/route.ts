import { NextRequest, NextResponse } from "next/server";

import { defaultFeedRange, validateFeedRange } from "@/lib/dates";
import { computeMetrics } from "@/lib/metrics";
import { NasaApiError, fetchNeoFeed } from "@/lib/nasa";
import { normalizeNeoFeed } from "@/lib/normalize";
import { rankNeos } from "@/lib/rank";
import { neosQuerySchema } from "@/lib/schemas";
import type { NeosApiResponse } from "@/lib/types";

/**
 * GET /api/neos
 * Query: start, end, sort, hazardous, maxMissKm
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const defaults = defaultFeedRange();

  const parsed = neosQuerySchema.safeParse({
    start: searchParams.get("start") ?? undefined,
    end: searchParams.get("end") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    hazardous: searchParams.get("hazardous") ?? undefined,
    maxMissKm: searchParams.get("maxMissKm") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const startDate = parsed.data.start ?? defaults.startDate;
  const endDate = parsed.data.end ?? defaults.endDate;
  const rangeError = validateFeedRange(startDate, endDate);
  if (rangeError) {
    return NextResponse.json({ error: rangeError }, { status: 400 });
  }

  try {
    const feed = await fetchNeoFeed(startDate, endDate);
    const normalized = normalizeNeoFeed(feed);
    const objects = rankNeos(normalized, {
      sort: parsed.data.sort,
      hazardousOnly: parsed.data.hazardous ?? false,
      maxMissKm: parsed.data.maxMissKm,
    });

    const payload: NeosApiResponse = {
      metrics: computeMetrics(normalized),
      objects,
      meta: {
        startDate,
        endDate,
        fetchedAt: new Date().toISOString(),
        elementCount: feed.element_count ?? normalized.length,
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof NasaApiError) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error.status >= 400 && error.status < 600 ? error.status : 502,
        },
      );
    }

    console.error("[api/neos]", error);
    return NextResponse.json(
      { error: "Unexpected error while loading NEO data." },
      { status: 500 },
    );
  }
}
