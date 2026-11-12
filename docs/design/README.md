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
  - Home's hero keeps the site headline as the only `h1`, visually hidden; each slide title is a visible `h2` (Build Spec; the prototype's `h1` changed with each slide). A blank slide title shows the headline (owner decision 2026-11-11, P4).
  - The hero's story card row shows **every** slide, the current one included and marked with `aria-current` and a gold rule; capture 01 leaves the current slide out, so a clicked card vanished and took keyboard focus with it (owner decision 2026-11-11, P4).
  - Story cards are named by their visible text (kicker + title), not by capture 01's `aria-label="Show …"`, so each name contains its visible label (WCAG 2.5.3). All cards use the one Build Spec `--card` colour, not the capture's slightly different tints (P4).
  - The hero shows each slide's photo full-bleed under a `--color-hero-scrim` (`--ink-80`) scrim wherever text or a control sits, header band included; capture 01 has no photo. Below 1024 px the scrim covers the whole hero (owner decisions 2026-11-11, P4).
  - The hero has two progress lines as in capture 01 (top bar and the line beside the arrows), both `--border-strong` thick (capture: 3 px and 2 px); arrows are `--tap-primary` (capture: 56 px). Their colour and progress transitions use `--duration-fast`, not the prototype's 0.5 s (P4).
  - Selected work captions add the project title, visually hidden, to the link's name: "01 Photography, [title]" (P4).
  - Home's "Behind the camera" heading and About's section headings use `--fs-section` (Build Spec section heading size), larger or smaller than in captures 01 and 08 (as in P1).
  - The "From the journal" cards (JournalRow `card` variant) use `--fs-card` for titles, as ProjectCard does; capture 01 draws them at 40 px (P4).
  - On Home, an empty chapter (no Selected work, no `meet` heading, no disciplines, no posts) is left out and the later chapters renumber; with no hero slides the page shows the ChapterOpener with a visible `h1` instead of the slider (owner decision 2026-11-11, P4).
  - Up to 768 px the Studio sidebar sits in Payload's full-width drawer behind the app-header menu button, on every Studio screen; capture 21 at 390 px stacks it open above the Overview. From 769 px it sits beside the page when open, and Payload's open/closed behaviour is kept: up to 1440 px each full page load starts with it closed, though captures 21 and 42 show it open (owner decisions 2026-11-11, P5).
  - The Overview's "On the home page" panel lists the published hero slides and links "Edit Home page" to the `home` global; capture 21's "Edit in site settings" points at the wrong place, since slides live in `home` (owner decision 2026-11-11, P5).
  - The Overview's Drafts panel covers draft projects **and** posts, with "All projects" and "All posts" links in place of capture 21's single "All projects" (owner decision 2026-11-11, P5).
  - The Overview's Needs a reply rows show the project type only ("Photography"); capture 21's "Photography — wedding" has no matching inquiry field (P5).
  - The Overview's Recently edited panel has a third chip, "Unpublished changes" (outlined), for a live doc with a newer autosaved draft; capture 21 shows only Published and Draft (owner decision 2026-11-11, P5).
  - Recently edited rows stack when the panel is narrower than 720 px; capture 21 at 390 px lets the row run off the screen (P5).
  - When more than nine projects are marked for Selected work, the Overview says "the first 9 of N"; capture 21 shows only the nine-piece case (P5).
  - Payload's app header bar (breadcrumb, account link and the sidebar's menu button) stays above every Studio view, the Overview included; captures 21 and 42 omit it. The sidebar keeps Payload's block-start padding so that menu button never covers the brand (P5).
  - The Studio log-in replaces Payload's login view so its errors show inline, as in capture 20--error, rather than as toasts (owner decision 2026-11-11, P5).
  - The inquiries inbox shows only the buttons that apply to the selected inquiry's status, adds "Mark as new", an "Open full record →" link (notes and delete) and "Newer"/"Older" paging; capture 27 shows only a new inquiry's three buttons. Cards and detail show `projectType` only, without capture 27's sub-type ("Photography — wedding"). There is no "All" tab, bulk select or search (owner decisions 2026-11-12, P6).
  - The collection filter pills sit in Payload's `beforeListTable` slot, below Payload's own search and filter bar; capture 22 puts them on one row with the search field (P6).
  - Each accent swatch shows its name, so the choice never rests on colour alone (WCAG 1.4.1); capture 29 shows unlabelled swatches (owner decision 2026-11-12, P6).
  - The theme pass on Payload's own screens 22–26 and 28–31 stops at the theme stylesheet and layout-only admin options (owner decision 2026-11-12, P6). What that leaves different from the captures is listed under "Studio theme pass (P6)" below.

