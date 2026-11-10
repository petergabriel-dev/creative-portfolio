# SiteHeader

## Purpose

Site identity and primary navigation on every public page. Source: captures 40 (light tone) and 12 (dark tone over an opener). The mobile layout follows the owner decision of 2026-11-10, which replaces the 390 px capture of screen 40.

## Anatomy

1. **Wordmark link** to `/`: LensMark (inline SVG, `--mark-size`, two concentric circles, `aria-hidden`) plus the site name. Gap `--space-3`, min-height `--tap-min`. Name: `--fs-sm`, `--fw-semibold`, `--tracking-wordmark`, uppercase.
2. **Nav** (`<nav aria-label>` from `copy.ts`): Home, Portfolio, About, Journal. `--fs-label`, `--fw-medium`, `--tracking-nav`, uppercase. Each link is inline-flex, min-height `--tap-min`, with a `--border-strong` bottom border (transparent unless current or hovered).
3. **Book Me pill**: Button, size `default`, labelled with `site-settings.bookingLabel`, linking to `/book`.

DOM order: wordmark, nav links, pill.

## Variants

| Tone | Background | Text and current underline | Pill |
|---|---|---|---|
| `light` | `--color-page` | `--color-text` | Button `ink` |
| `dark` | transparent (sits on an opener) | `--color-on-dark-heading` | Button `outline-light` |

## Sizes

Padding `--space-6` block, `--gutter` inline. Inner width `--max-width`, centred.

## States

- **Link default:** transparent bottom border.
- **Hover:** bottom border `--color-text-muted` (light) or `--color-on-dark` (dark).
- **Current:** `aria-current="page"` and a bottom border in the tone's text colour. Only one link can be current.
- **Focus-visible:** global dual focus ring.
- **Active:** same as hover.
- **Empty name:** the LensMark shows alone; the link keeps an accessible name from `copy.ts` ("Home"). Never crashes.

## Props/API

```ts
type SiteHeaderProps = {
  tone: 'dark' | 'light'
  current?: 'home' | 'portfolio' | 'about' | 'journal'
  settings: { name?: string | null; bookingLabel?: string | null }
}
```

Server component, no client JavaScript.

## Accessibility

- `<header>` landmark; `<nav>` with an `aria-label` from `copy.ts`.
- Every target at least 44 × 44 px.
- Focus order is wordmark, Home, Portfolio, About, Journal, Book Me at every width. Below 768 px the pill sits visually on row 1, so focus moves from row 2 back to row 1 for the last stop; the order is still logical.
- A long name that is clamped visually is still read in full (the text stays in the DOM).

## Responsive

- **1024 px and up:** one row, matching capture 40. Wordmark left; nav and pill right. Gaps between wordmark, nav and pill, and between links: `--space-9`.
- **768–1023 px:** the same single row with `--space-6` gaps, so the name keeps about 200 px (owner decision 2026-11-10). The name shrinks (`min-width: 0`) and clamps to two lines; links and pill never move.
- **Below 768 px:** two rows, no menu button, no JavaScript.
  - Row 1: wordmark (left) and pill (right). The pill never shrinks; the name takes the remaining width (`min-width: 0`), wraps, and is clamped to two lines with an ellipsis.
  - Row 2: Home, Portfolio, About, Journal, column gap `--space-6` (about 24 px); below 375 px `--space-2` so all four stay on one row (they measure 252 px against 280 px of room at 320 px).
- No horizontal scroll at 320 px or 390 px, including with a 30-character name.

## Usage

- Pages with a dark chapter opener pass the header into ChapterOpener's `header` slot with `tone="dark"`.
- Pages without an opener use `tone="light"`.
- Underline and colour transitions use `--duration-fast`; none under `prefers-reduced-motion`.

## Preview

[Open preview](../preview/index.html)
