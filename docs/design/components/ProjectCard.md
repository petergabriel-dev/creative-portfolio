# ProjectCard

## Purpose

One project in a collection's Projects chapter (`projects` layout), linking to the project page. Source: capture 03.

## Anatomy

One card block (flex column, gap `--space-5`). The title is the only link; its `::after` (`position: absolute; inset: 0`) stretches the click and tap area over the whole card, which is `position: relative` (owner decision 2026-11-11, WCAG 2.5.3 Label in Name):

1. **Image:** MediaImage of the cover in the discipline's `cardAspect`.
2. **Text group** (flex column, gap `--space-2`):
   - **Meta:** "{projectType} · {year}", joined with the separator from `copy.ts`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Title:** `<h3 id>` in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`.
   - **Call to action:** "View project" from `copy.ts` plus a trailing arrow, as a visual cue only (`aria-hidden`, not a link). `--fs-sm`, `--fw-medium`, underlined at `--underline-offset`.

## Variants

By `aspect`: `3:2`, `16:9` or `4:3` (the discipline's `cardAspect`).

## Sizes

One.

## States

- **Default:** as above.
- **Hover:** the call-to-action underline thickens to `--border-strong`.
- **Focus-visible:** the global dual focus ring around the title link.
- **Active:** same as hover.
- **Missing cover:** the tinted frame is shown.
- Disabled, loading and error do not apply.

## Props/API

```ts
type ProjectCardProps = {
  title: string
  href: string // canonical project URL
  projectType: string
  year: number
  cover?: Media | number | null
  aspect: '3:2' | '16:9' | '4:3'
  sizes: string
}
```

Server component.

## Accessibility

- One link per card: the title inside the `h3`, so the link's name is exactly its visible label (WCAG 2.5.3). RevealMore moves focus to this link when it reveals a card.
- Titles are `h3`s under the Projects chapter's `h2`.
- `touch-action: manipulation`.

## Responsive

- The grid holds **at most two columns** (Build Spec "cards, 2 up"; this overrides capture 03, which shows three):
  `repeat(auto-fit, minmax(max(min(var(--grid-min-card), 100%), calc((100% - var(--space-6)) / 2)), 1fr))`, with gaps `--space-12` (rows) and `--space-6` (columns).
- Two columns once the content is at least 864 px wide (two `--grid-min-card` columns plus the gap), as at 1312 px; one column below that, including 390 px and 768 px.

## Usage

Inside RevealMore on collection pages with the `projects` layout. Cards are sorted newest year first. Do not pass `priority`: the cards sit below the Highlights chapter.

## Preview

[Open preview](../preview/index.html)
