# Phase 1 — Portfolio

Status: Draft
Depends on: P0
Build Spec refs: Content model: collections › disciplines, projects · Story blocks · Access control & auth · Publishing: drafts, preview & revalidation · Site map & routes (route rules) · Front-end pages (Portfolio, Collection, Project, empty states) · Media handling (video, loading) · Accessibility, SEO & performance

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The owner publishes projects into the four collections of work. Visitors browse Portfolio → a collection → a project. This phase also builds the shared Story blocks and the publishing machinery that later phases reuse: drafts, live preview, page refresh on publish and slug redirects.

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
  | A discipline | `/portfolio`, its collection page, and `/` |

  - `/` is wired now even though the Home page arrives in P4.
- **Slug redirects:** changing a project or discipline slug 308-redirects the old URL to the new one. Where redirects are stored is a blocking open question.

**Pages**
- `/portfolio`: an opener, then one 3:4 tile per discipline in `order`, then a finale using the default copy from `site-settings`.
- `/portfolio/[collection]`, with layout `projects`:
  - an opener with breadcrumb, intro and buttons;
  - Chapter 01 Highlights: an edge-to-edge strip with 4 px gaps, in `highlightAspect`;
  - Chapter 02 Projects: cards two per row in `cardAspect`, newest year first;
  - the discipline's own finale, from `finaleHeadline` and `finaleBody`.
- "More projects": the page shows 8 cards, then the button loads the rest in place.
  - The public site never calls `/api`, so the extra cards come through a server action or route handler that uses the Local API with the published-only rule.
- `/portfolio/[collection]`, with layout `list` (Writing & More): an opener, Chapter 01 Selected pieces as text rows, then the finale.
- Empty state: a collection with no published projects shows its opener, then the single line "New work is on its way", then its finale. No empty grid is rendered.
- `/portfolio/[collection]/[project]`:
  - an opener with a breadcrumb back to the collection page, the title, the summary and a details strip (collection, type, year, client, role);
  - the cover at 21:9;
  - the story blocks;
  - the credits;
  - a finale with "Back to portfolio" and the booking button.
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
  - a 16:9 frame showing the poster or the provider's thumbnail;
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
- "More projects", the gallery and video click-to-load all work by mouse, touch and keyboard.
- Pages 02–07 match their captures at 1440 px and work at 390 px with no horizontal scroll.
- Saving an invalid video URL shows the message naming Vimeo and YouTube.
- A collection with no published projects shows the empty state and no grid.
- Each page has a single `h1`, a canonical URL and its metadata.

## Seed data

- The four disciplines, with the Build Spec's tints, layouts and orders: Photography, Film & Video, Design & Illustration, and Writing & More (`list` layout).
- Projects with bracketed placeholder titles in the style of capture 22, for example "[Couple names] wedding". One collection has at least nine published projects so "More projects" can be tested, and at least one project is a draft.
- One project uses all six block types.

## Open questions

- **Blocking: redirect storage.** Should slug redirects live in a small `redirects` collection or in Payload's redirects plugin? It must be decided before `/pi-plan`.

## Risks

- **Refresh on slug or collection change.** These hooks must read the previous document to refresh the old URLs. A missed path leaves stale pages until the next publish.
- **Autosave.** Autosave writes drafts often. The hooks must not refresh pages on draft saves.
- **"More projects" and caching.** Loading the extra cards must keep the published-only rule and must not stop the collection page from being statically rendered.
