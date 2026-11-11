---
id: ADR-0005
title: Journal path pagination, refresh scope and Singapore dates
status: Active
date: 2026-11-11
readWhen: changing journal URLs or pagination; touching post, category, project, home or about publish hooks; formatting a date; deleting or renaming categories
---

# ADR-0005: Journal path pagination, refresh scope and Singapore dates

## Decision

- **Path pagination, all static** (owner decision 1, 2026-11-11).
  - Page 1 is `/journal`; pages 2 and on are `/journal/page/N`, prerendered from `generateStaticParams`. This replaces the Build Spec's `/journal?page=N`.
  - `/journal/page/1` 308s to `/journal`. N past the last page, or anything that is not a plain whole number from 2 up (`0`, `02`, `abc`, `2.5`), renders the 404 page.
  - List order is `-publishedAt`, then `-id`, so posts sharing a date keep their place across pages.
- **Refresh scope.** Hooks act only when the published state changes (ADR-0004), then refresh:
  - a post: its entry (old and new URL), `/journal`, every `/journal/page/N` and `/`;
  - a category (any save or delete): every page, because entries show its name (owner decision 2);
  - a project's public change: its P1 paths plus every journal entry, so "See the work" links never point at a stale URL or a 404 (owner decision 6), and `/` always, not only while `showOnHome` is ticked (updated 2026-11-11, P4 owner decision 4: a Home hero slide can link any project);
  - the `home` global: `/`; the `about` global: `/about` (P4). They have drafts, so `globalPublishHooks` refreshes only when the global's main row changes (publish or unpublish), never on a draft save.
  - "Every page of a dynamic route" uses `revalidatePath(<route pattern>, 'page')`, and the pattern names the route **file**, route group included: `'/(frontend)/journal/[slug]'`, `'/(frontend)/journal/page/[n]'`.
- **Categories in use can't be deleted** (owner decision 3). A `beforeDelete` hook refuses with a 400 "Used by N posts. Move them to another category first."
- **`publishedAt` is a label and a sort key** (owner decision 4). It is filled with the publish time only when empty and the save publishes (a `beforeValidate` field hook); a hand-set date is kept; a future date neither hides nor schedules a post.
- **Dates read "6 Nov 2026" in Asia/Singapore time** (owner decision 5), through `formatDate`, with month names from `copy.ts`.

## Why

- `searchParams` would make `/journal` dynamic for every visitor (invariant 22) and wake Neon on each list view; path URLs keep every journal page static with no proxy and no client JavaScript.
- Posts shift between list pages on every publish, so refreshing all of them is the only correct scope, and the route pattern does it without counting pages.
- Home links projects from two places: Selected work (`showOnHome`) and hero slides (any project). Refreshing `/` on every public project change keeps both right with one more cached page to rebuild, instead of looking up which projects the `home` global links (P4).
- Next tags a page by its file path (`/(frontend)/journal/[slug]/page`) and `revalidatePath` does not strip route groups; a pattern without the group matches nothing (read in `next/dist/server/lib/implicit-tags.js` and `spec-extension/revalidate.js`, then verified live).
- A required relationship in a drafts-enabled collection is a nullable column with `ON DELETE set null`, so deleting a used category would silently clear it from posts.
- Vercel renders in UTC; without a fixed time zone a post published early in the Singapore morning would show the previous day.

## Affects

Docs:

- `docs/specs/phase-2-journal.md`
- `docs/specs/phase-4-home-about.md`
- `docs/specs/README.md`
- `docs/design/README.md`
- `docs/design/components/Pagination.md`
- `docs/engineering/architecture.md`
- `docs/engineering/invariants.md`
- `docs/engineering/conventions.md`
- `docs/engineering/traps.md`

Code:

- `src/app/(frontend)/journal/page.tsx`
- `src/app/(frontend)/journal/page/[n]/page.tsx`
- `src/app/(frontend)/journal/[slug]/page.tsx`
- `src/lib/journal.ts`
- `src/lib/publishing.ts`
- `src/lib/date.ts`
- `src/hooks/publishHooks.ts`
- `src/hooks/revalidatePost.ts`
- `src/hooks/revalidateProject.ts`
- `src/hooks/categoryHooks.ts`
- `src/collections/Posts.ts`
- `src/collections/Categories.ts`
- `src/globals/Home.ts`
- `src/globals/About.ts`

## Consequences

- Good: every journal page is static and refreshed on demand; no proxy, no client JavaScript, no dynamic list.
- Good: renames, unpublishes and category changes never leave a stale page or a broken "See the work" link.
- Good: dates are the same on every server and in every visitor's browser.
- Bad/risk: a post publish invalidates every list page, and a project change invalidates every entry and Home; they rebuild lazily on their next visit, which is cheap at this size.
- Bad/risk: the URL shape differs from the Build Spec; anyone reading the Build Spec alone would expect `?page=N`.
- Bad/risk: draft versions that point at a category don't block its delete; the next publish of that post asks for a category.

## Read when

- changing journal URLs, pagination or list order
- touching post, category, project, `home` or `about` publish hooks, or adding a dynamic route that needs a whole-route refresh
- formatting a date
- deleting or renaming categories

## Supersedes

- None. Overrides the Build Spec's `/journal?page=N` and its "A category → `/journal`" refresh row.
