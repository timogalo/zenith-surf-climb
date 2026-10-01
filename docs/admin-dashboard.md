# Admin dashboard (`/admin`)

A private area where the Zenith Nomads owner can review bookings, manage
week availability, and change her own admin password — without opening
Supabase or contacting the developer. See `docs/booking-backend.md` for
the booking data model and the email approval flow this dashboard shares
logic with.

## 1. Required environment variables

Two variables, in addition to everything in `docs/booking-backend.md`
section 1:

```
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_SECRET=
```

- `ADMIN_PASSWORD_HASH` — **secret, bootstrap-only** (see section 6). A
  salted scrypt hash of the admin password, format `<saltHex>:<hashHex>`.
  Read exactly once — the first time anyone reaches the site after
  `supabase/migrations/0002_admin_credentials.sql` is applied — to seed
  the `admin_credentials` table. After that, the table is the live
  source of truth and this variable is never read again; the admin
  changes her password from `/admin/settings`, not by editing this
  variable. Still required for that one-time bootstrap, and still never
  the plaintext password.
- `ADMIN_SESSION_SECRET` — **secret.** Strong random value, at least 32
  characters, used to sign the admin session cookie (HMAC-SHA256). Kept
  separate from `BOOKING_ACTION_SECRET` so rotating one never invalidates
  the other. `src/lib/admin/session.ts` refuses to run with a value
  shorter than 32 characters, the same safety check
  `BOOKING_ACTION_SECRET` gets.

**Neither of these is generated or committed by anyone but you.** Nothing
in this repo, in `.env.example`, or in git history ever contains a real
password, hash, or secret value.

### Generating `ADMIN_PASSWORD_HASH`

Only needed once, for the initial bootstrap (or if you ever need to
force-reset the password directly in Supabase — see section 6). Run this
from a local terminal with Node installed. Opening a plain `node` REPL
and pasting the snippet — rather than passing the password as a
command-line argument — avoids it ever landing in your shell history or
process list:

```
node
```

Then, at the `>` prompt, paste (edit the password on the line before
running):

```js
const { randomBytes, scryptSync } = require("crypto");
const password = "choose-a-strong-password-here";
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(salt.toString("hex") + ":" + hash.toString("hex"));
```

Copy the printed `<saltHex>:<hashHex>` value. Type `.exit` to leave the
REPL, and consider clearing your terminal scrollback afterward since the
plaintext password was visible on screen while you typed it.

### Generating `ADMIN_SESSION_SECRET`

Same command already used for `BOOKING_ACTION_SECRET`:

```
openssl rand -base64 32
```

No `openssl` available (e.g. some Windows setups)? Use Node instead:

```
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Where to set these

- **Local development:** add both to `.env.local` (git-ignored — never
  commit it). Restart `npm run dev` afterward.
- **Vercel:** Project Settings → Environment Variables. Set both for the
  **Production** environment with your real values. If you also use
  Preview deployments, set separate values there too — do not reuse the
  Production password/secret in Preview (same reasoning as the Supabase/
  Resend variables in `docs/booking-backend.md` section 16).

## 2. Applying the database schema

Before `/admin/login` will work, the `admin_credentials` table must
exist. Open your Supabase project → **SQL Editor** → paste the full
contents of `supabase/migrations/0002_admin_credentials.sql` → **Run**.
Idempotent — safe to run again. (This is in addition to
`0001_booking_schema.sql`, which you've already applied.)

## 3. Signing in

Go to `https://<your-domain>/admin`. You'll be redirected to
`/admin/login` if you don't already have a valid session. Enter the admin
password. On success you're redirected to `/admin` and stay signed in for
**7 days** (a signed cookie, not a database session — see "How it works"
below). Use **Log out** (top of every admin page) to end the session
early, e.g. on a shared or public computer.

Wrong password attempts are rate-limited (10 per IP per 10 minutes, via
the same Upstash Redis infrastructure that protects the booking form) —
if you're told to wait, that's this limiter, not a bug.

## 4. Using the dashboard

`/admin` opens on the **Bookings** section: summary cards (pending
requests; confirmed bookings, guests, and value — all scoped to
upcoming/current stays so old completed bookings don't skew the
numbers), filters (Upcoming/Past, All/Pending/Confirmed/Declined), a
search box (name, email, phone), and sort (newest request / upcoming
stay first).

Each row shows status, guest, contact (clickable email and phone, plus a
WhatsApp link), week, guest count, total, and request date. Click
**Details** on a row to reveal country and the customer's message
without cluttering the main table.

