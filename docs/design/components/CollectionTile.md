# CollectionTile

## Purpose

One tile per discipline on the Portfolio page, linking to its collection page. Source: capture 02.

## Anatomy

A single `<a>` block (flex column, gap `--space-5`):

1. **Image:** MediaImage `3:4`, showing the discipline's first highlight, or the tinted frame when there are no highlights.
2. **Text group** (flex column, gap `--space-2`):
   - **Label:** "Collection 0N" from `copy.ts`, where N is the discipline's position in `order`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Name:** `<h2 id>` in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`.
   - **Intro:** `<p>` with the discipline's `intro`, in `--fs-body`, `--lh-body`, `--color-text-muted`.
   - **Call to action:** "View collection" from `copy.ts` plus a trailing arrow (`aria-hidden`). `--fs-sm`, `--fw-medium`, `--color-text`, underlined at `--underline-offset`.

The capture's tile text is shorter than the discipline intro; the Build Spec has only `intro`, so the tile uses it.

## Variants

- With image (first highlight).
- Without image (tinted frame).

## Sizes

One. Grid columns use `--grid-min-tile`.

## States

- **Default:** as above.
- **Hover:** the call-to-action underline thickens to `--border-strong`. Colours never change.
- **Focus-visible:** the global dual focus ring around the whole tile.
- **Active:** same as hover.
- Disabled, loading and error do not apply. An empty intro is omitted.

## Props/API

```ts
type CollectionTileProps = {
  name: string
  href: string // /portfolio/<slug>
  intro?: string | null
  image?: Media | number | null
  index: number // 1-based position in order
  priority?: boolean
}
```

Server component.

## Accessibility

- One link per tile, named by the discipline name (`aria-labelledby` points at the `h2`), so screen readers do not read the intro and the call to action as the link name.
- Tile names are `h2`s under the page's `h1`.
- `touch-action: manipulation`.

## Responsive

The page grid is `repeat(auto-fit, minmax(min(var(--grid-min-tile), 100%), 1fr))` with gaps `--space-12` (rows) and `--space-4` (columns):

- four columns at 1312 px;
- two at 768 px;
- one at 320–390 px.

## Usage

The Portfolio page only. Pass `priority` to the first tile's image (the first image on the page).

## Preview

[Open preview](../preview/index.html)
