import {
  format,
  startOfToday,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  endOfToday,
  endOfWeek,
} from "date-fns";

export type DateRangeKey =
  | "today"
  | "this_week"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

export function getDateRange(key: DateRangeKey, custom?: { from: string; to: string }) {
  const now = new Date();
  switch (key) {
    case "today":
      return { from: startOfToday(), to: endOfToday() };
    case "this_week":
      return { from: startOfWeek(now), to: endOfWeek(now) };
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "this_year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "custom":
      return {
        from: custom?.from ? new Date(custom.from) : startOfMonth(now),
        to: custom?.to ? new Date(custom.to) : endOfToday(),
      };
  }
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string, pattern = "dd MMM yyyy"): string {
  try {
    return format(new Date(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
