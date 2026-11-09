# Phase specs — Creative Portfolio

The site and its Payload Studio are built in eight vertical phases, P0–P7. Each phase ships one feature end to end: the content model, the Studio editing views, and the public pages. Each phase has one scope spec in this folder. A spec says **what** the phase delivers and how we know it is done. It is not a task list.

## How to use

1. Pick the next phase whose dependencies are `Done`.
2. Resolve every **Blocking** open question in its spec.
3. Optionally run `/pi-discuss` on the spec.
4. Run `/pi-plan` with the spec to get a task plan against the real code.
5. Build with `/pi-build`.
6. When the shared Definition of Done and the spec's acceptance criteria pass, set the spec's `Status` to `Done` and update the roadmap below.

Status values: `Draft` → `Ready` (blocking questions resolved) → `In progress` → `Done`.

## Precedence

When sources disagree, the higher one wins:

1. User decisions from 2026-11-10, recorded in this README and in [`docs/engineering/decisions/`](../engineering/decisions/README.md)
2. The Build Spec, [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) (6 Nov 2026)
3. Handoff captures (9 Nov 2026). These are the visual target.

The Build Spec has its own eight-step build order, layer by layer ("Build order & acceptance criteria"). The vertical phases below replace that order, and each of its acceptance boxes is mapped to a phase in [Build Spec coverage](#build-spec-coverage).

## Sources

- Build Spec: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md). Specs cite its headings, for example "Content model: collections › projects", rather than copying its field tables.
- Handoff: [`handoff/README.md`](../design/reference/creative-portfolio/handoff/README.md) and [`handoff/manifest.json`](../design/reference/creative-portfolio/handoff/manifest.json), which lists each screen's route, Build Spec sections, states and image files.
- Captures: [`handoff/screens/`](../design/reference/creative-portfolio/handoff/screens/desktop/01-home.png). File names are `<id>.png` or `<id>--<state>.png`, in `desktop/` (1440 px), `mobile/` (390 px) and `html/`.
- Reference tokens: [`handoff/tokens/tokens.css`](../design/reference/creative-portfolio/handoff/tokens/tokens.css). P0 promotes them into the canonical token file.
- Provenance: [`docs/design/reference/creative-portfolio/README.md`](../design/reference/creative-portfolio/README.md).

## Roadmap

| Phase | Spec | Goal | Depends on | Site screens | Studio screens | Status |
|---|---|---|---|---|---|---|
| P0 Foundation | `phase-0-foundation.md` | A deployable Next.js + Payload app on a Vercel preview. Site header, footer and 404 read `site-settings`; media uploads to Blob | — | 12, 40, 41 (43 as reference) | 20, 28, 29 as default views | Draft |
| P1 Portfolio | `phase-1-portfolio.md` | The owner publishes projects into four collections. Visitors browse Portfolio → collection → project | P0 | 02–07 | 22, 23, 24 as default views | Draft |
| P2 Journal | `phase-2-journal.md` | The owner publishes journal posts. Visitors read the paged list and the entries | P1 | 09, 10 | 25, 26 as default views | Draft |
| P3 Book Me | `phase-3-book-me.md` | Visitors send inquiries. The owner gets an email alert and handles inquiries in the Studio | P0, P1 | 11 (+ errors, sent) | 27 as default view | Draft |
| P4 Home + About | `phase-4-home-about.md` | The `home` and `about` globals drive the Home and About pages. Adds the hero slider and Selected work | P1, P2 | 01, 08 | 30, 31 as default views | Draft |
| P5 Studio shell | `phase-5-studio-shell.md` | Studio theme, logo, nav badge, Overview dashboard and themed login | P3, P4 | — | 20, 21, 42 (visual match) | Draft |
| P6 Studio extras | `phase-6-studio-extras.md` | Filter pills, two-panel inbox and accent swatches, plus a theme pass on every Studio screen | P5 | — | 22–31 (theme-level match) | Draft |
| P7 Launch | `phase-7-launch.md` | Finish SEO, full QA, real content and production go-live | P0–P6 | All (QA pass) | All (QA pass) | Draft |

## Definition of Done (every phase)

A phase is done only when all of these pass, together with its own acceptance criteria:

