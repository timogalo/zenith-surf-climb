import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingRow, Database } from "@/lib/supabase/types";
import { buildBookingConfirmedEmail } from "@/lib/email/booking-confirmed-email";
import { buildBookingDeclinedEmail } from "@/lib/email/booking-declined-email";
import { sendTransactionalEmail } from "@/lib/email/resend";

export type BookingDecision = "confirmed" | "declined";

export type ApplyBookingActionResult =
  | { outcome: "applied"; status: BookingDecision; booking: BookingRow; emailSent: boolean }
  | { outcome: "already-processed" }
  | { outcome: "not-found" }
  | { outcome: "error" };

/**
 * The single implementation of "confirm or decline a pending booking",
 * shared by both authorization front doors:
 *  - the signed email Approve/Reject link (src/app/api/booking-action/route.ts)
 *  - the admin dashboard (src/app/admin/actions.ts)
 *
 * Callers are responsible for authorization (verifying the signed token,
 * or verifying the admin session) BEFORE calling this — it performs no
 * auth check of its own, only the state transition.
 *
 * Does NOT touch blocked_weeks. Approving a booking never makes its week
 * unavailable by itself — see docs/booking-backend.md section 8. That
 * rule is unchanged by the admin dashboard and must not be altered here
 * without an explicit client decision.
 *
 * The conditional `.eq("status", "pending")` update is what makes this
 * safe to call twice for the same booking (two browser tabs, an admin and
 * an email-link click racing each other, a double click) — the second
 * call simply matches zero rows instead of overwriting an already-decided
 * status.
 */
export async function applyBookingAction(
  supabase: SupabaseClient<Database>,
  bookingId: string,
  targetStatus: BookingDecision
): Promise<ApplyBookingActionResult> {
  const { data: updatedRows, error: updateError } = await supabase
    .from("bookings")
    .update({ status: targetStatus })
    .eq("id", bookingId)
    .eq("status", "pending")
    .select("*");

  if (updateError) {
    console.error("[apply-booking-action] update failed:", updateError.message);
    return { outcome: "error" };
  }

  if (!updatedRows || updatedRows.length === 0) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .maybeSingle();
    return existing ? { outcome: "already-processed" } : { outcome: "not-found" };
  }

  const booking = updatedRows[0] as BookingRow;

  const emailContent =
    targetStatus === "confirmed"
      ? buildBookingConfirmedEmail(booking)
      : buildBookingDeclinedEmail(booking);

  // Best-effort, same as the owner-notification email on booking
  // creation: the status change is already committed and is what
  // actually matters. A failed customer email must not roll it back.
  const emailResult = await sendTransactionalEmail({
    to: booking.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!emailResult.ok) {
    console.error(
      `[apply-booking-action] customer email failed for booking ${booking.id}:`,
      emailResult.error
    );
  }

  return { outcome: "applied", status: targetStatus, booking, emailSent: emailResult.ok };
}
