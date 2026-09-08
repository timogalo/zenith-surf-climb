import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";
import { addDays, toDateId } from "@/lib/weeks";

// Reads live data on every request — never statically cache this route.
export const dynamic = "force-dynamic";

/**
 * Public availability endpoint. Returns ONLY the start dates of blocked
 * weeks — never booking records, never any customer information. This is
 * the sole source of "unavailable" state for the booking UI; the frontend
 * treats every generated week as available unless its id appears here.
 */
export async function GET() {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[availability] Supabase client unavailable:", err);
    return apiError(
      500,
      "SERVER_ERROR",
      "Availability is temporarily unavailable. Please try again shortly."
    );
  }

  // Exclude weeks that are unambiguously over. The frontend only ever
  // generates weeks starting from the next upcoming Monday on/after
  // "today" (src/lib/weeks.ts), so nothing it could render would ever
  // match a blocked_weeks row whose stay already ended. Filtering on
  // end_date (not start_date) is the more conservative choice: it keeps
  // a week that's still technically in progress, and — combined with a
  // one-day-earlier cutoff — absorbs any small clock skew between the
  // server's "today" and a visitor's local "today" rather than risking
  // hiding a blocked week that's still relevant to someone. This is a
  // response-size optimization only; it doesn't change Monday-to-Monday
  // logic or which *future* weeks are considered blocked.
  const cutoffDateId = toDateId(addDays(new Date(), -1));

  const { data, error } = await supabase
    .from("blocked_weeks")
    .select("start_date")
    .gte("end_date", cutoffDateId);

  if (error) {
    console.error("[availability] blocked_weeks query failed:", error.message);
    return apiError(
      500,
      "SERVER_ERROR",
      "Availability is temporarily unavailable. Please try again shortly."
    );
  }

  const blockedWeeks = (data ?? []).map((row) => row.start_date);

  return NextResponse.json({ blockedWeeks });
}
