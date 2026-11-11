# Phase 2 — Journal

Status: Done
Depends on: P1 (Story blocks, the draft-mode route, live preview, refresh hooks, slug redirects)
Build Spec refs: Content model: collections › posts, categories · Story blocks · Access control & auth · Publishing: drafts, preview & revalidation · Front-end pages (Journal, Journal entry) · Accessibility, SEO & performance (SEO)

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The owner writes and publishes journal posts. Visitors read a paged list of posts and each post in full. The phase reuses P1's Story blocks and publishing machinery unchanged.

## Owner decisions (2026-11-11)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **Pagination URLs:** page 1 is `/journal`; pages 2 and on are `/journal/page/N`, statically rendered. This replaces the Build Spec's `/journal?page=N`, which would make `/journal` dynamic. `/journal/page/1` 308-redirects to `/journal`. A page past the last one, or anything that is not a plain whole number from 2 up (`0`, `02`, `abc`, `2.5`), returns the 404 page. This resolves the open question on out-of-range pages.
2. **Category changes** (any save or delete) refresh every page, because entry openers (and the Home journal cards in P4) show the category name. This replaces the Build Spec row "A category → `/journal`".
3. **Categories in use can't be deleted.** Deleting a category that any post uses is refused with "Used by N posts. Move them to another category first."
4. **`publishedAt`** is the date shown and the sort key, nothing more. It is filled with the publish time on first publish only when empty, never overwrites a date the editor set, and a future date neither hides nor schedules a post.
5. **Dates** read "6 Nov 2026" in Asia/Singapore time.
6. **Project changes refresh journal entries.** When a project's public state changes (publish, unpublish, rename, move, delete), every journal entry is refreshed, so "See the work" links never point at a stale URL or a 404.
7. **"See the work":** one published related project shows a single "See the work →" link (capture 10). Two or more show a "See the work" label and one link per project, named by its title. None shows nothing.
8. **Pagination row:** hidden when there is only one page. Otherwise it shows the page numbers and "Older stories →" while a later page exists; there is no "Newer stories" link.

Design deviations from the captures are recorded in `docs/design/README.md`.

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
  | A post (publish, unpublish, slug change, delete) | its entry (old and new URL), `/journal`, every `/journal/page/N`, and `/` |
  | A category (any save or delete) | every page (owner decision 2) |
  | A project's published state | every journal entry (owner decision 6), on top of the P1 project refresh |

- Changing a post's slug 308-redirects the old URL, using P1's storage: old slugs in the post's hidden `previousSlugs` (ADR-0004). Source: the Build Spec rule "308 redirects when slugs change" under SEO.

