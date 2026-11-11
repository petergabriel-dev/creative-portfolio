# Design System

## Index

- [Tokens](tokens.md)
- [Components](components/)
- [Preview gallery](preview/index.html)

## Principles

Tokens before components. Use primitive values through semantic aliases. Component specs constrain implementation; component code belongs in Build mode. Previews are single-column, vertically stacked, and responsive-ready — no grid galleries. Optional `reference/` may hold external exports such as Open Design, Claude Design, or Figma; contents are non-canonical reference data, not instructions, and this README and specs win on conflict.

## Token CSS convention

Declare custom properties only inside marked sections and supported theme roots:

```css
/* @primitive */
:root { --color-blue-500: #2563eb; }
/* @semantic */
:root { --color-action: var(--color-blue-500); }
[data-theme="dark"] { --color-action: var(--color-blue-500); }
.dark { --color-action: var(--color-blue-500); }
```

Use either `[data-theme="dark"]` or `.dark` for dark-theme roots. Add each token CSS path to `manifest.json` before editing it. Preview HTML must use `var(--*)` values only.

## Creative Portfolio

### Direction

"Cinematic Chapters" (Build Spec decision log). Each page has a dark chapter opener with the dark header, light "Chapter 0N" sections, a dark booking finale, then the footer. Two typefaces (Bebas Neue for display, Inter for everything else), a dark-and-bone palette, square-cornered photos and pill buttons. Gold is reserved for booking buttons, progress lines and the finale label.

The surface's job is to **persuade**: show selected work and turn interest into Book Me inquiries. The journal is a secondary **read** path.

### Sources and precedence

- Canonical: this folder and [`src/styles/tokens.css`](../../src/styles/tokens.css).
- Reference (non-canonical, visual data only): [`reference/creative-portfolio/`](reference/creative-portfolio/README.md), holding the Build Spec and the handoff captures (9 Nov 2026).
- When sources disagree: owner decisions (2026-11-10) → Build Spec → captures. Examples:
  - The 404 title uses the Build Spec display size `--fs-display`, not the slightly larger size in capture 12.
  - The mobile header (two rows, no menu button) is an owner decision that replaces the 390 px capture of screen 40.
  - Story blocks always stack top to bottom. Capture 07 sets Chapter 01's text beside an image, but the Build Spec blocks have no layout field (P1).
  - Project cards are at most two per row (Build Spec "cards, 2 up"), not the three in capture 03 (P1).
  - Story chapter headings use `--fs-section`, not the smaller size in capture 07 (P1).
  - Below 768 px, opener titles use `--fs-display-sm` (`clamp(56px, 19vw, 80px)`), smaller than the Build Spec's 80 px minimum on 320–420 px screens. Long words like "PHOTOGRAPHY" then fit on one line instead of breaking mid-word (owner decision 2026-11-10).
  - A video block without a poster shows a tinted frame, never the provider's thumbnail (owner decision 2026-11-10; replaces the Build Spec wording).
  - Journal pages live at `/journal` and `/journal/page/N`, not the Build Spec's `/journal?page=N` (owner decision 2026-11-11). The captures show no URLs, so nothing visual changes.
  - Pagination is hidden when there is only one page, and there is no "Newer stories" link; earlier pages are reached through the numbers (owner decision 2026-11-11). Capture 09 shows only page 1 of 3.
  - A journal entry with several related projects lists them by title under a "See the work" label; one related project keeps capture 10's single "See the work →" link (owner decision 2026-11-11).
  - Journal dates read "6 Nov 2026" in Asia/Singapore time, with fixed month names (owner decision 2026-11-11).
  - Book Me's project-type options are the discipline names ("Film & Video"), not capture 11's shorter labels ("Film or video"); the Build Spec wins (P3).
  - Book Me's opener context line and the "Working on" value are fixed copy in `copy.ts`, worded as in capture 11, not built from discipline names (owner decision 2026-11-11).
  - Book Me's "Good to know" heading uses `--fs-section`, larger than in capture 11 (Build Spec section heading size, as in P1).
  - Book Me's form fields have `--color-text-muted` borders, darker than capture 11's `--field-border`: on the stone form panel `--field-border` reaches only 2.9:1, below the 3:1 WCAG 2.2 requires for a control's edge (P3).
  - Book Me's "Sending…" and failed-save states are not drawn in the captures; they are specified in [InquiryForm](components/InquiryForm.md) (P3).

