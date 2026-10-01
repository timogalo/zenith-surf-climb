import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { hashAdminPassword, verifyPasswordAgainstHash, MIN_PASSWORD_LENGTH } from "./auth";

const SINGLETON_ID = "singleton" as const;

export type AdminCredential = {
  passwordHash: string;
  sessionVersion: number;
  updatedAt: string;
};

type GetCredentialResult = { ok: true; credential: AdminCredential } | { ok: false; error: string };

const UNAVAILABLE_ERROR = "Temporarily unavailable. Please try again shortly.";

/**
 * Reads the singleton admin credential from Supabase, bootstrapping it
 * from ADMIN_PASSWORD_HASH the first time it's ever read (i.e. the first
 * login or session check after supabase/migrations/0002_admin_credentials.sql
 * is applied). The env var is already a scrypt hash — never the
 * plaintext password — so bootstrapping never handles or stores
 * plaintext anywhere. After this first read, the row is the live source
 * of truth and ADMIN_PASSWORD_HASH is never read again. See
 * docs/admin-dashboard.md.
 */
export async function getAdminCredential(
  supabase: SupabaseClient<Database>
): Promise<GetCredentialResult> {
  const { data, error } = await supabase
    .from("admin_credentials")
    .select("password_hash, session_version, updated_at")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) {
    console.error("[admin/credentials] lookup failed:", error.message);
    return { ok: false, error: UNAVAILABLE_ERROR };
  }

  if (data) {
    return {
      ok: true,
      credential: {
        passwordHash: data.password_hash,
        sessionVersion: data.session_version,
        updatedAt: data.updated_at,
      },
    };
  }

  const bootstrapHash = process.env.ADMIN_PASSWORD_HASH;
  if (!bootstrapHash) {
    console.error(
      "[admin/credentials] no admin_credentials row and ADMIN_PASSWORD_HASH is unset — nothing to bootstrap from."
    );
    return { ok: false, error: "Admin credential is not configured." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("admin_credentials")
    .insert({ id: SINGLETON_ID, password_hash: bootstrapHash, session_version: 1 })
    .select("password_hash, session_version, updated_at")
    .single();

  if (!insertError && inserted) {
    return {
      ok: true,
      credential: {
        passwordHash: inserted.password_hash,
        sessionVersion: inserted.session_version,
        updatedAt: inserted.updated_at,
      },
    };
  }

  // A concurrent request may have bootstrapped it first — re-read rather
  // than treat that race as a failure.
  const { data: retryData, error: retryError } = await supabase
    .from("admin_credentials")
    .select("password_hash, session_version, updated_at")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (retryError || !retryData) {
    console.error("[admin/credentials] bootstrap failed:", insertError?.message);
    return { ok: false, error: UNAVAILABLE_ERROR };
  }

  return {
    ok: true,
    credential: {
      passwordHash: retryData.password_hash,
      sessionVersion: retryData.session_version,
      updatedAt: retryData.updated_at,
    },
  };
}

export type VerifyPasswordResult = { ok: true; sessionVersion: number } | { ok: false; error?: string };

export async function verifyAdminPassword(
  supabase: SupabaseClient<Database>,
  password: string
): Promise<VerifyPasswordResult> {
  const result = await getAdminCredential(supabase);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  if (!verifyPasswordAgainstHash(password, result.credential.passwordHash)) {
    return { ok: false };
  }

  return { ok: true, sessionVersion: result.credential.sessionVersion };
}

export type ChangePasswordResult = { ok: true; sessionVersion: number } | { ok: false; error: string };

/**
 * Verifies `currentPassword`, then overwrites the stored hash with
 * `newPassword`'s and bumps session_version in the same update —
 * everything that happens on a password change, done as one operation so
 * there's no window where the hash and version could disagree.
 */
export async function changeAdminPassword(
  supabase: SupabaseClient<Database>,
  currentPassword: string,
  newPassword: string
): Promise<ChangePasswordResult> {
  const result = await getAdminCredential(supabase);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  if (!verifyPasswordAgainstHash(currentPassword, result.credential.passwordHash)) {
    return { ok: false, error: "Current password is incorrect." };
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const newHash = hashAdminPassword(newPassword);
  const nextVersion = result.credential.sessionVersion + 1;

  const { error: updateError } = await supabase
    .from("admin_credentials")
    .update({ password_hash: newHash, session_version: nextVersion })
    .eq("id", SINGLETON_ID);

  if (updateError) {
    console.error("[admin/credentials] password update failed:", updateError.message);
    return { ok: false, error: "Could not update password. Please try again." };
  }

  return { ok: true, sessionVersion: nextVersion };
}
