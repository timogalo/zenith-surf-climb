import "server-only";
import { formatFullDate, parseDateId } from "@/lib/weeks";
import { escapeHtml } from "./layout";

/**
 * Shared by all three email templates for a human-readable week range.
 *
 * The normal path (`formatFullDate` output) only ever contains digits,
 * arrows, and month abbreviations, so it's inherently safe to interpolate
 * into HTML. The fallback path is currently unreachable with
 * attacker-controlled data — every caller passes `booking.start_date`/
 * `end_date`, which are Postgres `date` columns populated only from
 * already-validated values — but it's escaped anyway as defense-in-depth,
 * so this function is self-defending even if that ever changes.
 */
export function formatBookingRange(startDateId: string, endDateId: string): string {
  const start = parseDateId(startDateId);
  const end = parseDateId(endDateId);
  if (!start || !end) {
    return `${escapeHtml(startDateId)} → ${escapeHtml(endDateId)}`;
  }
  return `${formatFullDate(start)} → ${formatFullDate(end)}`;
}
