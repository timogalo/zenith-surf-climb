# Zenith Nomads

Public marketing and booking website for Zenith Nomads, a surf, climbing,
and creative retreat in Morocco. Includes a booking-request system backed
by Supabase and Resend, and a private `/admin` dashboard for managing
bookings and week availability.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [Supabase](https://supabase.com) (Postgres, server-only access)
- [Resend](https://resend.com) (transactional email)
- [Upstash Redis](https://upstash.com) (rate limiting)
- Deployed on [Vercel](https://vercel.com)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev      # start the local dev server
npm run lint      # run ESLint
npm run build    # production build
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values — see that
file for what each variable is for. **Never commit `.env.local` or any
real secret value.** Full setup walkthroughs, including exactly how to
generate the admin password hash and session secret, live in:

- [`docs/booking-backend.md`](docs/booking-backend.md) — Supabase,
  Resend, and rate-limiting setup
- [`docs/admin-dashboard.md`](docs/admin-dashboard.md) — admin
  authentication, the `admin_credentials` migration, and self-service
  password changes

## Architecture overview

```
Public website (app router pages, Tailwind)
  → Booking form → POST /api/bookings → Supabase (bookings, blocked_weeks)
                                       → Resend (owner notification email)
  → Owner approves/declines via a signed email link, or from /admin
                                       → Resend (customer confirmation/decline)

Private /admin dashboard (src/proxy.ts + session-based auth)
  → Lists and manages bookings, blocks/unblocks weeks, admin password change
  → Same Supabase service-role access, same shared booking-action logic
```

The browser never talks to Supabase directly — every read/write goes
through this app's own API routes and Server Actions, using a
server-only service-role Supabase client.

## Database migrations

Apply these to your Supabase project via the SQL editor, **in order**:

1. `supabase/migrations/0001_booking_schema.sql` — `bookings` and
   `blocked_weeks` tables
2. `supabase/migrations/0002_admin_credentials.sql` — admin password
   storage for the `/admin` dashboard
3. `supabase/migrations/0003_bookings_blocked_week_trigger.sql` —
   database-level enforcement that a booking can never be created for a
   blocked week

Each migration is idempotent — safe to re-run.

## Deployment

Deployed on Vercel. Set all required environment variables (see
`.env.example` and the docs above) in Vercel's Project Settings for the
Production environment — use separate values for Preview deployments
rather than reusing Production credentials. Apply all three database
migrations to the Supabase project Production points at before deploying.
