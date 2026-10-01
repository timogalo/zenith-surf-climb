"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/dal";
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_SESSION_COOKIE_PATH } from "@/lib/admin/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { applyBookingAction, type BookingDecision } from "@/lib/booking/apply-booking-action";

export type BookingActionState = { error: string | null };

/**
 * Server Functions are reachable by direct POST, not only through the
 * dashboard UI (see the Next.js Server Functions security note) — every
 * one of these re-verifies the admin session itself rather than trusting
 * that only an authenticated browser could have called it.
 */
async function setBookingStatus(
  bookingId: string,
  status: BookingDecision
): Promise<BookingActionState> {
  await requireAdminSession();

  if (typeof bookingId !== "string" || bookingId.length === 0) {
    return { error: "Missing booking id." };
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/actions] Supabase client unavailable:", err);
    return { error: "Temporarily unavailable. Please try again shortly." };
  }

  // Same shared implementation the signed email Approve/Reject link uses
  // (src/app/api/booking-action/route.ts) — one place decides what
  // "confirm"/"decline" actually does, including never touching
  // blocked_weeks. See src/lib/booking/apply-booking-action.ts.
  const result = await applyBookingAction(supabase, bookingId, status);

  switch (result.outcome) {
    case "applied":
      revalidatePath("/admin");
      return {
        error: result.emailSent
          ? null
          : "Status updated, but the customer email could not be sent. You may want to follow up directly.",
      };
    case "already-processed":
      revalidatePath("/admin");
      return { error: "This booking was already processed." };
    case "not-found":
      return { error: "Booking not found." };
    case "error":
      return { error: "Could not update the booking. Please try again." };
  }
}

// Only `bookingId` is declared even though useActionState calls these
// with (bookingId) already bound via .bind(null, bookingId), then invokes
// the result with (prevState, formData) — a function is assignable
// wherever more parameters are expected as long as it accepts no more
// than they do, so the extra args are simply ignored here.
export async function approveBookingAction(bookingId: string): Promise<BookingActionState> {
  return setBookingStatus(bookingId, "confirmed");
}

export async function rejectBookingAction(bookingId: string): Promise<BookingActionState> {
  return setBookingStatus(bookingId, "declined");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  // Must match the `path` the cookie was created with (ADMIN_SESSION_COOKIE_PATH)
  // exactly — deleting by name alone produces a different, inert cookie
  // at a different default path and leaves the real session untouched.
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE_NAME, path: ADMIN_SESSION_COOKIE_PATH });
  redirect("/admin/login");
}
