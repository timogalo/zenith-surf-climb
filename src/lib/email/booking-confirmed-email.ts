import "server-only";
import type { BookingRow } from "@/lib/supabase/types";
import { type EmailContent, escapeHtml, renderEmailLayout } from "./layout";
import { formatBookingRange } from "./date-range";

/**
 * Sent to the customer once the owner approves their request. Deliberately
 * says nothing about payment deadlines, deposits, cancellation policy,
 * transfers, meeting points, or equipment — none of that is defined yet,
 * and it isn't this task's job to invent it.
 */
export function buildBookingConfirmedEmail(booking: BookingRow): EmailContent {
  const range = formatBookingRange(booking.start_date, booking.end_date);
  const subject = "Your Zenith week is confirmed";
  const guestsLabel = `${booking.guests} guest${booking.guests === 1 ? "" : "s"}`;
  const name = escapeHtml(booking.full_name);

  const html = renderEmailLayout(`
    <h1 style="margin:0 0 16px;font-size:19px;font-weight:600;">Your week is confirmed</h1>
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;">Good news — your week at Zenith Nomads is confirmed.</p>
    <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#C76B44;">${escapeHtml(range)}</p>
    <p style="margin:0 0 20px;opacity:0.75;">${guestsLabel} · €${booking.total_price} total</p>
    <p style="margin:0 0 16px;">No payment has been taken through the website. Zenith will be in touch with next steps and further details ahead of your stay.</p>
    <p style="margin:0;">We can't wait to welcome you.</p>
  `);

  const text = [
    "Your Zenith week is confirmed",
    "",
    `Hi ${booking.full_name},`,
    "",
    "Good news — your week at Zenith Nomads is confirmed.",
    "",
    range,
    `${guestsLabel} · €${booking.total_price} total`,
    "",
    "No payment has been taken through the website. Zenith will be in touch with next steps and further details ahead of your stay.",
    "",
    "We can't wait to welcome you.",
  ].join("\n");

  return { subject, html, text };
}
