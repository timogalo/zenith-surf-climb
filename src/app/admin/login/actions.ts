"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPassword } from "@/lib/admin/credentials";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_COOKIE_PATH,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { checkRateLimit } from "@/lib/rate-limit/upstash";
import { getClientIpFromHeaders } from "@/lib/rate-limit/client-ip";

export type LoginState = { error: string | null };

const GENERIC_UNAVAILABLE_MESSAGE = "Login is temporarily unavailable. Please try again shortly.";

/**
 * Server Function invoked by the /admin/login form. Reachable directly by
 * POST (not only through the UI — see the Next.js Server Functions
 * warning in docs/app/getting-started/mutating-data), so every check here
 * (rate limit, password) runs regardless of how the request arrives.
 */
export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const rateLimitId = getClientIpFromHeaders(await headers());
  const rateLimit = await checkRateLimit("adminLogin", rateLimitId);
  if (rateLimit.limited) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Enter the admin password." };
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/login] Supabase client unavailable:", err);
    return { error: GENERIC_UNAVAILABLE_MESSAGE };
  }

  const verifyResult = await verifyAdminPassword(supabase, password);
  if (!verifyResult.ok) {
    if (verifyResult.error) {
      console.error("[admin/login] password verification failed:", verifyResult.error);
      return { error: GENERIC_UNAVAILABLE_MESSAGE };
    }
    return { error: "Incorrect password." };
  }

  let token: string;
  try {
    token = createAdminSessionToken(verifyResult.sessionVersion);
  } catch (err) {
    console.error("[admin/login] session token unavailable:", err);
    return { error: GENERIC_UNAVAILABLE_MESSAGE };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: ADMIN_SESSION_COOKIE_PATH,
    maxAge: ADMIN_SESSION_TTL_MS / 1000,
  });

  redirect("/admin");
}
