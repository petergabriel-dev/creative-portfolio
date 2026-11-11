# BookingFinale

## Purpose

The dark closing section before the footer on every page except Book Me: a gold label, a Bebas headline, one sentence and the booking button. Source: captures 02, 03, 06, 07, 09 and 10, and the Build Spec section "Front-end pages › Booking finale".

## Anatomy

`<section aria-labelledby>` on `--color-surface-finale`, padded `--finale-y` block and `--gutter` inline. Its content column is max-width `--max-width-narrow`, centred, with centred text and children `--space-5` apart:

1. **Label:** `<p>` from `copy.ts` ("Book me"). `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-booking`.
2. **Headline:** `<h2 id>` in `--font-display`, `--fw-regular`, `--fs-finale`, `--lh-finale`, uppercase, `--color-on-dark-heading`, `text-wrap: balance`, `overflow-wrap: break-word`.
3. **Body** (optional): `<p>`, max-width `--measure-body`, `--fs-lead`, `--lh-body`, `--color-on-dark`.
4. **Actions:** a centred row, row gap `--space-3`, column gap `--space-4`, with `--space-2` above.
   - Optional secondary action: Button `outline-light`, size `primary`, with a leading "←" (`aria-hidden`).
   - Booking: Button `gold`, size `primary`, linking to `/book`, labelled with `site-settings.bookingLabel`.

## Variants

- **With secondary action:** the project page ("← Back to portfolio").
- **Booking only:** Portfolio, collection, journal list and journal entry pages.

## Sizes

One. The headline scales with `--fs-finale`.

## States

- Default. The buttons bring their own hover, focus-visible and active states (Button spec).
- Empty body: the paragraph is omitted.

## Props/API

```ts
type BookingFinaleProps = {
  headline: string
  body?: string | null
  bookingLabel: string
  secondary?: { label: string; href: string }
}
```

Server component.

## Accessibility

- The section is named by its `h2`.
- Contrast on ink:
  - label 9.2:1 (gold), 5.9:1 (terracotta), 9.0:1 (sage), 15.4:1 (off-white);
  - headline 15.4:1;
  - body 10.5:1.
- Every accent is safe on this dark surface.
- The "←" arrow is decorative; the visible label is the accessible name.

## Responsive

- **Below 768 px:** the actions stack, centred.
- **768 px and up:** the actions sit in one centred row.
- The headline wraps. Nothing overflows at 320 px.

## Usage

| Page | Headline | Body |
|---|---|---|
| Portfolio | `site-settings.finaleHeadline` | default sentence in `copy.ts` |
| Collection | the discipline's `finaleHeadline` | the discipline's `finaleBody` |
| Project | its discipline's `finaleHeadline` (owner decision 2026-11-10) | its discipline's `finaleBody`; plus "Back to portfolio" |
| Journal (`/journal`, `/journal/page/N`) | `site-settings.finaleHeadline` | journal sentence in `copy.ts`: "Tell me about what you're making, and we'll start from there." (captures 09, 10) |
| Journal entry | `site-settings.finaleHeadline` | the same journal sentence; no secondary action ("Back to journal" sits above, in JournalEntryFooter) |

## Preview

[Open preview](../preview/index.html)
