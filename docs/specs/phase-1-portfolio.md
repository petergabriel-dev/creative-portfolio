# Phase 1 — Portfolio

Status: Done
Depends on: P0
Build Spec refs: Content model: collections › disciplines, projects · Story blocks · Access control & auth · Publishing: drafts, preview & revalidation · Site map & routes (route rules) · Front-end pages (Portfolio, Collection, Project, empty states) · Media handling (video, loading) · Accessibility, SEO & performance

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The owner publishes projects into the four collections of work. Visitors browse Portfolio → a collection → a project. This phase also builds the shared Story blocks and the publishing machinery that later phases reuse: drafts, live preview, page refresh on publish and slug redirects.

## Owner decisions (2026-11-10)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **Slug redirects:** each project and discipline keeps its old slugs in a hidden `previousSlugs` field. An old URL 308-redirects to the doc's current URL in one hop. There is no redirects collection and no redirects plugin. Old slugs are recorded only when a slug change is published.
2. **"More projects":** the statically rendered collection page holds every published project; the button reveals the hidden cards in place. Nothing is fetched.
3. **Video without a poster:** a tinted 16:9 frame with the play button. No provider thumbnail, and no request to YouTube, Vimeo or their image hosts before the click.
4. **Discipline changes** refresh every `/portfolio` page and `/` (implemented as a whole-site refresh).
5. **Project page finale:** uses its discipline's `finaleHeadline` and `finaleBody`.

Design deviations from the captures (story blocks stack; project cards at most two per row) are recorded in `docs/design/README.md`.

## In scope

**Content model** (fields and admin positions exactly as in the Build Spec)
- `disciplines`:
  - admin label "Collections", admin group Portfolio; no drafts; public read;
  - `order` sets the order on the Portfolio page, and later the default hero order and the Book Me project types.
- `projects`:
  - drafts, versions and autosave on; `useAsTitle: title`;
  - list columns: title, collection, project type, year, status, on home; search on title; filter by collection and status;
  - `homeOrder` shows only when `showOnHome` is ticked;
  - `slug` is unique, generated from the title on first save, and editable;
  - admin group Portfolio.
- Shared Story blocks module with six blocks: `chapter`, `text`, `image`, `gallery`, `video`, `quote`.
  - It is used by `projects` here and reused unchanged by `posts` in P2.
  - Admin labels follow the prototype: "01 · Chapter heading", "02 · Text", and so on.
  - The Text block's Lexical editor allows only paragraphs, bold, italic, links, and bulleted and numbered lists.
  - A video URL that is not Vimeo or YouTube fails validation with a message naming the two allowed hosts.
  - Image blocks take their alt text from the media doc and never ask for it again.
- `@payloadcms/plugin-seo` adds a `meta` group to `disciplines` and to `projects`, shown in an SEO tab on projects.
- A "published only" access function: logged-in users see everything; everyone else gets `_status equals published`. Front-end queries pass `overrideAccess: false` and `draft: false`.

**Publishing**
- **Draft-mode route** (for example `/next/preview`):
  - it turns on Next.js draft mode for logged-in editors only, checked with `PREVIEW_SECRET` and the editor's session;
  - preview queries pass `draft: true` only after that check.
- **Live preview** on projects:
  - `admin.livePreview.url` points at the project's front-end route;
  - breakpoints are Mobile 390, Tablet 768 and Desktop 1440;
  - the front end mounts Payload's live-preview refresh component;
  - the prototype's "Preview" becomes the preview pane plus a "View draft" link.
- **Page refresh on publish:**
  - `afterChange` and `afterDelete` hooks call `revalidatePath`;
  - they run on publish, unpublish and delete, never on draft saves, and are skipped when the `disableRevalidate` context is set;
  - the paths follow the Build Spec table:

  | When this changes | Refresh |
  |---|---|
  | A project | its page, its collection page, and `/` if `showOnHome` is ticked now or was before |
  | A project's slug or collection | the old and new project URLs, and both collection pages |
  | A discipline | every page (`revalidatePath('/', 'layout')`): `/portfolio`, every collection and project page, and `/`. Project pages show the discipline's name and use its slug in their URLs (owner decision 4) |

  - `/` is wired now even though the Home page arrives in P4.
