# GoodToKnow

## Purpose

The first column of Book Me's Chapter 01: how else to reach the owner, where they are based and what they work on, plus a line that sets expectations. Source: capture 11 (1440 px and 390 px) and the P3 owner decisions of 2026-11-11.

## Anatomy

1. **Heading:** ChapterHeading, number 1, title "Good to know" (from `copy.ts`), with an `id` for the section's `aria-labelledby`.
2. **Details:** a `<dl>` with `--space-6` above it and a `--border-hairline` `--color-rule` line above the first row. Each row is a `<div>` holding a `<dt>` and a `<dd>`, padded `--space-5` block, with a `--border-hairline` `--color-rule` line below it:
   - **Prefer email?**: `site-settings.contactEmail` as a `mailto:` link (built through `safeHref`), `--color-text`, underlined on hover only.
   - **Based in**: `site-settings.location`.
   - **Working on**: fixed copy from `copy.ts`, "Photography, film, design & writing" (owner decision 2026-11-11; final wording in P7).
3. **Note:** `<p>` from `copy.ts`, "This starts a conversation — nothing is booked until we've talked it through.", `--space-6` above, `--fs-sm`, `--lh-body`, `--color-text-muted`, max-width `--measure-body`.

**Term:** `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
**Value:** `--fs-body`, `--lh-body`, `--color-text`, `overflow-wrap: anywhere` (long email addresses).

## Variants

None.

## Sizes

One.

## States

- **Default:** as in Anatomy.
- **Email link:** hover adds the underline at `--underline-offset`; focus-visible uses the global dual focus ring.
- **Empty CMS value:** the row for an empty `contactEmail` or `location` is left out. "Working on" and the note always show. Never crashes.
- Loading, error and disabled do not apply (static server component).

## Props/API

```ts
type GoodToKnowProps = {
  contactEmail?: string | null
  location?: string | null
}
```

Server component.

## Accessibility

- `<dl>`, `<dt>`, `<dd>` carry the label–value pairs; the section is named by the Chapter 01 heading.
- The email link's accessible name is the address itself; the link meets 44 × 44 px through its block padding (min-height `--tap-min`).
- Contrast: terms `--muted` on `--bone` 6.1:1; values `--ink` on `--bone` 15.4:1; note 6.1:1.

## Responsive

- **Narrower than 400 px:** each row stacks the term above the value, `--space-1` apart.
- **At least 400 px wide** (a container query on the block): term on the left, value right-aligned on the same line (`justify-content: space-between`, gap `--space-6`). That is full width from 768 px and the first column at 1440 px; in the narrower first column from 1024 to about 1279 px the rows stay stacked, so the email address never breaks mid-word.
- Long values wrap; no horizontal scroll at 320 px.

## Usage

- Only on `/book`: the left column of Chapter 01 from 1024 px, above the form below that.
- The heading uses `--fs-section` (ChapterHeading), which is larger than capture 11's "Good to know"; the Build Spec section heading size wins, as for story chapters in P1.
- Motion: underline colour transition over `--duration-fast`; none under `prefers-reduced-motion`.

## Preview

[Open preview](../preview/index.html)
