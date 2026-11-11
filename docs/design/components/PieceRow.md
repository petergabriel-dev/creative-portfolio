# PieceRow

## Purpose

One project as a text row on a collection page with the `list` layout (Writing & More), linking to the project page. Source: capture 06.

## Anatomy

An `<li>` holding one `<a>` row. Rows are separated by a top hairline (`--border-hairline` `--color-rule`), the list closes with a bottom hairline, and each row is padded `--space-9` block.

1. **Meta:** "{projectType} · {client} · {year}", with empty parts dropped and the separator from `copy.ts`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
2. **Text group** (gap `--space-2`):
   - **Title:** `<h3 id>` in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`.
   - **Summary:** `<p>` with the project's `summary`, max-width `--measure-body`, in `--fs-lead`, `--lh-body`, `--color-text-muted`.
3. **Call to action:** "Read" from `copy.ts` plus a trailing arrow (`aria-hidden`). `--fs-sm`, `--fw-medium`, underlined at `--underline-offset`.

## Variants

One.

## Sizes

One.

## States

- **Default:** as above.
- **Hover:** the call-to-action underline thickens to `--border-strong`.
- **Focus-visible:** the global dual focus ring around the row.
- **Active:** same as hover.
- Empty client: dropped from the meta, along with its separator. Disabled, loading and error do not apply.

## Props/API

```ts
type PieceRowProps = {
  title: string
  href: string
  projectType: string
  client?: string | null
  year: number
  summary: string
}
```

Server component. The parent list is `<ul role="list">`.

## Accessibility

- One link per row, named by the title (`aria-labelledby`).
- Titles are `h3`s under the "Selected pieces" `h2`.
- Muted text on bone is 6.1:1.

## Responsive

- **Below 768 px:** meta, text group and call to action stack, `--space-3` apart.
- **768 px and up:** three grid columns, `minmax(0, 1fr) minmax(0, 3fr) auto`, with a column gap of `--space-12`, aligned to the top.

## Usage

Collection pages with `layout: list` only.

## Preview

[Open preview](../preview/index.html)