- **Pending** bookings show **Approve** and **Reject**. Approve applies
  immediately; **Reject asks you to confirm first** ("Reject booking for
  \<name>?") since the customer is notified by email right away and it
  can't be undone from here.
- **Confirmed** and **Declined** bookings show their resolved status
  instead of action buttons.

**Important — this does not change week availability.** Approving a
booking here does **not** automatically block that week from new
requests; see section 5.

## 5. Managing availability

The **Availability** section lists every upcoming Zenith week
(Monday→Monday, the same generator the public booking page uses — see
`src/lib/weeks.ts`) with its current status:

- **Available** weeks show **Mark unavailable** — this **asks you to
  confirm** ("Mark \<dates> unavailable?") since it immediately removes
  the week from the public booking page.
- **Unavailable** weeks show **Make available** directly (no
  confirmation needed — reopening a week is reversible and low-risk).

If a week has confirmed bookings, you'll see e.g. "2 confirmed bookings ·
5 guests" underneath its status. **This is informational only** — it
never affects availability, and there is no maximum-capacity concept
anywhere in this system. A confirmed booking never marks its own week
unavailable; you decide that separately, here.

**Past weeks aren't shown, by design, not because they're deleted.** The
list is built entirely from `generateWeeks()`, which only ever produces
upcoming weeks — a `blocked_weeks` row for a week that has already
passed simply has nothing to attach to in this UI, so it never appears.
At Zenith's scale (roughly one row per blocked week, a handful a year)
there's no performance reason to delete old rows either, so none are
deleted automatically — they just sit harmlessly in the table, exactly
as historical booking records do.

## 6. Changing your password

**Settings → Security.** Enter your current password, a new password
(minimum 10 characters), and confirm it. On success:

- Your new password is saved (as a scrypt hash — the plaintext is never
  stored).
- **You're signed out and returned to the login page**, with a note
  confirming the change — sign in again with your new password. This
  invalidates every session, including this browser's current one, not
  just other devices. See "Session invalidation" below for how.

If you enter the wrong current password, or the new password and
confirmation don't match, you'll see a clear message and nothing
changes. Password-change attempts are rate-limited the same way login
attempts are.

### Bootstrap: how the first password gets into Supabase

`ADMIN_PASSWORD_HASH` (section 1) seeds the `admin_credentials` table
automatically — there's no manual step beyond applying the migration
(section 2) and having that env var set, which you already do. The very
first time anyone reaches a page that checks the admin session (a login
attempt, or a page load) after the migration is applied,
`src/lib/admin/credentials.ts` finds no row, copies `ADMIN_PASSWORD_HASH`
into one, and never reads the env var again. Since that value is already
a hash (not the plaintext password), no plaintext password ever passes
through this bootstrap, this migration, or any code — the existing
password just keeps working, until you change it from Settings.

### Session invalidation

Every signed session token embeds `admin_credentials.session_version` at
the moment it's issued. Every admin page and action check
(`requireAdminSession()`, `src/lib/admin/dal.ts`) compares the token's
version against the CURRENT stored version — if they don't match (because
the password was changed since that token was issued), the session is
rejected, even though its signature and expiry are both still valid.
Changing your password bumps the stored version AND deletes the current
session cookie outright, so every session — including the one making the
change — is signed out and must log in again with the new password.

This version check deliberately lives in the DAL (`src/lib/admin/dal.ts`),
not in `src/proxy.ts`. Proxy stays a fast, database-free signature/expiry
check (the Next.js authentication guide's "optimistic" layer); the DAL is
the one place that does the extra Supabase read, once per page load or
action — the "secure" layer, per that same guide. Proxy also only ever
applies its redirect-based gating to `GET` requests — every admin
mutation is a Server Action (a POST to the current page's own URL,
`/admin/login` included), and a plain HTTP redirect from Proxy in
response to one of those POSTs breaks the browser's Server Actions
client runtime ("An unexpected response was received from the server").
`requireAdminSession()`'s own `redirect()`, called from *inside* a Server
Action, is the Next.js-correct way to redirect a failed mutation and
doesn't have this problem.

## 7. How it works (for future maintainers)

- **Auth:** one shared admin password (there is no per-user admin
  account system — Zenith Nomads has one admin), stored as a scrypt hash
  in the `admin_credentials` Supabase table (bootstrapped from
  `ADMIN_PASSWORD_HASH` — see section 6), verified and changed via
  `src/lib/admin/credentials.ts`. Session tokens are stateless, HMAC-
  signed (`src/lib/admin/session.ts`, mirroring
  `src/lib/booking/action-token.ts`'s pattern), embed a
  `sessionVersion`, and are stored in an `httpOnly`, `secure` (in
  production), `sameSite=strict` cookie scoped to `/admin`, valid for 7
  days.
- **Route protection:** `src/proxy.ts` — Next.js 16's replacement for
  `middleware.ts` (deprecated in this version; see
  `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`)
  — verifies the session cookie's signature and expiry on every request
  under `/admin/**`. This is an optimistic outer gate; every admin page
  and Server Action also independently calls `requireAdminSession()`
  (`src/lib/admin/dal.ts`), which additionally checks `sessionVersion`
  against Supabase — the one place in this system that check happens.
- **Data access:** all admin reads/writes use the existing service-role
  Supabase client (`src/lib/supabase/server.ts`), server-only, never sent
  to the browser.
- **Shared approval logic:** `src/lib/booking/apply-booking-action.ts` is
  the single implementation of "confirm or decline a pending booking."
  Both the signed email Approve/Reject link
  (`src/app/api/booking-action/route.ts`) and the admin dashboard
  (`src/app/admin/actions.ts`) call it after their own, independent
  authorization check (token vs. session). It never touches
  `blocked_weeks`.
- **Shared availability logic:** `src/lib/availability/blocked-weeks.ts`
  (read) and `manage-blocked-weeks.ts` (write) are used by both the
  public `/api/availability` endpoint and the admin Availability page —
  one definition of "which weeks are blocked," not two.
- **Confirmations:** `src/components/admin/ConfirmSubmitButton.tsx` wraps
  Reject and Mark-unavailable in a native `<dialog>` (focus trap,
  Escape-to-close, backdrop all built into the browser) — no modal
  library.
- **No new dependencies.** Everything above uses `node:crypto`,
  `next/headers`, `next/navigation`, native `<dialog>`/`<details>`, and
  the project's existing Supabase/Resend/Upstash clients.

## 8. Not implemented (by design, for now)

- Multiple admin accounts, roles, or a "who approved this" audit trail.
- Automatic `blocked_weeks` updates from admin actions — see section 5.
- Password reset via email (there's no email identity to reset to — this
  is a single shared credential, not a user account).
- Editing/cancelling bookings from the dashboard (only approve/reject).
