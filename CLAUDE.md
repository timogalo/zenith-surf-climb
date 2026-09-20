# Zenith Nomads

## Project purpose

Zenith Nomads is a premium Moroccan adventure retreat combining surfing,
climbing, creative workshops, Moroccan culture and community.

## Current phase

Production. This repository is the live Zenith Nomads marketing and booking
website, deployed at **https://zenithnomads.com**. It is not a prototype —
treat existing implemented behavior (booking, pricing, backend integrations)
as approved and load-bearing, not placeholder.

Do not invent missing client information.

## Confirmed client content

Brand name:
Zenith Nomads

Core concept:
Surfing, climbing, creative workshops, Moroccan culture, cuisine and community.

Primary message:
Surf. Climb. Create.

Reference:
Nomad Surf is a visual inspiration only.
Do not copy its layout, code, text, branding or distinctive design elements.

## Current homepage scope

- Navbar
- Hero
- About Zenith
- Surf / Climb / Create
- The Week / programme carousel
- Stay
- Package
- Paradise Valley
- Moroccan Experience
- Gallery
- Booking
- Final CTA
- Footer (with Instagram + WhatsApp contact links)

## Booking system (production)

A real booking-request workflow is implemented — this is not a future task:

- Weeks run **Monday → Monday** (7 nights). Availability is generated
  client-side from the visitor's current date (`src/lib/weeks.ts`).
- Price is **€900 per person**, computed server-side
  (`src/lib/booking/validation.ts`), never trusted from the client.
- There is **no arbitrary guest-count business cap** — `GuestSelector` has no
  configured maximum; a large technical safety ceiling exists purely to
  prevent integer overflow / abuse, and must never be presented to the
  customer as "our capacity."
- Submitting the form creates a **pending booking request** — not a
  confirmed reservation, and **no online payment is taken anywhere on the
  site**.
- The owner reviews and **approves or declines** each request via signed,
  expiring links sent by email (`src/lib/booking/action-token.ts`,
  `src/app/api/booking-action/route.ts`, `src/app/booking/action/**`).
- **Only `blocked_weeks` controls availability.** A confirmed booking does
  **not** automatically block its week — the owner manages `blocked_weeks`
  separately. Do not change this behavior without an explicit client
  decision; see `docs/booking-backend.md` for the full rationale.

## Production backend

- **Supabase** (service-role, server-only) is the database for `bookings`
  and `blocked_weeks`, with RLS enabled and no anon/authenticated policies —
  all access goes through this app's own API routes.
- **Resend** sends transactional email (owner notification, customer
  confirmation, customer decline) from `bookings@zenithnomads.com`.
- **Upstash Redis** provides distributed rate limiting on booking creation
  and approve/reject actions; it fails open (never blocks legitimate use) if
  unconfigured.
- See `.env.example` and `docs/booking-backend.md` for the full environment
  variable contract. Never print or commit secret values.

## Design direction

Modern editorial outdoor design with Moroccan warmth.

The website should feel:
- adventurous
- authentic
- creative
- premium
- warm
- spacious
- modern

Avoid:
- generic hotel templates
- excessive boho styling
- glassmorphism
- neumorphism
- excessive gradients
- excessive animation
- generic AI-looking card layouts

## Colors

Ocean Navy:
#102A43

Warm Sand:
#D9C3A5

Terracotta:
#C76B44

Warm White:
#F8F7F3

Charcoal:
#1B1B1B

White:
#FFFFFF

## Typography

Headings:
Space Grotesk

Body:
Inter

Editorial accent:
Cormorant Garamond Italic

Use the accent font sparingly.

## Layout

- Large photography
- Strong typography
- Generous whitespace
- Editorial image composition
- Alternating light and dark sections
- Mobile-first responsive behavior

## Spacing scale

8
16
24
32
48
64
80
96
128

## Development stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase, Resend, Upstash (booking backend)

Additional dependencies must not be added without approval.

## Coding rules

- Use strict TypeScript.
- Do not use `any`.
- Prefer server components unless client-side behavior is required.
- Keep components small and reusable.
- Use semantic HTML.
- Maintain accessibility.
- Add meaningful alt text.
- Avoid unnecessary dependencies.
- Do not modify unrelated files.
- Do not invent client facts.
- Keep placeholder content clearly identified internally.
- Run lint and build after meaningful changes.
- Never print or commit secret/environment variable values.

## Known content risks (internal — not for client-facing copy)

- The Moroccan Experience section (`src/data/content.ts` → `morocco`) has no
  dedicated cuisine/traditions/community photography. It reuses a general
  location/courtyard photo also used elsewhere; the layout keeps it
  small/secondary rather than presenting it as documentary proof of cuisine
  or traditions. Replace with dedicated Moroccan culture photography once
  the client provides it, and update alt text accordingly.

## Workflow

Before implementation:

1. Inspect relevant files.
2. Explain the proposed changes.
3. List files that will be created or modified.
4. Wait for approval if requested.

After implementation:

1. Run lint.
2. Run build.
3. Summarize changed files.
4. Mention any remaining issues.

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
