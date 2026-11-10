---
id: ADR-0001
title: Next.js + Payload 3 on Vercel with Neon, Blob and Resend
status: Active
date: 2026-11-10
updated: 2026-11-10
readWhen: choosing a library or service; touching config, env vars, deploys, migrations, media or email
---

# ADR-0001: Next.js + Payload 3 on Vercel with Neon, Blob and Resend

## Decision

- **App:**
  - One Next.js App Router app with Payload 3 inside it (`payload`, `@payloadcms/next`).
  - Public pages are Server Components that read content through Payload's Local API.
  - The admin lives at `/admin`. The REST API at `/api` serves the admin only, and GraphQL is off.
- **Database:** Neon Postgres through `@payloadcms/db-postgres`, connected with `POSTGRES_URL` (Neon's pooled connection string; migrations work over it). `@payloadcms/db-vercel-postgres` was not used.
  - Schema changes ship as committed migrations.
  - The Vercel build command is `payload migrate && next build`.
  - Neon is connected to the Vercel **Production and Preview** environments only. Every preview deployment gets its own Neon branch.
  - **Local development uses Docker Postgres** (`docker-compose.yml`), never Neon. Payload's push mode is enabled only for a localhost database URL.
- **Media:** Vercel Blob, through `@payloadcms/storage-vercel-blob` with `clientUploads: true`.
  - Images are served through `next/image` with a custom loader that picks the nearest Payload size.
  - Vercel's image optimisation is not used.
- **Email:** Resend, through `@payloadcms/email-resend`. It sends the new-inquiry alert and the admin password resets.
- **Content tools:**
  - `@payloadcms/plugin-seo` provides the SEO fields;
  - Lexical rich text is used only in the Text story block;
  - video is limited to Vimeo and YouTube embeds, and no video files are stored.
- **Hosting:** Vercel on the **Hobby** plan throughout, including after launch.
- **Region:** Singapore. Vercel functions in `sin1`, Neon in `aws-ap-southeast-1`, and the Blob store in `sin1`.
- **Optional:** Upstash rate limiting, only if the honeypot proves insufficient.

## Why

- **Payload:** custom-feeling and code-first, without having to build auth, uploads and versioning. Set aside: a fully custom build, Sanity, Strapi and Git-based tools. (Build Spec decision log.)
- **Neon:** preview-database branching and stricter relational integrity. Set aside: MongoDB Atlas.
- **Vercel:** the owner's choice, and a native fit for Next.js.
- **Hobby:** the owner chose not to spend on Vercel Pro (2026-11-10).
- **Singapore:** where most visitors and clients are expected; functions and database must share a region.
- **Docker Postgres locally:** offline, fast and free. It keeps push mode away from Neon and uses none of the Neon Free plan's 10 branches.
- **`@payloadcms/db-postgres`:** the plain `pg` adapter works the same against Docker and Neon's pooled URL.
- **One deployment:** the pages, the Book Me server action and the admin share one app and one Local API. Only data, files and email live in outside services.

## Affects

Docs:

- `docs/design/reference/creative-portfolio/build-spec.md` (Decisions & stack · Architecture · Environments, deployment & migrations)
- `docs/specs/phase-0-foundation.md`
- `docs/specs/phase-3-book-me.md`
- `docs/specs/phase-7-launch.md`

- `docs/engineering/dev-workflow.md`
- `docs/engineering/architecture.md`

Code:

- `src/payload.config.ts`
- `vercel.json`
- `docker-compose.yml`
- `next.config.ts`
- `src/collections/Media.ts`

## Consequences

- Good: one deploy and no separate API server. Pages are rendered statically and refreshed on demand when content is published.
- Good: Neon preview branches give each preview deployment its own database.
- Good: uploads go straight from the browser to Blob, which avoids Vercel's 4.5 MB request-body limit.
- Bad/risk: the Build Spec notes that Hobby is for non-commercial use and that a portfolio advertising services may count as commercial. Re-check Vercel's terms before P7 go-live; a paid plan would need the owner's approval.
- Bad/risk: the Neon Free plan allows 10 branches, so old preview deployments must be cleaned up by hand when previews start failing.
- Bad/risk: Payload's push mode and migrations must never be mixed on the same database.
- Bad/risk: the admin customisations depend on Payload's component API, so Payload versions must be pinned and re-tested on upgrade.
- Bad/risk: a custom image loader is required, because Vercel image optimisation is capped on Hobby and billed by usage on Pro.

## Read when

- Adding a dependency or an outside service.
- Changing env vars, the build command, migrations or the database adapter.
- Touching media storage, image delivery or email.

## Supersedes

- None

## History

- 2026-11-10: created from the Build Spec stack.
- 2026-11-10 (Phase 0, owner decisions): Vercel stays on Hobby, replacing "upgraded to the Pro plan before the domain goes live"; region set to Singapore; `@payloadcms/db-postgres` chosen; local development on Docker Postgres; Neon limited to Production and Preview.
