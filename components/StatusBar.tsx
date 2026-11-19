type StatusBarProps = {
  startDate: string;
  endDate: string;
  shown: number;
  total: number;
  fetchedAt?: string | null;
  loading?: boolean;
};

export function StatusBar({
  startDate,
  endDate,
  shown,
  total,
  fetchedAt,
  loading,
}: StatusBarProps) {
  const fetchedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-500">
      <p>
        Window{" "}
        <span className="font-mono text-zinc-300">
          {startDate || "—"} → {endDate || "—"}
        </span>
        <span className="mx-2 text-zinc-700">|</span>
        Showing{" "}
        <span className="font-mono text-zinc-300">
          {loading ? "…" : shown}
        </span>{" "}
        of{" "}
        <span className="font-mono text-zinc-300">
          {loading ? "…" : total}
        </span>
      </p>
      <p>
        Last fetch{" "}
        <span className="font-mono text-zinc-400">
          {loading ? "loading…" : fetchedLabel}
        </span>
      </p>
    </div>
  );
}
