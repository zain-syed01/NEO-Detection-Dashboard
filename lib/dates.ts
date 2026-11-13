/**
 * Date helpers for NeoWs feed queries (max 7-day window).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_FEED_RANGE_DAYS = 7;

/** Format a Date as YYYY-MM-DD (UTC). */
export function formatDateUTC(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's date as YYYY-MM-DD (UTC). */
export function todayUTC(): string {
  return formatDateUTC(new Date());
}

/** Add days to a YYYY-MM-DD string; returns YYYY-MM-DD (UTC). */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateUTC(date);
}

/** Inclusive day span between two YYYY-MM-DD strings. */
export function daySpan(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.floor((end - start) / DAY_MS) + 1;
}

/**
 * Validate a NeoWs feed date range.
 * Returns an error message, or null if valid.
 */
export function validateFeedRange(
  startDate: string,
  endDate: string,
): string | null {
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe.test(startDate) || !dateRe.test(endDate)) {
    return "Dates must use YYYY-MM-DD format.";
  }

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "One or both dates are invalid.";
  }
  if (end < start) {
    return "endDate must be on or after startDate.";
  }
  if (daySpan(startDate, endDate) > MAX_FEED_RANGE_DAYS) {
    return `NeoWs feed range cannot exceed ${MAX_FEED_RANGE_DAYS} days.`;
  }
  return null;
}

/** Default range: today through today + 6 days (7-day window). */
export function defaultFeedRange(): { startDate: string; endDate: string } {
  const startDate = todayUTC();
  return { startDate, endDate: addDays(startDate, MAX_FEED_RANGE_DAYS - 1) };
}
