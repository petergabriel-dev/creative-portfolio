# ChapterOpener

## Purpose

The dark opening section of a page: header on top, then a context line, a display title (the page's `h1`), an optional lead and actions. Source: capture 12 (404); later phases reuse it with breadcrumbs and tints.

## Anatomy

Section on an opener surface, min-height `--opener-min-h` (px, never vh), laid out as a column: the `header` slot at the top, the content block pushed to the bottom.

Content block: padding `--space-12` top, `--space-20` bottom, `--gutter` inline; width `--max-width`; children `--space-5` apart.

1. **Rule:** `--rule-short` wide, `--border-strong` tall, `--color-on-dark-heading`; decorative (`aria-hidden`).
2. **Context line:** `<p>`, `--fs-lead`, `--color-on-dark-strong`.
3. **Title:** `<h1>`, `--font-display`, `--fw-regular`, `--fs-display`, `--lh-display`, `--color-on-dark-heading`, uppercase (Bebas Neue is caps-only; uppercase keeps fallback fonts consistent). Capture 12 uses a slightly larger size; the Build Spec display size wins.
4. **Lead** (optional): `<p>`, max-width `--measure-body`, `--fs-body`, `--lh-body-loose`, `--color-on-dark`.
5. **Actions** (optional): row with row gap `--space-3`, column gap `--space-4`, `--space-2` above.

## Variants

`tint` picks the surface:

| Tint | Surface token |
|---|---|
| `chapter` (default) | `--color-surface-opener` |
| `photo` | `--color-surface-opener-photo` |
| `film` | `--color-surface-opener-film` |
| `design` | `--color-surface-opener-design` |
| `writing` | `--color-surface-opener-writing` |

## Sizes

One. Height grows with content above `--opener-min-h`.

## States

- Default only; it has no interactive states of its own (actions bring their own).
- Missing `lead` or `actions`: the element is omitted, not rendered empty.

## Props/API

```ts
type ChapterOpenerProps = {
  tint?: 'chapter' | 'photo' | 'film' | 'design' | 'writing'
  contextLine: string
  title: string
  lead?: string
  actions?: React.ReactNode
  header: React.ReactNode // a SiteHeader with tone="dark"
  as?: 'main' | 'div' // element for the content block; default 'div'
}
```

Server component.

## Accessibility

- Exactly one `h1` per page, and it is this title.
- Landmarks: the header slot renders before the content block, so the site header stays the banner landmark. Pages that are only an opener (404, the P0 Home placeholder) pass `as="main"` so the opener content is the `<main>` landmark; pages with chapters wrap their own `<main>` from P1 on.
- An empty `contextLine` is not rendered.
- On-dark text contrast: title 12.9:1, context line 11.2:1, lead 8.7:1 on `--chapter`.
- The rule is decorative and hidden from assistive tech.

## Responsive

- **768 px and up:** actions sit in one row.
- **Below 768 px:** actions stack in a column, aligned to the start. The display title wraps when it has to: "Nothing here" fits on one line at 390 px with `--fs-display` and takes two lines at 320 px (capture 12 uses a larger size and wraps at 390).
- No horizontal scroll at 320 px or 390 px.

## Usage

404 in P0; collection, project, journal and About openers in later phases (adding breadcrumb and details props then). No motion.

## Preview

[Open preview](../preview/index.html)