- **Slug redirects:** changing a project or discipline slug 308-redirects the old URL to the new one (owner decision 1).
  - Old slugs live in a hidden `previousSlugs` field on the doc, recorded only when a slug change is published.
  - A project is found by its slug alone (slugs are unique across projects). Any URL whose collection segment is not the project's current discipline slug 308s to the canonical URL, which covers renamed collections and moved projects.

**Pages**
- `/portfolio`: an opener, then one 3:4 tile per discipline in `order`, then a finale using the default copy from `site-settings`.
- `/portfolio/[collection]`, with layout `projects`:
  - an opener with breadcrumb, intro and buttons;
  - Chapter 01 Highlights: an edge-to-edge strip with 4 px gaps, in `highlightAspect`;
  - Chapter 02 Projects: cards two per row in `cardAspect`, newest year first;
  - the discipline's own finale, from `finaleHeadline` and `finaleBody`.
- "More projects": the page shows 8 cards, then the button reveals the rest in place (owner decision 2).
  - Every published project is already in the statically rendered page; the hidden cards' images load only when revealed. There is no server action, no route handler and no extra Local API path.
- `/portfolio/[collection]`, with layout `list` (Writing & More): an opener, Chapter 01 Selected pieces as text rows, then the finale.
- Empty state: a collection with no published projects shows its opener, then the single line "New work is on its way", then its finale. No empty grid is rendered.
- `/portfolio/[collection]/[project]`:
  - an opener with a breadcrumb back to the collection page, the title, the summary and a details strip (collection, type, year, client, role);
  - the cover at 21:9;
  - the story blocks;
  - the credits;
  - a finale with its discipline's `finaleHeadline` and `finaleBody`, "Back to portfolio" and the booking button (owner decision 5).
- Loading: the opener image loads with `priority`. Everything else lazy-loads, with the tint showing until the image arrives.
- Each route gets `generateMetadata` built from the SEO fields, falling back to `site-settings.defaultMeta`. The Open Graph image is the cover, else the default image. Every page has a canonical URL.

**Components**
- BookingFinale: gold label, Bebas headline, one sentence and a gold button.
- ChapterHeading, Filmstrip, CollectionTile, ProjectCard, PieceRow and DetailsStrip.
- One renderer per story block, as described in the Build Spec Story blocks table:
  - Chapter: "Chapter 0N" counts chapter blocks in order; the number is not stored.
  - Text: a 680 px column.
  - Image: contained (1,200 px max) or full-bleed.
  - Gallery: strip or pair. The strip wraps to one column on phones.
  - Video: see below.
  - Quote: a Bebas pull quote, 900 px max.
- Video block:
  - a 16:9 frame showing the poster, or a tinted frame when there is none (owner decision 3: no provider thumbnail, and nothing is requested from YouTube, Vimeo or their image hosts before the click);
  - the iframe loads only after a click;
  - YouTube embeds use `youtube-nocookie.com`, and Vimeo embeds add `dnt=1`.
- Client JavaScript is limited to "More projects" and video embeds.

## Out of scope

- The Home page and its Selected work: P4. Only the `/` refresh path is wired here.
- Collection filter pills and the theme for screens 22–24: P6.
- `sitemap.xml` and structured data: P7.
- `posts` and `categories`: P2.

## Screens

- Site: [02](../design/reference/creative-portfolio/handoff/screens/desktop/02-portfolio.png), [03](../design/reference/creative-portfolio/handoff/screens/desktop/03-collection-photography.png), [04](../design/reference/creative-portfolio/handoff/screens/desktop/04-collection-film.png), [05](../design/reference/creative-portfolio/handoff/screens/desktop/05-collection-design.png), [06](../design/reference/creative-portfolio/handoff/screens/desktop/06-collection-writing.png) and [07](../design/reference/creative-portfolio/handoff/screens/desktop/07-project.png), at 1440 px (`desktop/`) and 390 px (`mobile/`).
- Studio, working in default views: 22 Projects list, 23 Project editor (including the SEO tab) and 24 Collection editor (including the list layout).

## Content model

`disciplines`, `projects` and the shared `story` blocks field. Field-level detail is in the Build Spec, under "Content model: collections › disciplines", "› projects" and "Story blocks".

## Routes & behaviour

| Route | Content | Notes |
|---|---|---|
| `/portfolio` | `disciplines` | Tiles in `order` |
| `/portfolio/[collection]` | one discipline and its published projects | `projects` or `list` layout; empty state |
| `/portfolio/[collection]/[project]` | one project | Nested under its collection's slug |
| Draft-mode route | — | Editors only |

