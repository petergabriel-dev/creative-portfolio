# StudioAccentSwatches

## Purpose

The `site-settings.accent` field drawn as four round colour swatches with a live Book Me preview (screen 29, "Look & labels"). It replaces the select's control (`admin.components.Field`) and stores the same values (`gold`, `terracotta`, `sage`, `offwhite`). Sources: captures 29 at 1440 px and 390 px; the Build Spec section "Admin (Studio) customisation" (accent swatches) and "Globals › site-settings"; P6 owner decision 9 (2026-11-12).

## Anatomy

`<fieldset>` (no border, no padding), `--space-6` margin-block-end.

1. **Legend:** `<legend>` "Accent colour" followed by `<span>` " · Book Me buttons and progress only" (the field's label, then its description, as capture 29 writes them on one line): `--fs-sm`, `--fw-semibold`, `--color-text`, `--space-3` below.
2. **Body**, a row: `display: flex`, `flex-wrap: wrap`, `align-items: center`, gap `--space-8`.
   - **Swatches:** a row of four options, gap `--space-5`. Each option is a `<label>` (`display: grid`, `justify-items: center`, gap `--space-2`) holding:
     - a native `<input type="radio" name="<field path>" value="<accent>">` drawn as the swatch: `appearance: none`, `--space-10` square, `border-radius: 50%`, fill `var(<accentToken(value)>)` (`--accent-gold`, `--accent-terracotta`, `--accent-sage`, `--accent-offwhite`), `--border-hairline` solid `--color-studio-field-border` (the ring that keeps off-white visible);
     - the name ("Gold", "Terracotta", "Sage", "Off-white" from `ACCENT_OPTIONS`): `--fs-label`, `--color-text-muted`.
   - **Preview:** a panel, `--color-studio-nav-bg`, `--radius-cms-field`, padding `--space-4` block and `--space-5` inline, `display: flex`, `align-items: center`, gap `--space-5`:
     - "Preview": `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-studio-nav-label`;
     - Button `gold`, size `default`, `type="button"`, labelled with the form's current `bookingLabel` (or "Book Me" from `copy.ts` when it is blank). The panel sets `--color-booking: var(<accentToken(value)>)` inline, so Button is reused unchanged. The Button sits inside an `inert`, `aria-hidden="true"` wrapper: it is a picture of the site's button, not a control.
3. **Error:** Payload's `FieldError` for the field, under the body.

## Variants

Four accents; gold is the default (`DEFAULT_ACCENT`).

## Sizes

One. Swatches are `--space-10` (40 px) across; with the name under it each option is taller than `--tap-min`.

## States

| State | What changes |
|---|---|
| Default | As in Anatomy; the stored value is checked |
| Selected | The swatch gets a `--space-1` gap in `--color-studio-card` and a `--border-strong` ring in `--color-text` outside its own ring (two `box-shadow`s); its name turns `--color-text`, `--fw-semibold`. The preview shows that accent |
| Hover | Unselected swatch ring turns `--color-text` |
| Focus-visible | The global dual focus ring, offset outside the selected ring (`outline-offset` `--space-2`) so both stay visible |
| Active | Same as hover |
| Disabled / read-only | `useField`'s `disabled`: inputs `disabled`, swatches at `--opacity-disabled`, preview unchanged |
| Error | `FieldError` below; ring colours unchanged |
| Loading / Empty | None: the field always has a value (required, with a default) |

Choosing a swatch only changes the form; the site changes after Save (Payload's normal save, then `revalidateLayout`).

## Props/API

```ts
// admin.components.Field on site-settings.accent ('use client'): Payload passes the select field's client props.
type StudioAccentSwatchesProps = SelectFieldClientProps // uses path; useField<string>({ path }) gives value, setValue, disabled

// Pure view, testable without Payload's form context
type AccentSwatchesViewProps = {
  name: string
  value: Accent
  options: typeof ACCENT_OPTIONS
  label: string
  description: string
  bookingLabel: string
  disabled: boolean
  onChange: (value: Accent) => void
}
```

`accentToken()` (`src/lib/accent.ts`) maps a value to its token; colours stay in `tokens.css`.

## Accessibility

- A `<fieldset>` with a `<legend>`, and four native radios sharing one `name`: arrow keys move and select, Tab enters and leaves the group, Space selects (native radio group).
- Each swatch's name is visible text, so the choice never depends on seeing the colour (WCAG 1.4.1; capture 29 shows no names).
- The preview is `aria-hidden` and `inert`; it adds nothing to the reading order.
- Contrast (computed 2026-11-12): every swatch ring `--field-border` on `--surface` 3.5:1 (non-text, 3:1 required), so off-white (1.1:1 against the card on its own) stays visible; selected ring `--ink` on `--surface` 16.7:1; names `--muted` on `--surface` 6.6:1; "Preview" `--on-ink-muted` on `--ink` 8.2:1; every accent on `--ink` passes (gold 9.2:1, terracotta 5.9:1, sage 9.0:1, off-white 15.4:1), and `--ink` button text on each accent the same.
- Motion: ring colour transition over `--duration-fast`, none under `prefers-reduced-motion`.

## Responsive

- **Below 768 px:** the preview panel wraps below the swatches (capture 29 at 390 px).
- **768 px and up:** swatches and preview on one row, as capture 29 at 1440 px.
- No horizontal scroll at 320 px: the four options fit in 4 × 40 px plus gaps; the row wraps if needed.

## Usage

- Only on `site-settings.accent`.
- Changes from capture 29 (recorded in `docs/design/README.md`): each swatch shows its name.

## Preview

[Open preview](../preview/index.html#pv-studio-swatches)
