# Phase 0 — Foundation

Status: Done
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
  - Local development uses Payload's push mode, on the Docker Postgres database only (push is enabled only for localhost database URLs).
  - Before merging, a migration is created with `payload migrate:create <name>` and committed. It diffs the committed schema snapshot, not a database, and never pushes.
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
- The `[DOCS:design]` task is the first task after the scaffold and CI task (owner decision, 2026-11-10: nothing can merge into `dev` before CI exists) and comes before any component work:
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
  - Changing `accent` changes `--gold` on `<html>` to the matching accent token (owner decision, 2026-11-10). The header's Book Me pill is ink or outline per captures 40 and 12, so the first visible gold booking button, and its colour check, arrive with BookingFinale in P1.
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

All resolved by the owner on 2026-11-10:

- **Region:** Singapore. Vercel functions `sin1`, Neon `aws-ap-southeast-1`.
- **Local database:** Docker Postgres (`docker-compose.yml`). Neon is used only by Vercel previews and production, never by the Development environment.
- **Vercel plan:** Hobby throughout, including after launch.

## Risks

- **Migrations and Neon pooling.** Checked: `payload migrate` works over Neon's pooled `POSTGRES_URL`.
- **Push mode and migrations.** Mixing them on one database corrupts the migration state. Local databases that use push mode must never receive migrations.
- **Shared preview storage.** Preview deployments share one Blob store under the `preview/` prefix, so uploads made from previews pile up there. Cleanup is manual.
- **Payload version.** Payload 3 minor releases can change the admin and adapters. Pin exact versions.

## QA log (2026-11-10)

Run on the final `dev` code (`6fbff0d`) as a production build on a fresh database, plus the Vercel previews named below. Plan `p0-foundation`, tasks T1–T16; PRs #1–#14.

| Criterion | Result | Evidence |
|---|---|---|
| `/admin` on a Vercel preview; first user on first run; no public sign-up | Pass | Owner created the first user on the PR #5 preview; anonymous `POST /api/users` and a second `first-register` → 403 |
| Five failed logins lock the account for 15 minutes | Pass | Correct password refused after 5 failures ("locked due to having too many failed login attempts"), `login_attempts=5` |
| 15 MB JPEG uploads straight to Blob, no 4.5 MB error | Pass | Studio upload sends a browser `PUT` to Blob (Playwright, T6); owner's 16.05 MB JPG saved on the PR #5 Vercel preview with all sizes |
| Media cannot be saved without alt | Pass | `400` "invalid: Alt" |
| `thumb`/`card`/`feature`/`hero` as WebP; original kept | Pass | 15.7 MB JPEG → 480/960/1600/2560 px WebP + original JPEG |
| 26 MB file and non-JPEG/PNG/WebP rejected | Pass | 27.3 MB → `413` (direct and browser uploads); GIF → `400` |
| Fresh Neon preview branch migrated by the build | Pass | PR #4 and PR #11 build logs: `payload migrate` applied pending migrations on new preview branches before `next build` |
| Header, footer and 404 show site-settings | Pass | Rendered values match the saved global |
| Editing `name` / `bookingLabel` updates every page without a redeploy | Pass | Static `/` and the 404 showed new values after a save, no rebuild |
| Changing `accent` changes `--gold` | Pass | `--gold:var(--accent-gold)` → `var(--accent-terracotta)` on `<html>` after a save |
| Header at 320 / 390 px: two rows, no overlap or horizontal scroll with a 30-character name; targets ≥ 44 px | Pass | T9 measurements and screenshots at 320 / 340 / 390 / 768 / 1024 / 1440 px |
| Unknown route → 404 page with status 404 | Pass (status on preview not directly observable) | Local production build: `404`. `dev` preview: owner saw the 404 page for `/qa-unknown-page`; Vercel's runtime logs do not record status codes and previews need a bypass to `curl` |
| Public pages make no `/api` or `/graphql` requests; `/api/graphql` unavailable | Pass | 0 such requests on `/` and the 404; `/api/graphql` and `/api/graphql-playground` → `404` |
| Image URLs come from the custom loader; `/_next/image` never requested | Pass | 0 `/_next/image` requests; loader URLs equal stored size URLs (T6). P0 pages render no images yet |
| Tokens listed in `tokenFiles`; `tokens.md` generated; no hard-coded colours in components | Pass | `tokenFiles = [src/styles/tokens.css]`; 0 hex values in component CSS/TSX |
| Seed twice on a fresh database | Pass | One populated site-settings, one media doc, 0 users |
| DoD: visual match 1440 / 390 px | Pass | 12, 40, 41 compared; deviations: Build Spec title size, two-row mobile header (owner decision), 44 px contact rows |
| DoD: keyboard | Pass | Public pages: logical order, visible ring on every stop, no traps. Studio login: visible ring after the P0 admin stylesheet |
| DoD: axe WCAG 2.2 AA | Pass on site pages and login; Studio exceptions recorded | 0 violations on `/`, 404, `/admin/login`. Media list and Site settings: remaining findings are inside Payload's own components (see below) |
| DoD: code health | Pass | typecheck, lint, 40 unit tests |
| DoD: running on a Vercel preview | Pass | `dev` preview `dpl_FD4JmVSGfzjshZGejhVJ2uds7NNC` |

### Studio accessibility exceptions (owner decision, 2026-11-10)

`src/app/(payload)/custom.scss` fixes what CSS can: a visible focus ring, readable help text, "Add" labels and upload details, and 24 px array controls. These axe findings remain inside Payload's built-in admin components and are handed to the P5/P6 theme work and upstream Payload:

- Media and Users lists: row-select checkboxes rendered with an empty `aria-label` (`label`).
- Site settings: unnamed clipboard/popup buttons (`button-name`), array drag handle without a name (`aria-command-name`), react-select inputs without labels and a focusable clear button inside `aria-hidden` (`label`, `aria-hidden-focus`), document tabs list markup (`list`).
- Dashboard: one react-select `label` and one `aria-hidden-focus`.
