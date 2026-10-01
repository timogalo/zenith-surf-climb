import type { ReactNode } from "react";
import type { BookingRow as BookingRowType } from "@/lib/supabase/types";
import { formatBookingRange } from "@/lib/email/date-range";
import StatusBadge from "./StatusBadge";
import BookingActions from "./BookingActions";
import BookingRow from "./BookingRow";

const createdAtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : createdAtFormatter.format(date);
}

/** Digits only, for a best-effort wa.me link — phone has no enforced
 * international format (src/lib/booking/validation.ts), so this is a
 * convenience, not a guarantee it resolves correctly for every entry. */
function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-ocean-navy/45">{label}</dt>
      {/* min-w-0 is required for a flex child to shrink below its content's
          natural width — without it, a long unbroken value (an email,
          phone/WhatsApp pair) overflows the card instead of wrapping. */}
      <dd className="min-w-0 flex-1 text-right text-ocean-navy break-words">{value}</dd>
    </div>
  );
}

/**
 * Two independent renderings of the same booking list, toggled by
 * breakpoint via Tailwind's `hidden`/`lg:hidden`:
 *
 * - Desktop: a fixed-width table (STATUS/GUEST/CONTACT/WEEK/GUESTS/
 *   TOTAL/REQUESTED/DETAILS/ACTION) budgeted to ~1050px total — the
 *   page's actual content width at `max-w-6xl` minus padding — so it
 *   fits without horizontal scrolling on a normal laptop/desktop
 *   viewport, rather than the wider budget an earlier version used that
 *   forced a scrollbar. Country and the customer message move into each
 *   row's own expandable "Details" area (BookingRow) instead of being
 *   full columns.
 * - Mobile: stacked cards showing every field directly (no disclosure
 *   needed — vertical space is cheap there).
 *
 * Both read from the same `bookings` prop.
 */
export default function BookingsList({ bookings }: { bookings: BookingRowType[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto border border-ocean-navy/10 bg-white lg:block">
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[90px]" />
            <col className="w-[130px]" />
            <col className="w-[190px]" />
            <col className="w-[170px]" />
            <col className="w-[70px]" />
            <col className="w-[100px]" />
            <col className="w-[90px]" />
            <col className="w-[80px]" />
            <col className="w-[160px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ocean-navy/10 font-body text-xs uppercase tracking-[0.08em] text-ocean-navy/50">
              <th scope="col" className="px-3 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Guest
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Contact
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Week
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Guests
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Total
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Requested
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                <span className="sr-only">Details</span>
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                weekRangeLabel={formatBookingRange(booking.start_date, booking.end_date)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 lg:hidden">
        {bookings.map((booking) => (
          <div key={booking.id} className="border border-ocean-navy/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-base text-ocean-navy">{booking.full_name}</p>
                <p className="mt-1 font-body text-xs text-ocean-navy/50">
                  {formatCreatedAt(booking.created_at)}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <dl className="mt-4 space-y-2 font-body text-sm">
              <DetailRow
                label="Email"
                value={
                  <a
                    href={`mailto:${booking.email}`}
                    className="break-all underline decoration-ocean-navy/25 underline-offset-2"
                  >
                    {booking.email}
                  </a>
                }
              />
              <DetailRow
                label="Phone / WhatsApp"
                value={
                  <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5">
                    <a
                      href={`tel:${booking.phone}`}
                      className="break-all underline decoration-ocean-navy/25 underline-offset-2"
                    >
                      {booking.phone}
                    </a>
                    <a
                      href={whatsappHref(booking.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ocean-navy/50 underline decoration-ocean-navy/20 underline-offset-2"
                    >
                      WhatsApp
                    </a>
                  </span>
                }
              />
              <DetailRow label="Country" value={booking.country ?? "—"} />
              <DetailRow label="Week" value={formatBookingRange(booking.start_date, booking.end_date)} />
              <DetailRow label="Guests" value={String(booking.guests)} />
              <DetailRow label="Price / person" value={`€${booking.price_per_person}`} />
              <DetailRow label="Total" value={`€${booking.total_price}`} />
              <DetailRow label="Message" value={booking.message ?? "—"} />
            </dl>

            {booking.status === "pending" && (
              <div className="mt-5">
                <BookingActions bookingId={booking.id} guestName={booking.full_name} />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
