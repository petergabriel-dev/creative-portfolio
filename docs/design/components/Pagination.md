# Pagination

## Purpose

The page row under the journal list: where you are, the numbered pages and the way to older stories. Source: capture 09 (desktop and mobile) and the owner decisions of 2026-11-11 (path URLs, hidden on a single page, no "Newer" link).

## Anatomy

`<nav aria-label="Journal pages">` below the list's closing hairline, with `--space-10` above it.

1. **Status:** `<p>` "Page {N} of {M} · {perPage} stories per page", text from `copy.ts` and the shared separator. `--fs-sm`, `--color-text-muted`.
2. **Links** (one row, gap `--space-5`):
   - **Page numbers:** `<ul role="list">` of `<li>` links, gap `--space-2`. Each is a `--tap-min` × `--tap-min` circle (`--radius-pill`) with the number centred in `--fs-sm`, `--fw-medium`.
     - Current page: `--color-action` fill and border, `--color-on-action` number, `aria-current="page"`.
     - Other pages: transparent fill, `--border-hairline` border in `--color-text-muted`, `--color-text` number, `aria-label` "Page {n}".
   - **Older stories:** Button `text` variant with the trailing arrow, "Older stories" from `copy.ts`, linking to page N + 1. Rendered only while N < M.

Page 1's URL is `/journal`; page N ≥ 2 is `/journal/page/N` (the parent passes `pageHref`).

## Variants

One. There is no "Newer stories" link: earlier pages are reached through the numbers.

## Sizes

One. Circles are exactly `--tap-min` (44 px), as in the capture.

## States

- **Default:** as above.
- **Hover:** an outlined circle's border turns `--color-action` and thickens to `--border-strong` (inset, so the circle does not grow); "Older stories" follows the Button `text` hover.
- **Focus-visible:** the global dual focus ring.
- **Active:** same as hover.
- **Current page:** not interactive-looking (no hover change) but still a link with `aria-current="page"`.
- **Single page** (M ≤ 1): the component renders nothing (owner decision 2026-11-11).
- **Last page:** no "Older stories" link.
- Disabled, loading and error do not apply.

## Props/API

```ts
type PaginationProps = {
  current: number // 1-based
  total: number // total pages
  perPage: number // shown in the status text
  pageHref: (n: number) => string // 1 → '/journal', n → '/journal/page/n'
}
```

Server component; plain links, no client JavaScript.

## Accessibility

- The `nav` is named "Journal pages", distinct from the header and footer navigation.
- The current page carries `aria-current="page"`; other numbers are named "Page {n}".
- Tab order: the numbers in order, then "Older stories".
- Every target is at least 44 × 44 px.
- Contrast: the current number `--bone` on `--ink` 15.4:1; other numbers `--ink` on `--bone` 15.4:1; outlined borders `--muted` on `--bone` 6.1:1; status text 6.1:1.
- Motion: colour and border transitions only, `--duration-fast`, none under `prefers-reduced-motion`.

## Responsive

- **Below 768 px:** the status text on the first line; the links on the next, `--space-5` below, wrapping if needed.
- **768 px and up:** one row, `justify-content: space-between`: status on the left, links on the right, vertically centred.
- Nothing overflows at 320 px; with many pages the numbers wrap. If more than about seven pages ever exist, collapse them to a window (not built now).

Verify at 390 and 1,440 px against capture 09 (and 375, 768 and 1,280 px).

## Usage

Journal list pages only, after the JournalRow list.

## Preview

[Open preview](../preview/index.html)