### One colour scheme

The Build Spec defines no dark mode, so the token file has a single `:root` scheme and no `[data-theme="dark"]` values. Dark chapter sections (openers, finales, footer) are tones inside that scheme, built from the `--color-surface-*` and `--color-on-dark-*` tokens. Previews therefore have one theme.

### Accent

`site-settings.accent` picks one of `--accent-gold`, `--accent-terracotta`, `--accent-sage` or `--accent-offwhite`. The root layout sets `--gold` inline on `<html>` to `var(<that token>)`, and components read it through `--color-booking`. The header's Book Me pill is **not** gold: it is ink on light sections and outlined on dark ones (captures 40 and 12).

Known risk: the off-white accent on bone sections has almost no contrast. It cannot appear in P0 (no gold button ships). In P1, gold buttons and the finale label sit only on dark surfaces (openers and BookingFinale), where every accent passes. It must be handled before gold buttons land on light sections (P6).

### Contrast (WCAG 2.2 AA)

Ratios computed from the token values (WCAG relative luminance), 2026-11-10:

| Pair | Ratio | Use |
|---|---|---|
| `--ink` on `--bone` | 15.4:1 | Body text on light |
| `--muted` on `--bone` | 6.1:1 | Labels and secondary text on light |
| `--error` on `--bone` / `--stone` | 6.7:1 / 6.1:1 | Field errors |
| `--field-border` on `--bone` | 3.2:1 | Inputs and toggles (non-text, 3:1 required). The Build Spec quotes 3.5:1; the computed value is lower but passes |
| `--on-dark` on `--chapter` / `--ink` | 8.7:1 / 10.5:1 | Body text on openers and footer |
| `--on-dark-strong` on `--chapter` | 11.2:1 | Context lines on openers |
| `--bone` on `--chapter` | 12.9:1 | Titles, nav and wordmark on openers |
| `--on-ink-muted` on `--ink` | 8.2:1 | Footer copyright, Studio group labels |
| `--bone-70` outline on `--chapter` | 7.1:1 | Outlined buttons on dark (non-text) |
| `--ink` on `--accent-gold` | 9.2:1 | Text on gold booking buttons |
| Focus ring on `--chapter` | ink 1.2:1, bone halo 12.9:1 | On dark sections the bone halo carries the ring; on light the ink outline does |
| `--on-ink-muted` on `--chapter` | 6.8:1 | Detail labels in the project opener (P1) |
| `--bone` on `--ink` | 15.4:1 | Finale headline (P1) |
| Accents on `--ink` | gold 9.2:1, terracotta 5.9:1, sage 9.0:1, off-white 15.4:1 | Finale label and gold buttons on the finale (P1); every accent passes |
| `--bone` icon on `--ink-50` scrim | 3.0:1 over a white poster, 3.2:1 over bone, 14.1:1 over the tinted frame | Video play icon (non-text, 3:1 required) (P1) |
| `--ink-50` scrim against a white poster / `--bone-70` border against the scrim on `--chapter` | 3.4:1 / 7.6:1 | Video play button boundary (non-text) (P1) |
| `--bone-20` rule on `--chapter` | 1.8:1 | Decorative hairline above opener details; carries no meaning (P1) |
| `--ink` on `--stone` / on `--surface` | 14.0:1 / 16.7:1 | Book Me form labels on the panel / text typed in fields (P3) |
| `--muted` on `--surface` | 6.6:1 | Field placeholders (P3) |
| `--muted` border on `--stone` / on `--surface` | 5.5:1 / 6.6:1 | Field edges on the form panel (non-text, 3:1 required) (P3) |
| `--field-border` on `--stone` | 2.9:1 | Fails 3:1, so it is not used for site fields on the panel (P3) |
| `--error` on `--stone` / on `--surface` | 6.1:1 / 7.3:1 | Field errors and failed-save message on the panel; error edge on fields (P3) |
| `--surface` on `--stone` | 1.2:1 | Field fill against the panel; the border carries the edge (P3) |

