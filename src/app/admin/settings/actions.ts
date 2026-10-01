"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { changeAdminPassword } from "@/lib/admin/credentials";
import { ADMIN_SESSION_COOKIE_NAME, ADMIN_SESSION_COOKIE_PATH } from "@/lib/admin/session";
import { checkRateLimit } from "@/lib/rate-limit/upstash";
import { getClientIpFromHeaders } from "@/lib/rate-limit/client-ip";

export type ChangePasswordState = { error: string | null };

const GENERIC_UNAVAILABLE_MESSAGE = "Temporarily unavailable. Please try again shortly.";

/**
 * Reachable directly by POST, not only through the Settings UI — always
 * re-verifies the admin session itself first, same as every other admin
 * mutation. On success: the new hash and bumped session_version are
 * already stored by changeAdminPassword(); this then deletes the
 * CURRENT session cookie (invalidating this browser's session too, not
 * just every other one) and redirects to /admin/login, which requires
 * signing in again with the new password. See docs/admin-dashboard.md.
 */
export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  await requireAdminSession();

  const rateLimitId = getClientIpFromHeaders(await headers());
  const rateLimit = await checkRateLimit("adminChangePassword", rateLimitId);
  if (rateLimit.limited) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    currentPassword.length === 0 ||
    newPassword.length === 0
  ) {
    return { error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New password and confirmation do not match." };
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/settings] Supabase client unavailable:", err);
    return { error: GENERIC_UNAVAILABLE_MESSAGE };
  }

  const result = await changeAdminPassword(supabase, currentPassword, newPassword);
  if (!result.ok) {
    return { error: result.error };
  }

  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE_NAME, path: ADMIN_SESSION_COOKIE_PATH });

  redirect("/admin/login?passwordChanged=1");
}
