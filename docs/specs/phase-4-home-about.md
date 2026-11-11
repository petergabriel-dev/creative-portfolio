# Phase 4 — Home + About

Status: Done
Depends on: P1 (projects, disciplines, publishing machinery), P2 (posts for "From the journal")
Build Spec refs: Globals › home, about · Publishing: drafts, preview & revalidation · Front-end pages (Home, About) · Accessibility, SEO & performance (hero slider, one `h1`, motion) · Media handling (loading) · Admin (Studio) customisation ("Changed from the prototype")

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md) · design specs [HeroSlider](../design/components/HeroSlider.md), [SelectedWork](../design/components/SelectedWork.md) and the Home and About page layouts in [`docs/design/README.md`](../design/README.md)

## Goal

The `home` and `about` globals drive the Home and About pages. Home brings the earlier phases together: the hero slider, Selected work from projects, the discipline tiles and the latest journal posts. When P4 is done, every public route exists and every Build Spec content-model, routes, pages and publishing box is closed (see the README coverage table).

## Owner decisions (2026-11-11)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **Story cards show every slide.** One card per slide, in slide order, always in the same place; the current one has `aria-current="true"` and a visible mark. Capture 01 leaves the current slide out of the row, which made a clicked card disappear and drop keyboard focus.
2. **One hidden `h1`.** The hero's `h1` is `site-settings.headline`, visually hidden; every visible slide title is an `h2` in the live region. Screen readers hear the headline twice on slide 1; accepted.
3. **A slide's `title` is optional.** A blank title shows `site-settings.headline` at render time, so slide 1 follows the headline when it is edited. This replaces the Build Spec's "required, slide 1 defaults to `headline`"; the other slide fields stay required.
4. **Every public project change refreshes `/`** (publish, unpublish, slug or collection change, delete), not only projects with `showOnHome`, because hero slides can link any project. Same reasoning as P2 owner decision 6 for journal entries.
5. **A slide whose link target isn't public** (unpublished, deleted or unreadable project) still shows, without its secondary button; Book Me stays.
6. **Empty states never 404.** On Home an empty chapter (no Selected work, no `meet` heading, no disciplines, no posts) is left out and the later chapters renumber, as on collection pages. With no published hero slides, Home shows the ChapterOpener with the headline as a visible `h1`, and no slider. An unpublished `about` shows its opener with fallback copy and the finale, without portrait or sections.
7. **Selected work tiles** link through their caption (the number "01" on the left, the collection "Photography" on the right) with the project title added visually hidden, so the link says which project it opens; the image is `alt=""`. Numbers run down each of the three columns, as in capture 01.
8. **Slider interaction is buttons only.** Tap or click the cards and arrows, or use them by keyboard as normal tab stops (no roving tabindex); no swipe gesture, no autoplay. The arrows wrap from last to first and back and are never disabled, so a focused arrow never loses focus.
9. **Images:** only the current slide's photo is in the page; slide 1 loads with `priority` and the others when shown, behind their tint. Slide 1 is complete and usable without JavaScript; the controls do nothing until the page hydrates.
10. **`journalCount`** is a whole number from 1 to 6, default 2 (taken as recommended).
11. **Hero photo and scrim.** Each slide's photo is full-bleed under a `--color-hero-scrim` (`--ink-80`) scrim wherever text or a control sits, the header band included, so text keeps 4.5:1 over any photo; below 1024 px the scrim covers the whole hero. A lighter header band (`--ink-50`) would give the nav links only 3.0:1 over a white photo.

Design deviations from the captures are recorded in `docs/design/README.md`.

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

## QA log (2026-11-11)

