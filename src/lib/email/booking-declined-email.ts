import "server-only";
import type { BookingRow } from "@/lib/supabase/types";
import { type EmailContent, escapeHtml, renderEmailLayout } from "./layout";
import { formatBookingRange } from "./date-range";
import { getSiteUrl } from "@/lib/site";

/**
 * Sent to the customer if the owner declines their request. Says only that
 * this specific week couldn't be confirmed and invites them to pick
 * another — never blames the customer, never invents a reason.
 */
export function buildBookingDeclinedEmail(booking: BookingRow): EmailContent {
  const range = formatBookingRange(booking.start_date, booking.end_date);
  const subject = "Update on your Zenith booking request";
  const name = escapeHtml(booking.full_name);

  let bookingUrl: string | null = null;
  try {
    bookingUrl = `${getSiteUrl()}/#booking`;
  } catch {
    bookingUrl = null;
  }
  const bookingLinkHtml = bookingUrl
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(bookingUrl)}" style="color:#102A43;">Choose another week →</a></p>`
    : "";
  const bookingLinkText = bookingUrl ? `\n\nChoose another week: ${bookingUrl}` : "";

  const html = renderEmailLayout(`
    <h1 style="margin:0 0 16px;font-size:19px;font-weight:600;">Update on your booking request</h1>
    <p style="margin:0 0 16px;">Hi ${name},</p>
    <p style="margin:0 0 16px;">Thank you for your interest in Zenith Nomads. Unfortunately we're not able to confirm your requested week:</p>
    <p style="margin:0 0 20px;font-weight:600;">${escapeHtml(range)}</p>
    <p style="margin:0;">Please feel free to return to the site and choose another available week — we'd love to host you.</p>
    ${bookingLinkHtml}
  `);

  const text = [
    "Update on your Zenith booking request",
    "",
    `Hi ${booking.full_name},`,
    "",
    "Thank you for your interest in Zenith Nomads. Unfortunately we're not able to confirm your requested week:",
    "",
    range,
    "",
    "Please feel free to return to the site and choose another available week — we'd love to host you." +
      bookingLinkText,
  ].join("\n");

  return { subject, html, text };
}