**Pages**
- `/journal`:
  - an opener, then post rows, then the default finale;
  - each row shows the cover, "category · date", the title, the excerpt and a "Read story →" link;
  - posts are sorted by `publishedAt`, newest first, with a fixed tie-breaker so posts sharing a date keep their place across pages (capture 09's "Older stories →" points to later pages);
  - 10 posts per page, with numbered pages at `/journal/page/N` (owner decision 1);
  - the pagination row shows "Page N of M · 10 stories per page", the page numbers and "Older stories →" (owner decision 8);
  - with no published posts: the opener, a one-line empty state from `copy.ts` (never an empty list), then the finale.
- `/journal/page/N`: the same page for page N ≥ 2. `/journal/page/1` 308s to `/journal`; out-of-range or malformed N is a 404.
- `/journal/[slug]`:
  - an opener with a breadcrumb, "category · date", the title and the excerpt;
  - the cover at 21:9;
  - the story blocks;
  - a back link, and "See the work" links from the published `relatedProjects` (owner decision 7);
  - the finale.
- Dates display as "6 Nov 2026", in Asia/Singapore time (owner decision 5).
- Both journal finales use `site-settings.finaleHeadline` and the journal sentence from captures 09 and 10 ("Tell me about what you're making, and we'll start from there."), kept in `copy.ts`.
- Each route gets `generateMetadata` built from the SEO fields, falling back to `site-settings.defaultMeta`. The Open Graph image is the cover, else the default image. Every page has a canonical URL.
- Cover images on the rows use the 3:2 card crop. Every image except the opener lazy-loads behind its tint.

**Components**
- JournalRow: a post row on `/journal` (`docs/design/components/JournalRow.md`).
- Pagination: plain links, no client JavaScript (`docs/design/components/Pagination.md`).
- JournalEntryFooter: "Back to journal" and the related work (`docs/design/components/JournalEntryFooter.md`).

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
| `/journal` | published `posts`, `categories` | Page 1, 10 per page; static |
| `/journal/page/[n]` | published `posts`, `categories` | Pages 2+, prerendered; `1` → 308 `/journal`; out of range or malformed → 404 |
| `/journal/[slug]` | one post | Old slugs 308 to the current one; related projects link to their project pages |

## Acceptance criteria

- `posts` and `categories` exist with the Build Spec's fields and admin positions, and `posts.story` uses the shared Story blocks.
- With 11 or more published posts, `/journal` shows 10 on page 1 and the rest on `/journal/page/2`. The page numbers and "Older stories →" work by keyboard. With 10 or fewer, no pagination row shows.
- `/journal/page/1` 308-redirects to `/journal`; `/journal/page/N` past the last page, `/journal/page/0`, `/journal/page/02` and `/journal/page/abc` return the 404 page.
- `next build` lists `/journal` as static (○) and `/journal/page/[n]` and `/journal/[slug]` as prerendered (●).
- Publishing a post refreshes its entry, `/journal`, every `/journal/page/N` and `/` within a minute, with no redeploy. A draft save triggers no refresh.
- Saving or deleting a category refreshes every page. Deleting a category that a post uses is refused with a clear message.
- Unpublishing a project that a post links to removes the link from that entry on its next visit.
- An entry with one related project shows "See the work →"; with several, one link per project, named by its title.
- Draft changes to a post show only in live preview and in draft mode.
- Changing a post's slug 308-redirects the old URL.
- A logged-out REST request for a draft post returns nothing.
- Pages 09 and 10 match their captures at 1440 px and work at 390 px with no horizontal scroll.
- Dates render as "6 Nov 2026" in Asia/Singapore time, including September ("Sep", not "Sept").
- Publishing a post without a `publishedAt` fills it; a date the editor set is never overwritten.

## Seed data

- Categories: Process, Outdoors, Design and Film.
- At least 11 published posts, so page 2 can be tested, plus one draft. Titles are bracketed placeholders in the style of capture 09.
- At least one post links to one seeded project and one links to two, through `relatedProjects`, so both "See the work" forms can be checked.

## Open questions

- None. Out-of-range pages return the 404 page (owner decision 1, 2026-11-11).

## Risks

- **Pagination and caching.** Resolved by owner decision 1: path URLs keep every journal page static. Publishing a post refreshes all list pages, because posts shift between pages.
- **`publishedAt`.** Defaulting it on first publish must not overwrite a date the editor set by hand. The fill has to run before validation, since the field is required on publish (the same timing trap as P1's slug field).
- **Category delete.** Payload's database sets a deleted category to null on the posts that use it (`ON DELETE set null`); owner decision 3 blocks the delete instead.

## QA log (2026-11-11)

Run on the final `dev` code (`57e756d`, PR #28) plus the Studio stylesheet fixes below, as local production builds on fresh, migrated and seeded databases. Plan `p2-journal`, tasks 1–9; the per-task commits are on `feat/p2-journal` (PR #28 was squash-merged because `dev` accepts squash only, ADR-0003). Rows marked "Tn" cite that task's verification on the same kind of build; the rest were re-run on the final build. axe is axe-core 4.14 from the project's own dependencies (WCAG 2.2 AA tags).

| Criterion | Result | Evidence |
|---|---|---|
| `posts` and `categories` with the Build Spec's fields and admin positions; `posts.story` uses the shared Story blocks | Pass | Migration `20261111_040428_p2_journal` applies on a fresh database after the P1 migrations. Studio: Journal group (Posts, Categories); post editor with Content and SEO tabs and sidebar Category, Published At, Related Projects, Slug (T2) |
| A logged-out REST request for a draft post returns nothing | Pass | `where[_status][equals]=draft` → 0 docs; `?draft=true` hides drafts and a published post with a newer draft, also by id; `/api/posts/versions` → `403`; anonymous writes → `403` (T2) |
| 11+ published posts: 10 on `/journal`, the rest on `/journal/page/2`; numbers and "Older stories →" by keyboard | Pass | Seeded 11: page 1 shows 10 with the pagination row, page 2 shows 1 with no "Older stories"; tab order header → rows → page numbers (T6) |
| `/journal/page/1` 308s to `/journal`; out-of-range and malformed pages are 404 | Pass | curl: `1` → `308 /journal`; `3`, `9`, `0`, `02`, `abc`, `2.5` → `404` (T6) |
| `next build`: `/journal` ○, `/journal/page/[n]` and `/journal/[slug]` ● | Pass | Route tables on the T6, T7 and final builds; P1 routes unchanged |
| Publishing refreshes the entry, `/journal`, every `/journal/page/N` and `/`; a draft save refreshes nothing | Pass | Server logs per save; a newer post moved a post onto `/journal/page/2` on the next request (route pattern `'/(frontend)/journal/page/[n]'`); a published edit showed on the entry and `/journal` (T3, T6, T7) |
| Category changes refresh every page; a category in use can't be deleted | Pass | A rename logs a whole-site refresh; deleting a used category → `400` "Used by 1 post. Move it to another category first.", shown as a Studio toast; an unused one deletes (T3) |
| A project's public change refreshes every entry | Pass | Unpublishing `couple-names-wedding` removed its "See the work" link from its entry on the next visit; republishing restored it (T7) |
| Draft changes show only in live preview and draft mode | Pass; one item unverified | Draft-mode cookie without a session → published version; cookie + editor → draft; draft-only slug → `404` for the public; `/next/preview` → `403` without a session or with a wrong secret. Studio live preview renders the entry and updates on edit; its size menu lists Mobile, Tablet and Desktop, but switching sizes was not exercised (scripted clicks on Payload's popup failed) (T7) |
| A post slug change 308-redirects the old URL | Pass | Published rename → old URL `308` to the new one in one hop; `previousSlugs` recorded (T7) |
| "See the work": one link for one project, titled links for several | Pass | Seeded posts with 1 and 2 related projects; unit tests for 0, 1 and 2+ (T7) |
| Dates render as "6 Nov 2026" in Singapore time, including September | Pass | Rows show "4 Sep 2026", "11 Sep 2026"; unit tests for September, the Singapore day boundary and New Year (T5, T6) |
| `publishedAt` fills on first publish and keeps a hand-set date | Pass | REST: publish without a date → filled; draft → empty; hand-set → kept (T2) |
| Pages 09 and 10 match their captures at 1440 px and work at 390 px with no horizontal scroll | Pass, with recorded deviations | Screenshots at 1440 and 390 px against captures 09 and 10; no horizontal scroll at 320, 375, 390, 768, 1280 and 1440 px. Deviations: opener titles wrap wider than the captures (ChapterOpener sets no title width); entry text and pull quote sit at the left of the story column where capture 10 centres them (P1 StoryBlocks reused unchanged); the entry footer follows the text column |
| Seed runs twice without duplicates | Pass | 4 categories and 12 posts after both runs; "already exists" on the second (T4) |
| DoD: keyboard | Pass | Journal list: header → rows → page numbers; entry: header → breadcrumb → Back to journal → See the work → finale; dual ring on each stop. Post editor: every field reachable (Publish is disabled until a change, so it is skipped) |
| DoD: axe WCAG 2.2 AA | Pass on site pages; Studio exceptions recorded | 0 violations on `/journal`, `/journal/page/2`, three entry variants, `/portfolio`, both collection layouts and a project page, at 1440 and 390 px. The P1 cards and rows needed the title-link fix first (`9c632aa`): axe 4.14 flags whole-card links named by `aria-labelledby` (P1's QA ran axe 4.10.2) |
| DoD: code health | Pass | typecheck, lint, 233 unit tests |
| DoD: Vercel preview | Pass (builds only) | PR #28 `checks` and `Vercel` green; `dev`'s deployment of `57e756d` succeeded. Protected previews were not browsed |

### Studio accessibility (same policy as P0 and P1)

This task added to `src/app/(payload)/custom.scss`, with axe 4.14 findings that also affect P1's lists:

- List column headers used `#9a9a9a` on white (2.8:1) and now use `--theme-elevation-700`: colour-contrast 4 → 0 on Posts, 2 → 0 on Categories, 6 → 0 on Projects.
- Sort arrows (20 px wide), the date field's clear button and the relationship chips' edit and remove controls get a 24 × 24 px minimum: target-size 8 → 0 on Posts, 4 → 0 on Categories, 12 → 0 on Projects, 4 → 1 on the post editor.

These remain inside Payload's built-in components and go to the P6 theme (screens 25 and 26) and upstream Payload:

- Posts list: unnamed pagination arrows (`button-name` ×2); row-select checkboxes with an empty `aria-label` (`label` ×10). Categories list: `label` ×4.
- Post editor: `button-name` ×13 (popup, upload and block-row buttons); block drag handles (`aria-command-name` ×6); react-select parts inside `aria-hidden` (`aria-hidden-focus` ×8); react-select and checkbox labels (`label` ×5); the Lexical editor (`aria-input-field-name` ×2); document tabs (`list` ×1); the "Versions" tab named without its count (`label-content-name-mismatch` ×1); relationship chips (`nested-interactive` ×1); react-select's auto-growing input, 4 px wide until you type (`target-size` ×1).
- Category editor: `button-name` ×1, `list` ×1.

### Follow-ups

- Check the Studio live preview size switching (Mobile 390, Tablet 768, Desktop 1440) by hand once.
- Decide whether opener titles should wrap to the captures' width and whether entry text and quotes should be centred (shared P1 components; P6 theme or P7).
- Delete the PR #28 preview deployment and its Neon branch once merged work is no longer being reviewed.
- From P1, still open: favicon, `metadataBase` (P7).
