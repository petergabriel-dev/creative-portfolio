---
id: ADR-0001
title: Next.js + Payload 3 on Vercel with Neon, Blob and Resend
status: Active
date: 2026-11-10
readWhen: choosing a library or service; touching config, env vars, deploys, migrations, media or email
---

# ADR-0001: Next.js + Payload 3 on Vercel with Neon, Blob and Resend

## Decision

- **App:**
  - One Next.js App Router app with Payload 3 inside it (`payload`, `@payloadcms/next`).
  - Public pages are Server Components that read content through Payload's Local API.
  - The admin lives at `/admin`. The REST API at `/api` serves the admin only, and GraphQL is off.
- **Database:** Neon Postgres, through `@payloadcms/db-vercel-postgres`, or `@payloadcms/db-postgres` with Neon's pooled connection string.
  - Schema changes ship as committed migrations.
  - The Vercel build command is `payload migrate && next build`.
- **Media:** Vercel Blob, through `@payloadcms/storage-vercel-blob` with `clientUploads: true`.
  - Images are served through `next/image` with a custom loader that picks the nearest Payload size.
  - Vercel's image optimisation is not used.
- **Email:** Resend, through `@payloadcms/email-resend`. It sends the new-inquiry alert and the admin password resets.
- **Content tools:**
  - `@payloadcms/plugin-seo` provides the SEO fields;
  - Lexical rich text is used only in the Text story block;
  - video is limited to Vimeo and YouTube embeds, and no video files are stored.
- **Hosting:** Vercel, upgraded to the Pro plan before the domain goes live.
- **Optional:** Upstash rate limiting, only if the honeypot proves insufficient.

## Why

- **Payload:** custom-feeling and code-first, without having to build auth, uploads and versioning. Set aside: a fully custom build, Sanity, Strapi and Git-based tools. (Build Spec decision log.)
- **Neon:** preview-database branching and stricter relational integrity. Set aside: MongoDB Atlas.
- **Vercel:** the owner's choice, and a native fit for Next.js.
- **One deployment:** the pages, the Book Me server action and the admin share one app and one Local API. Only data, files and email live in outside services.

## Affects

Docs:

- `docs/design/reference/creative-portfolio/build-spec.md` (Decisions & stack · Architecture · Environments, deployment & migrations)
- `docs/specs/phase-0-foundation.md`
- `docs/specs/phase-3-book-me.md`
- `docs/specs/phase-7-launch.md`

Code:

- None yet. Phase 0 creates the app.

## Consequences

- Good: one deploy and no separate API server. Pages are rendered statically and refreshed on demand when content is published.
- Good: Neon preview branches give each preview deployment its own database.
- Good: uploads go straight from the browser to Blob, which avoids Vercel's 4.5 MB request-body limit.
- Bad/risk: the Vercel Pro plan is a recurring cost before launch, and needs the owner's approval.
- Bad/risk: Payload's push mode and migrations must never be mixed on the same database.
- Bad/risk: the admin customisations depend on Payload's component API, so Payload versions must be pinned and re-tested on upgrade.
- Bad/risk: a custom image loader is required, because Vercel image optimisation is capped on Hobby and billed by usage on Pro.

## Read when

- Adding a dependency or an outside service.
- Changing env vars, the build command, migrations or the database adapter.
- Touching media storage, image delivery or email.

## Supersedes

- None
