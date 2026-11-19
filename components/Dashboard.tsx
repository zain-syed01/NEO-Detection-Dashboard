"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { FiltersBar, type FiltersBarValues } from "@/components/FiltersBar";
import { MetricsGrid } from "@/components/MetricsGrid";
import { NeoDetailPanel } from "@/components/NeoDetailPanel";
import { NeoScatterChart } from "@/components/NeoScatterChart";
import { NeoTable } from "@/components/NeoTable";
import { defaultFeedRange } from "@/lib/dates";
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

/** Client-only default date window (empty on the server / during prerender). */
function useClientFeedRange() {
  return useSyncExternalStore(
    subscribeNoop,
    () => defaultFeedRange(),
    () => ({ startDate: "", endDate: "" }),
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
  const didLoad = useRef(false);

  const selected = objects.find((o) => o.id === selectedId) ?? null;

  const load = useCallback(async (values: FiltersBarValues) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      start: values.startDate,
      end: values.endDate,
      sort: values.sort,
      hazardous: String(values.hazardousOnly),
    });
    if (values.maxMissKm.trim()) {
      params.set("maxMissKm", values.maxMissKm.trim());
    }

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
      setSelectedId((prev) =>
        body.objects.some((o) => o.id === prev) ? prev : null,
      );
    } catch (err) {
      setObjects([]);
      setMetrics(emptyMetrics);
      setError(err instanceof Error ? err.message : "Failed to load NEO data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready || didLoad.current) return;
    didLoad.current = true;
    void load({
      startDate: range.startDate,
      endDate: range.endDate,
      sort: "threatScore",
      hazardousOnly: false,
      maxMissKm: "",
    });
  }, [ready, range.startDate, range.endDate, load]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-500/90">
          Space situational awareness
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          NEO Detection &amp; Alert Dashboard
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
          Live near-Earth object close-approach data from NASA NeoWs — parsed,
          ranked by threat metrics, and charted for quick hazard spotting.
        </p>
      </header>

      <MetricsGrid metrics={metrics} loading={loading || !ready} />

      <FiltersBar
        values={activeFilters}
        onChange={setFilters}
        onRefresh={() => void load(activeFilters)}
        disabled={loading || !ready}
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
          />
        </div>
        <NeoDetailPanel neo={selected} />
      </div>

      <NeoTable
        objects={objects}
        selectedId={selectedId}
        onSelect={(neo) => setSelectedId(neo.id)}
        loading={loading || !ready}
      />
    </div>
  );
}
