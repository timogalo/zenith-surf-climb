import AdminNav from "@/components/admin/AdminNav";
import AvailabilityList, { type AvailabilityItem } from "@/components/admin/AvailabilityList";
import { requireAdminSession } from "@/lib/admin/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateWeeks, WEEKS_TO_GENERATE } from "@/lib/weeks";
import { listUpcomingBlockedStartDates } from "@/lib/availability/blocked-weeks";

// Always evaluated fresh — reads live blocked_weeks/bookings data and the
// current date on every visit.
export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  await requireAdminSession();

  const supabase = getSupabaseServerClient();

  // The exact same week generator the public booking page uses
  // (src/lib/weeks.ts) — one definition of "a Zenith week," not a second
  // one reimplemented here.
  const weeks = generateWeeks(WEEKS_TO_GENERATE);
  const weekIds = weeks.map((week) => week.id);

  const [blockedResult, confirmedResult] = await Promise.all([
    listUpcomingBlockedStartDates(supabase),
    supabase
      .from("bookings")
      .select("start_date, guests")
      .eq("status", "confirmed")
      .in("start_date", weekIds),
  ]);

  if (confirmedResult.error) {
    console.error("[admin/availability] confirmed guests query failed:", confirmedResult.error.message);
  }

  const blockedStartDates = new Set(blockedResult.ok ? blockedResult.startDates : []);

  const confirmedByWeek = new Map<string, { guests: number; bookings: number }>();
  for (const row of confirmedResult.data ?? []) {
    const existing = confirmedByWeek.get(row.start_date) ?? { guests: 0, bookings: 0 };
    confirmedByWeek.set(row.start_date, {
      guests: existing.guests + row.guests,
      bookings: existing.bookings + 1,
    });
  }

  const items: AvailabilityItem[] = weeks.map((week) => {
    const confirmed = confirmedByWeek.get(week.id);
    return {
      week,
      isBlocked: blockedStartDates.has(week.id),
      confirmedGuests: confirmed?.guests ?? 0,
      confirmedBookings: confirmed?.bookings ?? 0,
    };
  });

  const hasError = !blockedResult.ok || Boolean(confirmedResult.error);

  return (
    <main className="min-h-screen bg-warm-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <AdminNav active="availability" />

        <div className="mt-8">
          <h1 className="font-heading text-2xl text-ocean-navy">Availability</h1>
          <p className="mt-2 max-w-2xl font-body text-sm text-ocean-navy/60">
            Marking a week unavailable removes it from the public booking page immediately.
            Confirmed guest counts below are informational only — approving a booking never
            marks its week unavailable on its own.
          </p>
        </div>

        {hasError && (
          <p className="mt-6 font-body text-sm text-terracotta">
            Some availability data could not be loaded. Refresh, or check Supabase directly if
            this continues.
          </p>
        )}

        <div className="mt-6">
          <AvailabilityList items={items} />
        </div>
      </div>
    </main>
  );
}
