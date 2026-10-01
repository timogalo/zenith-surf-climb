import type { BookingStatus } from "@/lib/supabase/types";

// Deliberately distinct treatments (not just color) so status reads at a
// glance for a non-technical user: pending is warm/attention-drawing,
// confirmed is solid/settled, rejected is a quiet outline, cancelled
// (not reachable from the admin UI today, but a valid DB status) is
// muted. Reuses only existing brand tokens — no new palette.
const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-warm-sand text-ocean-navy",
  confirmed: "bg-ocean-navy text-white",
  declined: "border border-terracotta text-terracotta",
  cancelled: "bg-charcoal/10 text-charcoal/50",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Rejected",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap px-3 py-1 font-body text-xs font-medium uppercase tracking-[0.08em] ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
