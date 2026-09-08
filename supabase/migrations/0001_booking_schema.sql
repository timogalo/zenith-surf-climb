-- Zenith Surf & Climb — booking backend, Phase 1
--
-- Apply this via the Supabase SQL editor (paste + run), or with the
-- Supabase CLI once it's initialized for this project:
--   supabase db push
--
-- See docs/booking-backend.md for the full setup walkthrough.

-- Supabase projects normally have pgcrypto enabled already; this is just
-- a safe no-op if so, and ensures gen_random_uuid() below works either way.
create extension if not exists pgcrypto;

-- ============================================================
-- bookings
-- ============================================================
-- A guest reservation REQUEST. Never auto-confirmed — the owner reviews
-- and updates `status` manually (no admin UI yet; use the Supabase table
-- editor or SQL). Multiple bookings may exist for the same start_date;
-- a booking never makes a week unavailable by itself — only a matching
-- row in blocked_weeks does that.

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  start_date date not null,
  end_date date not null,

  guests integer not null check (guests >= 1),

  price_per_person integer not null default 900,
  total_price integer not null,

  full_name text not null,
  email text not null,
  phone text not null,
  country text,
  message text,

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined', 'cancelled'))
);

comment on table public.bookings is
  'Guest reservation requests. status starts as pending and is only ever changed manually by the owner. See docs/booking-backend.md.';

create index if not exists bookings_start_date_idx on public.bookings (start_date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_created_at_idx on public.bookings (created_at);

-- Keep updated_at current on every row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- blocked_weeks
-- ============================================================
-- Explicit, owner-managed unavailability. A Monday→Monday week is
-- unavailable ONLY if a row exists here for its start_date — this is the
-- single source of truth for availability. Managed manually via SQL for
-- now (no admin UI yet).

create table if not exists public.blocked_weeks (
  id uuid primary key default gen_random_uuid(),
  start_date date not null unique,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now()
);

comment on table public.blocked_weeks is
  'Explicit owner-managed unavailability, one row per blocked Monday-to-Monday week. The application does not enforce start_date being a Monday or end_date = start_date + 7 at the database level — the API layer (src/lib/booking/validation.ts) validates that for bookings; blocked_weeks rows are entered manually and should follow the same convention.';

create index if not exists blocked_weeks_start_date_idx on public.blocked_weeks (start_date);

-- ============================================================
-- Row Level Security
-- ============================================================
-- Both tables default-deny. The browser never talks to Supabase directly
-- — only this project's Next.js API routes do (src/app/api/availability,
-- src/app/api/bookings), using the service-role key via
-- src/lib/supabase/server.ts, which BYPASSES RLS by design for that
-- trusted server-only path.
--
-- No policies are created for the anon/authenticated roles below: with
-- RLS enabled and zero policies, every access attempt from those roles is
-- denied. This is intentional — do not add a broad policy here. If a
-- narrow, specific client-side read is ever genuinely needed (e.g. a
-- future realtime "week just got blocked" indicator), add a policy that
-- exposes only the exact columns required, not full table access.

alter table public.bookings enable row level security;
alter table public.blocked_weeks enable row level security;
