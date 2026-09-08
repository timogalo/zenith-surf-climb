import ActionPageShell from "@/components/booking/ActionPageShell";
import {
  verifyBookingActionToken,
  type VerifyBookingActionTokenResult,
} from "@/lib/booking/action-token";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatFullDate, parseDateId } from "@/lib/weeks";

// Always evaluated fresh — this reads the current booking status from
// Supabase on every visit, never prerendered/cached.
export const dynamic = "force-dynamic";

function formatRange(startDateId: string, endDateId: string): string {
  const start = parseDateId(startDateId);
  const end = parseDateId(endDateId);
  if (!start || !end) return `${startDateId} → ${endDateId}`;
  return `${formatFullDate(start)} → ${formatFullDate(end)}`;
}

function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <ActionPageShell>
      <h1 className="font-heading text-xl text-ocean-navy">{title}</h1>
      <p className="mt-3 font-body text-sm text-ocean-navy/70">{body}</p>
    </ActionPageShell>
  );
}

type BookingActionPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

/**
 * GET-only page: verifies the signed token and shows what the owner is
 * about to do, but never mutates anything itself — the actual status
 * change only happens on the POST to /api/booking-action, which this
 * page's form submits to. This keeps opening the link (e.g. an email
 * client's link-preview scanner) from accidentally approving a booking.
 */
export default async function BookingActionPage({ searchParams }: BookingActionPageProps) {
  const { token: rawToken } = await searchParams;
  const token = typeof rawToken === "string" ? rawToken : null;

  if (!token) {
    return (
      <ErrorState
        title="Invalid link"
        body="This action link is invalid or has expired."
      />
    );
  }

  // verifyBookingActionToken throws if BOOKING_ACTION_SECRET is missing or
  // too weak (see src/lib/booking/action-token.ts) — a server
  // misconfiguration, not something to ever crash this page with a raw
  // framework error.
  let verified: VerifyBookingActionTokenResult;
  try {
    verified = verifyBookingActionToken(token);
  } catch (err) {
    console.error("[booking/action] token verification unavailable:", err);
    return (
      <ErrorState
        title="Temporarily unavailable"
        body="This page is temporarily unavailable. Please try again shortly."
      />
    );
  }
  if (!verified.ok) {
    return verified.reason === "expired" ? (
      <ErrorState title="Link expired" body="This action link is invalid or has expired." />
    ) : (
      <ErrorState title="Invalid link" body="This action link is invalid or has expired." />
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch {
    return (
      <ErrorState
        title="Temporarily unavailable"
        body="This page is temporarily unavailable. Please try again shortly."
      />
    );
  }

  // Only what this preview page actually renders — the POST route
  // (src/app/api/booking-action/route.ts) still fetches the full row,
  // since it genuinely needs email/phone/etc. for the customer email.
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id, full_name, start_date, end_date, guests, status")
    .eq("id", verified.payload.bookingId)
    .maybeSingle();

  if (error || !booking) {
    return (
      <ErrorState title="Booking not found" body="This action link is invalid or has expired." />
    );
  }

  if (booking.status !== "pending") {
    return (
      <ErrorState
        title="Already processed"
        body="This booking has already been processed."
      />
    );
  }

  const isConfirm = verified.payload.action === "confirm";
  const range = formatRange(booking.start_date, booking.end_date);

  return (
    <ActionPageShell>
      <h1 className="font-heading text-xl text-ocean-navy">
        {isConfirm ? "Approve this booking request?" : "Decline this booking request?"}
      </h1>
      <div className="mt-4 space-y-1 font-body text-sm text-ocean-navy/75">
        <p>{range}</p>
        <p>
          {booking.guests} guest{booking.guests === 1 ? "" : "s"}
        </p>
        <p>{booking.full_name}</p>
      </div>
      <form action="/api/booking-action" method="POST" className="mt-7">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className={`w-full py-3 text-center font-body text-sm uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 ${
            isConfirm ? "bg-ocean-navy" : "bg-terracotta"
          }`}
        >
          {isConfirm ? "Approve booking" : "Decline booking"}
        </button>
      </form>
    </ActionPageShell>
  );
}
