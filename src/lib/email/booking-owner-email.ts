import "server-only";
import type { BookingRow } from "@/lib/supabase/types";
import { type EmailContent, escapeHtml, renderEmailLayout } from "./layout";
import { formatBookingRange } from "./date-range";

export type OwnerActionLinks = {
  confirmUrl: string;
  declineUrl: string;
};

/**
 * Notifies the owner of a new pending booking request, with signed
 * Approve/Reject links. Contains no secrets — the links carry a signed
 * token (see src/lib/booking/action-token.ts), not credentials.
 */
export function buildOwnerBookingEmail(
  booking: BookingRow,
  links: OwnerActionLinks
): EmailContent {
  const range = formatBookingRange(booking.start_date, booking.end_date);
  const subject = `New Zenith Nomads booking request — ${range}`;

  const rows: Array<[string, string]> = [
    ["Full name", booking.full_name],
    ["Email", booking.email],
    ["Phone / WhatsApp", booking.phone],
    ["Country", booking.country ?? "—"],
    ["Selected week", range],
    ["Guests", String(booking.guests)],
    ["Price per person", `€${booking.price_per_person}`],
    ["Total price", `€${booking.total_price}`],
    ["Message", booking.message ?? "—"],
    ["Status", "Pending"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr>` +
        `<td style="padding:6px 16px 6px 0;color:#102A43;opacity:0.55;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#102A43;font-size:14px;">${escapeHtml(value)}</td>` +
        `</tr>`
    )
    .join("");

  const confirmHref = escapeHtml(links.confirmUrl);
  const declineHref = escapeHtml(links.declineUrl);

  const html = renderEmailLayout(`
    <h1 style="margin:0 0 16px;font-size:19px;font-weight:600;">New booking request</h1>
    <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
    <div style="margin-top:28px;">
      <a href="${confirmHref}" style="display:inline-block;background:#102A43;color:#FFFFFF;text-decoration:none;padding:12px 22px;border-radius:2px;font-size:13px;letter-spacing:0.06em;margin-right:12px;">APPROVE BOOKING</a>
      <a href="${declineHref}" style="display:inline-block;background:transparent;color:#C76B44;text-decoration:none;padding:11px 22px;border-radius:2px;font-size:13px;letter-spacing:0.06em;border:1px solid #C76B44;">REJECT BOOKING</a>
    </div>
    <p style="margin-top:24px;color:#102A43;opacity:0.5;font-size:12px;">Each link works once and expires in 7 days.</p>
  `);

  const text = [
    "New Zenith booking request",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `Approve: ${links.confirmUrl}`,
    `Reject: ${links.declineUrl}`,
  ].join("\n");

  return { subject, html, text };
}
