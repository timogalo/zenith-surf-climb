import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { toDateId } from "@/lib/weeks";

export type BookingSummary = {
  /** All pending requests, any date — they need a decision regardless of when the week is. */
  pendingCount: number;
  /** Confirmed bookings whose stay hasn't ended yet. */
  confirmedUpcomingCount: number;
  /** Guests across those same upcoming confirmed bookings. */
  upcomingGuests: number;
  /** total_price across those same upcoming confirmed bookings. Never includes declined bookings. */
  confirmedUpcomingValue: number;
};

/**
 * Dashboard summary cards. Deliberately scoped to upcoming/current
 * bookings for the confirmed-* figures (end_date >= today) so a large
 * volume of old, already-completed stays doesn't drown out what's
 * operationally relevant right now — pending count is the exception,
 * since an unprocessed request still needs a decision no matter how old.
 */
export async function getBookingSummary(
  supabase: SupabaseClient<Database>
): Promise<BookingSummary | null> {
  const todayId = toDateId(new Date());

  const [pendingResult, confirmedResult] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("bookings")
      .select("guests, total_price")
      .eq("status", "confirmed")
      .gte("end_date", todayId),
  ]);

  if (pendingResult.error) {
    console.error("[admin] pending count query failed:", pendingResult.error.message);
    return null;
  }
  if (confirmedResult.error) {
    console.error("[admin] confirmed summary query failed:", confirmedResult.error.message);
    return null;
  }

  const confirmedRows = confirmedResult.data ?? [];

  return {
    pendingCount: pendingResult.count ?? 0,
    confirmedUpcomingCount: confirmedRows.length,
    upcomingGuests: confirmedRows.reduce((sum, row) => sum + row.guests, 0),
    confirmedUpcomingValue: confirmedRows.reduce((sum, row) => sum + row.total_price, 0),
  };
}
