# JournalRow

## Purpose

One journal post as a row on `/journal` and `/journal/page/N`, linking to the post's entry page. Source: capture 09 (desktop and mobile).

## Anatomy

An `<li>` holding one `<a>` row. Rows are separated by a top hairline (`--border-hairline` `--color-rule`), the list closes with a bottom hairline, and each row is padded `--space-10` block.

1. **Image:** MediaImage of the post's `cover` at `3:2` (the `card` crop), `sizes="(min-width: 768px) 45vw, 100vw"`. Never `priority`: every list cover lazy-loads behind its tint.
2. **Text group** (flex column):
   - **Meta:** "{category name} · {date}", joined with the separator from `copy.ts`. The date reads "6 Nov 2026" (`formatDate`, Asia/Singapore time) inside `<time dateTime="YYYY-MM-DD">`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Title:** a heading (`h2` by default) with `id`, in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`. `--space-3` below the meta.
   - **Excerpt:** `<p>` with the post's `excerpt`, max-width `--measure-body`, `--fs-lead`, `--lh-body`, `--color-text-muted`. `--space-4` below the title.
   - **Call to action:** "Read story" from `copy.ts` plus a trailing arrow (`aria-hidden`). `--fs-sm`, `--fw-medium`, `--color-text`, underlined at `--underline-offset`. `--space-5` below the excerpt.

## Variants

One. `headingLevel` changes only the heading element, not its look.

## Sizes

One. The title scales with `--fs-card`.

## States

- **Default:** as above.
- **Hover:** the call-to-action underline thickens to `--border-strong`.
- **Focus-visible:** the global dual focus ring around the row.
- **Active:** same as hover.
- **Empty parts:** a missing category or date drops that part and its separator. With both missing, the meta line is omitted. A missing cover shows the tinted frame.
- Disabled, loading and error do not apply.

## Props/API

```ts
type JournalRowProps = {
  title: string
  href: string // canonical entry URL, /journal/<slug>
  excerpt: string
  cover?: Media | number | null
  categoryName?: string | null
  publishedAt?: string | null // ISO; formatted with formatDate
  headingLevel?: 'h2' | 'h3' // default 'h2'
}
```

Server component. The parent list is `<ul role="list">`.

## Accessibility

- One link per row, named by the title (`aria-labelledby` points at the heading).
- On `/journal` there is no chapter heading, so titles are `h2`s directly under the page's `h1`.
- The separator and arrow are `aria-hidden`; the date is a `<time>` with a machine-readable `dateTime`.
- Contrast: title `--ink` on `--bone` 15.4:1; meta and excerpt `--muted` on `--bone` 6.1:1.
- `touch-action: manipulation`.

## Responsive

- **Below 768 px:** image on top, then the text group, `--space-8` apart.
- **768 px and up:** two grid columns, `minmax(0, 5fr) minmax(0, 6fr)`, with a column gap of `--space-14`; the text group is vertically centred against the image. At 1,440 px this gives a 571 px image and a text column starting about 690 px from the content edge, as in capture 09.
- Nothing overflows at 320 px; long titles wrap.

Verify at 390 and 1,440 px against capture 09 (and 375, 768 and 1,280 px).

## Usage

Journal list pages only (`/journal`, `/journal/page/N`). The "From the journal" cards on Home are a different component (JournalCard, P4).

## Preview

[Open preview](../preview/index.html)