Run on `feat/p4-home-about` (plan `p4-home-about`, T1–T9, PR #35) plus the JournalCard hover fix below. The checks used a local production build on a fresh database: all 8 migrations, seeded twice with an empty local `./media` folder (traps.md), and an empty `BLOB_READ_WRITE_TOKEN`, so images came from local storage. Rows marked "Tn" cite that task's verification, done on the same kind of build of the same code; the rest were re-run on the final build. axe is axe-core 4.14 from the project's own dependencies (WCAG 2.2 AA tags).

| Criterion | Result | Evidence |
|---|---|---|
| `home` and `about` with the Build Spec fields, drafts, versions and live preview (owner decisions 3 and 10) | Pass | Migration `20261111_104705_p4_home_about` applies after P3's and only creates the home/about tables. Studio: Settings group lists Site settings, Home, About. A draft save writes a version only, and publish creates the main row. The live preview frame rendered `/` (its `h1` was read through the DOM, never screenshotted) (T2) |
| Hero slider works by mouse, touch and keyboard, never autoplays, announces each slide, keeps one `h1`, and drops its transitions under reduced motion | Pass (touch on a real device deferred) | Next on slide 5 → 1 and Previous on 1 → 5 kept focus on the arrow. Space on a card switched the slide and kept focus there. A focused card scrolls fully into the row. The live region starts "Story N of M". Transitions are 0.15 s with no preference and 0 s under `reduce`. One `h1` at 320–1440 px (T6). Touch is the same buttons (no gesture handlers, owner decision 8); a tap on a physical device is an owner check |
| Ticking `showOnHome` and publishing updates `/` without a redeploy; unticking removes the project; never more than nine | Pass | Unticking the first project removed it and the 10th moved in. Ticking another with `homeOrder 0` put it first. Each showed on the next request after the publish (T7) |
| Publishing a post updates "From the journal"; `journalCount` controls how many show | Pass | A new post appeared first; publishing `journalCount: 4` showed four cards (T7) |
| Draft changes to `home` or `about` show only in live preview and draft mode | Pass | A draft-only change never reached `/`, `/about` or anonymous REST (`?draft=true` included). `/next/preview` with the editor's session showed it in draft mode, and visitors still didn't see it afterwards (T2, T7, T8; the preview secret was never printed) |
| Every Build Spec route except `sitemap.xml` and `robots.txt` renders from CMS data, including the empty states | Pass | `/`, `/portfolio`, both collection layouts, a project, `/about`, `/journal`, `/journal/page/2`, a journal entry and `/book`: 200, served from cache. An unknown URL and `/api/graphql`: 404. Unpublishing `home` gave the plain opener with a visible `h1` and chapters renumbered 01–03; unpublishing `about` gave the fallback opener and the finale; both pages stayed 200 and came back on republish. Other empty chapters are covered by unit tests |
| Access for every collection and global matches the Build Spec table, logged out and in | Pass | Visitor reads: `users` 403, `inquiries` 403, the rest 200; projects 21 of 23 and posts 11 of 12 (published only, also with `?draft=true`); every visitor create, update and delete 403; global updates 403; `/api/globals/*/versions` 403. Editor: reads 200, creates allowed except `inquiries` (403). The config-level table is also a unit test (T2) |
| The full seed (P0–P4) fills a fresh database in one run, and running it again creates no duplicates | Pass | Run 1 created 56 docs and run 2 created 0, with the same counts after both: 23 projects (10 in Selected work), 12 posts, 4 disciplines, 4 categories, 4 inquiries, 7 media, 0 users, 1 version each of `home` and `about`. Needs an empty `./media`: leftover local files make Payload rename uploads (traps.md) |
| Pages 01 and 08 match their captures at 1440 px and work at 390 px with no horizontal scroll | Pass, with recorded deviations | Full-page screenshots at 1440 and section screenshots at 390 against captures 01 and 08 (T7, T8). No horizontal scroll at 320, 390, 768, 1024 and 1440 px on `/` and `/about`. Deviations are recorded in `docs/design/README.md`: hero photo and scrim, story card row with the current card, card colour and names, heading sizes, JournalCard title size, `--duration-fast`; and from T7, the stone band behind "Behind the camera" and the hairline above "From the journal" (both from capture 01) |
| Every public project change refreshes `/` (owner decision 4) | Pass | Publishing a project not in Selected work logged `revalidating …, /, …` (T2). Unpublishing the project slide 1 links to removed that slide's "See the work" (T7) |
| `next build`: `/` and `/about` ○ | Pass | Route table on the final build; both served with `x-nextjs-cache: HIT` |
| DoD: keyboard | Pass | `/`: 34 stops in reading order (header, hero buttons, 5 story cards, arrows, 9 Selected work captions, Get to know me, All collections, 4 tiles, Read the journal, journal cards, finale); `/about`: 10 stops. Every stop has the visible ring and nothing is off screen. Selected work captions are small boxes, but their stretched `::after` makes the whole tile the target; About's "See the work" is an inline link in a sentence. Studio: on the Home global a field was typed into, Shift+Tab reached "Publish changes", Enter published it, and `/` showed the change |
| DoD: axe WCAG 2.2 AA | Pass on site pages; Studio exceptions recorded | 0 violations on `/` and `/about` at 1440 and 390 px (the best-practice `region` note also appears on the existing `/portfolio` opener) |
| DoD: code health | Pass | typecheck, lint, 360 unit tests |
| DoD: Vercel preview | Pass (builds only) | PR #35: `checks` and `Vercel` green; the preview migrated its own Neon branch. The QA run itself did not browse the protected preview |
| Web interface guidelines review (`web-design-guidelines`) | Pass after one fix | The JournalCard (`JournalRow` `card`) had no hover state because it has no call to action; its title now underlines on hover (`--border-strong`), and `JournalRow.md` is updated. Accepted as specified: the progress fills animate `width`, and the slider state isn't in the URL |

### Studio accessibility (same policy as P0–P3)

No CSS fix this phase. The `target-size` finding is the spacing of the relationship field's 41 × 40 px "add new" button inside a nested popup, which CSS can't fix cleanly. These sit inside Payload's built-in components and go to the P6 theme (screens 30 and 31) and upstream Payload:

- Home global editor:
  - array row headers without a name (`aria-command-name` ×10);
  - react-select indicators inside `aria-hidden` (`aria-hidden-focus` ×20);
  - unnamed popup, clipboard, row and add-new buttons (`button-name` ×22);
  - the Versions tab (`label-content-name-mismatch` ×1);
  - react-select inputs without a label (`label` ×10);
  - document tabs (`list` ×1);
  - the add-new popup (`nested-interactive` ×5, `target-size` ×5).
- About global editor:
  - array row headers (`aria-command-name` ×3);
  - the Lexical editor (`aria-input-field-name` ×3);
  - unnamed popup and upload edit/remove buttons (`button-name` ×7);
  - the Versions tab (`label-content-name-mismatch` ×1);
  - document tabs (`list` ×1).

### Deferred owner checks

These are recorded as deferred, not passed:

- a screen-reader pass of the hero slider (live-region announcements and the story cards' current state);
- tapping the slider on a touch device;
- publish-to-live timing on a Vercel preview.

### Follow-ups

- Release P4 to `main` as `v0.5.0` (merge commit, annotated tag). Pass `--subject "Release P4 Home + About (v0.5.0) (#N)"` to `gh pr merge`.
- Delete the PR #35 preview deployment and its Neon branch once merged work is no longer being reviewed.
- The local `./media` folder holds about 865 gitignored seed placeholder files from QA runs; deleting them (owner's call) keeps the seed's media find-by-filename working locally (traps.md).
- P5/P6: the Studio exceptions above, and the theme for screens 30 and 31.
- P7: `Person` structured data on Home and About, `sitemap.xml`, measuring hero LCP with real photos, and the final hero and About copy.
- From P1–P3, still open: favicon, `metadataBase` (P7); opener title width.
