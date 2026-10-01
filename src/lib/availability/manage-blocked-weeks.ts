import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { addDays, isMonday, parseDateId, toDateId } from "@/lib/weeks";

export type ManageBlockedWeekResult = { ok: true } | { ok: false; error: string };

/**
 * Blocks (or re-confirms) a Monday-to-Monday week. `end_date` is always
 * derived from `startDateId` here — never accepted from a caller — so a
 * malformed or manipulated request can't create a blocked_weeks row that
 * doesn't match the Monday+7 convention every other row follows (see the
 * comment on that convention in supabase/migrations/0001_booking_schema.sql).
 *
 * Upserts on the table's existing unique `start_date` constraint, so
 * calling this twice for the same week (e.g. a double click) is a no-op,
 * not an error.
 */
export async function blockWeek(
  supabase: SupabaseClient<Database>,
  startDateId: string
): Promise<ManageBlockedWeekResult> {
  const start = parseDateId(startDateId);
  if (!start || !isMonday(start)) {
    return { ok: false, error: "Invalid week." };
  }
  const endDateId = toDateId(addDays(start, 7));

  const { error } = await supabase
    .from("blocked_weeks")
    .upsert({ start_date: startDateId, end_date: endDateId }, { onConflict: "start_date" });

  if (error) {
    console.error("[availability] block week failed:", error.message);
    return { ok: false, error: "Could not update availability. Please try again." };
  }

  return { ok: true };
}

/**
 * Unblocks a week — deletes its blocked_weeks row, if any. Deleting a
 * start_date that isn't currently blocked is a harmless no-op (Postgres
 * DELETE matches zero rows without erroring), which is what makes this
 * safe to call twice.
 */
export async function unblockWeek(
  supabase: SupabaseClient<Database>,
  startDateId: string
): Promise<ManageBlockedWeekResult> {
  const { error } = await supabase.from("blocked_weeks").delete().eq("start_date", startDateId);

  if (error) {
    console.error("[availability] unblock week failed:", error.message);
    return { ok: false, error: "Could not update availability. Please try again." };
  }

  return { ok: true };
}
