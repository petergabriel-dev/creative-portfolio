---
id: ADR-0004
title: Slug redirects from previous slugs on the doc, and publish hooks driven by the main row
status: Active
date: 2026-11-10
readWhen: changing a slug field, a collection URL or its redirects; adding a drafts-enabled collection with public pages (posts in P2); touching publish or revalidation hooks
---

# ADR-0004: Slug redirects from previous slugs on the doc, and publish hooks driven by the main row

## Decision

- **Old slugs live on the doc.** Projects and disciplines (and posts in P2) carry a hidden `previousSlugs` text list.
  - There is no `redirects` collection and no redirects plugin (owner decision, 2026-11-10; resolves the Build Spec open question).
- **Old URLs 308 to the canonical URL in one hop.**
  - A collection URL looks the slug up among current slugs first, then among `previousSlugs`; the most recently updated doc wins.
  - A project is found by its slug alone (unique across projects), else by a previous slug. Any URL that isn't `/portfolio/<current collection slug>/<current project slug>` 308s there, which covers renamed collections and moved projects without storing anything.
  - Renaming back to an earlier slug drops it from the list.
- **Only published slug changes are recorded.** A slug that only ever existed in a draft never becomes a redirect.
- **Publish hooks compare the main row, not `previousDoc`.**
  - For drafts-enabled collections, Payload's `previousDoc` is the latest version, often an autosaved draft that already holds the new slug.
  - The main row is the last published state: draft and autosave saves only write versions.
  - `beforeChange` snapshots it on `req.context`; `afterChange` re-reads it and refreshes the old and new public paths only when it changed (publish, unpublish, rename, move); `afterDelete` refreshes a deleted published doc's pages.
- **A discipline change refreshes the whole site** (`revalidatePath('/', 'layout')`), because project pages show its name and use its slug (owner decision 4).

## Why

- No extra collection, Studio screen or plugin to maintain, and every redirect is one hop: no chains to flatten when a slug changes again.
- The canonical check makes most redirects free; only a doc's own old slugs need storing.
- The main-row comparison is the only reliable way to tell a public change from a draft or autosave save; without it, renames were missed and drafts triggered refreshes (both reproduced while building P1).

## Affects

Docs:

- `docs/engineering/architecture.md`
- `docs/engineering/invariants.md`
- `docs/engineering/traps.md`
- `docs/specs/phase-1-portfolio.md`
- `docs/specs/README.md`

Code:

- `src/fields/slug.ts`
- `src/hooks/revalidateProject.ts`
- `src/hooks/revalidateDiscipline.ts`
- `src/lib/publishing.ts`
- `src/lib/portfolio.ts`
- `src/app/(frontend)/portfolio/[collection]/page.tsx`
- `src/app/(frontend)/portfolio/[collection]/[project]/page.tsx`

## Consequences

- Good: renames are safe for visitors and search engines without editor effort; old links never chain.
- Good: autosave and "Save draft" never refresh public pages or create redirects.
- Bad/risk: hand-made redirects (for example from an older site) are not supported; adding them later needs a redirects store.
- Bad/risk: if two docs once used the same slug, the old URL goes to the most recently updated one.
- Bad/risk: each publish costs two extra primary-key reads of the main row, which is negligible.
- Bad/risk: on-demand 308s and 404s are cached per path; publishing a doc refreshes its new URL, and discipline changes refresh everything, which clears them.

## Read when

- Changing a slug field, a collection URL or its redirects.
- Adding a drafts-enabled collection with public pages (posts in P2).
- Touching publish or revalidation hooks.

## Supersedes

- None. Resolves the Build Spec open question "Where do slug redirects live: a small `redirects` collection, or Payload's redirects plugin?"
