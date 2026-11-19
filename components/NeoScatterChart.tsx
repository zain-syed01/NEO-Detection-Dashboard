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

import type { NeoObject } from "@/lib/types";

type NeoScatterChartProps = {
  objects: NeoObject[];
  selectedId?: string | null;
  onSelect?: (neo: NeoObject) => void;
};

type Point = {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  hazardous: boolean;
};

/**
 * Diameter (X) vs miss distance (Y) scatter plot.
 * Hazardous objects are drawn in a separate series for emphasis.
 */
export function NeoScatterChart({
  objects,
  selectedId,
  onSelect,
}: NeoScatterChartProps) {
  const points: Point[] = objects.map((neo) => ({
    id: neo.id,
    name: neo.name,
    x: neo.estimatedDiameterKm,
    y: neo.missDistanceKm,
    z: neo.relativeVelocityKmS,
    hazardous: neo.isPotentiallyHazardous,
  }));

  const clear = points.filter((p) => !p.hazardous);
  const hazardous = points.filter((p) => p.hazardous);

  if (!points.length) {
    return (
      <div className="flex h-72 items-center justify-center border border-zinc-800 text-sm text-zinc-500">
        Chart awaits NEO data.
      </div>
    );
  }

  return (
    <div className="h-72 w-full border border-zinc-800 bg-zinc-950/40 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Diameter"
            unit=" km"
            stroke="#71717a"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            label={{
              value: "Estimated diameter (km)",
              position: "insideBottom",
              offset: -2,
              fill: "#71717a",
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Miss distance"
            unit=" km"
            stroke="#71717a"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            scale="log"
            domain={["auto", "auto"]}
            width={72}
            label={{
              value: "Miss distance (km)",
              angle: -90,
              position: "insideLeft",
              fill: "#71717a",
              fontSize: 11,
            }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 160]} name="Velocity" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#09090b",
              border: "1px solid #3f3f46",
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const numeric =
                typeof value === "number" ? value : Number(value ?? 0);
              if (name === "Diameter") return [`${numeric.toFixed(4)} km`, name];
              if (name === "Miss distance") {
                return [`${numeric.toLocaleString()} km`, name];
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
            fillOpacity={0.7}
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
            fillOpacity={selectedId ? 0.95 : 0.85}
            onClick={(data) => {
              const point = data as unknown as Point;
              const neo = objects.find((o) => o.id === point.id);
              if (neo) onSelect?.(neo);
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="sr-only">
        Scatter plot of estimated asteroid diameter versus miss distance.
        Potentially hazardous asteroids are highlighted.
      </p>
    </div>
  );
}
