import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRow, Database } from "@/lib/supabase/types";
import { toDateId } from "@/lib/weeks";

export type StatusFilter = "all" | "pending" | "confirmed" | "declined";
export type RangeFilter = "upcoming" | "past";
export type SortOption = "newest" | "upcoming";

export type ListBookingsParams = {
  status: StatusFilter;
  range: RangeFilter;
  sort: SortOption;
  /** Free-text search over name/email/phone. Empty string = no search. */
  query: string;
};

export type ListBookingsResult =
  | { ok: true; bookings: BookingRow[] }
  | { ok: false; error: string };

// Escapes PostgREST or-filter/ilike special characters. Only the
// authenticated admin can reach this (it's not public input), but this
// keeps a search containing "%", "_", ",", "(", ")" from altering the
// filter's structure instead of just being searched for literally.
function escapeForFilter(value: string): string {
  return value.replace(/[%_,()\\]/g, (char) => `\\${char}`);
}

/**
 * The admin dashboard's booking list query. "Upcoming" vs "past" is
 * defined by end_date against today — the same operational cutoff
 * src/lib/availability/blocked-weeks.ts uses for "still relevant" — so a
 * booking stays "upcoming" for the duration of the stay, not just until
 * it starts.
 */
export async function listBookings(
  supabase: SupabaseClient<Database>,
  params: ListBookingsParams
): Promise<ListBookingsResult> {
  let query = supabase.from("bookings").select("*");

  if (params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const todayId = toDateId(new Date());
  query = params.range === "past" ? query.lt("end_date", todayId) : query.gte("end_date", todayId);

  const trimmedQuery = params.query.trim();
  if (trimmedQuery.length > 0) {
    const escaped = escapeForFilter(trimmedQuery);
    query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%`);
  }

  query =
    params.sort === "upcoming"
      ? query.order("start_date", { ascending: true })
      : query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("[admin] booking list query failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, bookings: (data ?? []) as BookingRow[] };
}
