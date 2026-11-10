# Phase 2 — Journal

Status: Draft
Depends on: P1 (Story blocks, the draft-mode route, live preview, refresh hooks, slug redirects)
Build Spec refs: Content model: collections › posts, categories · Story blocks · Access control & auth · Publishing: drafts, preview & revalidation · Front-end pages (Journal, Journal entry) · Accessibility, SEO & performance (SEO)

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The owner writes and publishes journal posts. Visitors read a paged list of posts and each post in full. The phase reuses P1's Story blocks and publishing machinery unchanged.

## In scope

**Content model** (fields and admin positions exactly as in the Build Spec)
- `categories`:
  - fields `name` and `slug` (unique);
  - public read; admin group Journal.
  - Seeded with Process, Outdoors, Design and Film.
- `posts`:
  - drafts, versions and autosave on;
  - fields: `title`, `excerpt`, `cover`, `story` (required), `category` (required), `publishedAt`, `relatedProjects` and `slug`;
  - `publishedAt` defaults to the first publish and sets the list order;
  - `@payloadcms/plugin-seo` adds a `meta` group, shown in an SEO tab;
  - published-only access; admin group Journal.
- The `story` field reuses the P1 Story blocks module with no changes.

**Publishing**
- Live preview and the draft-mode route work for posts the same way they do for projects in P1, with the same breakpoints and the same editor check.
- Pages refresh on publish, unpublish and delete, never on draft saves:

  | When this changes | Refresh |
  |---|---|
  | A post | its entry, `/journal`, and `/` |
  | A category | `/journal` |

- Changing a post's slug 308-redirects the old URL, using the redirect storage chosen in P1. Source: the Build Spec rule "308 redirects when slugs change" under SEO.

**Pages**
- `/journal`:
  - an opener, then post rows, then the default finale;
  - each row shows the cover, "category · date", the title, the excerpt and a "Read story →" link;
  - posts are sorted by `publishedAt`, newest first (capture 09's "Older stories →" points to later pages);
  - 10 posts per page, with numbered pages at `/journal?page=N`;
  - the pagination row shows "Page N of M · 10 stories per page", the page numbers and "Older stories →".
- `/journal/[slug]`:
  - an opener with a breadcrumb, "category · date", the title and the excerpt;
  - the cover at 21:9;
  - the story blocks;
  - a back link, and "See the work" links from `relatedProjects`;
  - the finale.
- Dates display as "6 Nov 2026".
- Each route gets `generateMetadata` built from the SEO fields, falling back to `site-settings.defaultMeta`. The Open Graph image is the cover, else the default image. Every page has a canonical URL.
- Cover images on the rows use the 3:2 card crop. Every image except the opener lazy-loads behind its tint.

**Components**
- JournalRow: a post row on `/journal`.
- Pagination: plain links, no client JavaScript.

## Out of scope

- JournalCard and the "From the journal" section on Home: P4.
- Editing categories inline from the posts list (screen 25 draws this). The Build Spec covers Categories with Payload's default views, and they stay default.
- The theme for screens 25 and 26: P6.
- `sitemap.xml` and BlogPosting structured data: P7.

## Screens

- Site: [09 Journal](../design/reference/creative-portfolio/handoff/screens/desktop/09-journal.png) and [10 Journal entry](../design/reference/creative-portfolio/handoff/screens/desktop/10-journal-entry.png), at 1440 px (`desktop/`) and 390 px (`mobile/`).
- Studio, working in default views: 25 Journal posts and categories, 26 Post editor.

## Content model

`posts` and `categories`. Field-level detail is in the Build Spec, under "Content model: collections › posts" and "› categories".

## Routes & behaviour

| Route | Content | Notes |
|---|---|---|
| `/journal` | published `posts`, `categories` | 10 per page, `?page=N` |
| `/journal/[slug]` | one post | Related projects link to their project pages |

## Acceptance criteria

- `posts` and `categories` exist with the Build Spec's fields and admin positions, and `posts.story` uses the shared Story blocks.
- With 11 or more published posts, `/journal` shows 10 on page 1 and the rest on `?page=2`. The page numbers and "Older stories →" work by keyboard.
- Publishing a post refreshes its entry, `/journal` and `/` within a minute, with no redeploy. A draft save triggers no refresh.
- Draft changes to a post show only in live preview and in draft mode.
- Changing a post's slug 308-redirects the old URL.
- A logged-out REST request for a draft post returns nothing.
- Pages 09 and 10 match their captures at 1440 px and work at 390 px with no horizontal scroll.
- Dates render as "6 Nov 2026".

## Seed data

- Categories: Process, Outdoors, Design and Film.
- At least 11 published posts, so page 2 can be tested, plus one draft. Titles are bracketed placeholders in the style of capture 09.
- At least one post links to seeded projects through `relatedProjects`.

## Open questions

- **Out-of-range pages.** `/journal?page=N` past the last page, or not a whole number. The proposal is to return the 404 page. Non-blocking.

## Risks

- **Pagination and caching.** If page numbers are read from `searchParams`, `/journal` may stop being statically rendered. Decide in `/pi-plan` whether to keep `?page=N` dynamic or pre-render the pages, keeping the URL shape the Build Spec gives.
- **`publishedAt`.** Defaulting it on first publish must not overwrite a date the editor set by hand.
