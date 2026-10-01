import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { addDays, toDateId } from "@/lib/weeks";

export type ListBlockedStartDatesResult =
  | { ok: true; startDates: string[] }
  | { ok: false; error: string };

/**
 * Upcoming-or-current blocked week start dates (end_date >= yesterday) —
 * the exact query GET /api/availability has always used, extracted here
 * so the admin Availability page reads the identical definition of
 * "still relevant" rather than a second, potentially-diverging one. See
 * src/app/api/availability/route.ts for why the cutoff is end_date, not
 * start_date.
 */
export async function listUpcomingBlockedStartDates(
  supabase: SupabaseClient<Database>
): Promise<ListBlockedStartDatesResult> {
  const cutoffDateId = toDateId(addDays(new Date(), -1));

  const { data, error } = await supabase
    .from("blocked_weeks")
    .select("start_date")
    .gte("end_date", cutoffDateId);

  if (error) {
    console.error("[availability] blocked_weeks query failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, startDates: (data ?? []).map((row) => row.start_date) };
}
