# ChapterHeading

## Purpose

The "Chapter 0N" label and Bebas heading that open each light chapter, with an optional line beside it. Source: captures 03 (Highlights, Projects), 06 (Selected pieces) and 07 (story chapters).

## Anatomy

1. **Label:** `<p>` reading "Chapter 0N" (two digits, from `copy.ts`). `--fs-label`, `--fw-semibold`, `--tracking-label`, `--lh-label`, uppercase, `--color-text-muted`.
2. **Heading:** `<h2 id>` in `--font-display`, `--fw-regular`, `--fs-section`, `--lh-section`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`. It sits `--space-2` below the label.
3. **Aside** (optional): `<p>` in `--fs-body`, `--lh-body`, `--color-text-muted`, max-width `--measure-body`.

Capture 07 sets story chapter headings smaller than `--fs-section`; the Build Spec section heading size wins.

## Variants

- With aside (Highlights: "A best-of selection…").
- Without aside.

## Sizes

One.

## States

Default only. The heading is not interactive. An empty aside is not rendered.

## Props/API

```ts
type ChapterHeadingProps = {
  number: number // 1-based; rendered as "Chapter 01"
  title: string
  id?: string // for the parent section's aria-labelledby
  aside?: React.ReactNode
}
```

Server component.

## Accessibility

- The label is a plain paragraph before the heading, not part of the heading's name.
- The `h2` is the chapter's heading; the parent `<section aria-labelledby>` points at its `id`.
- Muted label on bone: 6.1:1.

## Responsive

- **Below 768 px:** label, heading and aside stack; the aside sits `--space-4` below the heading.
- **768 px and up:** one row with the label and heading on the left and the aside on the right, aligned to the bottom. Gap `--space-4` (rows) and `--space-12` (columns); it wraps when the aside does not fit.

## Usage

Collection chapters (Highlights, Projects, Selected pieces) and story `chapter` blocks. Chapter numbers are counted at render time, never stored.

## Preview

[Open preview](../preview/index.html)
