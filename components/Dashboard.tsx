"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { FiltersBar, type FiltersBarValues } from "@/components/FiltersBar";
import { MetricsGrid } from "@/components/MetricsGrid";
import { NeoDetailPanel } from "@/components/NeoDetailPanel";
import { NeoScatterChart } from "@/components/NeoScatterChart";
import { NeoTable } from "@/components/NeoTable";
import { StatusBar } from "@/components/StatusBar";
import { defaultFeedRange } from "@/lib/dates";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/filters";
import type { NeoMetrics, NeoObject, NeosApiResponse } from "@/lib/types";

const emptyMetrics: NeoMetrics = {
  totalTracked: 0,
  closestMissKm: null,
  closestMissName: null,
  hazardousCount: 0,
  maxVelocityKmS: null,
  largestDiameterKm: null,
};

function subscribeNoop() {
  return () => {};
}

/** Stable empty snapshot — React requires getServerSnapshot to return a cached value. */
const EMPTY_FEED_RANGE = { startDate: "", endDate: "" };

/** Cache the client date window so getSnapshot returns a stable reference. */
let clientFeedRangeCache: { startDate: string; endDate: string } | null = null;

function getClientFeedRange() {
  if (!clientFeedRangeCache) {
    clientFeedRangeCache = defaultFeedRange();
  }
  return clientFeedRangeCache;
}

/** Client-only default date window (empty on the server / during prerender). */
function useClientFeedRange() {
  return useSyncExternalStore(
    subscribeNoop,
    getClientFeedRange,
    () => EMPTY_FEED_RANGE,
  );
}

/**
 * Client dashboard shell: loads /api/neos and wires filters → chart → table.
 */
export function Dashboard() {
  const range = useClientFeedRange();
  const ready = Boolean(range.startDate && range.endDate);

  const [filters, setFilters] = useState<FiltersBarValues | null>(null);
  const activeFilters: FiltersBarValues = filters ?? {
    startDate: range.startDate,
    endDate: range.endDate,
    sort: "threatScore",
    hazardousOnly: false,
    maxMissKm: "",
  };
  const [objects, setObjects] = useState<NeoObject[]>([]);
  const [metrics, setMetrics] = useState<NeoMetrics>(emptyMetrics);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const didLoad = useRef(false);

  const selected = objects.find((o) => o.id === selectedId) ?? null;

  const syncUrl = useCallback((values: FiltersBarValues) => {
    const params = filtersToSearchParams(values);
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", next);
  }, []);

  const load = useCallback(
    async (values: FiltersBarValues) => {
      setLoading(true);
      setError(null);
      syncUrl(values);

      const params = filtersToSearchParams(values);

      try {
        const response = await fetch(`/api/neos?${params.toString()}`);
        const body = (await response.json()) as NeosApiResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(body.error ?? `Request failed (${response.status})`);
        }

        setObjects(body.objects);
        setMetrics(body.metrics);
        setFetchedAt(body.meta.fetchedAt);
        setSelectedId((prev) =>
          body.objects.some((o) => o.id === prev) ? prev : null,
        );
      } catch (err) {
        setObjects([]);
        setMetrics(emptyMetrics);
        setFetchedAt(null);
        setError(
          err instanceof Error ? err.message : "Failed to load NEO data.",
        );
      } finally {
        setLoading(false);
      }
    },
    [syncUrl],
  );

  useEffect(() => {
    if (!ready || didLoad.current) return;
    didLoad.current = true;

    const fallback: FiltersBarValues = {
      startDate: range.startDate,
      endDate: range.endDate,
      sort: "threatScore",
      hazardousOnly: false,
      maxMissKm: "",
    };
    const fromUrl = filtersFromSearchParams(
      new URLSearchParams(window.location.search),
      fallback,
    );
    setFilters(fromUrl);
    void load(fromUrl);
  }, [ready, range.startDate, range.endDate, load]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-10">
      <header className="fade-in space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-500/90">
              Space situational awareness
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              NEO Detection &amp; Alert Dashboard
            </h1>
            <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
              Live near-Earth object close-approach data from NASA NeoWs —
              parsed, ranked by threat metrics, and charted for quick hazard
              spotting.
            </p>
          </div>
          <div className="hidden text-right text-xs text-zinc-500 sm:block">
            <p className="uppercase tracking-[0.16em]">Data source</p>
            <p className="mt-1 font-mono text-zinc-400">NASA NeoWs /feed</p>
          </div>
        </div>
      </header>

      <MetricsGrid metrics={metrics} loading={loading || !ready} />

      <FiltersBar
        values={activeFilters}
        onChange={setFilters}
        onRefresh={() => void load(activeFilters)}
        disabled={loading || !ready}
      />

      <StatusBar
        startDate={activeFilters.startDate}
        endDate={activeFilters.endDate}
        shown={objects.length}
        total={metrics.totalTracked}
        fetchedAt={fetchedAt}
        loading={loading || !ready}
      />

      {error ? (
        <div
          role="alert"
          className="border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => void load(activeFilters)}
          >
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NeoScatterChart
            objects={objects}
            selectedId={selectedId}
            onSelect={(neo) => setSelectedId(neo.id)}
            loading={loading || !ready}
          />
        </div>
        <NeoDetailPanel neo={selected} />
      </div>

      <section className="space-y-2">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-sm font-medium tracking-wide text-zinc-300">
            Tracked objects
          </h2>
          <p className="text-xs text-zinc-500">
            Click a row or chart point to inspect
          </p>
        </div>
        <NeoTable
          objects={objects}
          selectedId={selectedId}
          onSelect={(neo) => setSelectedId(neo.id)}
          loading={loading || !ready}
        />
      </section>

      <footer className="border-t border-zinc-900 pt-4 text-xs text-zinc-600">
        Threat score weights: PHA 35% · closeness 30% · velocity 20% · diameter
        15%. Feed window limited to 7 days by NeoWs.
      </footer>
    </div>
  );
}
