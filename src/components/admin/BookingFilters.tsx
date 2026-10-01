import Link from "next/link";
import type { RangeFilter, SortOption, StatusFilter } from "@/lib/admin/list-bookings";

type CurrentFilters = {
  status: StatusFilter;
  range: RangeFilter;
  sort: SortOption;
  q: string;
};

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Declined" },
];

const RANGE_OPTIONS: Array<{ value: RangeFilter; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

function buildHref(current: CurrentFilters, overrides: Partial<CurrentFilters>): string {
  const merged = { ...current, ...overrides };
  const params = new URLSearchParams();
  if (merged.status !== "all") params.set("status", merged.status);
  if (merged.range !== "upcoming") params.set("range", merged.range);
  if (merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.q) params.set("q", merged.q);
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`px-3 py-1.5 font-body text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white ${
        active
          ? "bg-ocean-navy text-white"
          : "border border-ocean-navy/20 text-ocean-navy/60 hover:border-ocean-navy/40 hover:text-ocean-navy"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Entirely server-rendered: filter pills are plain links carrying the
 * merged query string, and the search/sort row is a native GET form —
 * both work without any client-side JavaScript, and neither needs a
 * "use client" component.
 */
export default function BookingFilters({ current }: { current: CurrentFilters }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ocean-navy/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {RANGE_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            href={buildHref(current, { range: opt.value })}
            active={current.range === opt.value}
            label={opt.label}
          />
        ))}
        <span aria-hidden="true" className="mx-1 text-ocean-navy/20">
          |
        </span>
        {STATUS_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            href={buildHref(current, { status: opt.value })}
            active={current.status === opt.value}
            label={opt.label}
          />
        ))}
      </div>

      <form
        action="/admin"
        method="GET"
        className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <input type="hidden" name="status" value={current.status} />
        <input type="hidden" name="range" value={current.range} />
        <label htmlFor="admin-search" className="sr-only">
          Search bookings by name or email
        </label>
        <input
          id="admin-search"
          type="search"
          name="q"
          defaultValue={current.q}
          placeholder="Search name, email, phone…"
          className="w-full border border-ocean-navy/20 bg-white px-3 py-1.5 font-body text-sm text-ocean-navy focus:border-ocean-navy focus:outline-none sm:w-52"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="admin-sort" className="sr-only">
            Sort bookings
          </label>
          <select
            id="admin-sort"
            name="sort"
            defaultValue={current.sort}
            className="border border-ocean-navy/20 bg-white px-2 py-1.5 font-body text-sm text-ocean-navy focus:border-ocean-navy focus:outline-none"
          >
            <option value="newest">Newest request</option>
            <option value="upcoming">Upcoming stay first</option>
          </select>
          <button
            type="submit"
            className="border border-ocean-navy/25 px-3 py-1.5 font-body text-xs uppercase tracking-[0.1em] text-ocean-navy transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
}
