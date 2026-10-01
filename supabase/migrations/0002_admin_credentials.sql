-- Zenith Nomads — admin dashboard, Phase 2: self-service password change
--
-- Apply this via the Supabase SQL editor (paste + run), same as
-- 0001_booking_schema.sql. Idempotent — safe to run again.
--
-- See docs/admin-dashboard.md for the full setup and bootstrap
-- explanation.

-- ============================================================
-- admin_credentials
-- ============================================================
-- A single-row (singleton) table holding the current admin password
-- hash. There is exactly one admin (the Zenith Nomads owner) — this is
-- NOT a multi-user accounts table, and the `id = 'singleton'` check
-- constraint enforces that at the database level, not just in
-- application code.
--
-- ADMIN_PASSWORD_HASH (env var) is now BOOTSTRAP-ONLY: the first time
-- src/lib/admin/credentials.ts reads this table and finds no row, it
-- seeds one from that env var (which is already a scrypt hash — the
-- plaintext password never passes through this migration, this table,
-- or any application code). After that one-time seed, this table is the
-- live source of truth, and the admin changes her password from
-- /admin/settings, never by editing environment variables again.

create table if not exists public.admin_credentials (
  id text primary key default 'singleton',
  password_hash text not null,
  -- Bumped on every password change; embedded in signed admin session
  -- tokens (src/lib/admin/session.ts) so a session issued before a
  -- password change stops being accepted after one, without needing a
  -- session table or touching src/proxy.ts's fast, DB-free check.
  session_version integer not null default 1,
  updated_at timestamptz not null default now(),

  constraint admin_credentials_singleton check (id = 'singleton')
);

comment on table public.admin_credentials is
  'Singleton admin password credential. Exactly one row (id = ''singleton''). See docs/admin-dashboard.md.';

-- Reuses the same trigger function 0001_booking_schema.sql already
-- created for `bookings` — one definition, not a second copy of it.
drop trigger if exists admin_credentials_set_updated_at on public.admin_credentials;
create trigger admin_credentials_set_updated_at
  before update on public.admin_credentials
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
-- Same default-deny posture as bookings/blocked_weeks: RLS enabled, zero
-- policies for anon/authenticated, so only the service-role client
-- (src/lib/supabase/server.ts, server-only) can ever read or write this
-- table. The password hash is never fetched by, or exposed to, the
-- browser under any circumstance.

alter table public.admin_credentials enable row level security;
