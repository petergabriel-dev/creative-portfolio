# Button

## Purpose

The one control for actions and calls to action: booking buttons, page actions such as "Back to home", and inline text links styled as actions. Source: UI kit (screen 43), header (40, 12) and 404 (12) captures.

## Anatomy

- A pill (`--radius-pill`) with a visible text label, centred with inline-flex.
- Optional trailing arrow on the `text` variant; the arrow string comes from `copy.ts`.
- Renders `<a>` (next/link) when it has `href`, otherwise `<button>`.

## Variants

| Variant | Background | Border (`--border-hairline`) | Text | Weight | Where |
|---|---|---|---|---|---|
| `gold` | `--color-booking` | `--color-booking` | `--color-on-booking` | `--fw-semibold` | Booking CTAs on dark sections (P1+) |
| `ink` | `--color-action` | `--color-action` | `--color-on-action` | `--fw-medium` | Header Book Me pill, light tone |
| `outline-ink` | transparent | `--color-action` | `--color-text` | `--fw-medium` | Secondary actions on light |
| `outline-light` | transparent | `--color-outline-on-dark` | `--color-on-dark-heading` | `--fw-medium` | Header pill on dark tone; 404 "Back to home" |
| `text` | none | none | inherits (`currentColor`) | `--fw-medium` | "Browse the portfolio →" |

Pill variants set labels in caps (`text-transform: uppercase`). The `text` variant is sentence case, `--fs-sm`, always underlined at `--underline-offset`.

## Sizes

| Size | Min height | Padding inline | Label |
|---|---|---|---|
| `default` | `--tap-min` | `--pill-pad-x` | `--fs-label`, `--tracking-nav` |
| `primary` | `--tap-primary` | `--space-7` | `--fs-label-lg`, `--tracking-label` |

The `text` variant uses the chosen size's min-height with `--space-2` inline padding.

## States

- **Default:** as in Variants.
- **Hover:** the label gets an underline at `--underline-offset` (pill variants); the `text` variant's underline thickens to `--border-strong`. Colours do not change, so contrast never drops.
- **Focus-visible:** the global dual focus ring from `tokens.css`.
- **Active:** same as hover.
- **Disabled** (`<button>` only): `--opacity-disabled`, `cursor: not-allowed`, native `disabled`. Links are never disabled.
- Loading, empty and error do not apply (static control).

## Props/API

```ts
type ButtonProps = {
  variant: 'gold' | 'ink' | 'outline-ink' | 'outline-light' | 'text'
  size?: 'default' | 'primary' // default 'default'
  href?: string // present → <a> via next/link
  trailingArrow?: boolean // appends the copy.ts arrow, aria-hidden (text variant)
  children: React.ReactNode
  disabled?: boolean // <button> only
  type?: 'button' | 'submit' | 'reset' // <button> only, default 'button'
}
```

## Accessibility

- The visible label is the accessible name; no icon-only buttons.
- Every size is at least 44 × 44 px (`--tap-min`).
- `<a>` for navigation, `<button>` for actions; never `aria-disabled` on links.
- Focus ring is visible on light (ink outline) and dark (bone halo) sections.
- Text contrast: ink on gold 9.2:1, bone on ink 15.4:1, bone on chapter 12.9:1.

## Responsive

Same at every width: inline size follows the label, never forced full width. Wrapping action rows are the parent's job (see ChapterOpener).

## Usage

- Booking actions on dark sections use `gold`. The header Book Me pill is `ink` (light tone) or `outline-light` (dark tone), never gold.
- Use `text` for secondary links next to a pill.
- Transitions: `color`, `background-color`, `border-color`, `text-decoration-color` over `--duration-fast`; none under `prefers-reduced-motion`.

## Preview

[Open preview](../preview/index.html)
