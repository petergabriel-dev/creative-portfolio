# MediaImage

## Purpose

One image from the `media` collection in a fixed-ratio frame. It is used by every P1 image: collection tiles, project cards, highlight strips, covers, story images and video posters. It serves Blob sizes through `next/image` and the custom loader (invariant 14). Source: captures 02, 03 and 07, and the Build Spec section "Media handling".

## Anatomy

- **Frame:** a block with a fixed `aspect-ratio`, `overflow: hidden`, square corners (`--radius-site`) and background `--color-frame`. The tint shows until the image has loaded.
- **Image:** `next/image` with `fill`, `object-fit: cover`, `object-position` from the media doc's focal point (`focalX`% `focalY`%, default 50% 50%), and the caller's `sizes`.

## Variants

`aspect` sets the frame ratio:

| Value | Ratio | Typical use |
|---|---|---|
| `3:4` | 3 / 4 | Collection tiles |
| `4:5` | 4 / 5 | Highlights, story images, gallery |
| `3:2` | 3 / 2 | Project cards, story images, gallery |
| `4:3` | 4 / 3 | Project cards |
| `1:1` | 1 / 1 | Highlights, gallery |
| `16:9` | 16 / 9 | Project cards, highlights, story images, video poster |
| `21:9` | 21 / 9 | Project cover, story images |
| `original` | media `width / height` | Story images |

The ratios are fixed data, not design tokens; they live as one class per value in the component's CSS module. `original` falls back to `3:2` when the media doc has no dimensions.

## Sizes

The frame fills its container's width. The loader picks the nearest generated size (`thumb` 480, `card` 960, `feature` 1600, `hero` 2560) from `sizes`.

## States

- **Default:** the image covers the frame.
- **Loading:** the `--color-frame` tint is visible behind the image until it arrives.
- **Empty:** the media is missing, unpopulated (an id only) or has no URL. Only the tinted frame renders, hidden from assistive tech.
- Hover, focus, active, disabled and error do not apply: the image is never interactive. Parents (cards, tiles) own interaction.

## Props/API

```ts
type MediaImageProps = {
  media: Media | number | null | undefined
  aspect: '3:4' | '4:5' | '3:2' | '4:3' | '1:1' | '16:9' | '21:9' | 'original'
  sizes: string // e.g. '(min-width: 768px) 50vw, 100vw'
  priority?: boolean // first image above the fold only
}
```

Server component.

## Accessibility

- `alt` comes from the media doc (required at upload); no block or card asks for it again.
- The empty frame has `aria-hidden="true"` and no `role="img"`.
- The image is never focusable.

## Responsive

Fluid width at every breakpoint. The ratio never changes, so nothing shifts as the image loads (CLS < 0.1).

## Usage

- Pass `priority` only to the first image above the fold on a page (the project cover, the first tile or highlight). Everything else lazy-loads by default.
- Never pass `priority` to cards that start hidden behind "More projects".

## Preview

[Open preview](../preview/index.html)
