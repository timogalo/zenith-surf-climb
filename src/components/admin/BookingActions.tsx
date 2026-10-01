"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  approveBookingAction,
  rejectBookingAction,
  type BookingActionState,
} from "@/app/admin/actions";
import ConfirmSubmitButton from "./ConfirmSubmitButton";

const initialState: BookingActionState = { error: null };

const BUTTON_BASE =
  "flex-1 py-2 text-center font-body text-xs uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${BUTTON_BASE} bg-ocean-navy text-white hover:opacity-90`}
    >
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}

/**
 * Approve/Reject controls for a single pending booking row. Only ever
 * rendered for bookings whose status is "pending" (see BookingRow) — an
 * already-processed booking shows its resolved status instead, never
 * these buttons. Approve submits directly; Reject goes through a
 * confirmation step (ConfirmSubmitButton) naming the guest, since a
 * reject can't be undone from here and the customer is notified by
 * email immediately.
 */
export default function BookingActions({
  bookingId,
  guestName,
}: {
  bookingId: string;
  guestName: string;
}) {
  const [approveState, approveFormAction] = useActionState(
    approveBookingAction.bind(null, bookingId),
    initialState
  );
  const [rejectState, rejectFormAction] = useActionState(
    rejectBookingAction.bind(null, bookingId),
    initialState
  );

  const error = approveState.error ?? rejectState.error;

  return (
    <div>
      <div className="flex gap-2">
        <form action={approveFormAction} className="flex flex-1">
          <ApproveButton />
        </form>
        <form action={rejectFormAction} className="flex flex-1">
          <ConfirmSubmitButton
            triggerLabel="Reject"
            pendingLabel="Rejecting…"
            title={`Reject booking for ${guestName}?`}
            description="The customer will be notified by email. This can't be undone from here."
            confirmLabel="Reject booking"
            triggerClassName={`${BUTTON_BASE} border border-terracotta text-terracotta hover:bg-terracotta hover:text-white`}
            confirmClassName="bg-terracotta px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
          />
        </form>
      </div>
      {error && (
        <p role="alert" className="mt-2 font-body text-xs text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
