import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from "./session";
import { getAdminCredential } from "./credentials";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Data Access Layer entry point for every admin Server Component/Server
 * Action/Route Handler. Verifies the session cookie independently of
 * src/proxy.ts — the Next.js-recommended defense-in-depth pattern for
 * auth (Proxy is an optimistic outer gate, never the only check; see
 * docs/app/guides/authentication#creating-a-data-access-layer-dal).
 * Redirects to /admin/login when the session is missing, tampered with,
 * expired, stale (see hasValidAdminSession), or the server secret is
 * misconfigured.
 */
export async function requireAdminSession(): Promise<void> {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }
}

/**
 * Non-redirecting check for callers that need to branch instead — e.g.
 * the login page deciding whether to bounce an already-authenticated
 * visitor straight to /admin.
 *
 * This is the ONE place a signed session is checked against Supabase
 * (admin_credentials.session_version) — src/proxy.ts deliberately stays
 * a fast, DB-free signature/expiry check only (the Next.js auth guide's
 * "optimistic" layer). A stale session — issued before the current
 * password was set — fails here even though its signature and expiry
 * are both still valid, which is what makes a password change actually
 * invalidate old sessions.
 */
export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return false;
  }

  let verified;
  try {
    verified = verifyAdminSessionToken(token);
  } catch (err) {
    console.error("[admin/dal] session verification unavailable:", err);
    return false;
  }
  if (!verified.ok) {
    return false;
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/dal] Supabase client unavailable:", err);
    return false;
  }

  const credentialResult = await getAdminCredential(supabase);
  if (!credentialResult.ok) {
    return false;
  }

  return verified.payload.sessionVersion === credentialResult.credential.sessionVersion;
}
