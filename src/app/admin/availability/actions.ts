"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/dal";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { blockWeek, unblockWeek } from "@/lib/availability/manage-blocked-weeks";

export type AvailabilityActionState = { error: string | null };

const GENERIC_UNAVAILABLE_MESSAGE = "Temporarily unavailable. Please try again shortly.";

/**
 * Reachable by direct POST, not only through the dashboard UI — verifies
 * the admin session itself before touching blocked_weeks, same as every
 * other admin mutation (src/app/admin/actions.ts).
 */
export async function markWeekUnavailableAction(startDateId: string): Promise<AvailabilityActionState> {
  await requireAdminSession();

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/availability] Supabase client unavailable:", err);
    return { error: GENERIC_UNAVAILABLE_MESSAGE };
  }

  const result = await blockWeek(supabase, startDateId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/availability");
  return { error: null };
}

export async function markWeekAvailableAction(startDateId: string): Promise<AvailabilityActionState> {
  await requireAdminSession();

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.error("[admin/availability] Supabase client unavailable:", err);
    return { error: GENERIC_UNAVAILABLE_MESSAGE };
  }

  const result = await unblockWeek(supabase, startDateId);
  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/availability");
  return { error: null };
}