- **Visual match.** Site screens shipped in the phase match their handoff captures at 1440 px and 390 px, checked by screenshot review (not pixel diff). There is no horizontal scroll at 390 px.
- **Keyboard.** Everything works by keyboard, with the visible focus ring: a 2 px ink outline with a 4 px bone ring outside it.
- **Accessibility.** axe reports no WCAG 2.2 AA violations on the pages and Studio screens the phase touched.
- **Code health.** Typecheck, lint and tests pass.
- **Preview.** The phase is running on a Vercel preview deployment.
- **Seed data.** Seed data for the phase's collections and globals exists, and running it twice creates no duplicates.
- **Studio scope.** Studio screens must match their captures only in P5 (20, 21, 42) and P6 (22–31). In P0–P4 they only need to work, but the keyboard, axe, test and preview items above still apply to them.

## Cross-phase rules

- **Stack.** Next.js App Router with Payload 3 inside it, on Vercel, with Neon Postgres, Vercel Blob, Resend and `@payloadcms/plugin-seo`. See the Build Spec, "Decisions & stack".
- **Paid services need owner approval.** No paid plan or paid service signup without the owner's approval. This covers Vercel Pro, a paid Neon plan, a paid Resend plan and Upstash. The spec of the phase that needs one lists it.
- **What P0 owns.** The `site-settings` global and the `media` collection land in P0, because the header, footer, accent colour and `defaultMeta.image` depend on them. Resend lands in P3, where it is first used.
- **Story blocks.** They are built once in P1 and reused unchanged by `posts` in P2.
- **Studio before P5.** In P1–P4, collections use Payload's built-in views with no theme. Still, each collection gets its `admin.group`, list columns, `useAsTitle` and field positions from the Build Spec as soon as it is created.
- **Studio target.** The Studio is built to the Build Spec level plus its extras:
  - built-in views, themed to the captures;
  - custom Logo/Icon, "N new" badge and Overview (P5);
  - collection filter pills, two-panel inbox and accent swatches (P6).
  - The captures are the visual reference for the theme. Built-in list and edit views are not rebuilt to match them pixel for pixel.
- **Mobile header (P0).** At 390 px and below:
  - Row 1 holds the logo and the booking pill. Row 2 holds Home, Portfolio, About and Journal, with a gap of about 24 px.
  - There is no menu button and no JavaScript.
  - A long site name wraps or is clamped, and never overlaps the pill. Verify at 320 px and 390 px.
- **Seed data.**
  - Each phase adds idempotent seed data for its collections and globals, using bracketed placeholder copy and tinted image frames.
  - The seed runs with the `disableRevalidate` context.
  - It never runs against production and never creates user credentials.
- **Access.**
  - Front-end Local API queries pass `overrideAccess: false` and `draft: false`; preview requests pass `draft: true` only after the editor's session is checked.
  - The `submitInquiry` server action is the only code path that writes with `overrideAccess: true`.
  - GraphQL is off.
- **Copy.** Text that is not CMS content (button words, labels such as "Chapter 01") lives in one `copy.ts`.
- **Secrets.** Docs and specs name environment variables but never contain their values.

## Build Spec coverage

These are the 22 boxes from the Build Spec section "Build order & acceptance criteria". Each box is closed in exactly one phase. Boxes that span several vertical slices are partly delivered in earlier phases and closed when the last part lands.

| # | Build Spec box | Closed in | Partly delivered in |
|---|---|---|---|
| 1.1 | Next.js + Payload 3 mounted; `/admin` reachable on a Vercel preview URL | P0 | — |
| 1.2 | Neon, Blob and Resend connected; a 15 MB photo uploads from the admin; a test email arrives | P0 (Neon, Blob, 15 MB upload) | P3 (Resend, test email) |
| 1.3 | The build command runs migrations before `next build` | P0 | — |
| 2.1 | Every collection, global and story block exists, with the listed fields and admin positions | P4 | P0 (users, media, site-settings), P1 (disciplines, projects, story blocks), P2 (posts, categories), P3 (inquiries) |
| 2.2 | Access rules match the access table; a logged-out REST request for a draft project returns nothing | P4 | P0, P1 (draft project check), P2, P3 |
| 2.3 | The seed script fills a fresh database | P4 | P0–P3 |
| 3.1 | Tokens, fonts, SiteHeader, SiteFooter, ChapterOpener and BookingFinale built | P1 (BookingFinale) | P0 |
| 3.2 | Every route renders from CMS data, including the empty states | P4 | P0–P3 (`sitemap.xml` and `robots.txt` in P7) |
| 4.1 | Each page matches its artboard at 1,440 px and works at 390 px with no horizontal scroll | P4 | P0 (404), P1, P2, P3 |
| 4.2 | Hero slider, "More projects" and video click-to-load work by mouse, touch and keyboard | P4 (hero slider) | P1 ("More projects", video) |
| 5.1 | Publishing a project updates its page, its collection page and Home within a minute, with no redeploy | P4 (Home) | P1 |
| 5.2 | Draft changes show only in live preview and draft mode | P4 (home, about) | P1, P2 |
| 5.3 | A slug change redirects the old URL | P1 | P2 (posts) |
| 6.1 | A valid inquiry creates a `new` doc and an email whose reply goes to the visitor | P3 | — |
| 6.2 | Invalid input shows field errors and moves focus to the first one | P3 | — |
| 6.3 | A filled honeypot saves nothing and still shows success | P3 | — |
| 7.1 | Theme, logo, nav groups, inquiry badge and Overview dashboard in place | P5 | P0–P4 (nav groups via `admin.group`) |
| 7.2 | Phase 2 extras (filter pills, two-panel inbox, accent swatches) scheduled or dropped | P6 (scheduled and built) | — |
| 8.1 | Keyboard-only pass on every page and the admin's main flows; automated scan shows no serious issues | P7 | Every phase (Definition of Done) |
| 8.2 | Core Web Vitals targets met on a mid-range phone profile | P7 | — |
| 8.3 | Metadata, sitemap and structured data validate | P7 | P1, P2 (`generateMetadata` per route) |
| 8.4 | Real content entered; Vercel on Pro; domain and Resend sending domain verified | P7 | — |

