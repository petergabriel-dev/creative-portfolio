# StudioFilterPills

## Purpose

Collection filter pills on the Projects list (screen 22): one tap shows the projects of one collection (discipline), with each collection's project count. Rendered in Payload's `beforeListTable` slot of `projects`; the filter itself is the collection's `admin.baseFilter`, which reads `?collection=<slug>`. Sources: captures 22 at 1440 px and 390 px; the Build Spec section "Admin (Studio) customisation" (collection filter pills); P6 owner decision 8 (2026-11-12).

## Anatomy

`<nav aria-label="Filter by collection">` holding a `<ul>`: `display: flex`, `flex-wrap: wrap`, gap `--space-3`, `--space-5` margin-block-end (above Payload's table).

- **Pills**, in order: "All", then every discipline in `order` (one with no projects included). Each `<li>` holds a link styled as the inbox status pill ([StudioInbox](StudioInbox.md)):
  - `--radius-pill`, min-height `--tap-min`, padding-inline `--space-5`, `--border-hairline` solid `--color-studio-field-border`, `--fs-sm`, `display: inline-flex`, `align-items: center`, gap `--space-2`;
  - text: the name (`--fw-semibold`, `--color-text`), then the count (`--fw-regular`), then a visually hidden " projects" / " project" so the name reads "Photography 3 projects";
  - current: `--color-action` fill and border, `--color-on-action` text, `aria-current="true"`.
- **Counts:** All = every project; a discipline = its projects. Drafts are included and each project is counted once, from its latest version, so a count equals the rows the list shows for that pill with no search or other filter. Counts don't change with search or filter-builder conditions.
- **Links:** each keeps the list's current `search`, `where`, `sort` and `limit` parameters, drops `page`, and sets `collection=<slug>` ("All" removes it).

Names come from the disciplines; the visually hidden suffix lives in `copy.ts`.

## Variants

- "All" current (no `collection` parameter, or one that matches no discipline).
- One discipline current.

## Sizes

One.

## States

| State | What changes |
|---|---|
| Default | As in Anatomy |
| Current | `--color-action` fill, `--color-on-action` text, `aria-current="true"` |
| Hover | Border `--color-text` (current pill unchanged) |
| Focus-visible | Global dual focus ring on the link |
| Active | Same as hover |
| Zero count | The pill shows "0" and still links; the list then shows Payload's empty state |
| Unknown slug | Treated as no filter: "All" is current and the list is unfiltered |
| Loading / Error / Disabled | None: a server component rendered with the list; a failed read fails the page into Payload's error view |

## Props/API

```ts
// beforeListTable slot (server). Payload passes list-view serverProps.
type StudioFilterPillsProps = { payload: Payload; user: TypedUser | null; searchParams: Record<string, string | string[] | undefined> }

// From src/lib/studio.ts (reads as the editor)
type ProjectCounts = { all: number; items: { id: number; name: string; slug: string; count: number }[] }

// Pure view, testable without a database
type StudioFilterPillsViewProps = { counts: ProjectCounts; current: string | null; hrefFor: (slug: string | null) => string }
```

## Accessibility

- A labelled `<nav>` with a list of links; the current one carries `aria-current="true"`, so the state is not colour alone.
- Each link's name contains its visible text ("Photography 3", WCAG 2.5.3), extended by the hidden " projects".
- Keyboard: Tab reaches every pill; Enter applies it.
- Targets: min-height `--tap-min`.
- Contrast (computed 2026-11-12): name and count `--ink` on `--bone` 15.4:1; current `--bone` on `--ink` 15.4:1; pill edge `--field-border` on `--bone` 3.2:1.
- Motion: border and colour transitions over `--duration-fast`, none under `prefers-reduced-motion`.

## Responsive

- Pills wrap onto as many rows as needed (two rows at 390 px, capture 22 mobile); one row at 1440 px.
- No horizontal scroll at 320 px; a long collection name wraps inside its pill.

## Usage

- Only on the Projects list (`/admin/collections/projects`).
- Change from capture 22 (recorded in `docs/design/README.md`): the pills sit in Payload's `beforeListTable` slot, below Payload's own search and filter bar, not on one row with the search field.

## Preview

[Open preview](../preview/index.html#pv-studio-pills)
