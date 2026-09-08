import "server-only";
import { formatFullDate, parseDateId } from "@/lib/weeks";

/** Shared by all three email templates for a human-readable week range. */
export function formatBookingRange(startDateId: string, endDateId: string): string {
  const start = parseDateId(startDateId);
  const end = parseDateId(endDateId);
  if (!start || !end) {
    return `${startDateId} → ${endDateId}`;
  }
  return `${formatFullDate(start)} → ${formatFullDate(end)}`;
}