Slugs are lowercase, hyphenated and unique within their collection.

## Acceptance criteria

- `disciplines`, `projects` and all six Story blocks exist with the Build Spec's fields and admin positions.
- A logged-out REST request for a draft project returns nothing.
- Publishing a project updates its page and its collection page within a minute, with no redeploy. A draft save triggers no refresh.
- Draft changes show only in live preview and in draft mode, never on the public site.
- Changing a project's or a discipline's slug 308-redirects the old URL.
- "More projects" and video click-to-load work by mouse, touch and keyboard. (The gallery is static: it wraps to one column on phones with no horizontal scroll.)
- Pages 02–07 match their captures at 1440 px and work at 390 px with no horizontal scroll.
- Saving an invalid video URL shows the message naming Vimeo and YouTube.
- A collection with no published projects shows the empty state and no grid.
- Each page has a single `h1`, a canonical URL and its metadata.

## Seed data

- The four disciplines, with the Build Spec's tints, layouts and orders: Photography, Film & Video, Design & Illustration, and Writing & More (`list` layout).
- Projects with bracketed placeholder titles in the style of capture 22, for example "[Couple names] wedding". One collection has at least nine published projects so "More projects" can be tested, and at least one project is a draft.
- One project uses all six block types.

## Open questions

- ~~**Blocking: redirect storage.**~~ Resolved 2026-11-10: old slugs on the doc (`previousSlugs`) plus canonical 308s; no redirects collection or plugin (owner decision 1).
- Not blocking: no "exit draft mode" route or banner is built. Only the project page reads drafts, and the draft-mode cookie is session-scoped.

## Risks

- **Refresh on slug or collection change.** These hooks must read the previous document to refresh the old URLs. A missed path leaves stale pages until the next publish.
- **Autosave.** Autosave writes drafts often. The hooks must not refresh pages on draft saves.
- **Autosave and old slugs.** Payload hands hooks the latest version as the previous doc, often an autosaved draft that already holds the new slug. The hooks compare against the last published row instead.
- **"More projects" scale.** Revealing pre-rendered cards assumes tens of projects per collection. Revisit with server fetching if a collection reaches about 100.

## QA log (2026-11-10)

Run on the final `dev` code (`5cef9b7`) plus the T10 fixes below, as a local production build on a fresh, migrated and seeded database. Plan `p1-portfolio`, tasks T1–T10; PRs #17–#25. Rows marked "PR #n" cite that task's verification on the same kind of build; everything else was re-run on the final build.

