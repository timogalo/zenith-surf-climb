import type { BookingSummary } from "@/lib/admin/booking-summary";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default function SummaryCards(summary: BookingSummary) {
  const cards: Array<{ label: string; value: string; hint?: string }> = [
    { label: "Pending requests", value: String(summary.pendingCount) },
    { label: "Confirmed bookings", value: String(summary.confirmedUpcomingCount), hint: "upcoming" },
    { label: "Upcoming guests", value: String(summary.upcomingGuests) },
    {
      label: "Confirmed value",
      value: currencyFormatter.format(summary.confirmedUpcomingValue),
      hint: "upcoming",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px border border-ocean-navy/10 bg-ocean-navy/10 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-warm-white p-5">
          <dt className="font-body text-xs uppercase tracking-[0.1em] text-ocean-navy/50">
            {card.label}
          </dt>
          <dd className="mt-2 font-heading text-2xl text-ocean-navy">{card.value}</dd>
          {card.hint && <p className="mt-1 font-body text-[11px] text-ocean-navy/35">{card.hint}</p>}
        </div>
      ))}
    </dl>
  );
}
