---
id: ADR-0008
title: Studio extras - inbox list view with an editor-scoped status action, filter pills through baseFilter, accent swatches, layout-only theme pass
status: Active
date: 2026-11-12
readWhen: changing the inquiries inbox, its status action or the Overview's inquiry links; touching the projects list, its filter pills or baseFilter; changing site-settings.accent or its swatches; changing editor layout (groups, rows, sidebar, labels) or custom.scss; upgrading Payload
---

# ADR-0008: Studio extras - inbox list view with an editor-scoped status action, filter pills through baseFilter, accent swatches, layout-only theme pass

## Decision

- **Two-panel inbox as the inquiries list view** (P6 owner decisions 3–7, 2026-11-12). `inquiries` sets `admin.components.views.list.Component` to `StudioInbox`, a server component fed by `studioInbox()` (`src/lib/studio.ts`): three status counts, a `findByID` for `?id=` and one page of 20, newest first, every call as the editor. The tab, page and selection live in the URL; every inbox link and the action's returned URL come from `inboxHref()` (`src/lib/studioInbox.ts`). No "All" tab, no bulk actions, no search; notes and delete stay in Payload's edit view ("Open full record →"). The Overview's Needs a reply rows link into the inbox.
- **Reply in Gmail, with a copy fallback** (owner decision 10, after the v0.7.0 release). The owner replies from Gmail in the browser, where the first `mailto:` "Reply by email" opened nothing. "Reply in Gmail" opens Gmail's compose window in a new tab (`gmailReplyHref`: `view=cm`, `to` the visitor, a fixed subject, `authuser` from `site-settings.contactEmail` when valid, all values URL-encoded, only for an address Payload accepts); `studioInbox()` reads that contact email as the editor. "Copy email" copies the address and announces the result.
- **Status changes through one server action that acts as the editor.** `setInquiryStatus` (`src/components/studio/inboxActions.ts`) checks every field against an allowlist before any database call, gets the editor from the session cookie (`payload.auth({ headers })`), writes only `status` with `overrideAccess: false` and returns `{ notice, href }` instead of redirecting. The client (`StudioInboxActions`, keyed per inquiry) replaces the URL; `StudioInboxFocus`, at the same place on every inbox page, owns the live region and moves focus to the next inquiry's heading. It also re-runs Back/Forward navigations whose history state Payload's `ListQueryProvider` wiped.
- **Filter pills through `baseFilter`** (owner decision 8). `StudioFilterPills` sits in the projects list's `beforeListTable` slot and links to `?collection=<slug>`, keeping the list's other parameters; `admin.baseFilter` (`collectionFilter`) turns a known slug into `collection equals <id>`, which Payload ANDs with the list's search and filter-builder `where`. Counts come from one `find({ draft: true })` grouped by collection, the same latest-version rows the list shows.
- **Accent swatches as a field component** (owner decision 9). `site-settings.accent` keeps its select values; `admin.components.Field` is `StudioAccentSwatches`, native radios drawn as swatches with visible names and a preview that reuses the site's `Button`.
- **Theme pass limited to layout-only config and the stylesheet** (owner decision 1). Screens 22–26 and 28–31 stay Payload's views: unnamed `group` cards, `row`s, `admin.position: 'sidebar'`, `admin.width`, labels and descriptions in the collection and global configs, and a P6 section in `custom.scss` (tokens only, classes listed). Nothing that changes the schema, no new custom views; placeholders, conditions, translated button text, the SEO plugin's field override and a "View page" link are out. Differences left are recorded in `docs/design/README.md`.
- **Payload stays pinned at 3.93.0**; the list view slot, `beforeListTable`, `baseFilter`, the field component props and the classes in `custom.scss` are re-checked on every upgrade.

## Why

