"use client";

import { useId, useState } from "react";
import type { BookingRow as BookingRowType } from "@/lib/supabase/types";
import StatusBadge from "./StatusBadge";
import BookingActions from "./BookingActions";

const DESKTOP_COLUMN_COUNT = 9;

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

/**
 * One booking's desktop table row, plus its own expand/collapse state
 * for a second row holding secondary details (country, message) — a
 * small client island (just a boolean) rather than a dialog/library, per
 * "prefer a simple accessible native/React solution." Kept as its own
 * component (rather than inline in BookingsList's map) specifically so
 * each row's disclosure state is independent.
 *
 * `weekRangeLabel` is pre-formatted by the caller (BookingsList, a
 * Server Component) rather than computed here — the formatter it would
 * use (src/lib/email/date-range.ts) pulls in `server-only` transitively,
 * which a "use client" module like this one can never import.
 */
export default function BookingRow({
  booking,
  weekRangeLabel,
}: {
  booking: BookingRowType;
  weekRangeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <>
      <tr className="border-b border-ocean-navy/5 align-top last:border-0">
        <td className="px-3 py-4">
          <StatusBadge status={booking.status} />
        </td>
        <td className="px-3 py-4 font-body text-sm text-ocean-navy">
          <span className="block truncate" title={booking.full_name}>
            {booking.full_name}
          </span>
        </td>
        <td className="px-3 py-4 font-body text-sm">
          <a
            href={`mailto:${booking.email}`}
            title={booking.email}
            className="block truncate text-ocean-navy underline decoration-ocean-navy/25 underline-offset-2 hover:decoration-ocean-navy"
          >
            {booking.email}
          </a>
          <div className="mt-0.5 flex items-baseline gap-2 text-ocean-navy/60">
            <a
              href={`tel:${booking.phone}`}
              className="truncate underline decoration-ocean-navy/20 underline-offset-2 hover:decoration-ocean-navy"
            >
              {booking.phone}
            </a>
            <a
              href={whatsappHref(booking.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-ocean-navy/45 underline decoration-ocean-navy/20 underline-offset-2 hover:text-ocean-navy hover:decoration-ocean-navy"
            >
              WhatsApp
            </a>
          </div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 font-body text-sm text-ocean-navy/70">
          {weekRangeLabel}
        </td>
        <td className="px-3 py-4 font-body text-sm text-ocean-navy/70">{booking.guests}</td>
        <td className="px-3 py-4 font-body text-sm text-ocean-navy">
          <div>€{booking.total_price}</div>
          <div className="text-xs text-ocean-navy/45">€{booking.price_per_person}/person</div>
        </td>
        <td className="whitespace-nowrap px-3 py-4 font-body text-xs text-ocean-navy/50">
          {formatCreatedAt(booking.created_at)}
        </td>
        <td className="px-3 py-4">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((value) => !value)}
            className="font-body text-xs uppercase tracking-[0.08em] text-ocean-navy/50 underline decoration-dotted underline-offset-2 hover:text-ocean-navy"
          >
            {open ? "Hide" : "Details"}
          </button>
        </td>
        <td className="px-3 py-4">
          {booking.status === "pending" ? (
            <BookingActions bookingId={booking.id} guestName={booking.full_name} />
          ) : (
            <span className="font-body text-xs text-ocean-navy/40">No action needed</span>
          )}
        </td>
      </tr>
      {open && (
        <tr id={detailsId} className="border-b border-ocean-navy/5 bg-warm-sand/20">
          <td colSpan={DESKTOP_COLUMN_COUNT} className="px-3 py-4">
            <dl className="grid grid-cols-3 gap-x-8 gap-y-1 font-body text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.08em] text-ocean-navy/40">Country</dt>
                <dd className="mt-0.5 text-ocean-navy/70">{booking.country ?? "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-[0.08em] text-ocean-navy/40">Message</dt>
                <dd className="mt-0.5 text-ocean-navy/70">{booking.message ?? "—"}</dd>
              </div>
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
