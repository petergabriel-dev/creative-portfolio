# ChapterOpener

## Purpose

The dark opening section of a page: the header on top, then a context line, a display title (the page's `h1`), an optional lead, actions and details. Source: capture 12 (404, P0) and captures 02, 03 and 07 (P1: breadcrumbs, tints, split layout, details).

## Anatomy

A section on an opener surface, min-height `--opener-min-h` (px, never vh), laid out as a column: the `header` slot at the top, the content block pushed to the bottom.

Content block: padding `--space-12` top, `--space-20` bottom, `--gutter` inline; width `--max-width`; children `--space-5` apart.

1. **Rule:** `--rule-short` wide, `--border-strong` tall, `--color-on-dark-heading`; decorative (`aria-hidden`).
2. **Context line:** `<p>`, `--fs-lead`, `--color-on-dark-strong`.
   - With `breadcrumb`, the line starts with one link per crumb, each followed by the separator from `copy.ts` (" · ", `aria-hidden`), then the `contextLine` text.
   - Breadcrumb links are inline-flex with min-height `--tap-min`, colour `--color-on-dark-strong`, and are underlined at `--underline-offset`; the underline thickens to `--border-strong` on hover.
3. **Title:** `<h1>`, `--font-display`, `--fw-regular`, `--lh-display`, `--color-on-dark-heading`, uppercase (Bebas Neue is caps-only; uppercase keeps fallback fonts consistent).
   - Size: `--fs-display-sm` below 768 px, `--fs-display` from 768 px.
   - `--fs-display-sm` (`clamp(56px, 19vw, 80px)`) lets the longest collection word, "PHOTOGRAPHY" (4.36 em in Bebas Neue), fit on one line at 320–420 px instead of breaking mid-word. From 421 px it equals the Build Spec minimum, 80 px (owner decision, 2026-11-10).
   - Captures 12, 02, 03 and 07 use slightly different sizes; the Build Spec display size wins.
4. **Lead** (optional): `<p>`, max-width `--measure-body`, `--fs-body`, `--lh-body-loose`, `--color-on-dark`.
5. **Actions** (optional): a row with row gap `--space-3` and column gap `--space-4`, `--space-2` above.
6. **Details** (optional, P1): a slot after the lead and actions, full content width. The project page puts a DetailsStrip (`tone="dark"`) here.

## Variants

`tint` picks the surface:

| Tint | Surface token | Discipline `openerTint` value |
|---|---|---|
| `chapter` (default) | `--color-surface-opener` | `default` (#2B2925) |
| `photo` | `--color-surface-opener-photo` | `warm` (#2F2A28) |
| `film` | `--color-surface-opener-film` | `plum` (#2C2A2E) |
| `design` | `--color-surface-opener-design` | `forest` (#28302B) |
| `writing` | `--color-surface-opener-writing` | `clay` (#302A26) |

`src/lib/openerTint.ts` maps a discipline's `openerTint` to the `tint` prop. Collection openers use their discipline's tint; the project opener uses `chapter` (capture 07).

`layout` places the lead and actions:

| Layout | Where | 768 px and up |
|---|---|---|
| `stacked` (default) | 404, project page | Actions below the lead |
| `split` | Portfolio, collection pages (captures 02, 03) | Lead and actions share one row, wrapping, `justify-content: space-between`, aligned to the bottom; gap `--space-5` (rows) and `--space-12` (columns) |

## Sizes

One. Height grows with content above `--opener-min-h`.

## States

- Default only; it has no interactive states of its own. Actions and breadcrumb links bring their own (hover, focus-visible, active).
- Missing `lead`, `actions` or `details`: the element is omitted, not rendered empty.

## Props/API

```ts
type ChapterOpenerProps = {
  tint?: 'chapter' | 'photo' | 'film' | 'design' | 'writing'
  layout?: 'stacked' | 'split' // default 'stacked'
  breadcrumb?: { label: string; href: string }[]
  contextLine: string
  title: string
  lead?: string | null
  actions?: React.ReactNode
  details?: React.ReactNode
  header: React.ReactNode // a SiteHeader with tone="dark"
  as?: 'main' | 'div' // element for the content block; default 'div'
}
```

Server component.

## Accessibility

- Exactly one `h1` per page, and it is this title.
- Landmarks: the header slot renders before the content block, so the site header stays the banner landmark. Pages that are only an opener (404, the P0 Home placeholder) pass `as="main"` so the opener content is the `<main>` landmark. Pages with chapters wrap their own `<main>` from P1 on.
- An empty `contextLine` with no breadcrumb is not rendered.
- Breadcrumb links are at least 44 px tall (invariant 17); separators are hidden from assistive tech.
- On-dark text contrast:
  - on `--chapter`: title 12.9:1, context line 11.2:1, lead 8.7:1;
  - lowest tint (`design`, forest): title 12.0:1, context line 10.4:1, lead 8.2:1.
- The rule is decorative and hidden from assistive tech.

## Responsive

- **768 px and up:** actions sit in one row; with `layout="split"`, beside the lead.
- **Below 768 px:** actions stack in a column, aligned to the start, below the lead, for both layouts. The display title uses `--fs-display-sm` and wraps between words when it has to. "Nothing here" and "Photography" each fit on one line from 320 px (capture 12 uses a larger size and wraps at 390).
- No horizontal scroll at 320 px or 390 px.

## Usage

- 404 (P0).
- Portfolio and collection openers: `split` layout and a breadcrumb.
- Project opener: breadcrumb and details slot.
- Journal list opener (P2): `stacked`, default tint, context line "Journal", title and lead from `copy.ts`, no actions (capture 09).
- Journal entry opener (P2): `stacked`, default tint, breadcrumb "Journal", context line "{category} · {date}" (missing parts dropped), the post's title, its excerpt as the lead, no actions (capture 10).
- Book Me opener (P3): `stacked`, default tint, context line "Book me · photography, film, design & writing" (fixed copy, owner decision 2026-11-11), title "Let's talk about your project", lead from `copy.ts` ending "…and reply within {replyTime}." (the clause is dropped when `replyTime` is empty), no actions (capture 11).
- About opener in a later phase.
- No motion.

## Preview

[Open preview](../preview/index.html)
