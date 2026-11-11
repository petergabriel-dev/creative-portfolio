# JournalEntryFooter

## Purpose

The row that closes a journal entry, after the story and before the finale: the way back to the journal and links to the related work. Source: capture 10 and the owner decision of 2026-11-11 on several related projects.

## Anatomy

A block inside `<main>`, after the `<article>`, aligned with the story's text column: it sits in the same box as StoryBlocks' column (max-width `--max-width-story` plus two `--gutter`s, centred, inline padding `--gutter`) and is `--measure-story` wide, starting at the column's left edge like the paragraphs above it. (Capture 10 centres both the text and this row; the P1 StoryBlocks column, reused unchanged, keeps text at the left of the story column, so the row follows the text.) A top hairline (`--border-hairline` `--color-rule`) with `--space-7` below it, and `--section-y` below the block.

1. **Back link:** Button `outline-ink`, size `primary`, with a leading "←" (`aria-hidden`) and "Back to journal" from `copy.ts`, linking to `/journal`.
2. **Related work** (only published related projects whose collection is known):
   - **One project:** Button `text` with the trailing arrow, "See the work" from `copy.ts`, linking to the project page (as in capture 10).
   - **Two or more:** a "See the work" label (`--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`), then a `<ul role="list">` of Button `text` links, each named by the project's title with the trailing arrow, `--space-1` apart.
   - **None:** nothing.

## Variants

- **Back only** (no related work).
- **One related project.**
- **Several related projects.**

## Sizes

One.

## States

- Default. The buttons bring their own hover, focus-visible and active states (Button spec).
- Empty related work: only the back link renders.

## Props/API

```ts
type JournalEntryFooterProps = {
  related: { title: string; href: string }[] // already filtered to published projects
}
```

Server component.

## Accessibility

- No two links share a name but point to different places: one related project uses "See the work"; several use their titles (WCAG 2.4.4).
- The label above several links is plain text, not a heading.
- Arrows are decorative (`aria-hidden`).
- Targets: the pill is `--tap-primary` high; text links are at least `--tap-min`.

## Responsive

- **Below 768 px:** the back link, then the related work below it, `--space-5` apart, left-aligned.
- **768 px and up:** one row, `justify-content: space-between`, items centred vertically; the related work is right-aligned (a list of several stays right-aligned, one link per line).
- Nothing overflows at 320 px; long project titles wrap.

Verify at 390 and 1,440 px against capture 10.

## Usage

Journal entry pages only.

## Preview

[Open preview](../preview/index.html)