## Screen coverage

There are 28 handoff screens. Each has exactly one phase where its visual match is required, and Studio screens also list the phase where they first work.

| Screen | Visual match in | Working in |
|---|---|---|
| 01 Home | P4 | P4 |
| 02 Portfolio | P1 | P1 |
| 03 Collection — Photography | P1 | P1 |
| 04 Collection — Film & Video | P1 | P1 |
| 05 Collection — Design & Illustration | P1 | P1 |
| 06 Collection — Writing & More (list) | P1 | P1 |
| 07 Project page | P1 | P1 |
| 08 About | P4 | P4 |
| 09 Journal | P2 | P2 |
| 10 Journal entry | P2 | P2 |
| 11 Book Me (+ errors, sent) | P3 | P3 |
| 12 404 | P0 | P0 |
| 20 Log in (+ error) | P5 | P0 (default login) |
| 21 Overview dashboard | P5 | P5 |
| 22 Projects list | P6 | P1 |
| 23 Project editor (+ SEO tab) | P6 | P1 |
| 24 Collection editor (+ list layout) | P6 | P1 |
| 25 Journal posts and categories | P6 | P2 |
| 26 Post editor | P6 | P2 |
| 27 Inquiries inbox | P6 | P3 |
| 28 Media library | P6 | P0 |
| 29 Site settings | P6 | P0 |
| 30 Home page global | P6 | P4 |
| 31 About page global | P6 | P4 |
| 40 Site header | P0 | P0 |
| 41 Site footer | P0 | P0 |
| 42 Studio sidebar | P5 | P0 (default nav) |
| 43 UI kit (reference) | P0 | — |

## Open questions

The owner answers these. Resolve a **Blocking** question before running `/pi-plan` for its phase.

| Question | Phase | Blocking | Status |
|---|---|---|---|
| Which region should the Vercel functions and Neon use? | P0 | Yes | Open |
| Where should slug redirects be stored: a small `redirects` collection or Payload's redirects plugin? | P1 | Yes | Open |
| If `/journal?page=N` is out of range or not a number, show a 404 or clamp to a valid page? The spec proposes 404. | P2 | No | Open |
| Should visitors get an automatic "I've got your message" email, or only the editor alert? | P3 | No | Open |
| How long are inquiries kept before they are archived or deleted? | P3 | No | Open |
| If the alert email fails to send, keep the inquiry, log the error and don't retry? This is the proposal; please confirm. | P3 | No | Open |
| Analytics: Vercel Web Analytics, another tool, or none? | P7 | No | Open |
| Booking label: "Book Me" or "Work with me"? It can be edited in `site-settings.bookingLabel`. | P7 | No | Open |
| What are the final name and wordmark, and the copy for every [bracketed] placeholder? | P7 | No | Open |
| What are the domain name and the `contactEmail` address? | P7 | No | Open |

## Phase spec template

```markdown
# Phase N — Name

Status: Draft | Ready | In progress | Done
Depends on: Pn, …
Build Spec refs: <build-spec.md headings>

## Goal
## In scope
## Out of scope
## Screens
## Content model
## Routes & behaviour
## Acceptance criteria
## Seed data
## Open questions
## Risks
```

Acceptance criteria list only what is specific to the phase. The shared Definition of Done always applies on top.
