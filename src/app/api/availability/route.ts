import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";
import { listUpcomingBlockedStartDates } from "@/lib/availability/blocked-weeks";

// Reads live data on every request — never statically cache this route.
export const dynamic = "force-dynamic";

/**
 * Public availability endpoint. Returns ONLY the start dates of blocked
 * weeks — never booking records, never any customer information. This is
 * the sole source of "unavailable" state for the booking UI; the frontend
 * treats every generated week as available unless its id appears here.
 *
 * Shares its query (src/lib/availability/blocked-weeks.ts) with the admin
 * Availability page (src/app/admin/availability/page.tsx) — one
 * definition of "still relevant," not two.
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

  const result = await listUpcomingBlockedStartDates(supabase);
  if (!result.ok) {
    return apiError(
      500,
      "SERVER_ERROR",
      "Availability is temporarily unavailable. Please try again shortly."
    );
  }

  return NextResponse.json({ blockedWeeks: result.startDates });
}
