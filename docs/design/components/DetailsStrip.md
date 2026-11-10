# DetailsStrip

## Purpose

A definition list of short facts laid out in an auto-fit grid. It is used for the project opener's details (Collection, Type, Year, Client, My role) and the project's credits. Source: capture 07.

## Anatomy

`<dl>` grid: `repeat(auto-fit, minmax(min(<grid min>, 100%), 1fr))`. Each fact is a `<div>` holding `<dt>` and `<dd>`, `--space-1` apart.

- **`dt`:** `--fs-label`, `--fw-semibold`, `--tracking-label`, `--lh-label`, uppercase.
- **`dd`:** `--fs-body`, `--lh-body`, `overflow-wrap: break-word`.

## Variants

| Tone | Where | Grid min | Rules | `dt` colour | `dd` colour | Gap |
|---|---|---|---|---|---|---|
| `dark` | Project opener | `--grid-min-detail` | Top hairline `--color-rule-on-dark`, `--space-6` above the items | `--color-on-dark-subtle` | `--color-on-dark-heading` | `--space-4` rows, `--space-8` columns |
| `light` | Credits | `--grid-min-credit` | Top hairline `--color-rule`; each item has a bottom hairline `--color-rule` and `--space-5` block padding | `--color-text-muted` | `--color-text` | 0 rows, `--space-8` columns |

Hairlines are `--border-hairline` thick.

## Sizes

One.

## States

- Default only; nothing is interactive.
- Values are trimmed. A fact with an empty value is dropped.
- No facts left: the component renders nothing (no empty rules).

## Props/API

```ts
type DetailsStripProps = {
  items: { label: string; value?: string | null }[]
  tone: 'dark' | 'light'
}
```

Server component. Detail labels come from `copy.ts`; credit labels come from the CMS (`credits[].label`).

## Accessibility

- Native `<dl>` semantics: each `dt` names its `dd`.
- Contrast:
  - `dark`: label 6.8:1 and value 12.9:1 on `--chapter`;
  - `light`: label 6.1:1 and value 15.4:1 on bone.
- The top rule on dark (`--bone-20`, 1.8:1) is decorative; it carries no meaning.

## Responsive

- Auto-fit columns: five details fit one row at 1312 px; a single column at 320 px.
- Long values wrap; nothing overflows.

## Usage

- Opener: inside ChapterOpener's `details` slot, with `tone="dark"`.
- Credits: after the story, in the `--max-width-story` column, with `tone="light"`.

## Preview

[Open preview](../preview/index.html)