### One colour scheme

The Build Spec defines no dark mode, so the token file has a single `:root` scheme and no `[data-theme="dark"]` values. Dark chapter sections (openers, finales, footer) are tones inside that scheme, built from the `--color-surface-*` and `--color-on-dark-*` tokens. Previews therefore have one theme.

### Accent

`site-settings.accent` picks one of `--accent-gold`, `--accent-terracotta`, `--accent-sage` or `--accent-offwhite`. The root layout sets `--gold` inline on `<html>` to `var(<that token>)`, and components read it through `--color-booking`. The header's Book Me pill is **not** gold: it is ink on light sections and outlined on dark ones (captures 40 and 12).

Known risk: the off-white accent on bone sections has almost no contrast. It cannot appear in P0 (no gold button ships). In P1, gold buttons and the finale label sit only on dark surfaces (openers and BookingFinale), where every accent passes. Checked again in P6 (2026-11-12): every `gold` Button and accent progress line on the site still sits on a dark surface (openers, BookingFinale, the hero under its scrim, the Book Me thank-you panel), so nothing on the site changes. In the Studio, the accent appears only in [StudioAccentSwatches](components/StudioAccentSwatches.md): each swatch has a `--field-border` ring and the Book Me preview sits on an ink panel. A future gold button on a light section still needs a visible boundary.

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
| `--on-dark` / `--on-dark-strong` / `--bone` on `--ink-80` scrim over a white photo | 5.5:1 / 7.0:1 / 8.1:1 | Hero body, place line, titles and header links: the worst case (P4). `--ink-50` would give bone only 3.0:1, so the header band uses `--ink-80` too |
| `--accent-gold` / `--bone-70` on `--ink-80` scrim over white | 4.8:1 / 5.0:1 | Hero Book Me fill and progress fills; outlined button and arrow borders (non-text) (P4) |
| `--bone` / `--on-dark-strong` on `--card` | 6.6:1 / 5.8:1 | Story card title and kicker (P4) |
| `--accent-gold` on `--card` | 4.0:1 | Current story card's rule (non-text) (P4) |
| `--on-dark` on `--ink` | 10.5:1 | Studio sidebar links (P5) |
| `--bone` on `--ink-raised` | 11.2:1 | Studio sidebar current link (P5) |
| `--ink-raised` / `--ink-rule` on `--ink` | 1.4:1 / 1.5:1 | Current-link fill and the footer hairline: decorative; the current link also changes weight and has `aria-current` (P5) |
| `--accent-gold` on `--ink` / `--ink` on `--accent-gold` | 9.2:1 | "Studio · CMS" label; the inquiries badge (P5) |
| `--ink` / `--muted` on `--surface` | 16.7:1 / 6.6:1 | Overview panel text (P5) |
| `--chip-published-fg` on `--chip-published-bg` | 7.8:1 | Published chip (P5) |
| `--chip-draft-fg` on `--chip-draft-bg` | 5.5:1 | Draft chip and "{n} unpublished" (P5) |
| `--chip-published-fg` on `--surface` | 9.3:1 | "Unpublished changes" chip text and border (P5) |
| `--field-border` on `--field-bg` / on `--bone` | 3.6:1 / 3.2:1 | Studio field edges (non-text, 3:1 required) (P5) |
| `--error` on `--field-bg` | 7.6:1 | Studio log-in error edge (P5) |
| `--muted` on `--field-bg` | 6.9:1 | Payload's secondary text after the Studio theme maps its mid greys to `--color-text-muted` (P5) |
| `--field-border` on `--surface` | 3.5:1 | Accent swatch rings; Payload's resting field edges inside Studio cards (non-text, 3:1 required) (P6) |
| `--ink` on `--surface` / on `--field-bg` | 16.7:1 / 17.4:1 | Selected swatch ring; selected inbox card edge (P6) |
| `--bone` on `--ink` | 15.4:1 | New inquiry chip; current status pill and filter pill (P6) |
| `--chip-published-fg` on `--chip-published-bg` / `--chip-draft-fg` on `--chip-draft-bg` | 7.8:1 / 5.5:1 | Replied / Archived inquiry chips (P6) |
| `--field-border` on `--bone` | 3.2:1 | Status and filter pill edges (P6) |
| Accent fills against `--surface` | gold 1.8:1, terracotta 2.8:1, sage 1.9:1, off-white 1.1:1 | Swatch fills alone fail 3:1 against the card; the `--field-border` ring carries each swatch's edge and the name carries its meaning (P6) |

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