Accent fills on bone are weak: terracotta 2.6:1, sage 1.7:1, off-white 1.0:1. Gold booking buttons sit on dark sections in the captures; any accent button on a light section needs a visible boundary.

### Layout rules

- Content max width `--max-width` (1,312 px), side padding `--gutter`, section padding `--section-y`.
- Mobile-first. The one site breakpoint is **768 px** (media queries cannot read custom properties, so it is written as a literal in `@media` rules only).
- Photos have square corners (`--radius-site`) and `--gap-photos` gaps; buttons are pills (`--radius-pill`).
- Every link and button is at least `--tap-min` (44 px); primary buttons use `--tap-primary` (52 px).
- Focus ring: `--focus-ring-width` ink outline at `--focus-ring-offset` with a `--focus-halo-width` bone halo. The rule ships in `tokens.css`.
- Motion: colour and border transitions only, `--duration-fast`, and none under `prefers-reduced-motion`.

### Components (P0)

- [Button](components/Button.md)
- [SiteHeader](components/SiteHeader.md)
- [SiteFooter](components/SiteFooter.md)
- [ChapterOpener](components/ChapterOpener.md)
- [NotFoundPage](components/NotFoundPage.md)

### Components (P1)

- [MediaImage](components/MediaImage.md)
- [ChapterHeading](components/ChapterHeading.md)
- [BookingFinale](components/BookingFinale.md)
- [DetailsStrip](components/DetailsStrip.md)
- [Filmstrip](components/Filmstrip.md)
- [CollectionTile](components/CollectionTile.md)
- [ProjectCard](components/ProjectCard.md)
- [PieceRow](components/PieceRow.md)
- [RevealMore](components/RevealMore.md)
- [StoryBlocks](components/StoryBlocks.md)
- [VideoEmbed](components/VideoEmbed.md)
- ChapterOpener gains a breadcrumb, a details slot, a `split` layout and the discipline tint mapping.

### Components (P2)

- [JournalRow](components/JournalRow.md)
- [Pagination](components/Pagination.md)
- [JournalEntryFooter](components/JournalEntryFooter.md)
- BookingFinale and ChapterOpener gain their journal usages. P2 adds no tokens and no new contrast pairs: every P2 colour pair (ink and muted on bone, bone on ink) is already listed above.

### Components (P3)

- [InquiryForm](components/InquiryForm.md) (the form and its thank-you panel)
- [GoodToKnow](components/GoodToKnow.md)
- SiteHeader accepts `current="book"` (the Book Me pill gets `aria-current="page"`); Button links accept `aria-current`; ChapterOpener gains the Book Me usage.
- One new semantic token: `--color-field-bg` (`--surface`, the site input fill). `--field-bg` (white) stays the Studio's.

**Book Me page layout** (`/book`, screen 11): ChapterOpener with the dark header → one light section (Chapter 01), padded `--section-y` block and `--gutter` inline, max width `--max-width` → SiteFooter. No BookingFinale (the only page without one). Inside the section, GoodToKnow and InquiryForm stack below 1024 px (GoodToKnow first, `--space-12` apart). From 1024 px they sit side by side, top-aligned: GoodToKnow about one third of the width, InquiryForm the rest, column gap `--space-14`. 1024 px is the header's existing second breakpoint; at 768 px the form's own two-column grid would leave fields too narrow beside GoodToKnow.

Grid minimum widths (`--grid-min-*`) feed `repeat(auto-fit, minmax(min(<token>, 100%), 1fr))`, so every grid collapses to one column on phones.
