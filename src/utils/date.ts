import dayjs, { type Dayjs } from "dayjs";

/** Server-local day as YYYY-MM-DD. */
export const todayStr = (): string => dayjs().format("YYYY-MM-DD");

/** Short wall-clock time, e.g. "14:03:21". */
export const formatTime = (ts: string | Date): string => dayjs(ts).format("HH:mm:ss");

/** The Monday (start of week) for a given date. */
export const mondayOf = (d: string | Date | Dayjs): Dayjs => {
  const x = dayjs(d);
  return x.subtract((x.day() + 6) % 7, "day").startOf("day");
};

export interface WeekDay {
  date: string; // YYYY-MM-DD
  weekday: string; // MON
  day: string; // 09
}

/** The 7 days (Mon→Sun) of the week starting at `monday`. */
export const weekDays = (monday: Dayjs): WeekDay[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = monday.add(i, "day");
    return { date: d.format("YYYY-MM-DD"), weekday: d.format("ddd").toUpperCase(), day: d.format("DD") };
  });

/** Range label, e.g. "Jun 9 – Jun 15, 2026". */
export const weekLabel = (monday: Dayjs): string =>
  `${monday.format("MMM D")} – ${monday.add(6, "day").format("MMM D, YYYY")}`;
