# CollectionTile

## Purpose

One tile per discipline on the Portfolio page, linking to its collection page. Source: capture 02. The `home` variant shows the same tiles in "Explore the portfolio" on Home (capture 01, P4).

## Anatomy

One tile block (flex column, gap `--space-5`). The title is the only link; its `::after` (`position: absolute; inset: 0`) stretches the click and tap area over the whole tile, which is `position: relative` (owner decision 2026-11-11, WCAG 2.5.3 Label in Name):

1. **Image:** MediaImage `3:4`, showing the discipline's first highlight, or the tinted frame when there are no highlights.
2. **Text group** (flex column, gap `--space-2`):
   - **Label:** "Collection 0N" from `copy.ts`, where N is the discipline's position in `order`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Name:** `<h2 id>` in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`.
   - **Intro:** `<p>` with the discipline's `intro`, in `--fs-body`, `--lh-body`, `--color-text-muted`.
   - **Call to action:** "View collection" from `copy.ts` plus a trailing arrow, as a visual cue only (`aria-hidden`, not a link). `--fs-sm`, `--fw-medium`, `--color-text`, underlined at `--underline-offset`.

The capture's tile text is shorter than the discipline intro; the Build Spec has only `intro`, so the tile uses it.

## Variants

- With image (first highlight).
- Without image (tinted frame).
- **`portfolio`** (default): as above. Its output is unchanged by P4.
- **`home`** (P4, capture 01), for the tiles under the Home chapter "Explore the portfolio":
  - image frame `4:5`, not `3:4`;
  - no "Collection 0N" label (the capture shows none);
  - name in an `h3`, not an `h2` (it sits under the chapter's `h2`);
  - call to action "View gallery" (from `copy.ts`) plus the arrow, instead of "View collection".
  - Everything else (link, intro, states, tokens) is the same.

## Sizes

One. Grid columns use `--grid-min-tile`.

## States

- **Default:** as above.
- **Hover:** the call-to-action underline thickens to `--border-strong`. Colours never change.
- **Focus-visible:** the global dual focus ring around the name link.
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
  variant?: 'portfolio' | 'home' // default 'portfolio'
}
```

Server component.

## Accessibility

- One link per tile: the discipline name inside the `h2`, so the link's name is exactly its visible label and screen readers do not read the intro and the call to action as part of it. A whole-tile link named by `aria-labelledby` fails axe 4.14's `label-content-name-mismatch` (serious, WCAG 2.5.3).
- Tile names are `h2`s under the page's `h1` on Portfolio, and `h3`s under the chapter `h2` on Home.
- `touch-action: manipulation`.

## Responsive

The page grid is `repeat(auto-fit, minmax(min(var(--grid-min-tile), 100%), 1fr))` with gaps `--space-12` (rows) and `--space-4` (columns):

- four columns at 1312 px;
- two at 768 px;
- one at 320–390 px.

Home uses the same grid and tokens, with gaps `--space-10` (rows) and `--space-4` (columns), as in capture 01.

## Usage

- `portfolio`: the Portfolio page. Pass `priority` to the first tile's image (the first image on the page).
- `home`: Home's "Explore the portfolio" chapter, one tile per discipline in `order`. Never `priority` (below the hero).

## Preview

[Open preview](../preview/index.html)
