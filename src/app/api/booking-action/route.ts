import { NextResponse } from "next/server";
import {
  verifyBookingActionToken,
  type VerifyBookingActionTokenResult,
} from "@/lib/booking/action-token";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { buildBookingConfirmedEmail } from "@/lib/email/booking-confirmed-email";
import { buildBookingDeclinedEmail } from "@/lib/email/booking-declined-email";
import { sendTransactionalEmail } from "@/lib/email/resend";
import type { BookingRow } from "@/lib/supabase/types";
import { rejectIfBodyTooLarge } from "@/lib/api/body-size";
import { checkRateLimit } from "@/lib/rate-limit/upstash";
import { getClientIp } from "@/lib/rate-limit/client-ip";

export const dynamic = "force-dynamic";

// The payload is just a single signed token (well under 1KB even with form
// encoding overhead) — this only exists to reject wildly oversized bodies.
const MAX_ACTION_BODY_BYTES = 2 * 1024;

type ResultOutcome = "confirmed" | "declined" | "already-processed" | "invalid" | "rate-limited";

function resultRedirect(request: Request, outcome: ResultOutcome, emailFailed = false) {
  const url = new URL("/booking/action/result", request.url);
  url.searchParams.set("outcome", outcome);
  if (emailFailed) {
    url.searchParams.set("emailFailed", "1");
  }
  // 303: the browser must re-request this URL with GET, not resubmit the
  // POST body — the standard pattern after a form POST that changes state.
  return NextResponse.redirect(url, { status: 303 });
}

/**
 * Applies an Approve/Reject action from the signed link in the owner
 * notification email. The token itself is the only source of truth for
 * *which* booking and *which* action — the browser never supplies a
 * bookingId or target status directly.
 */
export async function POST(request: Request) {
  const tooLarge = rejectIfBodyTooLarge(request, MAX_ACTION_BODY_BYTES);
  if (tooLarge) {
    return tooLarge;
  }

  // Generous limit relative to booking creation: the signed token is
  // already the real authorization check here, this only guards against
  // obvious automated hammering (e.g. a bot brute-forcing token guesses),
  // and must never make legitimate owner clicks flaky.
  const rateLimit = await checkRateLimit("bookingAction", getClientIp(request));
  if (rateLimit.limited) {
    return resultRedirect(request, "rate-limited");
  }

  const token = await readToken(request);
  if (!token) {
    return resultRedirect(request, "invalid");
  }

  // verifyBookingActionToken throws if BOOKING_ACTION_SECRET is missing or
  // too weak (see src/lib/booking/action-token.ts) — a server
  // misconfiguration, not something to ever surface as a raw framework
  // error page to whoever clicked the email link.
  let verified: VerifyBookingActionTokenResult;
  try {
    verified = verifyBookingActionToken(token);
  } catch (err) {
    console.error("[booking-action] token verification unavailable:", err);
    return resultRedirect(request, "invalid");
  }
  if (!verified.ok) {
    return resultRedirect(request, "invalid");
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[booking-action] Supabase client unavailable:", err);
    return resultRedirect(request, "invalid");
  }

  const targetStatus: "confirmed" | "declined" =
    verified.payload.action === "confirm" ? "confirmed" : "declined";

  // Conditional update: only a row that is STILL "pending" gets changed,
  // and .select() only returns rows Postgres actually updated. This is
  // what makes a double-click (or two people clicking the same link)
  // safe — the second request matches zero rows instead of overwriting
  // an already-decided status. No separate locking table is needed.
  const { data: updatedRows, error: updateError } = await supabase
    .from("bookings")
    .update({ status: targetStatus })
    .eq("id", verified.payload.bookingId)
    .eq("status", "pending")
    .select("*");

  if (updateError) {
    console.error("[booking-action] update failed:", updateError.message);
    return resultRedirect(request, "invalid");
  }

  if (!updatedRows || updatedRows.length === 0) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", verified.payload.bookingId)
      .maybeSingle();
    return resultRedirect(request, existing ? "already-processed" : "invalid");
  }

  const booking = updatedRows[0] as BookingRow;

  const emailContent =
    targetStatus === "confirmed"
      ? buildBookingConfirmedEmail(booking)
      : buildBookingDeclinedEmail(booking);

  // Best-effort, same as the owner-notification email: the status change
  // is already committed and is what actually matters. A failed customer
  // email must not roll it back.
  const emailResult = await sendTransactionalEmail({
    to: booking.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!emailResult.ok) {
    console.error(
      `[booking-action] customer email failed for booking ${booking.id}:`,
      emailResult.error
    );
  }

  return resultRedirect(request, targetStatus, !emailResult.ok);
}

async function readToken(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { token?: unknown };
      return typeof body.token === "string" ? body.token : null;
    }
    const form = await request.formData();
    const value = form.get("token");
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}
