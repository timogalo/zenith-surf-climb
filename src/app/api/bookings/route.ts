import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";
import { PRICE_PER_PERSON, validateBookingInput } from "@/lib/booking/validation";
import {
  BOOKING_ACTION_TOKEN_TTL_MS,
  createBookingActionToken,
} from "@/lib/booking/action-token";
import { buildOwnerBookingEmail } from "@/lib/email/booking-owner-email";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site";
import type { BookingRow } from "@/lib/supabase/types";
import { rejectIfBodyTooLarge } from "@/lib/api/body-size";
import { checkRateLimit } from "@/lib/rate-limit/upstash";
import { getClientIp } from "@/lib/rate-limit/client-ip";

export const dynamic = "force-dynamic";

// Comfortably above the legitimate payload (name/email/phone/country/
// message + a handful of short fields tops out well under 3KB even with
// generous multi-byte UTF-8), small enough to block multi-megabyte abuse.
const MAX_BOOKING_BODY_BYTES = 10 * 1024;

/**
 * Creates a booking REQUEST — not a confirmed reservation. Every row is
 * inserted with status "pending"; the owner reviews and confirms/declines
 * via the signed Approve/Reject links sent in the owner notification email
 * (see notifyOwnerOfNewBooking below and docs/booking-backend.md) — there
 * is still no admin dashboard.
 *
 * Authoritative values (end date, price, total, status) are always
 * computed here and never taken from the request body, and availability
 * is re-checked against blocked_weeks immediately before inserting, so a
 * stale frontend can't slip a newly-blocked week through.
 */
export async function POST(request: Request) {
  const tooLarge = rejectIfBodyTooLarge(request, MAX_BOOKING_BODY_BYTES);
  if (tooLarge) {
    return tooLarge;
  }

  const rateLimit = await checkRateLimit("bookingCreate", getClientIp(request));
  if (rateLimit.limited) {
    return apiError(
      429,
      "RATE_LIMITED",
      "Too many booking requests. Please wait a few minutes and try again.",
      { "Retry-After": String(rateLimit.retryAfterSeconds) }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "INVALID_REQUEST", "Request body must be valid JSON.");
  }

  if (typeof body !== "object" || body === null) {
    return apiError(400, "INVALID_REQUEST", "Invalid request body.");
  }

  const input = body as Record<string, unknown>;

  // Honeypot: a hidden form field real visitors never see or fill (see
  // the booking-website field in src/components/sections/Booking.tsx). A
  // non-empty value here almost certainly means an automated submission.
  // Returning the same generic INVALID_REQUEST shape as any other
  // validation failure (rather than a distinct "bot detected" code)
  // avoids teaching a bot which field tripped the check. This is a
  // secondary layer only — rate limiting and server-side validation are
  // the primary defenses.
  if (typeof input.website === "string" && input.website.trim().length > 0) {
    console.warn("[bookings] honeypot field filled — rejecting as spam");
    return apiError(400, "INVALID_REQUEST", "We couldn't process your request. Please try again.");
  }

  // Only ever read the user-controlled fields — status/endDate/price/total
  // are intentionally never accepted from the client, even if present.
  const validation = validateBookingInput({
    startDate: input.startDate,
    guests: input.guests,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    country: input.country,
    message: input.message,
  });

  if (!validation.ok) {
    return apiError(400, "INVALID_REQUEST", validation.message);
  }

  const { startDateId, endDateId, guests, fullName, email, phone, country, message } =
    validation.data;

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[bookings] Supabase client unavailable:", err);
    return apiError(
      500,
      "SERVER_ERROR",
      "Booking requests are temporarily unavailable. Please try again shortly."
    );
  }

  // Authoritative re-check. Multiple bookings may exist for the same week
  // (that's expected — a booking never blocks a week by itself), but an
  // explicit blocked_weeks row always wins, even if the browser's earlier
  // /api/availability fetch said this week was open.
  const { data: blockedRow, error: blockedError } = await supabase
    .from("blocked_weeks")
    .select("start_date")
    .eq("start_date", startDateId)
    .maybeSingle();

  if (blockedError) {
    console.error("[bookings] blocked_weeks lookup failed:", blockedError.message);
    return apiError(500, "SERVER_ERROR", "Unable to verify availability right now.");
  }

  if (blockedRow) {
    return apiError(
      409,
      "WEEK_UNAVAILABLE",
      "This week is no longer available. Please choose another date."
    );
  }

  const totalPrice = guests * PRICE_PER_PERSON;

  const { data: inserted, error: insertError } = await supabase
    .from("bookings")
    .insert({
      start_date: startDateId,
      end_date: endDateId,
      guests,
      price_per_person: PRICE_PER_PERSON,
      total_price: totalPrice,
      full_name: fullName,
      email,
      phone,
      country,
      message,
      status: "pending",
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    console.error("[bookings] insert failed:", insertError?.message);
    return apiError(
      500,
      "SERVER_ERROR",
      "Unable to submit your request right now. Please try again."
    );
  }

  const booking = inserted as BookingRow;

  // Owner notification is best-effort AFTER persistence. The database is
  // already the source of truth for this booking request — a missing
  // Resend/env setup, or Resend being briefly down, must never make an
  // already-saved booking look like it failed to the customer.
  await notifyOwnerOfNewBooking(booking);

  return NextResponse.json({
    bookingId: booking.id,
    startDate: booking.start_date,
    endDate: booking.end_date,
    guests: booking.guests,
    totalPrice: booking.total_price,
    status: booking.status,
  });
}

async function notifyOwnerOfNewBooking(booking: BookingRow): Promise<void> {
  try {
    const ownerEmail = process.env.BOOKING_OWNER_EMAIL;
    if (!ownerEmail) {
      throw new Error("BOOKING_OWNER_EMAIL is not configured.");
    }

    const expiresAt = Date.now() + BOOKING_ACTION_TOKEN_TTL_MS;
    const confirmToken = createBookingActionToken({
      bookingId: booking.id,
      action: "confirm",
      expiresAt,
    });
    const declineToken = createBookingActionToken({
      bookingId: booking.id,
      action: "decline",
      expiresAt,
    });

    const siteUrl = getSiteUrl();
    const confirmUrl = `${siteUrl}/booking/action?token=${encodeURIComponent(confirmToken)}`;
    const declineUrl = `${siteUrl}/booking/action?token=${encodeURIComponent(declineToken)}`;

    const { subject, html, text } = buildOwnerBookingEmail(booking, {
      confirmUrl,
      declineUrl,
    });

    const result = await sendTransactionalEmail({ to: ownerEmail, subject, html, text });
    if (!result.ok) {
      console.error(`[bookings] owner email failed for booking ${booking.id}:`, result.error);
    }
  } catch (err) {
    console.error(`[bookings] owner notification skipped for booking ${booking.id}:`, err);
  }
}
