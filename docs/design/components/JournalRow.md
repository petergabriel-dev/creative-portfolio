# JournalRow

## Purpose

One journal post as a row on `/journal` and `/journal/page/N`, linking to the post's entry page. Source: capture 09 (desktop and mobile). The `card` variant is the Build Spec's JournalCard on Home (capture 01, P4).

## Anatomy

An `<li>` holding one row block (`position: relative`). The only link is the title's; its `::after` (`position: absolute; inset: 0`) stretches the click and tap area over the whole row, so the row still works as one target (owner decision 2026-11-11, WCAG 2.5.3 Label in Name). Rows are separated by a top hairline (`--border-hairline` `--color-rule`), the list closes with a bottom hairline, and each row is padded `--space-10` block.

1. **Image:** MediaImage of the post's `cover` at `3:2` (the `card` crop), `sizes="(min-width: 768px) 45vw, 100vw"`. Never `priority`: every list cover lazy-loads behind its tint.
2. **Text group** (flex column):
   - **Meta:** "{category name} · {date}", joined with the separator from `copy.ts`. The date reads "6 Nov 2026" (`formatDate`, Asia/Singapore time) inside `<time dateTime="YYYY-MM-DD">`. `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Title:** a heading (`h2` by default) wrapping the `<a href>` to the entry (colour inherited, no underline), in `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `text-wrap: balance`, `overflow-wrap: break-word`. `--space-3` below the meta.
   - **Excerpt:** `<p>` with the post's `excerpt`, max-width `--measure-body`, `--fs-lead`, `--lh-body`, `--color-text-muted`. `--space-4` below the title.
   - **Call to action:** "Read story" from `copy.ts` plus a trailing arrow, as a visual cue only (`aria-hidden`, not a link: the stretched title link covers it). `--fs-sm`, `--fw-medium`, `--color-text`, underlined at `--underline-offset`. `--space-5` below the excerpt.

## Variants

- **`row`** (default): as above, on the journal list pages.
- **`card`** (P4): the Build Spec's **JournalCard**, used for "From the journal" on Home (capture 01). One component with two layouts keeps the meta, link and empty-part rules in one place. Differences from `row`:
  - always stacked (image on top, then the text group, `--space-5` apart), at every width; no hairlines or block padding;
  - meta, title (`--fs-card`, as `ProjectCard`; capture 01's 40 px is smaller, recorded in `../README.md`) and excerpt (`--fs-body`, `--color-text-muted`, max-width `--measure-body`) as in `row`, `--space-2` apart;
  - **no call to action**: the capture shows none, and the stretched title link already covers the card.

`headingLevel` changes only the heading element, not its look. Home passes `h3` (the cards sit under the "From the journal" chapter `h2`).

## Sizes

One. The title scales with `--fs-card`.

## States

- **Default:** as above.
- **Hover:** anywhere on the row; the call-to-action underline thickens to `--border-strong`. On a `card` (no call to action), the title gets a `--border-strong` underline at `--underline-offset` instead (P4).
- **Focus-visible:** the global dual focus ring around the title link.
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
  variant?: 'row' | 'card' // default 'row'; 'row' output is unchanged by P4
}
```

Server component. The parent list is `<ul role="list">`.

## Accessibility

- One link per row: the title, so the link's name is exactly its visible label (WCAG 2.5.3). A whole-row link named by `aria-labelledby` fails axe's `label-content-name-mismatch` (serious) because the row's other visible text is left out of the name.
- The cover's alt text, the meta line and the excerpt are ordinary content around the link.
- On `/journal` there is no chapter heading, so titles are `h2`s directly under the page's `h1`.
- The separator and arrow are `aria-hidden`; the date is a `<time>` with a machine-readable `dateTime`.
- Contrast: title `--ink` on `--bone` 15.4:1; meta and excerpt `--muted` on `--bone` 6.1:1.
- `touch-action: manipulation` on the link. The stretched area means excerpt text can't be selected by dragging; that is accepted.

## Responsive

- **Below 768 px:** image on top, then the text group, `--space-8` apart.
- **768 px and up:** two grid columns, `minmax(0, 5fr) minmax(0, 6fr)`, with a column gap of `--space-14`; the text group is vertically centred against the image. At 1,440 px this gives a 571 px image and a text column starting about 690 px from the content edge, as in capture 09.
- Nothing overflows at 320 px; long titles wrap.
- **`card`:** stacked at every width. The Home grid is `repeat(auto-fit, minmax(min(var(--grid-min-card), 100%), 1fr))` with gaps `--space-12` (rows) and `--space-6` (columns): one card per row below about 900 px, two side by side above (capture 01).

Verify at 390 and 1,440 px against capture 09 (and 375, 768 and 1,280 px); the `card` variant against capture 01 at the same widths.

## Usage

- `row`: journal list pages (`/journal`, `/journal/page/N`).
- `card`: "From the journal" on Home (P4), the latest `home.journalCount` posts. The cover is never `priority`.

## Preview

[Open preview](../preview/index.html)
