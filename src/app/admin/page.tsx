import { requireAdminSession } from "@/lib/admin/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getBookingSummary } from "@/lib/admin/booking-summary";
import {
  listBookings,
  type RangeFilter,
  type SortOption,
  type StatusFilter,
} from "@/lib/admin/list-bookings";
import AdminNav from "@/components/admin/AdminNav";
import SummaryCards from "@/components/admin/SummaryCards";
import BookingFilters from "@/components/admin/BookingFilters";
import BookingsList from "@/components/admin/BookingsList";

// Always evaluated fresh — reads live booking data and searchParams on
// every visit, and requireAdminSession() reads the session cookie, both
// incompatible with static prerendering.
export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  searchParams: Promise<{ status?: string; range?: string; q?: string; sort?: string }>;
};

function parseStatus(value: string | undefined): StatusFilter {
  return value === "pending" || value === "confirmed" || value === "declined" ? value : "all";
}

function parseRange(value: string | undefined): RangeFilter {
  return value === "past" ? "past" : "upcoming";
}

function parseSort(value: string | undefined): SortOption {
  return value === "upcoming" ? "upcoming" : "newest";
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  await requireAdminSession();

  const rawParams = await searchParams;
  const status = parseStatus(rawParams.status);
  const range = parseRange(rawParams.range);
  const sort = parseSort(rawParams.sort);
  const q = typeof rawParams.q === "string" ? rawParams.q : "";

  const supabase = getSupabaseServerClient();

  const [summary, listResult] = await Promise.all([
    getBookingSummary(supabase),
    listBookings(supabase, { status, range, sort, query: q }),
  ]);

  const isFiltered = status !== "all" || q.trim().length > 0;

  return (
    <main className="min-h-screen bg-warm-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <AdminNav active="bookings" />

        <h1 className="mt-8 font-heading text-2xl text-ocean-navy">Booking requests</h1>

        <div className="mt-6">
          {summary ? (
            <SummaryCards {...summary} />
          ) : (
            <p className="font-body text-sm text-terracotta">Summary could not be loaded right now.</p>
          )}
        </div>

        <div className="mt-8">
          <BookingFilters current={{ status, range, sort, q }} />
        </div>

        {!listResult.ok ? (
          <p className="mt-10 font-body text-sm text-terracotta">
            Bookings could not be loaded right now. Please refresh, or check Supabase directly if
            this continues.
          </p>
        ) : listResult.bookings.length === 0 ? (
          <p className="mt-10 font-body text-sm text-ocean-navy/60">
            {isFiltered ? "No bookings match these filters." : "No booking requests yet."}
          </p>
        ) : (
          <div className="mt-8">
            <BookingsList bookings={listResult.bookings} />
          </div>
        )}
      </div>
    </main>
  );
}
