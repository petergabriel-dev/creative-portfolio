# Filmstrip

## Purpose

A row of square-cornered photos with `--gap-photos` gaps that wraps on small screens. It is used for a collection's Highlights strip and for the story `gallery` block. Source: captures 03 (Highlights) and 07 (gallery).

## Anatomy

`<ul role="list">` grid with `list-style: none` and gap `--gap-photos`. Each item is an `<li>` holding a MediaImage in the strip's `aspect`.

## Variants

| Variant | Columns | Width |
|---|---|---|
| `strip` | `repeat(auto-fit, minmax(min(var(--grid-min-photo), 100%), 1fr))` | — |
| `pair` | 1 below 768 px, 2 equal columns from 768 px | — |
| `bleed` (with `strip`) | as `strip` | Edge to edge: full viewport width, no gutter (Highlights) |
| contained (default) | — | Max-width `--max-width-story`, centred; the parent section owns the `--gutter` (gallery block) |

With few images, auto-fit stretches them to fill the row. In capture 03, five highlights fill 1440 px; in capture 07, three gallery images fill 1200 px.

## Sizes

One. Aspect ratios come from the CMS: `highlightAspect` for Highlights, the gallery block's `aspect` for galleries.

## States

- Default only; the strip is static, with no carousel, no scroll and no controls.
- Fewer than one resolved image: nothing renders. The gallery block requires at least two images on save.

## Props/API

```ts
type FilmstripProps = {
  images: (Media | number)[]
  aspect: '4:5' | '3:2' | '1:1' | '16:9'
  layout: 'strip' | 'pair'
  bleed?: boolean
  sizes: string
}
```

Server component.

## Accessibility

- `role="list"` keeps list semantics in Safari after `list-style: none`.
- Each image takes its alt text from the media doc.
- No interactive elements, so there is nothing to reach by keyboard or touch.

## Responsive

- **`strip`:** about five columns at 1440 px edge to edge, two at 768 px and one at 320–390 px.
- **`pair`:** one column below 768 px.
- Never scrolls horizontally.

## Usage

- Highlights: `layout="strip"` and `bleed`, with `sizes="(min-width: 768px) 20vw, 100vw"`. The first image is `priority` only when it is the first image on the page.
- Gallery block: `strip` or `pair` as chosen in the CMS, contained.

## Preview

[Open preview](../preview/index.html)
