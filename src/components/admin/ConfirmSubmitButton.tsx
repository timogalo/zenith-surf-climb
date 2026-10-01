"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

type ConfirmSubmitButtonProps = {
  triggerLabel: string;
  pendingLabel: string;
  title: string;
  description?: string;
  confirmLabel: string;
  triggerClassName: string;
  confirmClassName: string;
};

/**
 * A submit button that opens a confirmation step before the surrounding
 * form actually submits — used for the two admin actions flagged as
 * needing one (reject a booking, mark a week unavailable). Built on the
 * native <dialog> element: focus trapping, Escape-to-close, and a
 * backdrop all come for free from the browser, so no modal library is
 * needed, and nothing here is a `window.confirm()`-style blocking hack.
 *
 * Must be rendered inside the <form> it should confirm — useFormStatus()
 * reports that form's pending state.
 */
export default function ConfirmSubmitButton({
  triggerLabel,
  pendingLabel,
  title,
  description,
  confirmLabel,
  triggerClassName,
  confirmClassName,
}: ConfirmSubmitButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        disabled={pending}
        className={triggerClassName}
      >
        {pending ? pendingLabel : triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        className="w-[calc(100%-2.5rem)] max-w-sm border border-ocean-navy/15 bg-white p-6 backdrop:bg-ocean-navy/40"
      >
        <p className="font-heading text-lg text-ocean-navy">{title}</p>
        {description && <p className="mt-2 font-body text-sm text-ocean-navy/60">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-ocean-navy/60 transition-colors hover:text-ocean-navy"
          >
            Cancel
          </button>
          <button type="submit" onClick={() => dialogRef.current?.close()} className={confirmClassName}>
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
