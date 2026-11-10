# SiteFooter

## Purpose

Closing identity, navigation and contact on every public page. Source: capture 41.

## Anatomy

Footer surface `--color-surface-footer`, text `--color-on-dark`, `--fs-sm`, `--lh-body`. Padding `--space-14` top, `--space-10` bottom, `--gutter` inline. Inner width `--max-width`; the top row and the copyright line are `--space-10` apart.

Top row, three groups:

1. **Brand:** wordmark link to `/` (LensMark + name, same type as the header wordmark, colour `--color-on-dark-heading`), then "role line · location".
2. **Links** (`<nav aria-label>` from `copy.ts`): Home, Portfolio, About, Journal, and the booking label linking to `/book`. Column gap `--space-7`.
3. **Contact:** the contact email (`mailto:`), then social links separated by a decorative " · " (`aria-hidden`).

Copyright: "© {year} {name}. {footerNote}" in `--fs-caption`, `--color-on-dark-subtle`. The "©" and joining punctuation come from `copy.ts`.

## Variants

One.

## Sizes

All links are inline-flex with min-height `--tap-min`.

## States

- **Links:** default `--color-on-dark`; hover underline at `--underline-offset`; focus-visible uses the global dual ring; active same as hover.
- **Empty socials:** the socials line is omitted.
- **Empty email:** the email line is omitted. If both are empty, the contact group is omitted.
- **Empty role line or location:** the joining " · " is dropped.

## Props/API

```ts
type SiteFooterProps = {
  settings: {
    name?: string | null
    roleLine?: string | null
    location?: string | null
    contactEmail?: string | null
    socials?: { platform: string; url: string }[] | null
    footerNote?: string | null
    bookingLabel?: string | null
  }
}
```

Server component, no client JavaScript.

## Accessibility

- `<footer>` landmark; the links group is a `<nav>` with its own `aria-label`, distinct from the header's.
- Social links use the platform name as link text and `rel="me noopener"`. A platform of "Other" shows the link's host name (for example `example.org`), so the link text says where it goes. URLs are validated as http(s) at save time and filtered again before rendering.
- Every target at least 44 px tall.
- Text contrast: `--on-dark` on ink 10.5:1; copyright 8.2:1.

## Responsive

- **768 px and up:** the three groups sit in a row, spread apart (row gap `--space-8`, column gap `--space-12`), aligned to the top.
- **Below 768 px:** one stacked column in source order: brand, links, contact, then copyright.
- No horizontal scroll at 320 px or 390 px.

## Usage

Rendered once at the bottom of every public page, after the booking finale (P1+) or directly after the opener (404).

## Preview

[Open preview](../preview/index.html)
