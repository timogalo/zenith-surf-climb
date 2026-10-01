"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  markWeekAvailableAction,
  markWeekUnavailableAction,
  type AvailabilityActionState,
} from "@/app/admin/availability/actions";
import ConfirmSubmitButton from "./ConfirmSubmitButton";

const initialState: AvailabilityActionState = { error: null };

const BUTTON_CLASS =
  "border border-ocean-navy/25 px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-ocean-navy transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white disabled:cursor-not-allowed disabled:opacity-50";

function MakeAvailableButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={BUTTON_CLASS}>
      {pending ? "Updating…" : "Make available"}
    </button>
  );
}

/**
 * Making a week available again is reversible and low-risk, so it stays
 * a direct submit. Marking a week unavailable immediately removes it
 * from the public booking page, so it goes through a confirmation step
 * naming the specific week — the one distinction the client asked for
 * between the two directions of this toggle.
 */
export default function AvailabilityToggle({
  startDateId,
  isBlocked,
  rangeLabel,
}: {
  startDateId: string;
  isBlocked: boolean;
  rangeLabel: string;
}) {
  const action = isBlocked ? markWeekAvailableAction : markWeekUnavailableAction;
  const [state, formAction] = useActionState(action.bind(null, startDateId), initialState);

  return (
    <div className="shrink-0">
      <form action={formAction}>
        {isBlocked ? (
          <MakeAvailableButton />
        ) : (
          <ConfirmSubmitButton
            triggerLabel="Mark unavailable"
            pendingLabel="Updating…"
            title={`Mark ${rangeLabel} unavailable?`}
            description="This immediately removes the week from the public booking page."
            confirmLabel="Mark unavailable"
            triggerClassName={BUTTON_CLASS}
            confirmClassName="bg-ocean-navy px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
          />
        )}
      </form>
      {state.error && (
        <p role="alert" className="mt-2 max-w-[220px] font-body text-xs text-terracotta">
          {state.error}
        </p>
      )}
    </div>
  );
}
