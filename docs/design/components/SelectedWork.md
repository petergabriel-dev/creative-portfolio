# SelectedWork

## Purpose

Home's "Chapter 01 · Selected work" grid (screen 01): up to nine published projects with "Show in Selected work" (`showOnHome`) ticked, in `homeOrder`, each linking to its project page. Source: capture 01, Build Spec "Front-end pages › Home" ("up to 9, masonry, number + collection captions"), owner decisions 2026-11-11.

## Anatomy

The chapter itself (section, ChapterHeading with `home.selectedWorkIntro` as the aside) belongs to the Home page. SelectedWork renders only the grid:

1. **Columns:** the items are split, in order, into three column groups of ⌈n ÷ 3⌉ (`selectedWorkColumns`): items 1–3 in the first, 4–6 in the second, 7–9 in the third (capture 01 numbers down each column). DOM order is therefore 01…09, the same as the visual reading order at every width. Each column is a `<ul role="list">` laid out as a flex column, gap `--space-4`.
2. **Tile** (one per project, `position: relative`, flex column, gap `--space-3`):
   - **Image:** MediaImage of the project's `cover` with `aspect="original"` (its stored width and height, so tiles of different shapes stack like masonry with no layout shift), `alt=""` — the tile's link names it. A missing cover shows the tinted frame at 3:2.
   - **Caption:** the tile's only link (`<a href>` to `/portfolio/<collection>/<project>`), a flex row with `justify-content: space-between`, gap `--space-3`: the number ("01", two digits) on the left and the collection name on the right. `--fs-label`, `--fw-semibold`, `--tracking-label`, `--lh-label`, uppercase, `--color-text-muted`, no underline. After the visible text, a visually hidden ", {project title}". The link's `::after` (`position: absolute; inset: 0`) stretches its click and tap area over the whole tile.

## Variants

- One to nine items. With fewer than three items, the empty column groups are not rendered.
- No items: SelectedWork is not rendered, and Home leaves the chapter out and renumbers the rest (owner decision 2026-11-11).

## Sizes

One.

## States

- **Default:** as above.
- **Hover:** anywhere on the tile; the caption gets an underline at `--underline-offset` (`--border-hairline`). Colours never change.
- **Focus-visible:** the global dual focus ring around the caption link.
- **Active:** same as hover.
- **Missing cover:** tinted frame. **Missing collection** (project without a published collection): the project is skipped, since its URL can't be built.
- Disabled, loading and error do not apply.

## Props/API

```ts
type SelectedWorkItem = {
  number: number // 1-based position in Selected work
  collectionName: string
  title: string // project title, visually hidden in the link
  href: string // projectPath(collection slug, project slug)
  cover: Media | number | null
}

type SelectedWorkProps = {
  items: SelectedWorkItem[] // at most 9, already ordered by homeOrder
}
```

Server component.

## Accessibility

- One link per tile, the caption. Its accessible name is "01 Photography, [project title]": it starts with the visible label (WCAG 2.5.3, invariant 17) and still says which project opens. Never a whole-tile link named by `aria-labelledby`.
- The image is `alt=""` (decorative inside the tile; the link carries the meaning).
- Each column is a `<ul role="list">` of `<li>` tiles inside one wrapping `<div>`. Screen readers meet the tiles once, in order 01…09; the visible numbers carry the order, so the lists are unordered.
- Every link's tap area is the whole tile (far above `--tap-min`). `touch-action: manipulation`.
- Contrast: caption `--muted` on `--bone` 6.1:1.

## Responsive

Mobile-first. The columns are `flex: 1 1 var(--grid-min-tile)` with `min-width: 0` in a wrapping row, gap `--space-4`:

- **1,312 px:** three columns side by side (capture 01).
- **About 600–900 px:** two columns side by side, the third wraps below at full width (items 7–9 stack after 1–6, so reading order holds).
- **Below that (320–390 px):** one column; items 01…09 stack in order.

No horizontal scroll at 320 px. Verify at 320, 390, 768, 1,024 and 1,440 px against capture 01.

## Usage

Home only, inside "Selected work". Covers are never `priority` (below the hero). `sizes`: `(min-width: 1024px) 33vw, (min-width: 600px) 50vw, 100vw`.

## Preview

[Open preview](../preview/index.html) (section "SelectedWork")
