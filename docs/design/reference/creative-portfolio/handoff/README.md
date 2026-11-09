# Creative Portfolio — implementation handoff

Every page and Studio CMS screen in the Build Spec, captured from the prototype on 9 Nov 2026 and ready to build against. There are 28 screens: 12 site pages, 12 CMS screens and 4 shared components. Five of them have extra states. Each screen is captured at desktop (1440 px) and mobile (390 px) width.

- **Build Spec (source of truth):** https://claude.ai/artifact/Ce8HoZLvrg3DdQ2zMZihbS
- **Clickable prototype (Design canvas):** https://claude.ai/artifact/KLHKn717jgjPLW38tpBuD8

Both links are private until the owner shares them.

## What's in the folder

| Path | What it is |
|---|---|
| `screens/desktop/` | Full-page PNGs at 1440 px wide, 2× scale. The CMS sidebar is 264 px wide. |
| `screens/mobile/` | Full-page PNGs at 390 px wide, 2× scale. Home is at 1× because it is very tall. |
| `screens/html/` | Static HTML snapshot of each screen. Links between screens work. Nothing is interactive. Fonts load from Google Fonts. |
| `tokens/tokens.css` | Design tokens as CSS custom properties, plus the focus ring. |
| `tokens/tokens.json` | The same tokens as JSON. |
| `manifest.json` | Each screen's route, spec sections, states, image files and pixel sizes. |

A state file is named `<id>--<state>.png`, for example `11-book-me--errors.png`.

## Screens

| # | Screen | Route | Spec sections | Extra states |
|---|---|---|---|---|
| 01 | Home | `/` | Front-end pages › Home · Globals › home | — |
| 02 | Portfolio | `/portfolio` | Front-end pages › Portfolio | — |
| 03 | Collection — Photography (projects layout) | `/portfolio/photography` | Front-end pages › Collection · Content model › disciplines | — |
| 04 | Collection — Film & Video (projects layout) | `/portfolio/film-video` | Front-end pages › Collection | — |
| 05 | Collection — Design & Illustration (projects layout) | `/portfolio/design-illustration` | Front-end pages › Collection | — |
| 06 | Collection — Writing & More (list layout) | `/portfolio/writing-more` | Front-end pages › Collection (list) | — |
| 07 | Project page | `/portfolio/[collection]/[project]` | Front-end pages › Project · Story blocks · projects | — |
| 08 | About | `/about` | Front-end pages › About · Globals › about | — |
| 09 | Journal, page 1 with pagination | `/journal` | Front-end pages › Journal · posts | — |
| 10 | Journal entry | `/journal/[slug]` | Front-end pages › Journal entry · Story blocks | — |
| 11 | Book Me | `/book` | Book Me & inquiries | Field errors · Thank-you panel |
| 12 | 404 | any missing route (`not-found.tsx`) | Front-end pages › 404 | — |
| 20 | Log in | `/admin/login` | Access control · Admin (Studio) | Sign-in error |
| 21 | Overview dashboard | `/admin` | Admin › Overview (custom) | — |
| 22 | Projects list | `/admin/collections/projects` | Admin › Projects list, filter pills | — |
| 23 | Project editor | `/admin/collections/projects/[id]` | Admin › Project editor · projects | SEO tab |
| 24 | Collection editor | `/admin/collections/disciplines/[id]` | Content model › disciplines | List layout (Writing & More) |
| 25 | Journal posts and categories | `/admin/collections/posts` | Admin › Journal · posts, categories | — |
| 26 | Post editor | `/admin/collections/posts/[id]` | posts · Story blocks | — |
| 27 | Inquiries inbox (two-panel) | `/admin/collections/inquiries` | Admin › Inquiries, Two-panel inbox | — |
| 28 | Media library | `/admin/collections/media` | media · Media handling | — |
| 29 | Site settings | `/admin/globals/site-settings` | Globals › site-settings · Accent swatches | — |
| 30 | Home page global | `/admin/globals/home` | Globals › home | — |
| 31 | About page global | `/admin/globals/about` | Globals › about | — |
| 40 | Site header | component | Front-end pages › Shared pieces | — |
| 41 | Site footer | component | Front-end pages › Shared pieces | — |
| 42 | Studio sidebar | component | Admin › Sidebar, logo, "3 new" badge | — |
| 43 | UI kit (desktop only) | reference | Design system | — |

Screens 01–07 use Photography as their example. The other collections use the same layout with their own tint and copy.

## Changes to the prototype for this handoff

- **New screens:**
  - 404 page
  - Book Me field errors (spec copy; focus moves to the first error)
  - CMS log in, including the sign-in error
  - Collection editor
  - Post editor
  - Media library
  - Home page global
  - About page global
- **Studio sidebar:** now grouped the way `admin.group` sets it up: Portfolio, Journal, Inbox, Library and Settings.
- **Project editor:**
  - The "Use as a hero slide" switch is gone. Hero slides are now set in the Home page global, as the spec requires.
  - Added "Order on Home", which maps to `homeOrder`.
  - Added a Credits section and an SEO tab.
- **Site settings:** now holds only the `site-settings` fields: identity, social links, labels, accent and default SEO. Collection order lives on each collection. Hero slides live in the Home page global.
- **Book Me form:**
  - Field names now match the spec: `name`, `email`, `projectType`, `timing` and `message`.
  - Added the hidden `website` honeypot.
- **Journal:** numbered pagination under the list.
- **Collection pages:** a "More projects" button under the project cards.

## Build notes

- Text in `[brackets]` is placeholder copy. Real values come from the CMS or `copy.ts`.
- Every image is a tinted frame (`--frame` / `--frame-alt`, or the discipline tint). That is also the loading state the spec describes.
- Desktop CMS images are captured at the screen's own height. Each CMS screen's root is `min-height: 100vh`, so in a real window it fills the viewport.
- Users and Categories use Payload's default list and edit views, so they have no custom screen. Categories are also edited inline on screen 25.
- `tokens.css` adds a few values the spec didn't list. They are marked "added in the handoff": `--error`, `--surface`, `--field-bg`, `--rule-soft`, `--on-ink-muted` and the status chip colours. `--error` is #9B2C1F, with at least 6.1:1 contrast on every light background it is used on.

## States described in the spec but not drawn

- **Empty collection:** opener, then one line, "New work is on its way", then the finale. There is no grid.
- **Book Me sending:** while the form posts, the button reads "Sending…" and is disabled.
- **"More projects":** the page shows 8 cards, then the button loads the rest in place.

## Open question

- **Header at 390 px:** in the mobile captures, the four links and Book Me wrap onto two rows. Decide whether to keep that or design a menu button before front-end work starts.
