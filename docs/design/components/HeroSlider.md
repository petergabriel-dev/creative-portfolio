# HeroSlider

## Purpose

The Home hero (screen 01): one to six slides curated in the `home` global, each with a full-bleed photo, a title, a short line of copy, Book Me and an optional link to a collection or project. Story cards, two arrows and a progress line move between slides. It replaces the chapter opener on Home. Source: capture 01 (desktop and mobile), Build Spec "Front-end pages › Home" and "Accessibility", owner decisions 2026-11-11 (see `docs/specs/phase-4-home-about.md`).

The surface's job is to **persuade**: the first screen shows the work and the booking button.

## Anatomy

The outer element is a `<div>`, never a `<section>` or other landmark, so the dark SiteHeader inside it keeps its banner role (same as ChapterOpener). It is `position: relative`, at least `--hero-min-h` tall, `overflow: hidden`, a flex column.

1. **Surface:** background `--color-surface-opener` or the slide's tint (`--color-surface-opener-photo`, `-film`, `-design`, `-writing`, mapped from the slide's `tint` like discipline openers). The tint shows while the photo loads and when there is none.
2. **Photo:** the current slide's image, full-bleed (`object-fit: cover`, focal point from the media doc), behind everything else. Only the current slide's image is in the DOM; it changes with the slide (React `key`). Slide 1's image loads with `priority`, `sizes="100vw"`; the others load when their slide is shown.
3. **Scrim** (`aria-hidden`, above the photo, below the content): `--color-hero-scrim` everywhere text or a control sits.
   - Below 1024 px: the scrim covers the whole hero (the stacked content fills it).
   - From 1024 px: a band behind the header, the full scrim from the top of the content block to the bottom, and between them a fade to transparent, so the photo shows brighter only in the gap between the header and the content.
   - Only `--color-hero-scrim` and `transparent` are used; no other alpha values.
4. **Top progress bar** (`aria-hidden`): full width, `--border-strong` tall, track `--color-rule-on-dark`, fill `--color-booking` with width = current ÷ total.
5. **Header slot:** the SiteHeader, `tone="dark"`, `current="home"`.
6. **Hidden page heading:** `<h1 class="visually-hidden">` with `site-settings.headline` (the only `h1`; the Build Spec fixes the prototype, where the visible slide title was the `h1`).
7. **Content block** (padding-block `--space-12` below 1024 px and `--space-20` from 1024 px, padding-inline `--gutter`; max width `--max-width`, centred; pushed to the bottom of the hero):
   - **Slide text** — the live region (`aria-live="polite"`), flex column, gap `--space-6`:
     - visually hidden "Story N of M" (`copy.home.storyPosition`), so a change is announced with its position;
     - short rule: `--rule-short` × `--border-strong`, `--color-on-dark-heading`, `aria-hidden`;
     - **place line:** `<p>` `placeLine` ("Featured · [Project title]"), `--fs-lead`, `--color-on-dark-strong`;
     - **title:** `<h2>` the slide `title`, or the site headline when the title is blank. `--font-display`, `--fw-regular`, `--fs-hero`, `--lh-display`, uppercase, `--color-on-dark-heading`, `text-wrap: balance`, `overflow-wrap: break-word`;
     - **body:** `<p>` `body`, `--fs-body`, `--lh-body-loose`, `--color-on-dark`, max width `--measure-body`;
     - **actions** (flex, wrap, gap `--space-3` / `--space-4`): Button `gold` `primary` "Book Me" (`site-settings.bookingLabel`, to `/book`), then Button `outline-light` `primary` with `linkLabel` to the slide's link. The secondary button is left out when the link's target is unpublished, deleted or unreadable; Book Me is left out only when the booking label is empty.
   - **Controls** (flex column, gap `--space-9`, `min-width: 0`):
     - **Story cards:** `<div role="group" aria-label={copy.home.moreStories}>`, a row of one StoryCard per slide, gap `--space-5`, `overflow-x: auto` (it scrolls inside itself; the page never scrolls sideways);
     - **Arrows and progress:** a row, gap `--space-4`: Previous and Next buttons, then a progress line (`aria-hidden`, flex 1, `--border-strong` tall, track `--color-rule-on-dark`, fill `--color-booking` = current ÷ total), then the counter "01" (`aria-hidden`, two digits, `--font-display`, `--fs-card`, line height 1, `--color-on-dark-heading`).

### StoryCard

A sub-component of HeroSlider (same file). One `<button type="button">` per slide:

- `--story-card-w` wide, aspect 2:3, `--radius-story-card`, background `--color-surface-story-card`, `--shadow-story-card`, padding `--space-5`; content at the bottom (flex column, `justify-content: flex-end`, gap `--space-2`), left-aligned.
- Short rule (`aria-hidden`, `--space-4` × `--border-strong`, `--color-on-dark-heading`); **kicker** `cardKicker` ("Collection 01") `--fs-label`, `--color-on-dark-strong`; **title** (slide title, or the headline when blank) `--font-display`, `--fs-story-card`, `--lh-card`, uppercase, `--color-on-dark-heading`.
- All cards use the one `--color-surface-story-card` colour (Build Spec `--card`); the capture's slightly different card tints are not reproduced.
- **Current card:** `aria-current="true"`; its short rule is `--color-booking` and twice as wide (`--rule-short`). The card stays in place; nothing in the row moves when the slide changes (owner decision 2026-11-11: the capture leaves the current slide out of the row, which loses focus on click).

