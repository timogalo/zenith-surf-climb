import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";

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

  const { data, error } = await supabase.from("blocked_weeks").select("start_date");

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
