"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction, type ChangePasswordState } from "@/app/admin/settings/actions";

const initialState: ChangePasswordState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 bg-ocean-navy px-5 py-2.5 font-body text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Changing…" : "Change password"}
    </button>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-body text-xs uppercase tracking-[0.08em] text-ocean-navy/60">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="mt-2 w-full max-w-sm border border-ocean-navy/20 bg-warm-white px-3 py-2 font-body text-sm text-ocean-navy focus:border-ocean-navy focus:outline-none"
      />
    </div>
  );
}

/**
 * On success, changePasswordAction redirects to /admin/login — there is
 * no in-place "success" state to render here, only errors. The form
 * fields are never explicitly cleared on failure either, which is fine:
 * a failed attempt leaves the current/new/confirm fields as typed so the
 * admin can correct just the wrong one.
 */
export default function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, formAction] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="mt-6 max-w-sm space-y-5">
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label={`New password (min. ${minLength} characters)`}
        autoComplete="new-password"
        minLength={minLength}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={minLength}
      />

      {state.error && (
        <p role="alert" className="font-body text-sm text-terracotta">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
