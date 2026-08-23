# Zenith Surf & Climb

## Project purpose

Zenith Surf & Climb is a premium Moroccan adventure retreat website combining surfing, climbing, creative workshops, Moroccan culture and community.

This repository currently contains the first visual prototype for client review.

## Current phase

Prototype v0.1

The goal is to create a polished homepage that communicates the visual direction of the project.

Do not invent missing client information.

## Confirmed client content

Brand name:
Zenith Surf & Climb

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
- Moroccan Experience
- Gallery
- Final CTA
- Footer

Do not implement yet:
- prices
- packages
- accommodation details
- online booking
- payments
- final FAQ
- legal pages

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

## Known content risks (internal — not for client-facing copy)

- The Surf / Climb / Create section (`src/data/content.ts` → `experiences`) reuses the four general location photos in `public/images/location/` — there is no dedicated per-pillar (surf/climb/create-specific) photography yet. `zenith-coast-03.JPG` is shared between the About section and the Climb block for the same reason.
- The Moroccan Experience section (`src/data/content.ts` → `morocco`) has no dedicated cuisine/traditions/community photography available. It reuses `zenith-morocco-location-01.JPG` (courtyard/riad architecture) — the same image already used in the Experiences → Create block. This is now used in two sections; the layout keeps it small/secondary rather than presenting it as documentary proof of cuisine or traditions, but it should be replaced with dedicated Moroccan culture photography once the client provides it.
- `public/images/location/` currently contains only 4 unique client photos, and all 4 are now in active use across Hero, About, Experiences, Morocco and Gallery. The Gallery section (`src/data/content.ts` → `gallery`) reuses all four rather than introducing new material, since no additional licensed photography exists. The homepage is fully out of unique imagery — any further sections needing photography (Final CTA, Footer) will need either new client assets or a non-photographic treatment.
- Replace with confirmed, pillar-specific client photography once available, and update alt text accordingly.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
