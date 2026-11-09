# Phase 0 — Foundation

Status: Draft
Depends on: —
Build Spec refs: Decisions & stack · Architecture · Site map & routes (route rules) · Content model: collections › users, media · Globals › site-settings · Access control & auth · Media handling · Design system · Accessibility, SEO & performance · Environments, deployment & migrations · Front-end pages (shared pieces, 404)

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

Produce one deployable Next.js app with Payload 3 inside it, running on a Vercel preview. The admin works, photos upload to Blob, and the site header, footer and 404 page read their content from `site-settings`. Every later phase builds on this shell.

## In scope

**App and platform**
- Next.js App Router app with Payload 3 mounted inside it (`payload`, `@payloadcms/next`). The admin lives at `/admin`.
- Payload's REST API is mounted at `/api` for the admin only; the public site never calls it. GraphQL is off.
- Neon Postgres connected through the Vercel Marketplace (`@payloadcms/db-vercel-postgres`, or `@payloadcms/db-postgres` with Neon's pooled connection string).
- Vercel Blob connected through `@payloadcms/storage-vercel-blob`.
- Environment variables, names only: `PAYLOAD_SECRET`, `POSTGRES_URL` (or `DATABASE_URL`), `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SERVER_URL`. Each environment gets its own `PAYLOAD_SECRET`.
- Migrations:
  - Local development uses Payload's push mode.
  - Before merging, a migration is created with `payload migrate:create <name>` against a database that has never used push mode, and committed.
  - The Vercel build command is `payload migrate && next build`.
  - Push mode and migrations are never mixed on the same database.

**Content model** (fields exactly as in the Build Spec)
- `users`:
  - auth collection with a `name` field;
  - `maxLoginAttempts` 5, `lockTime` 15 minutes;
  - no public sign-up, and the first user is created on first run;
  - admin group Admin.
- `media`:
  - uploads stored in Blob with `clientUploads: true`;
  - accepts JPEG, PNG and WebP up to 25 MB;
  - fields: `alt` (required), `caption`, `credit`; focal point on;
  - generated sizes `thumb` 480, `card` 960, `feature` 1,600 and `hero` 2,560 px, as WebP, with the original kept;
  - public read; admin group Library.
- `site-settings` global:
  - every field listed in the Build Spec;
  - versions on, no drafts;
  - public read, editor update;
  - on change, calls `revalidatePath('/', 'layout')`;
  - admin group Settings.
- Access follows the Build Spec access table for these three. Session cookies are HTTP-only, and secure in production.

**Design foundation**
- The first task of the P0 plan is a `[DOCS:design]` task:
  - scaffold `docs/design/` (`/docs init --design`);
  - promote [`handoff/tokens/tokens.css`](../design/reference/creative-portfolio/handoff/tokens/tokens.css) into a canonical `tokens.css` with `/* @primitive */` and `/* @semantic */` layers;
  - list it in the `docs/design/manifest.json` `tokenFiles`, and generate `docs/design/tokens.md` with `/docs update-tokens`.
  - There is one colour scheme only; the Build Spec defines no dark mode. Dark chapter sections are part of it.
- Fonts load with `next/font/google`, `display: swap`: Bebas Neue 400 and Inter 400, 500 and 600.
- At runtime, `site-settings.accent` sets `--gold`, which is used only for booking buttons, progress lines and the finale label.
- Layout rules from "Design system":
  - content max width 1,312 px;
  - side and section padding use the listed `clamp()` values;
  - photos have square corners; buttons are pills.
- `copy.ts` holds all text that is not CMS content.
- `next/image` uses a custom loader that picks the nearest Payload size. The Blob host is added to `images.remotePatterns`. Vercel's image optimisation is never called.

**Components**
- SiteHeader:
  - `dark` tone over openers, `light` tone otherwise;
  - links to Home, Portfolio, About and Journal, plus a booking button labelled with `bookingLabel`;
  - the current page is underlined.
- SiteFooter: name, role line, location, footer links, contact email, socials and footer note.
- ChapterOpener.
- Button variants: gold, ink, outline-ink, outline-light and text link.
- Focus ring: a 2 px ink outline with a 4 px bone ring outside it, visible on light and dark sections. Every link and button is at least 44 × 44 px.
- Mobile header, at 390 px and below:
  - row 1: the logo and the booking pill;
  - row 2: the four links, with a gap of about 24 px;
  - no menu button and no JavaScript;
  - a long site name wraps or is clamped, and never overlaps the pill.

**Pages**
- `not-found.tsx`: an opener reading "Nothing here", with links to Home and Portfolio. Its content comes from `site-settings`.
- The root layout's `generateMetadata` falls back to `site-settings.defaultMeta`, including its `titleTemplate`.

**Seed**
- A seed command that is idempotent, runs with the `disableRevalidate` context, refuses to run against production and never creates users.

## Out of scope

- Resend and email: P3.
- `@payloadcms/plugin-seo` on collections, the draft-mode route and live preview: P1.
- BookingFinale: P1.
- The Studio theme, logo and badge: P5. P0 uses Payload's default admin.
- `sitemap.xml`, `robots.txt` and structured data: P7.
- The Vercel Pro upgrade and the production domain: P7.

## Screens

- Site: [12 404](../design/reference/creative-portfolio/handoff/screens/desktop/12-not-found.png), [40 header](../design/reference/creative-portfolio/handoff/screens/desktop/40-site-header.png), [41 footer](../design/reference/creative-portfolio/handoff/screens/desktop/41-site-footer.png). [43 UI kit](../design/reference/creative-portfolio/handoff/screens/desktop/43-ui-kit.png) is the reference for tokens, type and buttons.
- Mobile header: the decision above replaces the 390 px capture of screen 40 (handoff open question).
- Studio, working in default views only: 20 login, 28 media, 29 site settings, 42 nav.

## Content model

`users`, `media` and `site-settings`, as described in In scope. Field-level detail is in the Build Spec, under "Content model: collections › users", "› media" and "Globals › site-settings".

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/admin/...` | Payload admin. Login is required. |
| `/api/...` | Payload REST API for the admin. It obeys the access table. |
| Any unknown route | 404 page with HTTP status 404 |

## Acceptance criteria

- `/admin` is reachable on a Vercel preview URL. The first user is created on first run, and there is no public sign-up.
- Five failed logins lock the account for 15 minutes.
- **Uploads:**
  - A 15 MB JPEG uploads from the admin straight to Blob, with no 4.5 MB request error.
  - A media doc cannot be saved without alt text.
  - `thumb`, `card`, `feature` and `hero` are generated as WebP, and the original is kept.
  - A 26 MB file is rejected, and so is any file type other than JPEG, PNG and WebP.
- A fresh Neon preview branch is migrated by the build (`payload migrate` runs before `next build`).
- **`site-settings`:**
  - The header, footer and 404 page show its values.
  - Editing `name` or `bookingLabel` updates every page without a redeploy.
  - Changing `accent` changes the booking button colour.
- **Header:**
  - At 320 px and 390 px it shows the two rows, with no horizontal scroll and no overlap with a 30-character site name.
  - All of its targets are at least 44 × 44 px.
- An unknown route returns the 404 page with status 404.
- The public pages make no requests to `/api` or `/graphql`, and `/api/graphql` is not available.
- Image URLs come from the custom loader, which points at the Blob sizes; `/_next/image` is never requested.
- **Tokens:**
  - The canonical `tokens.css` is listed in `tokenFiles`, and `docs/design/tokens.md` has been generated.
  - Components use named tokens and contain no hard-coded colour values.
- Running the seed twice on a fresh database gives one populated `site-settings` and no duplicate media.

## Seed data

`site-settings` with every required field filled in, using the Build Spec's example values as bracketed placeholders, for example "Your Name", "Multidisciplinary creative" and "[City, Country]". `contactEmail` uses a reserved test domain such as `example.com`. If a required field needs an image, the seed adds one placeholder image to `media`.

## Open questions

- **Blocking: region.** Which region should the Vercel functions and the Neon database use? The Build Spec suggests Singapore if most clients are in Southeast Asia, and says to pick where most visitors are. Both must be in the same region.
- **Local database.** Use a Neon dev branch or a local Postgres? The Build Spec allows either; decide in `/pi-plan`.
- **Vercel plan during the build.** The Build Spec requires Pro only before the domain goes live (P7). The owner should confirm that Hobby is acceptable for private previews until then.

## Risks

- **Migrations and Neon pooling.** Running migrations through Neon's pooled connection may fail. Check whether `payload migrate` needs the unpooled URL during the build.
- **Push mode and migrations.** Mixing them on one database corrupts the migration state. Local databases that use push mode must never receive migrations.
- **Shared preview storage.** Preview deployments share one Blob store under the `preview/` prefix, so uploads made from previews pile up there. Cleanup is manual.
- **Payload version.** Payload 3 minor releases can change the admin and adapters. Pin exact versions.
