# StudioOverview

## Purpose

The Studio's home at `/admin` (screen 21): what needs the editor today. It replaces Payload's default dashboard (`admin.components.views.dashboard`). Sources: captures 21 at 1440 px and 390 px; the Build Spec section "Admin (Studio) customisation" (Overview: Needs a reply · Drafts · On the home page · Recently edited); the P5 owner decisions of 2026-11-11, which change three of capture 21's panels (see Usage).

## Anatomy

**Page** (inside Payload's default template, beside StudioNav): `--color-studio-page`; padding `--space-8` block-start, `--space-12` block-end, `--space-5` inline below 768 px and `--space-12` from 768 px.

1. **Header**, then the panels `--space-8` below:
   - **Label:** `<p>` "Studio": `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Title:** `<h1>` "Overview": `--font-display`, `--fw-regular`, `--fs-studio-title`, `--lh-section`, uppercase, `--color-text`.
   - **Greeting:** `<p>` "Good to see you. Here's what needs you today.": `--fs-body`, `--color-text-muted`, `--space-3` above.
   - **Actions:** Button `outline-ink` "View site" → `/` and Button `ink` "New project" → `/admin/collections/projects/create`, both size `default`, `--space-3` apart.
2. **Panels grid:** `repeat(auto-fit, minmax(min(var(--grid-min-tile), 100%), 1fr))`, gap `--space-6`, `align-items: start`. Order: Needs a reply, Drafts, On the home page, then Recently edited across the full row (`grid-column: 1 / -1`).

**Panel** (`<section aria-labelledby>`): `--color-studio-card`, `--border-hairline` solid `--color-studio-card-border`, `--radius-cms-card`, padding `--space-6`.

- **Panel head:** a row, `justify-content: space-between`, `align-items: center`, `--space-4` padding-block-end and a `--border-hairline` `--color-studio-row-rule` bottom border:
  - `<h2>`: `--fs-label-lg`, `--fw-semibold`, `--tracking-nav`, uppercase, `--color-text`;
  - optional **count pill** (hidden at 0): `--radius-pill`, min-height `--space-6`, padding-inline `--space-3`, `--fs-label`, `--fw-semibold`.
- **Rows:** a `<ul>` (an `<ol>` for hero slides); each `<li>` padded `--space-5` block with a `--border-hairline` `--color-studio-row-rule` bottom border, the last without one; `position: relative` for the stretched title link.
- **Row title link:** `<a>` with `--fs-body`, `--fw-semibold`, `--color-text`, no underline; `::after { position: absolute; inset: 0 }` makes the whole row the target (conventions: card and row links).
- **Meta:** `--fs-sm`, `--color-text-muted`, `--space-1` below the title.
- **Thumbnail:** `--studio-thumb-w` wide, `aspect-ratio: 3 / 2`, `object-fit: cover`, `alt=""`, square corners; `--color-frame` when the doc has no cover. The image is the cover's `thumb` size.
- **Date:** `<time datetime>` through `formatDate`, `--fs-sm`, `--color-text-muted`.
- **Footer links**, `--space-5` above: Button `text` with the trailing arrow, `--color-text`; two links sit `--space-6` apart.
- **Empty line** (in place of the list): `<p>` `--fs-sm`, `--color-text-muted`, `--space-5` padding-block.

**The four panels:**

| Panel | Count pill | Rows | Empty line | Footer |
|---|---|---|---|---|
| Needs a reply | "{n} new": `--color-action` fill, `--color-on-action` text | Up to 3 newest `new` inquiries: name (title link → the inquiry), meta = `projectType`, date received at the inline end | "Nothing waiting." | "Open inquiries" → `/admin/collections/inquiries` |
| Drafts | "{n} unpublished": `--color-chip-draft-bg` / `--color-chip-draft-fg` | Up to 3 draft projects and posts, newest saved first: thumbnail, title link → editor, meta "{collection name} · {projectType}" for a project, "Journal · {category}" for a post | "No drafts." | "All projects" → `/admin/collections/projects`; "All posts" → `/admin/collections/posts` |
| On the home page | none | Sub-label "Hero slides, in order" (`--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`, `--space-4` above), then an `<ol>` of the published slide titles: the number "01" (`--fs-sm`, `--color-text-muted`, tabular figures, `--space-6` wide) and the title (`--fs-body`, `--color-text`). Plain text, no links. Then the Selected work line (`<p>`, `--fs-sm`, `--lh-body`, `--color-text-muted`, `--space-5` above) | Rows: "No hero slides published yet." The Selected work line always shows | "Edit Home page" → `/admin/globals/home` |
| Recently edited | none | 4 latest saved projects and posts: thumbnail, title link → editor, meta "Project · {projectType}" / "Journal · {category}", collection name ("—" for a post, `aria-hidden`), status chip, date, "Edit" (`aria-hidden`, underlined, `--fs-sm`, `--fw-medium`) | "Nothing edited yet." | none |

A blank slide title shows `site-settings.headline` (P4 owner decision 3).

**Selected work line** (`copy.ts`; N = published projects with "Show in Selected work"):

| N | Text |
|---|---|
| 0 | Nothing is marked “On home” yet. |
| 1 | Selected work shows 1 piece you've marked “On home”. |
| 2–9 | Selected work shows N pieces you've marked “On home”. |
| over 9 | Selected work shows the first 9 of N pieces you've marked “On home”. |

**Status chip** (Recently edited): `--radius-pill`, min-height `--space-6`, padding-inline `--space-3`, `--fs-label`, `--fw-semibold`, text always shown:

| Status | When | Fill | Text | Border |
|---|---|---|---|---|
| Published | The latest saved version is the published one | `--color-chip-published-bg` | `--color-chip-published-fg` | none |
| Draft | The doc is not live (never published, or unpublished) | `--color-chip-draft-bg` | `--color-chip-draft-fg` | none |
| Unpublished changes | The doc is live and a newer draft is saved | `--color-chip-changes-bg` | `--color-chip-changes-fg` | `--border-hairline` solid `--color-chip-changes-fg` |

**Recently edited row layout** (a container query on the panel, so the sidebar width never matters):

- Panel narrower than 720 px: thumbnail beside a column of title, meta, then a line with the collection name, the chip, the date and "Edit", wrapping, `--space-3` apart.
- Panel 720 px or wider (as capture 21): one grid row, `grid-template-columns: var(--studio-thumb-w) minmax(0, 3fr) minmax(0, 2fr) auto auto auto`, column gap `--space-6`, `align-items: center`.

All copy (label, title, greeting, panel names, pills, empty lines, links, "Edit", the Selected work line, "Project", "Journal") lives in `copy.ts`.

## Variants

Each panel has a data and an empty variant. The count pills are hidden at 0.

## Sizes

One. The title uses the fixed `--fs-studio-title` (captures 20 and 21 draw it at the same size on desktop and phone).

## States

| State | What changes |
|---|---|
| Default | As in Anatomy |
| Hover | The row title gets an underline at `--underline-offset`; footer text links thicken to `--border-strong` (Button `text`); action buttons per Button |
| Focus-visible | Global dual focus ring on the title link (the ring follows the link box, not the stretched area) |
| Active | Same as hover |
| Empty | The panel's empty line; count pill hidden |
| Loading | None: a server component, rendered complete |
| Error | A failed query fails the page into Payload's error view; nothing partial is shown |
| Disabled | Not applicable |

## Props/API

```ts
// admin.components.views.dashboard: a server component; Payload passes initPageResult (req.user, req.payload)
type StudioOverviewProps = { initPageResult: InitPageResult }

// From src/lib/studio.ts (all reads: overrideAccess false, user = the editor)
type StudioDocRow = {
  id: string | number
  collection: 'projects' | 'posts'
  title: string
  meta: string
  thumbUrl: string | null
  editUrl: string
  updatedAt: string
}
type NeedsReply = { total: number; rows: { id: string | number; name: string; projectType: string; receivedAt: string; editUrl: string }[] }
type Drafts = { total: number; rows: StudioDocRow[] }
type HomeLineup = { slideTitles: string[]; selectedWorkCount: number }
type RecentRow = StudioDocRow & { collectionName: string | null; status: 'published' | 'draft' | 'changes' }
```

A pure view takes these plain values, so every state renders in tests without a database.

## Accessibility

- One `<h1>` ("Overview"); each panel is a `<section aria-labelledby>` with an `<h2>`.
- Rows are lists; hero slides are an ordered list. Each row's title is its only link, named by the title; "Edit" and the "—" are `aria-hidden` (conventions: row links).
- The count pill and chips are text, never colour alone.
- Dates are `<time datetime>`; thumbnails are decorative (`alt=""`).
- Targets: row links cover the whole row (≥ 44 px high); Buttons per the Button spec.
- Contrast (computed 2026-11-11):
  - text `--ink` on `--surface` 16.7:1, `--muted` on `--surface` 6.6:1; on the page `--ink` / `--muted` on `--bone` 15.4:1 / 6.1:1;
  - "{n} new" `--bone` on `--ink` 15.4:1; "{n} unpublished" and Draft chip `--muted` on `--stone` 5.5:1;
  - Published chip `--chip-published-fg` on `--chip-published-bg` 7.8:1; Unpublished changes `--chip-published-fg` on `--surface` 9.3:1;
  - card border and row rules are decorative (the cards are not controls).

## Responsive

- **Below 768 px:** one column; header actions wrap below the greeting, `--space-5` above; Recently edited rows stack (container below 720 px). Capture 21 at 390 px lets the Recently edited row run off the screen; this layout replaces it.
- **768 px and up:** the grid fits two or three panels by width (three at 1440 px with the sidebar, as capture 21); the header is one row, title block left and actions right, `align-items: end`.
- No horizontal scroll at 320 px. Long titles wrap; long collection names wrap in their column.

## Usage

- Only at `/admin`.
- Changes from capture 21 (owner decisions 2026-11-11, recorded in `docs/design/README.md`):
  - "On the home page" lists the published hero slides and the Selected work line, and links "Edit Home page" to the `home` global (the capture's "Edit in site settings" points at the wrong place: slides live in `home`).
  - Drafts covers projects and posts, with two footer links.
  - Needs a reply shows `projectType` only: inquiries have no sub-type field.
  - Recently edited has the third chip, "Unpublished changes".
  - Payload's app header bar (account link; the drawer toggle below 1024 px) stays above the page; capture 21 omits it.
- Motion: underline and colour transitions over `--duration-fast`, none under `prefers-reduced-motion`.

## Preview

[Open preview](../preview/index.html#pv-studio-overview)
