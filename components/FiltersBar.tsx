"use client";

import type { FiltersBarValues, NeoSortKey } from "@/lib/types";

export type { FiltersBarValues };

type FiltersBarProps = {
  values: FiltersBarValues;
  onChange: (next: FiltersBarValues) => void;
  onRefresh: () => void;
  disabled?: boolean;
};

const SORT_OPTIONS: { value: NeoSortKey; label: string }[] = [
  { value: "threatScore", label: "Threat score" },
  { value: "missDistanceKm", label: "Miss distance" },
  { value: "relativeVelocityKmS", label: "Velocity" },
  { value: "estimatedDiameterKm", label: "Diameter" },
  { value: "closeApproachDate", label: "Approach date" },
  { value: "name", label: "Name" },
];

/**
 * Date range + ranking controls for the dashboard.
 */
export function FiltersBar({
  values,
  onChange,
  onRefresh,
  disabled,
}: FiltersBarProps) {
  return (
    <section
      aria-label="Filters"
      className="panel-surface flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-end"
    >
      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Start
        <input
          type="date"
          value={values.startDate}
          disabled={disabled}
          onChange={(e) => onChange({ ...values, startDate: e.target.value })}
          className="control-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        End
        <input
          type="date"
          value={values.endDate}
          disabled={disabled}
          onChange={(e) => onChange({ ...values, endDate: e.target.value })}
          className="control-input"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Sort
        <select
          value={values.sort}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...values, sort: e.target.value as NeoSortKey })
          }
          className="control-input"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400">
        Max miss (km)
        <input
          type="number"
          min={0}
          placeholder="Optional"
          value={values.maxMissKm}
          disabled={disabled}
          onChange={(e) => onChange({ ...values, maxMissKm: e.target.value })}
          className="control-input"
        />
      </label>

      <label className="flex items-center gap-2 pb-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={values.hazardousOnly}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...values, hazardousOnly: e.target.checked })
          }
          className="accent-red-500"
        />
        Hazardous only
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={onRefresh}
        className="border border-cyan-700/60 bg-cyan-950/40 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-900/40 disabled:opacity-50"
      >
        Apply
      </button>
    </section>
  );
}