| Criterion | Result | Evidence |
|---|---|---|
| `disciplines`, `projects` and all six Story blocks with the Build Spec's fields and admin positions | Pass | Migration applies on a fresh database. Studio 22, 23 (with the SEO tab) and 24 (with the list layout) create, save and publish (PR #18) |
| A logged-out REST request for a draft project returns nothing | Pass | Draft by ID → `404`; `where[_status][equals]=draft` → 0 docs; `/api/projects/versions` → `403`. List, `?draft=true` and draft slugs queried by name also hide it (PR #18, #20) |
| Publishing updates the project and collection pages within a minute, no redeploy; a draft save triggers no refresh | Pass | A draft save left the public page unchanged; a publish showed on both pages on the next request. Autosave, "Save draft", first publish, rename, unpublish, republish, delete and discipline saves each refreshed exactly the expected paths (PR #19) |
| Draft changes show only in live preview and draft mode | Pass | The draft-mode cookie without an editor session sees the published version; a never-published draft is `404` for the public. Studio live preview shows the draft and refreshes after autosave. `/next/preview` returns `403` with no cookie for a missing or wrong secret, no session, or an off-site path (PR #24) |
| A project or discipline slug change 308-redirects the old URL | Pass | Renaming a collection: old URL → `308` to the new one, and `/portfolio` links update. Renaming back reverses it. A project under the old collection slug and a wrong collection segment → one `308` to the canonical URL. Old project slug and both at once (PR #23) |
| "More projects" and video click-to-load by mouse, touch and keyboard | Pass (touch synthetic) | "More projects": click, Enter and a synthetic touch tap; focus lands on card 9; hidden cards' images stay unloaded (PR #22). Video: click, Enter and a synthetic tap mount the `youtube-nocookie.com` iframe and focus it; 0 requests to YouTube, Vimeo or their image hosts before the click (PR #23). playwright-cli has no touch emulation |
| Pages 02–07 match their captures at 1440 px and work at 390 px with no horizontal scroll | Pass, with recorded deviations | 02, 03, 05, 06 and 07 compared at 1440 px; 03 and 07 at 390 px; 04 checked by measurement (plum tint `rgb(44,42,46)`, 16:9 frames). No horizontal scroll at 320 or 390 px on all six pages. Deviations in `docs/design/README.md` (cards 2 up, stacked story blocks, chapter heading size, `--fs-display-sm`, tinted video frame). Also seen: the Highlights aside is one generic line from `src/copy.ts`, and tiles show the whole intro |
| Saving an invalid video URL names Vimeo and YouTube | Pass | Publishing with `https://example.com/watch?v=abc` → `400` "Use a Vimeo or YouTube link, e.g. https://vimeo.com/123456789"; nothing created |
| A collection with no published projects shows the empty state and no grid | Pass | Opener, "New work is on its way", finale; no grid (PR #22) |
| Each page has a single `h1`, a canonical URL and its metadata | Pass after a T10 fix | `/portfolio`, the four collections, a list-layout piece and a project: one `h1`, canonical equal to the path, templated title, description, `og:title` and `og:image`. QA found that pages with no image of their own (Writing & More) lost every Open Graph tag; `src/lib/seo.ts` now leaves `openGraph` out, so the default image applies. Canonicals stay path-relative until P7 sets `metadataBase` |
| Public pages stay static | Pass | `/portfolio` ○; collection and project pages ●; `/next/preview` ƒ |
| DoD: keyboard | Pass | `/portfolio/photography`: header → breadcrumb → Book Me → See the projects → 8 cards → More projects → finale → footer; dual ring on every stop; hidden cards skipped; no traps. Video button by Enter (PR #23) |
| DoD: axe WCAG 2.2 AA | Pass on site pages; Studio exceptions recorded | 0 violations on all six public pages. Studio 22–24: 0 colour-contrast findings after the T10 stylesheet fixes; the rest sit in Payload's own components (see below) |
| Lighthouse mobile (spot check, not gating) | Recorded | 03: performance 95, accessibility 100, best practices 96, SEO 92 (LCP 2.9 s). 07: 97 / 100 / 96 / 92 (LCP 2.5 s). CLS 0 and TBT 0 ms on both. Local build with media from disk. Best practices: `/favicon.ico` 404; SEO: relative canonical |
| DoD: code health | Pass | typecheck, lint, 163 unit tests |
| DoD: Vercel previews | Pass (builds only) | PRs #17–#25 merged with `checks` and `Vercel` green (rulesets). Protected previews were not browsed in this pass |

### Studio accessibility exceptions (same policy as P0)

T10 added to `src/app/(payload)/custom.scss`: inactive tab labels ("SEO"), the upload dropzone's "or" and "Or Drag and drop a file" text, and the blocks field's "Add Story" label use `--theme-elevation-700`. Colour-contrast findings went from 6 to 0 on the project editor and 3 to 0 on the collection editor. These axe findings remain inside Payload's built-in components and are handed to the P6 theme (screens 22–24) and upstream Payload:

- Projects list: unnamed pagination arrows (`button-name` ×2); row-select checkboxes with an empty `aria-label` (`label` ×10).
- Project editor: unnamed popup, upload and block-row buttons (`button-name` ×26); block drag handles (`aria-command-name` ×15); react-select focusable parts inside `aria-hidden` (`aria-hidden-focus` ×14); react-select and checkbox labels (`label` ×7); the Lexical editor (`aria-input-field-name` ×2); document tabs markup (`list` ×1).
- Collection editor: `button-name` ×11, `aria-hidden-focus` ×8, `aria-command-name` ×5, `label` ×4, `list` ×1, from the same components.

### Follow-ups

- P7: set `metadataBase` so canonical and Open Graph URLs become absolute.
- No phase owns a favicon yet; browsers request `/favicon.ico` and get a 404. Owner to decide where it lands (P7 is the natural place).
- Seed (cosmetic): the all-blocks project would read better with a 3:2 image in place of the 4:5 one.
