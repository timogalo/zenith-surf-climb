import type { WeekSlot } from "@/lib/weeks";
import { formatFullDate } from "@/lib/weeks";
import AvailabilityToggle from "./AvailabilityToggle";

export type AvailabilityItem = {
  week: WeekSlot;
  isBlocked: boolean;
  /** Sum of guests across confirmed bookings for this week. Informational only — never a capacity limit. */
  confirmedGuests: number;
  /** Count of confirmed bookings for this week (not guests) — shown alongside confirmedGuests. */
  confirmedBookings: number;
};

function formatRangeLabel(week: WeekSlot): string {
  return `${formatFullDate(week.start)} → ${formatFullDate(week.end)}`;
}

export default function AvailabilityList({ items }: { items: AvailabilityItem[] }) {
  return (
    <ul className="divide-y divide-ocean-navy/10 border border-ocean-navy/10 bg-white">
      {items.map((item) => {
        const rangeLabel = formatRangeLabel(item.week);
        return (
          <li
            key={item.week.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="whitespace-nowrap font-heading text-lg text-ocean-navy">
                {formatFullDate(item.week.start)}{" "}
                <span aria-hidden="true" className="text-ocean-navy/35">
                  →
                </span>{" "}
                {formatFullDate(item.week.end)}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs uppercase tracking-[0.08em]">
                <span className={item.isBlocked ? "text-terracotta" : "text-ocean-navy/50"}>
                  {item.isBlocked ? "Unavailable" : "Available"}
                </span>
                {item.confirmedBookings > 0 && (
                  <span className="normal-case tracking-normal text-ocean-navy/40">
                    {item.confirmedBookings} confirmed booking{item.confirmedBookings === 1 ? "" : "s"} ·{" "}
                    {item.confirmedGuests} guest{item.confirmedGuests === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
            <AvailabilityToggle
              startDateId={item.week.id}
              isBlocked={item.isBlocked}
              rangeLabel={rangeLabel}
            />
          </li>
        );
      })}
    </ul>
  );
}