- Payload's list view has no detail panel or status buttons, and its edit view hides the reply link and status behind a form save; the inbox makes triage one screen. A list-view override keeps the collection's own URL, the sidebar link and access checks, at the cost of Payload's unused list query.
- A server action is a public endpoint, so the write is validated and scoped like a REST call would be, and it never trusts the form for who the user is or where to go next. Returning state instead of redirecting keeps the announcement and the focus move on the client, which a redirect would discard.
- A URL parameter read by `baseFilter` composes with Payload's own search and filter builder without rewriting their `where`, and REST ignores it, so relationship pickers are unaffected.
- A field component keeps the stored values and validation of the existing select, so the site's accent code (`accentToken`) is unchanged.
- Layout-only options give the captures' structure without a migration or a second set of views to maintain; anything beyond them was a scope the owner declined.

## Affects

Docs:

- `docs/specs/phase-6-studio-extras.md`
- `docs/specs/README.md`
- `docs/design/README.md`
- `docs/design/components/StudioInbox.md`
- `docs/design/components/StudioFilterPills.md`
- `docs/design/components/StudioAccentSwatches.md`
- `docs/design/components/StudioOverview.md`
- `docs/engineering/architecture.md`
- `docs/engineering/conventions.md`
- `docs/engineering/invariants.md`
- `docs/engineering/traps.md`
- `docs/engineering/dev-workflow.md`
- `docs/engineering/decisions/ADR-0007-studio-custom-views-and-login.md` (referenced, not superseded: the log-in, sidebar and Overview stand)

Code:

- `src/collections/Inquiries.ts`
- `src/collections/Projects.ts`
- `src/collections/Disciplines.ts`
- `src/collections/Posts.ts`
- `src/collections/Media.ts`
- `src/globals/SiteSettings.ts`
- `src/globals/Home.ts`
- `src/globals/About.ts`
- `src/blocks/story.ts`
- `src/fields/slug.ts`
- `src/lib/studio.ts`
- `src/lib/studioInbox.ts`
- `src/lib/inquiry.ts`
- `src/components/studio/StudioInbox.tsx`
- `src/components/studio/StudioInboxActions.tsx`
- `src/components/studio/StudioInboxFocus.tsx`
- `src/components/studio/inboxActions.ts`
- `src/components/studio/StudioFilterPills.tsx`
- `src/components/studio/StudioAccentSwatches.tsx`
- `src/components/ui/Button.tsx`
- `src/app/(payload)/custom.scss`
- `src/app/(payload)/admin/importMap.js`
- `src/styles/tokens.css`
- `src/copy.ts`

## Consequences

- Good: the editor reads, replies to and files inquiries on one screen, by keyboard, with each change announced; counts and the sidebar badge are fresh after every change.
- Good: no write path bypasses access; the action's checks, editor scope and log content are unit-tested (`tests/unit/inboxActions.test.ts`, `tests/unit/studioInbox.test.ts`).
- Good: the pills, swatches and layout add no schema, migration or new data path; reverting any of them is a config change.
- Bad/risk: the inbox, pills, swatches and stylesheet depend on Payload internals (the list view override's props, `ListQueryProvider`'s URL rewrite, `baseFilter`, field component props, admin class names); a Payload upgrade can break them.
- Bad/risk: Payload still runs its list query before the inbox renders (one small wasted read per load), and the Back/Forward fix works around Payload's `history.replaceState(null, …)`.
- Bad/risk: Payload's own components keep their accessibility gaps (recorded per phase), and the SEO plugin's inline colours fail contrast without a stylesheet fix.
- Bad/risk: "Reply in Gmail" ties the main reply button to Gmail and to its compose URL, a de-facto format rather than a documented API. "Copy email" works with any mail service, and returning to `mailto:` is a change to one function (`gmailReplyHref`).

## Read when

- changing the inquiries inbox, its status action or the Overview's inquiry links
- touching the projects list, its filter pills or `baseFilter`
- changing `site-settings.accent` or its swatches
- changing editor layout (groups, rows, sidebar, labels) or `custom.scss`
- upgrading Payload

## Supersedes

- none
