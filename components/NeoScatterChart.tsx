"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { formatDistanceKm, formatVelocityKmS } from "@/lib/format";
import type { NeoObject } from "@/lib/types";

type NeoScatterChartProps = {
  objects: NeoObject[];
  selectedId?: string | null;
  onSelect?: (neo: NeoObject) => void;
  loading?: boolean;
};

type Point = {
  id: string;
  name: string;
  x: number;
  /** Miss distance in millions of km (chart units). */
  y: number;
  /** Original miss distance in km (tooltip / selection). */
  missDistanceKm: number;
  z: number;
  hazardous: boolean;
};

function formatMillionKmTick(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (value >= 10) return value.toFixed(0);
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/**
 * Diameter (X) vs miss distance (Y) scatter plot.
 * Hazardous objects are drawn in a separate series for emphasis.
 */
export function NeoScatterChart({
  objects,
  selectedId,
  onSelect,
  loading,
}: NeoScatterChartProps) {
  const points: Point[] = objects.map((neo) => ({
    id: neo.id,
    name: neo.name,
    x: neo.estimatedDiameterKm,
    y: Math.max(neo.missDistanceKm / 1_000_000, 0.001),
    missDistanceKm: neo.missDistanceKm,
    z: neo.relativeVelocityKmS,
    hazardous: neo.isPotentiallyHazardous,
  }));

  const clear = points.filter((p) => !p.hazardous);
  const hazardous = points.filter((p) => p.hazardous);

  if (loading) {
    return (
      <div className="panel-surface flex h-80 items-center justify-center text-sm text-zinc-500">
        Plotting close-approach field…
      </div>
    );
  }

  if (!points.length) {
    return (
      <div className="panel-surface flex h-80 items-center justify-center text-sm text-zinc-500">
        Chart awaits NEO data.
      </div>
    );
  }

  return (
    <div className="panel-surface">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 px-3 py-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Field plot
          </p>
          <p className="text-sm text-zinc-300">
            Estimated diameter vs miss distance
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Clear
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            PHA
          </span>
        </div>
      </div>

      <div className="h-72 w-full px-2 pb-1 pt-2 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, bottom: 36, left: 52 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Diameter"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickMargin={8}
              label={{
                value: "Estimated diameter (km)",
                position: "insideBottom",
                offset: -22,
                fill: "#a1a1aa",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Miss distance"
              stroke="#71717a"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickFormatter={formatMillionKmTick}
              tickMargin={6}
              scale="log"
              domain={["auto", "auto"]}
              width={44}
              label={{
                value: "Miss distance (million km)",
                angle: -90,
                position: "left",
                offset: 0,
                fill: "#a1a1aa",
                fontSize: 11,
                style: { textAnchor: "middle" },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[40, 180]} name="Velocity" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "#09090b",
                border: "1px solid #3f3f46",
                fontSize: 12,
              }}
              formatter={(value, name, item) => {
                const payload = item?.payload as Point | undefined;
                if (name === "Diameter") {
                  const numeric =
                    typeof value === "number" ? value : Number(value ?? 0);
                  return [`${numeric.toFixed(4)} km`, "Diameter"];
                }
                if (name === "Miss distance") {
                  return [
                    formatDistanceKm(payload?.missDistanceKm ?? Number(value) * 1_000_000),
                    "Miss distance",
                  ];
                }
                if (name === "Velocity") {
                  const numeric =
                    typeof value === "number" ? value : Number(value ?? 0);
                  return [formatVelocityKmS(numeric), "Velocity"];
                }
                return [String(value ?? ""), String(name ?? "")];
              }}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload as Point | undefined;
                return row?.name ?? "";
              }}
            />
            <Scatter
              name="Clear"
              data={clear}
              fill="#22d3ee"
              fillOpacity={0.72}
              onClick={(data) => {
                const point = data as unknown as Point;
                const neo = objects.find((o) => o.id === point.id);
                if (neo) onSelect?.(neo);
              }}
            />
            <Scatter
              name="PHA"
              data={hazardous}
              fill="#f87171"
              fillOpacity={selectedId ? 0.95 : 0.88}
              onClick={(data) => {
                const point = data as unknown as Point;
                const neo = objects.find((o) => o.id === point.id);
                if (neo) onSelect?.(neo);
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="border-t border-zinc-800/80 px-3 py-2 text-[11px] text-zinc-500">
        Y-axis uses a log scale in million km so close and distant approaches stay
        readable. Hover a point for the exact miss distance.
      </p>
      <p className="sr-only">
        Scatter plot of estimated asteroid diameter versus miss distance.
        Potentially hazardous asteroids are highlighted. Bubble size encodes
        relative velocity.
      </p>
    </div>
  );
}
