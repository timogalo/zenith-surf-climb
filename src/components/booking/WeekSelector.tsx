"use client";

import { formatDayMonth, formatWeekday, type AvailableWeekSlot } from "@/lib/weeks";

type WeekSelectorProps = {
  weeks: AvailableWeekSlot[];
  selectedWeekId: string | null;
  onSelect: (weekId: string) => void;
};

export default function WeekSelector({
  weeks,
  selectedWeekId,
  onSelect,
}: WeekSelectorProps) {
  return (
    <ul className="border-t border-ocean-navy/10">
      {weeks.map((week) => {
        const isSelected = week.id === selectedWeekId;
        const statusLabel = !week.isAvailable
          ? "Unavailable"
          : isSelected
            ? "Selected"
            : "Available";

        return (
          <li key={week.id} className="border-b border-ocean-navy/10">
            <button
              type="button"
              disabled={!week.isAvailable}
              aria-pressed={isSelected}
              aria-label={`${
                week.isAvailable ? "Select week" : "Unavailable week"
              } ${formatWeekday(week.start)} ${formatDayMonth(week.start)} to ${formatWeekday(
                week.end
              )} ${formatDayMonth(week.end)}, 7 nights`}
              onClick={() => onSelect(week.id)}
              className={`flex w-full items-baseline justify-between gap-6 border-l-2 py-5 pl-4 pr-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand ${
                !week.isAvailable
                  ? "cursor-not-allowed border-transparent opacity-60"
                  : isSelected
                    ? "border-terracotta"
                    : "border-transparent hover:border-ocean-navy/15"
              }`}
            >
              <span
                className={`flex flex-wrap items-baseline gap-x-2 font-heading text-lg font-medium sm:text-xl ${
                  isSelected ? "text-terracotta" : "text-ocean-navy"
                }`}
              >
                {formatWeekday(week.start)} {formatDayMonth(week.start)}
                <span aria-hidden="true" className="text-ocean-navy/35">
                  →
                </span>
                {formatWeekday(week.end)} {formatDayMonth(week.end)}
                <span className="ml-1 font-body text-xs font-normal uppercase tracking-[0.12em] text-ocean-navy/40">
                  · 7 nights
                </span>
              </span>

              <span
                className={`shrink-0 font-body text-[11px] font-medium uppercase tracking-[0.14em] ${
                  !week.isAvailable
                    ? "text-ocean-navy/40"
                    : isSelected
                      ? "text-terracotta"
                      : "text-ocean-navy/45"
                }`}
              >
                {statusLabel}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
