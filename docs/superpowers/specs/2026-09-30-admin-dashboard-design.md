# Admin dashboard — design

Status: Approved by client (2026-09-30). Ready for implementation.

## Purpose

Give Adriana (the Zenith Nomads owner) a private `/admin` area to view all
booking requests and approve/reject pending ones, without opening Supabase
directly. Replaces the "manual fallback via SQL" path documented in
`docs/booking-backend.md` section 6 as the day-to-day workflow; that SQL
fallback still exists as a last resort.

## Non-goals (explicitly out of scope)

- Multi-user admin accounts, roles, or an audit trail of who clicked what.
- Any change to `blocked_weeks` behavior — approving a booking must not
  auto-block the week. That business-logic question is deliberately
  deferred to a separate future decision (per client instruction #7).
- Payments, cancellation, capacity limits — unchanged, out of scope.
- Redesigning the public marketing site.
- Any new npm dependency. Everything is built from `node:crypto`,
  `next/headers`, and existing project libraries.

## Architecture

### Auth: single shared admin password, stateless signed session

- `ADMIN_PASSWORD_HASH` (env, secret): `scrypt` hash of the shared admin
  password, stored as `<saltHex>:<hashHex>`. Verified with
  `node:crypto.scryptSync` + `timingSafeEqual` — same tamper-evident
  comparison pattern already used in `src/lib/booking/action-token.ts`.
- `ADMIN_SESSION_SECRET` (env, secret, ≥32 chars, same validation style as
  `BOOKING_ACTION_SECRET`): HMAC-SHA256 signs a stateless session token
  carried in a cookie. Kept separate from `BOOKING_ACTION_SECRET` so
  rotating one never invalidates the other.
- Session token payload: `{ issuedAt, expiresAt }` (no PII). Format
  mirrors `action-token.ts`: `base64url(JSON payload).base64url(HMAC)`.
- **Lifetime: 7 days** (per client instruction #8 — adjusted up from the
  originally proposed 12h).
- Cookie `admin_session`: `httpOnly`, `secure` in production, `sameSite:
  "strict"`, `path: "/admin"`, `maxAge` matching the 7-day token expiry.
  Expiry is enforced cryptographically (inside the verified payload), not
  just by the cookie's own `Max-Age`.
- `src/proxy.ts` (Next.js 16 convention — **not** `middleware.ts`, which is
  deprecated in this version) matches `/admin/:path*` and
  `/api/admin/:path*`, verifies the session cookie, and redirects
  unauthenticated requests to `/admin/login` (and authenticated requests
  away from `/admin/login` to `/admin`). Proxy runs on the Node.js runtime
  in Next 16 (not Edge), so it can call `node:crypto` directly — confirmed
  against `node_modules/next/dist/docs/01-app/02-guides/upgrading/
  version-16.md`.
- Defense in depth: every admin Server Component/Server Action/Route
  Handler also calls `requireAdminSession()` directly (the Next.js-
  recommended DAL pattern) rather than trusting Proxy alone.

### Shared approval/rejection logic

Extract the core of today's `POST /api/booking-action` — the conditional
`pending → confirmed/declined` update plus the best-effort customer email
— into `src/lib/booking/apply-booking-action.ts`. Both callers use it
unchanged:

- The existing signed-token email flow (`POST /api/booking-action`),
  after verifying the HMAC token.
- The new admin flow (a Server Action), after verifying the admin
  session.

Neither caller touches `blocked_weeks`. The conditional
`.eq("status","pending")` update is what already makes double-approval
(two tabs, two clicks) safe, and both callers get that for free from the
shared function.

### Data access

No schema changes. The admin dashboard reads `bookings` via the existing
`getSupabaseServerClient()` service-role client (`select * order by
created_at desc`), server-only, same RLS posture (RLS on, zero
anon/authenticated policies). The browser never talks to Supabase
directly, exactly as today.

### UI

- `/admin/login` — password-only form, Server Action, generic error
  message on failure, rate-limited.
- `/admin` — dashboard. Desktop: table. Mobile: stacked cards (no
  horizontal scrolling mess). Every booking shows: name, email, phone/
  WhatsApp, country, week (formatted range), guests, price/person, total
  price, message, status, created date/time.
- Status is visually distinct: Pending / Confirmed / Rejected each get a
  clearly different badge treatment using existing brand colors (ocean
  navy / terracotta / warm sand / charcoal — no new palette).
- Approve/Reject buttons appear only on `pending` rows. Processed rows
  show their resolved status, not stale/misleading action buttons.
- Logout button, visible on every admin page.
- Visual language reuses existing tokens (`font-heading`/`font-body`,
  brand colors, spacing scale) from the public site — no new design
  system, per client instruction #14.
- `/admin/**` gets `robots: { index: false, follow: false }`, same
  pattern as `/booking/action`.

## New environment variables

| Variable | Secret? | Purpose |
|---|---|---|
| `ADMIN_PASSWORD_HASH` | yes | scrypt hash of the admin password, `salt:hash` |
| `ADMIN_SESSION_SECRET` | yes | HMAC key for signing admin session cookies |

Neither is generated or committed by Claude — see the report for exact
client-run commands.

## Files (planned)

New:
- `src/proxy.ts`
- `src/lib/admin/session.ts`
- `src/lib/admin/auth.ts`
- `src/lib/admin/dal.ts`
- `src/lib/booking/apply-booking-action.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/login/actions.ts`
- `src/app/admin/layout.tsx` (noindex metadata, shared shell)
- `src/app/admin/page.tsx`
- `src/app/admin/actions.ts`
- `src/components/admin/BookingsList.tsx`
- `src/components/admin/StatusBadge.tsx`
- `src/components/admin/LogoutButton.tsx`

Modified:
- `src/app/api/booking-action/route.ts` (delegate to the extracted
  shared function — behavior-preserving)
- `src/lib/rate-limit/upstash.ts` (add `adminLogin` limiter)
- `.env.example` (document the two new variable names, no values)
- `docs/booking-backend.md` (update "not implemented yet" list, note the
  admin path, cross-reference the new admin doc)

New doc:
- `docs/admin-dashboard.md` — setup + operating instructions for Adriana
  and for future maintainers.

## Security considerations

- Brute force: `adminLogin` rate limiter (existing Upstash
  infrastructure, fails open if unconfigured, same as `bookingCreate`/
  `bookingAction`).
- Timing attacks: `timingSafeEqual` for both the password hash compare
  and the session HMAC compare (matches existing `action-token.ts`).
- Forged/expired sessions: rejected by signature or expiry check before
  any Supabase call.
- Secrets never reach the browser: admin pages are Server
  Components/Server Actions/Route Handlers only.
- CSRF: admin mutations are Next.js Server Actions (POST-only, same-
  origin enforced by the framework), not hand-built cross-origin-callable
  endpoints.
- No behavior change to the existing owner/customer email flow.

## Self-review notes

- No placeholders remain; every file in the "Files" list has a defined
  responsibility.
- Scope is a single implementation pass — no decomposition needed.
- Ambiguity resolved: session lifetime is 7 days (client instruction #8,
  overriding the original 12h proposal); `blocked_weeks` behavior is
  explicitly frozen (client instruction #7).
