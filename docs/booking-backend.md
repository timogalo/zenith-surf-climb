# Booking backend (Supabase + Resend)

Status: booking requests are persisted, availability is real, and all
authoritative values (price, total, status, dates) are calculated
server-side (**Phase 1**). The owner is now emailed on every new request
with signed Approve/Reject links, and the customer is emailed once the
owner acts (**Phase 2**). Rate limiting, a honeypot, request-size limits,
and stricter secret validation harden the public-facing endpoints against
abuse (**Phase 3**). There is still no admin dashboard, no CAPTCHA, and no
capacity logic — everything owner-facing happens by email or directly in
Supabase.

## 1. Required environment variables

Copy `.env.example` to `.env.local` and fill in real values.

**Supabase** (Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL` — your project URL. Public, safe to expose.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the public anon key. Not used by any
  code yet (the browser never talks to Supabase directly), but documented
  now for whenever client-side access is genuinely needed.
- `SUPABASE_SERVICE_ROLE_KEY` — **secret.** Grants full access, bypassing
  Row Level Security. Only ever read by `src/lib/supabase/server.ts`,
  which is only ever imported from API route handlers
  (`src/app/api/**/route.ts`). Never commit this value; `.env.local` is
  git-ignored.

**Resend / booking actions** (Phase 2):

```
RESEND_API_KEY=
BOOKING_OWNER_EMAIL=
BOOKING_ACTION_SECRET=
NEXT_PUBLIC_SITE_URL=
BOOKING_FROM_EMAIL=
```

- `RESEND_API_KEY` — **secret.** From resend.com/api-keys. Only ever read
  by `src/lib/email/resend.ts`, called only from server routes.
- `BOOKING_OWNER_EMAIL` — the real inbox that receives new-booking
  notifications (with Approve/Reject links) and stays the source of truth
  for pending requests until an admin dashboard exists.
- `BOOKING_ACTION_SECRET` — **secret.** Strong random value used to sign
  Approve/Reject links (HMAC-SHA256). Generate one with, e.g.
  `openssl rand -base64 32`. **Must be at least 32 characters** —
  `src/lib/booking/action-token.ts` refuses to sign/verify tokens
  otherwise, so a weak value fails safely instead of quietly working.
  Rotating it invalidates every outstanding (unclicked) action link —
  that's expected, not a bug.
- `NEXT_PUBLIC_SITE_URL` — canonical site URL used to build the action
  links embedded in owner emails, e.g. `http://localhost:3000` locally, no
  trailing slash. This is a public value (it's what visitors already see
  in their address bar) but is only actually read server-side today.
- `BOOKING_FROM_EMAIL` — **optional.** Overrides the sender for all
  transactional booking emails. `zenithnomads.com` is now verified in
  Resend, so leaving this unset already defaults to
  `Zenith Nomads <bookings@zenithnomads.com>` (see
  `src/lib/email/resend.ts`) — only set this if you need a different
  sender for some reason (see below).

**Rate limiting** (Phase 3, optional but recommended):

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — REST credentials
  for an Upstash Redis database, used by `src/lib/rate-limit/upstash.ts`.
  **If either is missing, rate limiting is silently skipped** (fails
  open) rather than blocking the booking form — see "Rate limiting" below
  for why, and for what this means for testing.

Restart `npm run dev` after editing `.env.local` — Next.js only reads env
files on server start.

## 2. Resend setup

1. Create a Resend account and an API key (resend.com/api-keys) → put it
   in `RESEND_API_KEY`.
2. **Sender domain:** `zenithnomads.com` is verified in Resend. The default
   sender (`src/lib/email/resend.ts`, used whenever `BOOKING_FROM_EMAIL` is
   unset) is `Zenith Nomads <bookings@zenithnomads.com>`, which delivers
   normally to any recipient — no further setup needed. If you ever need a
   different sender (e.g. Resend's shared testing sender,
   `onboarding@resend.dev`, for local testing without emailing real
   inboxes — note it only delivers to the email address your Resend
   account itself is registered with), set `BOOKING_FROM_EMAIL` to
   override it.
3. Set `BOOKING_OWNER_EMAIL` to wherever new-booking notifications should
   land.

## 3. Applying the database schema

Unchanged from Phase 1 — no schema changes were needed for Phase 2 (see
"Why no new table", below). The schema lives at
`supabase/migrations/0001_booking_schema.sql`.

**Easiest path (no CLI needed):** open your Supabase project → **SQL
Editor** → paste the full contents of that file → **Run**.

**If you use the Supabase CLI** and have it linked to this project:

```
supabase db push
```

The migration is idempotent (`create table if not exists`, `create index
if not exists`, etc.) — running it again is safe.

## 4. Manually blocking a week

There's no admin UI yet. Block a week directly in the Supabase SQL editor
or table editor. `start_date` must be a Monday; `end_date` must be exactly
7 days later:

```sql
insert into blocked_weeks (start_date, end_date, reason)
values ('2026-10-12', '2026-10-19', 'Owner unavailable');
```

The booking API re-validates this at submission time regardless of what
the browser last fetched, so a week blocked while someone has the page
open will still be rejected if they try to submit it.

**Approving a booking never does this automatically** — see "No
blocked_weeks side effects" below.

## 5. Unblocking a week

```sql
delete from blocked_weeks where start_date = '2026-10-12';
```

## 6. Approving / declining a booking

**Normal path:** the owner email for each new request (sent to
`BOOKING_OWNER_EMAIL`) contains an **Approve** and a **Reject** button.
Clicking one opens a minimal Zenith-branded confirmation page
(`/booking/action?token=...`) showing the customer, week, and guest count;
submitting that page's button is what actually changes the status and
emails the customer. Opening the link alone (e.g. an email client's
preview scanner) never changes anything — only the POST does.

**Manual fallback**, e.g. if an email was never delivered — inspect and
update directly:

```sql
select id, start_date, end_date, guests, total_price, full_name, email,
       phone, status, created_at
from bookings
order by created_at desc;

update bookings set status = 'confirmed' where id = '...' and status = 'pending';
update bookings set status = 'declined'  where id = '...' and status = 'pending';
```

Note the manual path does **not** send the customer their confirmation/
decline email — that only happens through the `/api/booking-action` POST
route. If you update status by hand, consider emailing the customer
yourself.

`status` only ever moves `pending → confirmed` or `pending → declined`
(see "Status transition rules" below) — the database CHECK constraint
also rejects any value outside `pending`/`confirmed`/`declined`/
`cancelled`, and no API route ever accepts a client-supplied status.

## 7. Status transition rules

- New booking: always `pending`.
- Allowed: `pending → confirmed`, `pending → declined`.
- Not allowed, and not built: `confirmed → declined`, `declined →
  confirmed`, or any transition starting from `cancelled` — clicking an
  action link for a booking that isn't `pending` anymore shows "This
  booking has already been processed." and changes nothing.
- The update in `POST /api/booking-action` is conditional —
  `update ... where id = ... and status = 'pending'` — and only proceeds
  if exactly one row was actually changed. This is what makes two clicks
  on the same link (or two tabs) safe without any extra locking: the
  second request simply matches zero rows.

## 8. No blocked_weeks side effects (critical)

**Approving or declining a booking never touches `blocked_weeks`.**
Multiple confirmed bookings can and will coexist for the same
Monday-to-Monday week — that is expected, not a bug. `blocked_weeks`
remains a separate, owner-controlled mechanism (steps 4–5 above) and
nothing in the approve/decline code path inserts, updates, or deletes
from it.

**Capacity is still undefined.** There is no max-guests-per-week or
max-bookings-per-week limit anywhere in this codebase, and none should be
assumed. A future capacity feature may sum `guests` across `confirmed`
bookings for a given `start_date`, but that logic does not exist yet and
must not be guessed at — it needs an explicit number from the owner first.

## 9. Action link / token details

Approve/Reject links are stateless and signed, not stored in the
database — no new table was needed (see below). The token
(`src/lib/booking/action-token.ts`) is:

```
base64url(JSON.stringify({ bookingId, action, expiresAt })) + "." + base64url(HMAC-SHA256(payload, BOOKING_ACTION_SECRET))
```

- `action` is only ever `"confirm"` or `"decline"` — the browser can never
  supply an arbitrary status; the API route derives `confirmed`/`declined`
  entirely from the verified token.
- Contains no customer PII — only the booking id, the action, and an
  expiry.
- Expires 7 days after the booking was created; an expired or
  tampered-with token is rejected before the database is even queried.
- Signature comparison uses Node's `crypto.timingSafeEqual`.

**Why no new table:** a signed, expiring token is sufficient to make the
link tamper-evident and single-purpose; the token doesn't need to be
looked up anywhere. The *booking row itself* is what prevents replay in
any meaningful way — once its status leaves `pending`, the conditional
update means the same link can never apply a second time. If a real
audit trail (who clicked what, when) is ever needed, that's a deliberate
future addition, not something built speculatively here.

## 10. Email failure behavior

Both notification emails (owner, on new booking; customer, on
approve/decline) are **best-effort and sent only after** the database
write they describe has already succeeded:

- If the booking insert succeeds but the owner email fails to send, the
  booking is still created and `POST /api/bookings` still returns success
  to the customer — the database row is the source of truth, and a
  Resend/config problem must never make an already-saved request look
  like it failed. The failure is logged server-side only.
- If the status update (`pending → confirmed`/`declined`) succeeds but the
  customer email fails, the status change is **not** rolled back. The
  action result page still says "Booking confirmed."/"Booking declined."
  but adds a restrained note that the customer email could not be sent, so
  the owner knows to follow up directly.
- No Resend error details, API keys, or stack traces are ever shown to a
  browser — only safe, generic messages; real errors go to
  `console.error` only.

## 11. Rate limiting

`POST /api/bookings` and `POST /api/booking-action` are rate-limited via
Upstash Redis (`src/lib/rate-limit/upstash.ts`) — a plain in-memory counter
would be useless here since this runs on Vercel's serverless platform,
where each invocation can be a different process with no shared memory.

- **Booking creation:** 5 submissions per IP per 10 minutes.
- **Booking actions (approve/decline):** 30 per IP per 10 minutes — far
  more generous, since the signed token is the real authorization check
  here; this only guards against obvious automated hammering and must not
  make legitimate owner clicks flaky.
- Exceeding the limit returns `429` with the standard JSON error shape and
  a `Retry-After` header (bookings only; the action route redirects to a
  generic "invalid link" result page instead, since it's a browser
  navigation, not a JSON API call).
- IP is read from `x-real-ip` / `x-forwarded-for`, which Vercel's edge
  network sets on every request — not blindly trusted client input. See
  `src/lib/rate-limit/client-ip.ts` for the trust assumption and what
  would need re-checking on a non-Vercel deployment.
- **If `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` aren't set, rate
  limiting is silently skipped (fails open)** — a missing/misconfigured
  anti-abuse layer must never take the booking form itself down. A warning
  is logged once per server instance so this isn't silently forgotten.
  **This means rate limiting is NOT active until you configure Upstash —
  see "Production deployment" below.**

Setup: create a free Upstash Redis database (upstash.com → Create
Database → choose the REST/Global type), copy its REST URL and token from
the dashboard into `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
No schema or table is needed — `@upstash/ratelimit` manages its own keys.

## 12. Honeypot

The booking form includes one hidden field (`website`, rendered in
`src/components/sections/Booking.tsx`) that real visitors never see or
reach — it's positioned off-screen, marked `aria-hidden="true"`, and
removed from the tab order (`tabIndex={-1}`), so it has no effect on
keyboard or screen-reader users. A simple bot that fills every `<input>`
it finds in the DOM will fill it anyway.

If `POST /api/bookings` receives a non-empty `website` field, it's
rejected with the *same generic 400 response* used for any other
validation failure — deliberately not a distinct "bot detected" error, so
a scripted submission can't learn which field tripped the check. No
booking row is created, and no owner email is sent.

This is a secondary layer, not the primary defense — rate limiting and
server-side field validation matter more. There is no CAPTCHA/Turnstile in
this phase.

## 13. Guest count technical safety ceiling

`guests` is capped at 500 in `src/lib/booking/validation.ts`
(`MAX_GUESTS_TECHNICAL_LIMIT`). **This is not Zenith's capacity limit** —
real per-week capacity is still undefined (see section 8) and this number
must never be presented to a customer as a maximum group size. It exists
purely so an absurd value (e.g. a scripted `guests: 999999999`) can't
overflow the `bookings.guests` / `bookings.total_price` Postgres `integer`
columns (max ≈2.147 billion) and turn into an ugly `500` instead of a
clean validation error. 500 guests is already far beyond any realistic
booking and comfortably below the overflow point.

## 14. Request body size limits

Both `POST /api/bookings` (10KB) and `POST /api/booking-action` (2KB)
reject requests whose `Content-Length` header exceeds a small limit,
*before* parsing the body (`src/lib/api/body-size.ts`), returning `413`.
Both limits are comfortably above any legitimate payload for these
endpoints (a filled-out booking form is well under 3KB; an action token
is a few hundred bytes) and small enough to block multi-megabyte abuse.

A request sent without `Content-Length` (e.g. chunked transfer-encoding)
skips this specific guard — the existing per-field length validation in
`src/lib/booking/validation.ts` still protects every field regardless of
how the body arrived.

## 15. Not implemented yet

By design, this project does **not** include:

- Admin login or dashboard
- Payments (Stripe or otherwise)
- Cancellation workflow / links
- Capacity thresholds or automatic blocking based on approved guest counts
- Booking modification
- Reminder emails or calendar sync
- CAPTCHA / Turnstile (the honeypot in section 12 is the only bot
  deterrent so far)

## 16. Production deployment

**Vercel Production and Preview environments must be configured
separately** — do not assume the same values are safe in both:

- If a Preview deployment (e.g. for a pull request) uses the **same**
  Supabase project, Resend API key, and `BOOKING_OWNER_EMAIL` as
  Production, then testing the booking form on that preview URL creates
  **real rows in the production `bookings` table** and sends **real
  emails** to the real owner and to whatever email address the tester
  typed in. Use a separate Supabase project (or at least a separate
  `BOOKING_OWNER_EMAIL`) for Preview before sharing preview links widely.
- Set all of the following to their real **production** values in
  Vercel's Production environment specifically (Project Settings →
  Environment Variables, scoped to Production): `NEXT_PUBLIC_SITE_URL`
  (the final `https://` domain — action links are built from this at
  send-time and won't retroactively fix already-sent emails if the domain
  changes later), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY`, `BOOKING_OWNER_EMAIL`, `BOOKING_ACTION_SECRET`.
- If rate limiting is enabled, also set `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN` for Production. Without them, `POST
  /api/bookings` and `POST /api/booking-action` still work correctly —
  they just aren't rate-limited (see section 11).
- `NEXT_PUBLIC_SITE_URL` must be `https://` in production — action links
  embed this value directly, and an `http://` link would send the signed
  token over plaintext.
- None of this is committed anywhere — `.env.example` documents variable
  *names* only, never real values, and `.env.local` stays git-ignored.

## Architecture summary

```
Browser (Booking.tsx)
  → GET  /api/availability     (public: returns only blocked start dates)
  → POST /api/bookings          (size guard → rate limit → honeypot check →
                                  validates (incl. guest safety ceiling) →
                                  re-checks availability → inserts → then
                                  best-effort emails the owner with signed
                                  Approve/Reject links)
      ↓
  src/lib/supabase/server.ts    (service-role client, server-only)
      ↓
  Supabase (RLS enabled, no anon/authenticated policies — default-deny)

Owner email → GET  /booking/action?token=...   (verify + show, no mutation)
            → POST /api/booking-action         (size guard → rate limit →
                                                 verify token again →
                                                 conditional
                                                 pending→confirmed/declined
                                                 update → best-effort emails
                                                 the customer)
            → redirect to /booking/action/result
```

The browser never holds Supabase or Resend credentials and never queries
Supabase directly. Both tables have Row Level Security enabled with **no
policies** for the `anon`/`authenticated` roles, so all client access is
denied by default; only the service-role server client (which bypasses
RLS entirely, by design) can read or write.
