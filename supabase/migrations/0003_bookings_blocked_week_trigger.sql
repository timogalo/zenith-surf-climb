-- Zenith Nomads — booking backend, Phase 5: database-level blocked-week
-- enforcement (defense-in-depth for the TOCTOU gap between the
-- application's blocked_weeks check and its bookings insert).
--
-- Apply this via the Supabase SQL editor (paste + run), same as
-- 0001_booking_schema.sql and 0002_admin_credentials.sql. Idempotent —
-- safe to run again.

-- ============================================================
-- bookings_prevent_blocked_week (trigger function)
-- ============================================================
-- POST /api/bookings (src/app/api/bookings/route.ts) already checks
-- blocked_weeks immediately before inserting and returns 409
-- WEEK_UNAVAILABLE if it's blocked. That check and this insert are two
-- separate, non-transactional round trips, so there is a narrow window
-- where an admin's blockWeek() (src/lib/availability/manage-blocked-weeks.ts)
-- could commit in between — this trigger closes that window atomically,
-- inside the same transaction as the insert itself, regardless of
-- application-level timing. It is defense-in-depth, not a replacement
-- for the application check: the app check still gives a fast, normal
-- 409 for the overwhelmingly common case where nothing is racing;
-- this trigger is the backstop for the rare case where something is.
--
-- Fires on INSERT only (see the trigger definition below) — booking
-- status updates (pending -> confirmed/declined, applyBookingAction) use
-- UPDATE, which this trigger never runs for, so approving/declining an
-- existing booking is never affected, even for a week that's since been
-- blocked.
--
-- Uses a custom, deliberately-chosen SQLSTATE ('ZW001') rather than
-- Postgres's generic default ('P0001' for an unqualified RAISE
-- EXCEPTION) so the application can distinguish "this specific
-- invariant was violated" from any other database error via
-- error.code, instead of fragile text matching. src/app/api/bookings/
-- route.ts checks for this exact code to translate the trigger firing
-- into the same public 409 WEEK_UNAVAILABLE response the normal
-- application-level check already returns — never a raw database error.
create or replace function public.bookings_prevent_blocked_week()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.blocked_weeks where start_date = new.start_date
  ) then
    raise exception 'Week starting % is blocked and cannot accept new bookings', new.start_date
      using errcode = 'ZW001';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_prevent_blocked_week on public.bookings;
create trigger bookings_prevent_blocked_week
  before insert on public.bookings
  for each row
  execute function public.bookings_prevent_blocked_week();
