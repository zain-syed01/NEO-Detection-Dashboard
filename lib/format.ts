/**
 * Display helpers for distances, speeds, and diameters.
 */

export function formatDistanceKm(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} M km`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} k km`;
  return `${value.toFixed(0)} km`;
}

export function formatDistanceKmCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

export function formatVelocityKmS(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} km/s`;
}

export function formatDiameterKm(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value < 0.001) return `${(value * 1000).toFixed(1)} m`;
  return `${value.toFixed(3)} km`;
}

export function formatThreatScore(value: number): string {
  return value.toFixed(1);
}

/** Lunar distances (approx) for human-readable miss distance. */
export function formatMissRelativeToMoon(missDistanceKm: number): string {
  const lunarKm = 384_400;
  const ratio = missDistanceKm / lunarKm;
  if (ratio < 0.01) return `${(ratio * 100).toFixed(2)}% LD`;
  return `${ratio.toFixed(2)} LD`;
}
