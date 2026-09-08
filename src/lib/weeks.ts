// Pure date helpers for the Monday-to-Monday weekly booking model. No
// browser or Next.js APIs are used here, so this file is safe to import
// from both Client Components and server-side API route handlers — it's
// the single source of truth for "what counts as a valid stay week" on
// both sides.
//
// Availability itself (which weeks are blocked) is NOT part of this file
// — it comes from Supabase, fetched by the UI via /api/availability and
// re-checked authoritatively by POST /api/bookings. This file only knows
// about dates.

export type WeekSlot = {
  /** Stable id derived from the start date, e.g. "2026-03-02". */
  id: string;
  start: Date;
  end: Date;
};

/** A generated week combined with live availability from Supabase. */
export type AvailableWeekSlot = WeekSlot & { isAvailable: boolean };

const DATE_ID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getUpcomingMonday(referenceDate: Date): Date {
  const date = new Date(referenceDate);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay(); // 0 (Sun) .. 6 (Sat)
  const daysUntilMonday = (1 - day + 7) % 7; // 0 if referenceDate is already a Monday
  date.setDate(date.getDate() + daysUntilMonday);
  return date;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Local (not UTC) date id, avoiding the timezone-shift risk of toISOString(). */
export function toDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" id back into a local midnight Date, or null if the
 * string isn't well-formed or doesn't represent a real calendar date (e.g.
 * "2026-02-30" is rejected rather than silently rolling over to March).
 */
export function parseDateId(id: string): Date | null {
  if (!DATE_ID_PATTERN.test(id)) return null;

  const [year, month, day] = id.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isMonday(date: Date): boolean {
  return date.getDay() === 1;
}

/** True if `date` (a local midnight Date) is strictly before today. */
export function isPastDate(date: Date, referenceDate: Date = new Date()): boolean {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

/**
 * Generates `count` consecutive Monday-to-Monday week slots starting from
 * the next upcoming Monday on/after `referenceDate` (today by default).
 */
export function generateWeeks(
  count: number,
  referenceDate: Date = new Date()
): WeekSlot[] {
  const firstMonday = getUpcomingMonday(referenceDate);

  return Array.from({ length: count }, (_, index) => {
    const start = addDays(firstMonday, index * 7);
    const end = addDays(start, 7);

    return {
      id: toDateId(start),
      start,
      end,
    };
  });
}

export const WEEKS_TO_GENERATE = 14;

// Weeks are generated from the visitor's own current date, so they must
// only ever be computed on the client — doing it during the static build
// would bake in build-time dates that disagree with whatever "today"
// actually is when a real visitor loads the page later, causing a
// hydration mismatch. useSyncExternalStore (in Booking.tsx) is the
// React-recommended way to read a client-only value like this safely: it
// renders `getWeeksServerSnapshot()` (matching the static HTML) through
// hydration, then swaps to the real `getWeeksSnapshot()` value right
// after — without setState-in-effect cascading renders.
let cachedWeeks: WeekSlot[] | null = null;
const EMPTY_WEEKS: WeekSlot[] = [];

export function getWeeksSnapshot(): WeekSlot[] {
  if (!cachedWeeks) {
    cachedWeeks = generateWeeks(WEEKS_TO_GENERATE);
  }
  return cachedWeeks;
}

export function getWeeksServerSnapshot(): WeekSlot[] {
  return EMPTY_WEEKS;
}

export function subscribeToWeeks(): () => void {
  return () => {};
}

const weekdayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});
const fullDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatWeekday(date: Date): string {
  return weekdayFormatter.format(date);
}

export function formatDayMonth(date: Date): string {
  return dayMonthFormatter.format(date);
}

export function formatFullDate(date: Date): string {
  return fullDateFormatter.format(date);
}
