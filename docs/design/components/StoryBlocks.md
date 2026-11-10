# StoryBlocks

## Purpose

Renders a project's `story` blocks top to bottom, one renderer per block type. The same component renders `posts` in P2. Source: capture 07 and the Build Spec section "Story blocks".

## Anatomy

**Sections.**
- Each `chapter` block starts a new `<section aria-labelledby>` containing the blocks that follow it, up to the next chapter.
- Blocks before the first chapter form a leading `<div>` with no heading.
- Sections are padded `--section-y` block and `--gutter` inline. Their content column is max-width `--max-width-story`, centred.
- Blocks inside a section are `--space-10` apart.

**Renderers:**

| Block | Renders as |
|---|---|
| `chapter` | ChapterHeading. N counts chapter blocks in order and is never stored |
| `text` | Lexical rich text in a column of max-width `--measure-story`, aligned left. Paragraphs `--fs-lead`, `--lh-story`, `--color-text`, `--space-5` apart. Bold is `--fw-semibold`; italic is native. Lists use native markers with `--space-6` inline-start padding. Links are underlined at `--underline-offset`, inherit their colour, and their underline thickens to `--border-strong` on hover. A link only renders when its href is http(s), `mailto:` or site-relative; anything else (for example `javascript:`) renders as plain text |
| `image` | `<figure>` with MediaImage in the block's `aspect`. **Contained** spans the story column (`--max-width-story`); **full-bleed** spans the viewport edge to edge with no gutter. The optional `<figcaption>` shows the block caption (else the media caption), then the media credit after the `copy.ts` separator, in `--fs-caption`, `--color-text-muted`, `--space-2` below the image |
| `gallery` | Filmstrip, `strip` or `pair`, contained, in the block's `aspect` |
| `video` | VideoEmbed in the story column |
| `quote` | `<figure>` of max-width `--max-width-narrow`. The `<blockquote>` is `--font-display`, `--fw-regular`, `--fs-quote`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`. The attribution is a `<figcaption>` in `--fs-sm`, `--color-text-muted`, `--space-4` below |

**Deviation from capture 07:** the capture shows Chapter 01's text beside a 4:5 image. The Build Spec blocks have no layout field, so blocks always stack (Build Spec outranks captures; recorded in the design README).

## Variants

Six block renderers; image `contained` or `full-bleed`; gallery `strip` or `pair`.

## Sizes

One.

## States

- **Empty story:** nothing renders.
- **Block missing required data** (for example an unpopulated image or empty rich text): that block is skipped, never a crash.
- **Leading blocks before the first chapter:** an unlabelled group.
- **Text links:** default, hover (thicker underline), focus-visible (global ring), active (as hover).
- No loading or error states; video states belong to VideoEmbed.

## Props/API

```ts
type StoryBlocksProps = {
  blocks: Project['story'] // generated payload-types; posts reuse the same block union in P2
}
```

Server component. Only the `video` renderer mounts a client component.

## Accessibility

- One `h2` per chapter, under the page `h1`; sections are named by their chapter heading.
- Images take their alt text from the media doc.
- Quotes use `figure` / `blockquote` / `figcaption`.
- Unsafe links are dropped to plain text (invariant 13), so no `javascript:` URL ever reaches the page.
- Body text on bone is 15.4:1; captions are 6.1:1.

## Responsive

- Single column at every width, mobile-first.
- The text column narrows with the viewport (`--measure-story` is a maximum).
- Full-bleed images ignore the gutter at every width.
- Galleries follow Filmstrip; nothing scrolls horizontally at 320 px.

## Usage

Project pages (P1) and journal entries (P2), unchanged between them.

## Preview

[Open preview](../preview/index.html)