## Variants

- **Two to six slides:** everything above.
- **One slide:** no story cards, arrows, progress line, counter or top progress bar; the slide text, buttons and photo render as above.
- **No slides** (`home` never published): HeroSlider is not used; Home renders the ChapterOpener fallback (visible `h1`). See `docs/specs/phase-4-home-about.md`.

## Sizes

One. The title scales with `--fs-hero`; the card title is fixed (`--fs-story-card`) so long names fit the fixed-width card.

## States

- **Default (server-rendered):** slide 1, its image `priority`. Without JavaScript slide 1 is complete and usable (title, body, Book Me, secondary link); the cards and arrows are present but do nothing until the page hydrates.
- **Current card:** `aria-current="true"`, gold rule.
- **Hover** (cards and arrows): arrows' border becomes `--color-on-dark-heading`; a card's rule becomes `--color-booking`. Colours only.
- **Focus-visible:** the global dual focus ring on every card, arrow and button (bone halo carries it on the dark surface). Card shadows must not hide the ring; the card row has enough block padding (`--space-2`) that the ring is not clipped by `overflow-x`.
- **Active:** same as hover.
- **Image loading / missing:** the tint surface shows; the scrim still covers text areas.
- **Disabled:** never. The arrows wrap (Previous on the first slide goes to the last, Next on the last goes to the first), so a focused arrow is never disabled and never loses focus.
- **Empty parts:** an empty place line or body is omitted; a blank title shows the headline.
- Loading and error states do not apply (static data).

## Props/API

```ts
type HeroSlideView = {
  id: string
  title: string // already resolved: blank → site headline
  placeLine: string
  body: string
  link: { href: string; label: string } | null // null when the target is not public
  image: Media | null // populated media or null
  cardKicker: string
  tint: OpenerTint
}

type HeroSliderProps = {
  slides: HeroSlideView[] // 1–6, built on the server (src/lib/heroSlides.ts)
  headline: string // site-settings.headline: the hidden h1
  bookingLabel: string
  header: React.ReactNode // <SiteHeader tone="dark" current="home" />
}
```

Client component (`'use client'`): the one piece of Home that needs JavaScript. Slides are plain serializable data; it imports no server-only code.

## Accessibility

- **Headings:** one `h1` (visually hidden headline, first in the hero); each slide title is an `h2`. On slide 1 screen readers hear the headline twice (`h1`, then the slide's `h2`); accepted (owner decision 2026-11-11).
- **Live region:** the slide text sits in `aria-live="polite"` and starts with the hidden "Story N of M". The first render announces nothing; each change announces the new slide.
- **Story cards** are real buttons. Their accessible name is their visible content (kicker + title), with no `aria-label`, so the name contains the visible label (WCAG 2.5.3, invariant 17). The group is named "More stories" (`copy.home.moreStories`). The current card has `aria-current="true"`.
- **Arrows** are buttons with `aria-label` "Previous story" / "Next story" (`copy.ts`); the arrow icons are `aria-hidden`. They are `--tap-primary` square, round (`--radius-pill`), border `--border-hairline` `--color-outline-on-dark`, colour `--color-on-dark-heading`.
- **Keyboard:** every card and both arrows are ordinary tab stops (no roving tabindex); Enter and Space activate. Focus stays on the control that was used.
- **No autoplay.** Nothing moves unless the visitor acts.
- **Motion:** only the surface `background-color` and the progress fills' `width` transition, `--duration-fast` `--ease-standard`; none under `prefers-reduced-motion`. The photo never slides or fades.
- **Touch:** tap the cards and arrows; the card row scrolls natively. No swipe gesture. `touch-action: manipulation` on the buttons. Every target is at least `--tap-min`.
- **Images:** the photo's `alt` comes from the media doc.
- **Contrast** (worst case: a white photo under `--color-hero-scrim`, i.e. `--ink-80` over white, about #494846): `--color-on-dark` body 5.5:1, `--color-on-dark-strong` place line 7.0:1, `--color-on-dark-heading` titles and header links 8.1:1, `--color-booking` button fill 4.8:1 and progress fill, `--color-outline-on-dark` button and arrow borders 5.0:1. On story cards: `--bone` on `--card` 6.6:1, `--on-dark-strong` on `--card` 5.8:1, the current card's gold rule on `--card` 4.0:1 (non-text). Over the tint alone (no photo) every pair is at least as high as on openers.

## Responsive

Mobile-first:

- **Below 1024 px:** header, then the content stacked: slide text, the card row (scrolls sideways inside itself), then arrows, progress line and counter. The scrim covers the whole hero. No horizontal page scroll at 320 px; long titles wrap.
- **1024 px and up:** two grid columns, `minmax(0, 5fr) minmax(0, 6fr)` (the JournalRow ratio; about 570 and 685 px at the 1,312 px max width, as capture 01's 560 and 680), column gap `--space-14`, both aligned to the bottom: slide text left, controls right. The photo shows brighter only between the header band and the content.

Verify at 320, 390, 768, 1,024 and 1,440 px against capture 01 (desktop and mobile), with seeded placeholder photos and with a white test image (contrast).

## Usage

Home (`/`) only, first thing on the page, outside `<main>` like every opener. The page builds `slides` with `heroSlides(home, headline)` from `src/lib/heroSlides.ts`.

## Preview

[Open preview](../preview/index.html) (section "HeroSlider · StoryCard")
