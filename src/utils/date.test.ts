import dayjs from "dayjs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { todayStr, formatTime, mondayOf, weekDays, weekLabel } from "./date";

afterEach(() => vi.useRealTimers());

describe("todayStr", () => {
  it("returns today as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 14, 9, 30)); // local 2026-06-14
    expect(todayStr()).toBe("2026-06-14");
  });

  it("always matches the YYYY-MM-DD shape", () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatTime", () => {
  it("formats a Date as zero-padded HH:mm:ss wall-clock time", () => {
    // Local-time Date so the assertion is timezone-independent.
    expect(formatTime(new Date(2026, 5, 14, 4, 3, 7))).toBe("04:03:07");
  });

  it("accepts an ISO string and returns the HH:mm:ss shape", () => {
    expect(formatTime("2026-06-14T14:03:21Z")).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe("mondayOf", () => {
  it("snaps any weekday back to that week's Monday", () => {
    // 2026-06-10 is a Wednesday → Monday is 2026-06-08.
    expect(mondayOf("2026-06-10").format("YYYY-MM-DD")).toBe("2026-06-08");
  });

  it("treats Sunday as the end of its week, not the start", () => {
    // 2026-06-14 is a Sunday → Monday of that week is still 2026-06-08.
    expect(mondayOf("2026-06-14").format("YYYY-MM-DD")).toBe("2026-06-08");
  });

  it("always resolves to a Monday", () => {
    expect(mondayOf("2026-06-10").day()).toBe(1);
  });
});

describe("weekDays", () => {
  const days = weekDays(mondayOf("2026-06-10"));

  it("returns 7 consecutive days Mon→Sun", () => {
    expect(days).toHaveLength(7);
    expect(days[0].date).toBe("2026-06-08");
    expect(days[6].date).toBe("2026-06-14");
    expect(days[0].weekday).toBe("MON");
    expect(days[6].weekday).toBe("SUN");
  });

  it("exposes a zero-padded day-of-month", () => {
    expect(days[0].day).toBe("08");
  });
});

describe("weekLabel", () => {
  it("formats the Monday→Sunday span with a single trailing year", () => {
    expect(weekLabel(dayjs("2026-06-08"))).toBe("Jun 8 – Jun 14, 2026");
  });
});
