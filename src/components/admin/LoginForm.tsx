"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full bg-ocean-navy py-3 text-center font-body text-sm uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6">
      <label
        htmlFor="password"
        className="block font-body text-xs uppercase tracking-[0.08em] text-ocean-navy/60"
      >
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="mt-2 w-full border border-ocean-navy/20 bg-warm-white px-3 py-2 font-body text-sm text-ocean-navy focus:border-ocean-navy focus:outline-none"
      />
      {state.error && (
        <p role="alert" className="mt-3 font-body text-sm text-terracotta">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
