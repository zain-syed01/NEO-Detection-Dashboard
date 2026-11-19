type HazardBadgeProps = {
  hazardous: boolean;
};

/**
 * Visual flag for NASA potentially hazardous asteroids (PHA).
 * Styling hooks live here so the table/chart stay declarative.
 */
export function HazardBadge({ hazardous }: HazardBadgeProps) {
  if (!hazardous) {
    return (
      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-zinc-700">
        Clear
      </span>
    );
  }

  return (
    <span className="hazard-pulse inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold text-red-200 ring-1 ring-red-500/80">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
      PHA
    </span>
  );
}
