import { describe, expect, it } from "vitest";

import {
  MAX_FEED_RANGE_DAYS,
  addDays,
  daySpan,
  validateFeedRange,
} from "@/lib/dates";

describe("dates helpers", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-11-28", 5)).toBe("2026-12-03");
  });

  it("computes inclusive day span", () => {
    expect(daySpan("2026-11-18", "2026-11-18")).toBe(1);
    expect(daySpan("2026-11-18", "2026-11-24")).toBe(7);
  });

  it("rejects ranges longer than NeoWs allows", () => {
    const err = validateFeedRange("2026-11-01", "2026-11-10");
    expect(err).toContain(String(MAX_FEED_RANGE_DAYS));
  });

  it("accepts a valid 7-day window", () => {
    expect(validateFeedRange("2026-11-18", "2026-11-24")).toBeNull();
  });
});
