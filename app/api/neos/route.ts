import { NextRequest, NextResponse } from "next/server";

import { defaultFeedRange } from "@/lib/dates";
import { computeMetrics } from "@/lib/metrics";
import { NasaApiError, fetchNeoFeed } from "@/lib/nasa";
import { normalizeNeoFeed } from "@/lib/normalize";
import { rankNeos } from "@/lib/rank";
import type { NeoSortKey, NeosApiResponse } from "@/lib/types";

const SORT_KEYS: NeoSortKey[] = [
  "threatScore",
  "missDistanceKm",
  "relativeVelocityKmS",
  "estimatedDiameterKm",
  "closeApproachDate",
  "name",
];

function parseSort(value: string | null): NeoSortKey {
  if (value && (SORT_KEYS as string[]).includes(value)) {
    return value as NeoSortKey;
  }
  return "threatScore";
}

/**
 * GET /api/neos
 * Query: start, end, sort, hazardous, maxMissKm
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const defaults = defaultFeedRange();

  const startDate = searchParams.get("start") ?? defaults.startDate;
  const endDate = searchParams.get("end") ?? defaults.endDate;
  const sort = parseSort(searchParams.get("sort"));
  const hazardousOnly = searchParams.get("hazardous") === "true";
  const maxMissRaw = searchParams.get("maxMissKm");
  const maxMissKm =
    maxMissRaw != null && maxMissRaw !== ""
      ? Number(maxMissRaw)
      : undefined;

  try {
    const feed = await fetchNeoFeed(startDate, endDate);
    const normalized = normalizeNeoFeed(feed);
    const objects = rankNeos(normalized, {
      sort,
      hazardousOnly,
      maxMissKm: Number.isFinite(maxMissKm) ? maxMissKm : undefined,
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
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    console.error("[api/neos]", error);
    return NextResponse.json(
      { error: "Unexpected error while loading NEO data." },
      { status: 500 },
    );
  }
}