### Components (P4)

- [HeroSlider](components/HeroSlider.md) (with StoryCard): the one new client component on public pages.
- [SelectedWork](components/SelectedWork.md)
- CollectionTile gains a `home` variant (4:5, no label, "View gallery", `h3`); JournalRow gains a `card` variant (the Build Spec's JournalCard); ChapterHeading gains a label detail ("Chapter 02 · Behind the camera"). Their default output is unchanged.
- New tokens: primitive `--ink-80`; semantic `--color-hero-scrim`; `--fs-hero`, `--fs-story-card`, `--hero-min-h`, `--story-card-w`, `--shadow-story-card`.
- Motion: the hero's surface colour and its progress fills' width transition with `--duration-fast`, off under `prefers-reduced-motion` (Build Spec: "the slider's colour and progress transitions"). Nothing else moves.

**Home page layout** (`/`, screen 01): HeroSlider (outside `<main>`, like an opener) → `<main>` with up to four light chapters, each a `<section aria-labelledby>` padded `--section-y` block and `--gutter` inline, max width `--max-width`, ChapterHeading then content `--space-10` below → BookingFinale (`site-settings.finaleHeadline`, Home's own body from `copy.ts`) → SiteFooter.

1. **Selected work:** aside `home.selectedWorkIntro`; [SelectedWork](components/SelectedWork.md).
2. **Behind the camera:** on the stone band (`--color-surface-band`, as capture 01). Below 768 px the `meet` portrait (MediaImage 4:5) then the text, `--space-12` apart; from 768 px two equal columns (`minmax(0, 1fr)` each), gap `--space-20`, vertically centred. Text: ChapterHeading with the label detail and `meet.heading` as its title, `meet.body` (`--fs-lead`, `--lh-body`, `--color-text`), then an `outline-ink` `primary` Button "Get to know me" to `/about`, `--space-6` apart.
3. **Explore the portfolio:** aside = `text` Button "All collections" with trailing arrow to `/portfolio`; CollectionTile `home` tiles in the Portfolio grid.
4. **From the journal:** no top padding on the section; its content column starts with a `--border-hairline` `--color-rule` top border and `--section-y` above the heading, separating it from the light chapter before (capture 01). Aside = `outline-ink` `primary` Button "Read the journal" to `/journal`; JournalRow `card` items, at most two per row (`--grid-min-card` grid, as ProjectCard).

**About page layout** (`/about`, screen 08): ChapterOpener `split` (context line, title, lead; Book Me `gold` and "View my work" `outline-light` to `/portfolio`) → `<main>` padded `--section-y` / `--gutter`, max width `--max-width`: below 1024 px the portrait (MediaImage 4:5) then the sections, `--space-12` apart; from 1024 px two columns `minmax(0, 5fr) minmax(0, 6fr)`, gap `--space-20`, top-aligned. Sections stack `--space-12` apart; each is a `<section aria-labelledby>` with ChapterHeading ("Chapter 0N", the section heading) and its rich-text body (`--fs-lead`, `--lh-story`, `--color-text`; links underlined, `--color-text`). → BookingFinale (`site-settings.finaleHeadline`, the same body as the journal pages, as in capture 08) → SiteFooter.

Grid minimum widths (`--grid-min-*`) feed `repeat(auto-fit, minmax(min(<token>, 100%), 1fr))`, so every grid collapses to one column on phones.

### Components (P5): the Studio

- [StudioNav](components/StudioNav.md) (with StudioBrand, also used as Payload's `graphics.Logo` and `graphics.Icon`)
- [StudioOverview](components/StudioOverview.md) (the `/admin` dashboard)
- [StudioLogin](components/StudioLogin.md)
- Button is reused unchanged in the Studio (`ink`, `outline-ink`, `text`).
- New tokens: primitives `--ink-raised`, `--ink-rule`, `--fs-studio-title`, `--studio-nav-width`, `--studio-thumb-w`, `--tap-cms`; semantic `--color-studio-*`, `--color-on-studio-accent` and `--color-chip-*`. The Studio brand label and badge use fixed gold (`--accent-gold`), not `site-settings.accent`.
- Light only: the admin's dark theme is switched off (`admin.theme: 'light'`), so the Studio tokens have no dark values, like the site.

**Studio theme** (`src/app/(payload)/custom.scss`, loaded after `tokens.css`): Payload's own views (lists, editors, forgot, reset, create-first-user) keep their layout and take the Studio palette through Payload's CSS variables. Built-in views are not rebuilt to match captures 22–31 (P6). `--font-body` has the same name in Payload and in `tokens.css`, so the admin's text is Inter.

| Payload variable | Studio token | Payload uses it for |
|---|---|---|
| `--theme-bg` | `--color-studio-page` | Page background |
| `--theme-text` | `--color-text` | Body text |
| `--theme-input-bg` | `--color-studio-field-bg` | Field fill |
| `--theme-elevation-0` | `--color-studio-field-bg` | Inputs, popups, table rows |
| `--theme-elevation-50` | `--color-studio-card` | Raised panels |
| `--theme-elevation-100` | `--color-surface-band` | Hover and subtle backgrounds |
| `--theme-elevation-150` (`--theme-border-color`) | `--color-studio-card-border` | Borders |
| `--theme-elevation-200` | `--color-frame-alt` | Stronger backgrounds, icons |
| `--theme-elevation-250` | `--color-studio-field-border` | Control borders on hover and some field edges (3.6:1 on white; Payload's grey was 1.8:1). Resting field borders use `--theme-elevation-150` (1.5:1 on white, as Payload's own grey); P6 draws the resting edge of inputs, textareas, selects and upload fields with `--color-studio-field-border` instead (3.6:1 on white, 3.5:1 on a card), leaving `--theme-elevation-150` for card borders |
| `--theme-elevation-300` … `-650` | `--color-text-muted` | Secondary text and icons (6.9:1 on white) |
| `--theme-elevation-700` … `-1000` | `--color-text` | Text and dark fills |
| `--style-radius-s`, `--style-radius-m` | `--radius-cms-field` | Fields, small controls |
| `--style-radius-l` | `--radius-cms-card` | Cards, drawers |
| `--nav-width` (from 769 px) | `--studio-nav-width` | Sidebar width. Below 769 px Payload's drawer stays full width (its own small-break rule) |
| `--accessibility-outline` | `--focus-ring-width` solid `--focus-ring-color` | Payload's own focus outline; a catch-all `:focus-visible` rule adds the `--focus-halo-*` ring |

Payload's buttons (`.btn`) take `--radius-pill`, like the site's Button. The P0–P3 accessibility fixes in `custom.scss` move from `--theme-elevation-700` to `--color-text-muted`.

**Overview layout** (`/admin`, screen 21): StudioNav → the page on `--color-studio-page`: header (label, title, greeting, actions) → a panel grid (`--grid-min-tile` auto-fit, `--space-6` gap) with Needs a reply, Drafts and On the home page, then Recently edited across the row. See [StudioOverview](components/StudioOverview.md).

**Log-in layout** (`/admin/login`, screen 20): two equal panels from 1024 px (ink brand panel left, bone form panel right), stacked below 1024 px. See [StudioLogin](components/StudioLogin.md).

### Components (P6): Studio extras

- [StudioInbox](components/StudioInbox.md) (with StudioInboxActions): replaces Payload's list view for `inquiries`.
- [StudioFilterPills](components/StudioFilterPills.md): Payload's `beforeListTable` slot on `projects`, filtering through `admin.baseFilter`.
- [StudioAccentSwatches](components/StudioAccentSwatches.md): the field component for `site-settings.accent`.
- [StudioOverview](components/StudioOverview.md): its Needs a reply rows now open the inbox with the inquiry selected (owner decision 2026-11-12).
- Button is reused unchanged (`ink`, `outline-ink`, `text`; `gold` inside the swatch preview, with `--color-booking` set on its wrapper).
- New tokens: semantic `--color-chip-new-*`, `--color-chip-replied-*` and `--color-chip-archived-*` (aliases of existing primitives). Swatch rings and 3:1 field edges reuse `--color-studio-field-border`; pills reuse `--color-action` / `--color-on-action`. No new primitives.

**Inbox layout** (`/admin/collections/inquiries`, screen 27): StudioNav → the page on `--color-studio-page`: header (label, title, description) → status pills → below 1024 px the list, pager and detail stacked; from 1024 px the list (`minmax(var(--grid-min-tile), 1fr)`) beside the detail (`minmax(0, 2.5fr)`), gap `--space-7`. See [StudioInbox](components/StudioInbox.md).

### Studio theme pass (P6)

Screens 22–26 and 28–31 stay Payload's own views (owner decision 2026-11-10). P6 brings them to the captures through `custom.scss` and layout-only admin options: `row`, `collapsible`, unnamed `tabs`, unnamed `group` (titled cards), `admin.position: 'sidebar'`, `admin.width`, field labels and descriptions, and collection and global descriptions (owner decision 2026-11-12). Nothing changes the database schema.

| Screen | Layout options (config) | Theme stylesheet |
|---|---|---|
| 22 Projects list | Description line; filter pills | List table as a card with row rules and capture header labels; status cells as Published / Draft chips; display-font title |
| 23 Project editor (+ SEO tab) | Cards Basics, Cover image, Story, Credits; sidebar cards Organise, Home page, Web address; Year beside Client; capture labels and help text | Cards and card titles; display-font title input; 3:1 field edges; dashed "+ Add" pills; block cards; upload thumbnails; tabs |
| 24 Collection editor (+ list layout) | Sidebar cards Layout, Opener tint, Order & address (`admin.position`); Highlights card; capture labels | As 23 |
| 25 Journal posts | Description line ("Stories and notes…") | As 22 |
| 26 Post editor | Cards Basics, Cover image, Story; sidebar Organise, Related work, Web address; capture labels | As 23 |
| 28 Media | Description line; "Alt text", "Caption", "Credit" labels and help | List as 22; upload card |
| 29 Site settings | Cards Identity, Social links, Look & labels, Default search & sharing; fields in thirds; capture labels and card notes; description line | As 23; accent swatches |
| 30 Home page | Slide image beside its text fields; "Behind the camera" portrait beside heading and body; capture labels; description line | As 23 |
| 31 About page | Portrait beside the opener text; capture labels; description line | As 23 |

Payload shows a collection's description on its list **and** above each of its edit forms (owner-accepted, 2026-11-12). Payload stacks `row` fields below 1024 px, as the 390 px captures do.

**Stylesheet** (`custom.scss`, P6 section): list and editor titles in `--font-display` (lists `--fs-studio-title`, editors `--fs-card`); description lines `--fs-body` muted; every top-level group a card (`--color-studio-card`, `--color-studio-card-border`, `--radius-cms-card`, `--space-6` padding, `--space-5` apart) with a small-caps title (`--fs-label-lg`, `--tracking-nav`) and its note on the same line; untitled groups inside rows lose Payload's gutter rule; field labels `--fs-sm` semibold; resting edges of text inputs, textareas, selects and upload boxes `--color-studio-field-border` (3:1); list tables one card with `--color-studio-row-rule` rules, small-caps column labels and Published / Draft chips (`--color-chip-*`); "Create New" ink; tabs small caps; "Add" buttons dashed pills; block row titles small caps.

**Left as they are** (recorded deviations; each would need a schema change, a custom view or an option outside owner decision 2026-11-12):

- Page kickers ("STUDIO", "SETTINGS", "LIBRARY") above Payload's titles, and the header layout with buttons beside the title.
- Payload's own button words ("Save", "Publish changes", "Create New") instead of the captures' "Save changes", "New post", "Upload images", "View page".
- Grey placeholder text in empty fields (`admin.placeholder`).
- Array row titles: Payload writes "Section 01", the captures "01 · Section".
- Collections (24): the switcher pills, "New collection", the opener preview, tint swatches with "Selected: …", layout as radio cards, hiding the highlight and card-shape fields for the list layout, a "View page" link, and the SEO fields inline instead of in their tab.
- SEO tabs (23, 24, 26): the plugin's checklist and search preview stay; one SEO help text for every collection.
- Journal (25): the cover column, View/Edit links and the Categories card.
- Media (28): the grid view, filter pills, drop zone, details panel, "No alt text" badges and the "Showing 12 of [48]" line.
- Home (30): custom slide headers and the live Selected work list with "Change in Projects".
- Editing alt text, Replace and Remove on a cover inside the project and post editors (23, 26), and a date-only picker for the post date (26).
- Found in the P6 build:
  - Web address fields are labelled with the real path (`/portfolio/[collection]/`, `/portfolio/`, `/journal/`), not the captures' placeholder domain ("yourname.com/…"); the domain is set in P7.
  - Payload's list shows the "Show in Selected work" column as `true` / `false`, not capture 22's "★ On home" / "—".
  - Repeating rows (social links, hero slides, credits, About sections) keep Payload's collapsible "Row 01" headers and Collapse All / Show All controls; captures 29–31 draw them inline or with slide thumbnails.
  - Block rows read "01 Chapter heading" in small caps, without capture 23's "·" between number and name (no text in the stylesheet), next to Payload's optional block name ("Untitled").
  - Image and portrait columns are 30% wide on Home (33% on About): Payload's upload box needs about 370 px; below about 1300 px the image stacks above its fields.
  - The SEO tab's checklist colours are the plugin's inline styles (grey help text 2.7:1, white on red "Missing" 4.0:1). They can't be overridden without colour values and `!important`, so they are recorded as Payload exceptions in the P6 QA log.
