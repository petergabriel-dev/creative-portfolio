# Phase 4 — Home + About

Status: Draft
Depends on: P1 (projects, disciplines, publishing machinery), P2 (posts for "From the journal")
Build Spec refs: Globals › home, about · Publishing: drafts, preview & revalidation · Front-end pages (Home, About) · Accessibility, SEO & performance (hero slider, one `h1`, motion) · Media handling (loading) · Admin (Studio) customisation ("Changed from the prototype")

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The `home` and `about` globals drive the Home and About pages. Home brings the earlier phases together: the hero slider, Selected work from projects, the discipline tiles and the latest journal posts. When P4 is done, every public route exists and every Build Spec content-model, routes, pages and publishing box is closed (see the README coverage table).

## In scope

**Content model** (fields exactly as in the Build Spec)
- `home` global:
  - drafts and versions on, with live preview at `/`; admin group Settings.
  - `heroSlides` has 1–6 rows, and the row order is the slider order. Each slide has `title`, `placeLine`, `body`, `link`, `linkLabel`, `image`, `cardKicker` and `tint`.
  - Slide 1's `title` defaults to `site-settings.headline`.
  - A slide's `link` points to a discipline or to a project.
  - Other fields: `selectedWorkIntro`, the `meet` group (heading, body, portrait), and `journalCount`, which defaults to 2.
- `about` global:
  - drafts and versions on, with live preview at `/about`; admin group Settings.
  - Fields: `contextLine`, `title`, `lead`, `portrait` (4:5), and `sections` with 1–4 rows of heading and rich-text body.
- Hero slides are chosen only in `home`. Projects get no "Use as a hero slide" toggle; they keep "Show in Selected work" (`showOnHome`). See "Changed from the prototype" in the Build Spec.
- Access: published only for the public, update by the editor only.

**Publishing**
- Publishing the `home` global refreshes `/`, and publishing `about` refreshes `/about`. Draft saves refresh nothing.
- This phase closes the refresh of `/` that P1 (project changes) and P2 (post changes) already wired.

**Home** (`/`)
- **Hero slider** (HeroSlider + StoryCard):
  - no autoplay;
  - the arrows and the story cards are real buttons with labels, and both they and the progress line move between slides;
  - the slide's tint shows while its image loads;
  - the slide text sits in an `aria-live="polite"` region;
  - the page `h1` stays the site headline, and each slide title is an `h2`;
  - under `prefers-reduced-motion`, the colour and progress transitions are off;
  - the first slide's image loads with `priority`.
- **Chapter 01 Selected work:**
  - projects with `showOnHome` ticked, sorted by `homeOrder`, nine at most;
  - laid out as masonry, captioned with a number and the collection;
  - each item links to its project;
  - `selectedWorkIntro` sits under the heading.
- **Chapter 02 Behind the camera:** the `meet` group (heading, body and portrait).
- **Chapter 03 Explore the portfolio:** one tile per discipline, in `order`, each with "View gallery →".
- **Chapter 04 From the journal:** the latest `journalCount` published posts, as JournalCards.
- **Finale:** the default booking finale from `site-settings`.

**About** (`/about`)
- An opener with `contextLine`, `title` and `lead`, plus the buttons "Book Me" and "View my work".
- The 4:5 portrait, then each section as "Chapter 0N" with its heading and body.
- The finale.
- It also reads `site-settings`.

**Both pages**
- `generateMetadata` falls back to `site-settings.defaultMeta`, and each page has a canonical URL. The Open Graph image is the default image.

**Components:** HeroSlider, StoryCard and JournalCard. Client JavaScript is limited to the hero slider.

## Out of scope

- `Person` structured data on Home and About, and `sitemap.xml`: P7.
- The theme for screens 30 and 31: P6.

## Screens

- Site: [01 Home](../design/reference/creative-portfolio/handoff/screens/desktop/01-home.png) and [08 About](../design/reference/creative-portfolio/handoff/screens/desktop/08-about.png), at 1440 px (`desktop/`) and 390 px (`mobile/`; Home's mobile capture is at 1× scale).
- In the prototype, the hero `h1` changed with each slide. The Build Spec fixes this: the site headline is the only `h1`, and slide titles are `h2`.
- Studio, working in default views: 30 Home page global, 31 About page global.

## Content model

The `home` and `about` globals. Field-level detail is in the Build Spec, under "Globals › home" and "› about".

## Routes & behaviour

| Route | Content |
|---|---|
| `/` | the `home` global; `projects` with `showOnHome`; the latest posts; `disciplines`; `site-settings` |
| `/about` | the `about` global; `site-settings` |

## Acceptance criteria

- `home` and `about` exist with the Build Spec's fields, drafts, versions and live preview.
- The hero slider:
  - works by mouse, touch and keyboard;
  - never autoplays;
  - announces each slide's text through the polite live region;
  - keeps a single `h1`;
  - turns off its transitions under reduced motion.
- Ticking `showOnHome` on a project and publishing it updates `/` within a minute, with no redeploy. Unticking and publishing removes it. Selected work never shows more than nine projects.
- Publishing a post updates "From the journal" on `/`, and `journalCount` controls how many posts show.
- Draft changes to `home` or `about` show only in live preview and in draft mode.
- Every route in the Build Spec route table, apart from `sitemap.xml` and `robots.txt`, now renders from CMS data, including the empty states.
- Access for every collection and global matches the Build Spec access table. Check each row logged out and logged in.
- The full seed (P0–P4) fills a fresh database in one run, and running it again creates no duplicates.
- Pages 01 and 08 match their captures at 1440 px and work at 390 px with no horizontal scroll.

## Seed data

- `home` with at least two hero slides: one linking to a seeded discipline and one to a seeded project. Also a `meet` group with a placeholder portrait, and `journalCount` set to 2.
- At least nine seeded projects with `showOnHome` ticked and set `homeOrder` values, so the nine-item limit can be tested.
- `about` with three sections ("Who I am", "Why I make things", "How I see stories") and bracketed placeholder copy.

## Open questions

None specific to this phase.

## Risks

- **Slider accessibility.** Story cards that double as slide controls need clear labels and a clear current-slide state. Check them with a screen reader, not only with axe.
- **Hero LCP.** The hero image is the page's largest element. Its `priority` load and the `hero` size choice decide whether the Core Web Vitals targets are met in P7.
- **Mixed link targets.** A slide `link` can point to a discipline or a project. The URL builder must handle both, along with the nested project URL.
