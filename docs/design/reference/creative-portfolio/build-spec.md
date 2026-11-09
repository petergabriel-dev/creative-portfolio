# Creative Portfolio — Build Spec

Nov 6, 2026 · @Peter

## Overview & goals

We are building one Next.js app that serves a personal portfolio for a multidisciplinary creative and the Payload CMS that runs it, hosted on Vercel. The site's job is to show selected work and turn interest into **Book Me** inquiries; the journal is a secondary path.

- **Owner and editor:** one person, editing everything through the CMS at `/admin`.
- **Visitors:** potential clients across four kinds of work, and readers who arrive through the journal.
- **Primary action:** send a Book Me inquiry. **Secondary:** read the journal.
- **Collections of work:** Photography, Film & Video, Design & Illustration, Writing & More. Weddings are one project type inside Photography.
- **Design source of truth:** the [Creative Portfolio Prototype](https://claude.ai/artifact/KLHKn717jgjPLW38tpBuD8) canvas: its site pages, Studio CMS screens and UI kit. Where this spec and the canvas disagree, this spec wins and the canvas gets updated.

In scope: the public site (11 pages and templates), the content model, the customised Payload admin, the inquiry inbox with email alerts, and deployment. Out-of-scope items and open questions close the doc.

## Decisions & stack

The stack is Next.js with Payload 3 inside it, Neon Postgres for data, Vercel Blob for media and Resend for email, all on Vercel.

| Layer | Choice | Package or service | Notes |
| --- | --- | --- | --- |
| Framework | Next.js, App Router | `next` | Public pages are Server Components; Payload mounts its admin and API inside the same app |
| CMS | Payload 3 (MIT) | `payload`, `@payloadcms/next` | Content model lives in TypeScript in the repo; admin, auth, uploads, drafts and versions built in |
| Rich text | Lexical | `@payloadcms/richtext-lexical` | Used only inside the Text story block |
| Database | Neon Postgres via the Vercel Marketplace | `@payloadcms/db-vercel-postgres` (or `@payloadcms/db-postgres` with Neon's pooled connection string) | Schema changes ship as migrations |
| Media | Vercel Blob | `@payloadcms/storage-vercel-blob` | `clientUploads: true` so large photos skip the 4.5 MB server upload cap |
| Email | Resend | `@payloadcms/email-resend` | Sends the new-inquiry alert |
| SEO fields | Payload SEO plugin | `@payloadcms/plugin-seo` | Meta title, description and image per page |
| Video | Vimeo or YouTube embeds | none | No video files stored |
| Hosting | Vercel, Pro plan before launch | none | Hobby is non-commercial only; a portfolio that advertises services counts as commercial |
| Spam guard (optional) | Upstash Redis | `@upstash/ratelimit` | Add only if the honeypot is not enough |

### Decision log

| Decision | Chosen | Set aside | Why |
| --- | --- | --- | --- |
| Positioning | Personal portfolio for a multidisciplinary creative | Photography-only portfolio | The owner works across photography, film, design and writing |
| Visual direction | B, Cinematic Chapters | A, Full Expedition; C, Gallery Calm | Keeps the approved hero, one type pairing, readable long-form |
| CMS | Payload | Fully custom; Sanity; Strapi; Git-based tools | Custom-feeling and code-first, without building auth, uploads and versioning |
| Database | Neon Postgres | MongoDB Atlas | Preview-database branching and stricter relational integrity |
| Hosting | Vercel | none considered | Owner's choice; native fit for Next.js |

## Architecture

Payload runs inside the Next.js app, so the public pages, the Book Me action and the admin share one deployment and one Local API. Only data, files and email live in outside services.

&#91;embedded content: architecture · one app, three services\]

Pages read content in-process through the Local API; there is no separate API server. Visitors' browsers load images straight from Blob and video from Vimeo or YouTube, and admin uploads go from your browser straight to Blob.

## Site map & routes

The public site has 11 routes, four of them templates driven by the CMS; the admin lives at `/admin`.

| Route | Page | Content from | Prototype artboard |
| --- | --- | --- | --- |
| `/` | Home | `home` global, `projects` (on home), `posts` (latest 2), `disciplines` | Home |
| `/portfolio` | Portfolio | `disciplines` | Portfolio |
| `/portfolio/[collection]` | Collection page | one `disciplines` doc + its published `projects` | Photography, Film & Video, Design & Illustration, Writing & More |
| `/portfolio/[collection]/[project]` | Project page | one `projects` doc | Project page |
| `/about` | About | `site-settings` global, `about` fields (see Globals) | About |
| `/journal` | Journal | `posts`, `categories` | Journal |
| `/journal/[slug]` | Journal entry | one `posts` doc | Journal entry |
| `/book` | Book Me | `site-settings` global; writes `inquiries` | Book Me |
| `/sitemap.xml`, `/robots.txt` | Generated | published `projects`, `posts`, `disciplines` | none |
| not found | 404 | `site-settings` | none |
| `/admin/...` | Payload admin (Studio) | all collections and globals | CMS page of the canvas |

Route rules:

- Slugs are lowercase, hyphenated, unique within their collection, and generated from the title on first save.
- A project URL nests under its collection's slug. Changing either slug redirects the old URL with a 308 (see open questions for how redirects are stored).
- A draft-mode route (for example `/next/preview`) turns on Next.js draft mode for logged-in editors only.
- Payload's REST API stays mounted at `/api` for the admin; the public site never calls it. GraphQL is turned off.

## Content model: collections

Seven collections hold everything that repeats: `users`, `media`, `disciplines`, `projects`, `posts`, `categories` and `inquiries`. The slug `disciplines` avoids a clash with Payload's own word "collection"; the admin labels it **Collections**.

### users

Auth collection for the single editor. `auth: true`, `maxLoginAttempts` 5, `lockTime` 15 minutes.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | Shown in the sidebar footer ("Signed in as …") |
| email, password | built in | yes | From Payload auth |

### media

Upload collection stored in Vercel Blob. Accepts JPEG, PNG and WebP. Focal point on. Sizes are listed under Media handling.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| alt | text | yes | Describes the image for screen readers; save is blocked without it |
| caption | text | no | Shown under single images where a block asks for it |
| credit | text | no | For images by collaborators |

### disciplines (admin label: Collections)

One doc per collection of work. Order drives the Portfolio page, the hero slider order default and the Book Me project-type list.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | "Photography" |
| slug | text, unique | yes | "photography" |
| order | number | yes | 1–4 today |
| intro | textarea | yes | Opener paragraph, about 25 words |
| openerTint | select | yes | `#2F2A28` warm · `#2C2A2E` plum · `#28302B` forest · `#302A26` clay · `#2B2925` default |
| layout | select | yes | `projects` (highlights strip + project cards) or `list` (text-led, used by Writing & More) |
| highlights | upload → media, hasMany | no | Ordered images for the Chapter 01 strip |
| highlightAspect | select | yes | `4:5` · `16:9` · `1:1` |
| cardAspect | select | yes | `3:2` · `16:9` · `4:3` for project cards |
| finaleHeadline | text | yes | "Have a shoot in mind?" |
| finaleBody | textarea | yes | One sentence under it |
| meta | group (SEO plugin) | no | Title, description, image |

### projects

The core of the portfolio. Drafts and versions on, autosave on. `useAsTitle: title`. List columns: title, collection, project type, year, status, on home.

| Field | Type | Required | Position | Notes |
| --- | --- | --- | --- | --- |
| title | text | yes | main | "\[Couple names\] wedding" |
| summary | textarea | yes | main | One or two sentences; the opener paragraph |
| cover | upload → media | yes | main | 21:9 crop on the project page; card crop elsewhere |
| story | blocks | no | main | Story blocks, next section |
| credits | array of {label, value} | no | main | Client, collaborators, made with |
| collection | relationship → disciplines | yes | sidebar | Drives the URL |
| projectType | text | yes | sidebar | "Wedding", "Music video", "Brand identity" |
| year | number | yes | sidebar |  |
| client | text | no | sidebar |  |
| role | text | no | sidebar | "Photographer, editor" |
| showOnHome | checkbox | no | sidebar | Adds it to Selected work on Home |
| homeOrder | number | no | sidebar | Shown only when showOnHome is ticked; lower comes first |
| slug | text, unique | yes | sidebar | Generated from title; editable |
| meta | group (SEO plugin) | no | tab | Title, description, image |

### posts

Journal posts. Drafts and versions on, autosave on. Same story blocks as projects.

| Field | Type | Required | Position | Notes |
| --- | --- | --- | --- | --- |
| title | text | yes | main |  |
| excerpt | textarea | yes | main | Shown on Home and the Journal list |
| cover | upload → media | yes | main | 3:2 on cards, 21:9 on the entry |
| story | blocks | yes | main |  |
| category | relationship → categories | yes | sidebar |  |
| publishedAt | date | yes | sidebar | Defaults to first publish; sorts the list |
| relatedProjects | relationship → projects, hasMany | no | sidebar | Optional "See the work" links |
| slug | text, unique | yes | sidebar |  |
| meta | group (SEO plugin) | no | tab |  |

### categories

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | Process, Outdoors, Design, Film |
| slug | text, unique | yes |  |

### inquiries

Messages from the Book Me form. No drafts. `useAsTitle: name`. List columns: name, project type, status, received. Default sort newest first.

| Field | Type | Required | Position | Notes |
| --- | --- | --- | --- | --- |
| name | text | yes | main |  |
| email | email | yes | main | Reply-to on the alert email |
| projectType | select | yes | main | One option per discipline + "Something else" |
| timing | text | no | main | Free text: a date, a month, "not sure yet" |
| message | textarea | yes | main | 20–5,000 characters |
| status | select | yes | sidebar | `new` (default) · `replied` · `archived` |
| notes | textarea | no | sidebar | Private notes; never shown publicly |
| createdAt | built in | yes | sidebar | Shown as "Received" |

## Story blocks

Projects and posts share one `story` blocks field with six block types; the editor adds, reorders and removes them, and the page renders them top to bottom.

| Block | Slug | Fields | Renders as |
| --- | --- | --- | --- |
| Chapter heading | `chapter` | heading (text, required) | Inter caps label "Chapter 0N" + Bebas heading. N counts chapter blocks in order; it is not stored |
| Text | `text` | body (Lexical rich text, required): paragraphs, bold, italic, links, bulleted and numbered lists only | 680 px reading column, Inter 18/1.75 |
| Image | `image` | image (upload, required), width (`contained` · `full-bleed`), aspect (`4:5` · `3:2` · `16:9` · `21:9` · `original`), caption (text) | Contained = 1,200 px max; full-bleed = edge to edge |
| Gallery | `gallery` | images (upload, hasMany, min 2, required), aspect (`4:5` · `3:2` · `1:1`), layout (`strip` · `pair`) | Strip = filmstrip with 4 px gaps, wraps to one column on phones; pair = two up |
| Video | `video` | url (text, required; Vimeo or YouTube only), poster (upload, optional), caption (text) | 16:9 frame with a play button; the iframe loads only after the click |
| Quote | `quote` | quote (textarea, required), attribution (text) | Bebas pull quote, 900 px max |

Block rules:

- A video URL that is not Vimeo or YouTube fails validation with a message naming the two allowed hosts.
- YouTube embeds use the `youtube-nocookie.com` domain; Vimeo embeds add `dnt=1`.
- Every image in a block inherits its alt text from the media doc; the block never asks for alt text again.
- The admin block labels match the prototype editor: "01 · Chapter heading", "02 · Text" and so on.

## Globals

Three globals hold one-off content: `site-settings` for identity and labels, `home` for the hero and Home sections, and `about` for the About page. `home` and `about` have drafts and versions; `site-settings` keeps versions only.

### site-settings

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| name | text | yes | "Your Name"; header, footer, titles |
| roleLine | text | yes | "Multidisciplinary creative" |
| location | text | yes | "\[City, Country\]" |
| contactEmail | email | yes | Receives inquiry alerts; shown on Book Me |
| replyTime | text | yes | "\[response time\]" on Book Me and the thank-you state |
| socials | array of {platform (select: Instagram, Vimeo, YouTube, Behance, Dribbble, Other), url} | no | Footer |
| accent | select | yes | Gold `#E9B44C` (default) · Terracotta `#E07A5F` · Sage `#9FC3A8` · Off-white `#F3F1EC`; Book Me buttons and progress only |
| bookingLabel | text | yes | "Book Me"; header, buttons, finales |
| headline | text | yes | "Every moment has a story"; hero slide 1 |
| finaleHeadline | text | yes | "Let's capture your story"; default booking finale |
| footerNote | text | yes | "All work by Your Name" |
| defaultMeta | group: titleTemplate, description, image | yes | Fallback SEO |

### home

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| heroSlides | array, 1–6 rows | yes | Order = slider order |
| → title | text | yes | Bebas headline; slide 1 defaults to `headline` |
| → placeLine | text | yes | "Featured · \[Project title\]" |
| → body | textarea | yes | About 20 words |
| → link | relationship → disciplines or projects | yes | Secondary button target |
| → linkLabel | text | yes | "View photography" |
| → image | upload | yes | Full-bleed hero photo |
| → cardKicker | text | yes | "Collection 01" on the story card |
| → tint | select | yes | Same tints as disciplines; shows while the image loads |
| selectedWorkIntro | text | yes | One line under "Selected work" |
| meet | group: heading, body, portrait (upload) | yes | "Behind the camera" section |
| journalCount | number | yes | Posts shown in "From the journal"; default 2 |

Selected work itself comes from `projects` where `showOnHome` is ticked, sorted by `homeOrder`, nine maximum.

### about

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| contextLine | text | yes | "About · the person behind the work" |
| title | text | yes | "Hi, I'm Your Name" |
| lead | textarea | yes | Opener paragraph |
| portrait | upload | yes | 4:5 |
| sections | array of {heading, body (rich text)}, 1–4 rows | yes | "Who I am", "Why I make things", "How I see stories" |

## Access control & auth

Only the logged-in editor can write anything; the public can read published content and nothing else, and inquiries are never readable outside the admin.

| Collection or global | Read | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| users | editor | editor (first user created on first run) | editor | editor |
| media | public | editor | editor | editor |
| disciplines, categories | public | editor | editor | editor |
| projects, posts | public: published only · editor: all | editor | editor | editor |
| inquiries | editor | server action only (see Book Me flow) | editor | editor |
| site-settings, home, about | public: published only | n/a | editor | n/a |

Rules:

- "Published only" is an access function: a logged-in user sees everything; anyone else gets `_status equals published`.
- Payload's Local API skips access control by default. Every front-end query therefore passes `overrideAccess: false` and `draft: false`, so the published-only rule applies; preview requests pass `draft: true` after checking the editor's session.
- The Book Me server action is the only code path that writes with `overrideAccess: true`, and only after server-side validation.
- GraphQL is disabled. The REST API stays on for the admin and obeys the table above.
- `PAYLOAD_SECRET` signs sessions; admin cookies are HTTP-only and secure in production.
- No public sign-up. A second editor, if ever needed, is added by the first.

## Publishing: drafts, preview & revalidation

Pages are statically rendered and cached; publishing in the admin refreshes exactly the pages that show the change, so no redeploy is ever needed for content.

- **Drafts and versions:** on for `projects`, `posts`, `home` and `about`. The editor gets Payload's "Save draft" and "Publish changes" buttons, version history and restore. Autosave is on for projects and posts.
- **Live preview:** each of those sets `admin.livePreview.url` to its front-end route with draft mode on. Breakpoints offered: Mobile 390, Tablet 768, Desktop 1440. The front end mounts Payload's live-preview refresh component so the preview updates on save.
- **Preview button:** the prototype's "Preview" becomes Payload's live preview pane plus a "View draft" link through the draft-mode route.
- **Revalidation:** `afterChange` and `afterDelete` hooks call Next.js `revalidatePath`. They run when a doc is published, unpublished or deleted, not on draft saves. A `disableRevalidate` context flag skips them during seeding.

| When this changes | Refresh these paths |
| --- | --- |
| A project | its project page · its collection page · `/` when `showOnHome` is ticked now or was before |
| A project's slug or collection | the old and new project URLs · both collection pages |
| A post | its entry · `/journal` · `/` |
| A discipline | `/portfolio` · its collection page · `/` |
| A category | `/journal` |
| `home` global | `/` |
| `about` global | `/about` |
| `site-settings` global | every page (`revalidatePath('/', 'layout')`) |
| A media doc (alt text, caption) | nothing automatically; the change shows on the next publish of a page that uses it |

`sitemap.xml` is regenerated whenever a project, post or discipline is published or deleted.

## Front-end pages

Every page follows the same rhythm: a dark chapter opener with the dark header, light "Chapter 0N" sections, then a dark booking finale and the footer. Book Me is the only page without a finale.

Shared pieces:

- **SiteHeader:** tone `dark` over openers; `light` exists for any page without one. Links: Home, Portfolio, About, Journal, and the booking button. The current page is underlined.
- **SiteFooter:** name, role line, location, footer links, contact email, socials, footer note.
- **Booking finale:** gold label, Bebas headline, one sentence, gold button. Copy comes from the discipline or from `site-settings`.
- **Empty states:** a collection with no published projects shows its opener and finale and a single line, "New work is on its way"; nothing renders as an empty grid.

| Page | Sections in order | Behaviour |
| --- | --- | --- |
| Home | Hero slider · Chapter 01 Selected work (up to 9, masonry, number + collection captions) · Chapter 02 Behind the camera · Chapter 03 Explore the portfolio (one tile per discipline) · Chapter 04 From the journal · finale | Slider: no autoplay; arrows, story cards and a progress line move between slides; tint shows while each image loads. Selected-work items link to their project |
| Portfolio | Opener · discipline tiles (3:4) · finale | Tiles ordered by `order` |
| Collection (layout `projects`) | Opener with breadcrumb + intro + buttons · Chapter 01 Highlights strip (edge to edge, 4 px gaps) · Chapter 02 Projects (cards, 2 up) · discipline finale | Projects sorted by year, newest first. Show 8, then a "More projects" button loads the rest in place |
| Collection (layout `list`) | Opener · Chapter 01 Selected pieces (text rows) · finale | Used by Writing & More |
| Project | Opener with breadcrumb, title, summary and a details strip (collection, type, year, client, role) · 21:9 cover · story blocks · credits · finale with "Back to portfolio" + booking button | Breadcrumb links to the project's collection page |
| About | Opener (title, lead, buttons) · portrait + sections from `about` · finale |  |
| Journal | Opener · post rows (cover, category · date, title, excerpt) · finale | 10 per page, then numbered pages `/journal?page=2` |
| Journal entry | Opener (breadcrumb, category · date, title, excerpt) · 21:9 cover · story blocks · back link + related work · finale |  |
| Book Me | Opener · "Good to know" details + inquiry form · footer | See the Book Me flow below |
| 404 | Opener "Nothing here" · links to Home and Portfolio |  |

Dates display as "6 Nov 2026". All copy that is not CMS content (button words, labels such as "Chapter 01") lives in one `copy.ts` file so it can be changed in one place.

## Book Me & inquiries flow

A submitted form becomes an `inquiries` doc with status `new`, and the editor gets an email they can reply to directly.

1. The visitor fills in the form: name, email, project type, timing (optional), message.
2. The form posts to a Next.js server action, `submitInquiry`. It works without JavaScript; with JavaScript, the button shows a sending state and the page does not reload.
3. The server validates the fields (table below).
   - Invalid: return field errors. Each error sits under its field, linked with `aria-describedby`, and focus moves to the first one.
   - Looks like spam (honeypot filled, or sent under 3 seconds after the page loaded): return the normal success state and save nothing.
4. Valid: `payload.create` on `inquiries` with `overrideAccess: true` and status `new`.
5. An `afterChange` hook on create sends the alert through Resend:
   - to `site-settings.contactEmail`, with reply-to set to the visitor's email
   - subject "New inquiry · {project type} · {name}"
   - body: every field, plus a link to the inquiry in `/admin`
6. The page swaps the form for the thank-you panel: "Thank you — I'll be in touch soon", the reply time, links to Portfolio and Home, and "Send another inquiry".

| Field | Rule | Error message |
| --- | --- | --- |
| name | 1–120 characters | "Please add your name." |
| email | valid email format | "Please check your email address." |
| projectType | one of the listed options | "Please choose the kind of project." |
| timing | 0–120 characters | none |
| message | 20–5,000 characters | "Tell me a little more — at least a sentence or two." |
| website (honeypot) | must be empty; hidden from people and screen readers | none, silent |

In the admin, statuses move `new` → `replied` → `archived`, and any of them can go back to `new`. The sidebar badge counts `new` inquiries. Only the form fields are stored: no IP address, no tracking data.

## Media handling

Images live in Vercel Blob and are resized once, at upload; video is never uploaded, only embedded.

- **Storage:** `@payloadcms/storage-vercel-blob` on the `media` collection, with `clientUploads: true`. The browser sends files straight to Blob, which avoids Vercel's 4.5 MB request-body cap. The token comes from `BLOB_READ_WRITE_TOKEN`.
- **Accepted files:** JPEG, PNG and WebP, up to 25 MB each.
- **Alt text** is required on every upload; captions and credits are optional.
- **Focal point** is set per image in the admin and used for every crop.

| Size name | Width | Used for |
| --- | --- | --- |
| `thumb` | 480 px | Admin lists, small cards on phones |
| `card` | 960 px | Project and journal cards, highlight strips |
| `feature` | 1,600 px | Contained story images, About portrait |
| `hero` | 2,560 px | Hero slides, 21:9 covers, full-bleed images |

Sizes are generated as WebP, with the original kept.

- **Serving:** `next/image` with a custom loader that picks the nearest Payload size. Vercel's own image optimisation is never called; it is capped at 5,000 transformations a month on Hobby and billed by usage on Pro. The Blob host is added to `images.remotePatterns`.
- **Loading:** the first hero image and each page's opener image load with `priority`; everything else lazy-loads, with the tint colour showing until it arrives.
- **Video:** Vimeo or YouTube links only (Story blocks). A poster image or the provider's thumbnail shows first; the iframe loads on click.

## Admin (Studio) customisation

Payload's standard admin covers most of the designed Studio screens; four small custom components and a theme close the gap, and the two-panel inbox is optional.

| Prototype screen | Payload implementation | Built in or custom | Phase |
| --- | --- | --- | --- |
| Sidebar | Default nav with `admin.group`: Portfolio (Projects, Collections) · Journal (Posts, Categories) · Inbox (Inquiries) · Library (Media) · Settings (Site settings, Home, About) · Admin (Users) | Built in | 1 |
| Logo and icon | Custom `graphics.Logo` and `graphics.Icon`: lens mark + "YOUR NAME", "Studio · CMS" in gold | Custom, small | 1 |
| "3 new" badge | Custom nav component that counts inquiries with status `new` | Custom, small | 1 |
| Overview | Custom dashboard: Needs a reply · Drafts · On the home page · Recently edited, each linking into the admin | Custom, medium | 1 |
| Projects list | List view with columns from the content model, search on title, filter by collection and status | Built in | 1 |
| Collection filter pills | Small component above the list that sets the collection filter | Custom, small | 2 |
| Project editor | Edit view: sidebar fields, story blocks with add / reorder / remove, Save draft, Publish changes, versions, live preview | Built in | 1 |
| Journal | Posts and Categories lists and editors, same blocks | Built in | 1 |
| Inquiries | List (name, type, status, received) + edit view with status in the sidebar | Built in | 1 |
| Two-panel inbox | Custom list view: list on the left, message on the right, status buttons | Custom, medium | 2 |
| Site settings | `site-settings`, `home`, `about` globals; arrays for collections order and hero slides | Built in | 1 |
| Accent swatches | Custom field component: four round swatches + Book Me preview | Custom, small | 2 |

**Theme:** one custom stylesheet for the admin. It loads Bebas Neue and Inter, sets ink `#1B1A17` for the nav, bone `#F3F1EC` for the page, `#FBFAF7` cards with `#D6D0C6` borders, pill buttons and the dual focus ring. Light mode only at launch.

**Changed from the prototype:** the project editor's "Use as a hero slide" switch is gone. Hero slides are curated in the `home` global so their order has one home; the editor keeps "Show in Selected work".

## Design system

The site uses the Cinematic Chapters system from the UI kit: two typefaces, a dark-and-bone palette, square photos, and gold reserved for booking and progress. Tokens become CSS custom properties in one `tokens.css`.

| Token | Value | Used for |
| --- | --- | --- |
| `--chapter` | `#2B2925` | Default opener, hero tint |
| `--tint-photo` / `--tint-film` / `--tint-design` / `--tint-writing` | `#2F2A28` / `#2C2A2E` / `#28302B` / `#302A26` | Collection openers |
| `--ink` | `#1B1A17` | Text on light, booking finale, footer, primary buttons |
| `--gold` | `#E9B44C` (from `site-settings.accent`) | Booking buttons, progress lines, finale label |
| `--bone` | `#F3F1EC` | Page background, light text on dark |
| `--stone` | `#EAE6DF` | Bands, form panel |
| `--frame` / `--frame-alt` | `#DCD6CC` / `#D3CCC0` | Image placeholders while loading |
| `--muted` | `#5E5A52` | Labels and secondary text on light (6.1:1 on bone) |
| `--on-dark` / `--on-dark-strong` | `#CFC8BB` / `#E6E1D8` | Body and context lines on dark |
| `--rule` | `#D6D0C6` | Hairlines |
| `--field-border` | `#8C867B` | Inputs, toggles (3.5:1) |
| `--card` | `#5A554E` | Hero story cards |

| Style | Font | Size | Line height | Notes |
| --- | --- | --- | --- | --- |
| Display | Bebas Neue | `clamp(80px, 11vw, 168px)` | 0.86 | Opener titles, hero, finales (64–136 px) |
| Section heading | Bebas Neue | `clamp(52px, 6vw, 84px)` | 0.92 | Chapter headings |
| Card title | Bebas Neue | 30–60 px | 0.95 | Projects, posts, story cards |
| Body | Inter 400 | 15–18 px | 1.6–1.75 | Paragraphs, stories, fields |
| Label | Inter 600, caps | 12–13 px, tracking 0.14–0.16em | 1.5 | "Chapter 01", meta, buttons |

Fonts load through `next/font/google` with `display: swap`.

Layout rules:

- Content max width 1,312 px; side padding `clamp(20px, 5vw, 64px)`; section padding `clamp(72px, 8vw, 104px)`.
- Photos have square corners and 4 px gaps. Story cards use 14 px radius, buttons are pills, admin cards 10 px.
- Grids use `repeat(auto-fit, minmax(min(Npx, 100%), 1fr))`, so they collapse to one column on phones.

Components to build: SiteHeader, SiteFooter, ChapterOpener, ChapterHeading, HeroSlider, StoryCard, Filmstrip, CollectionTile, ProjectCard, PieceRow, JournalRow, JournalCard, BookingFinale, DetailsStrip, Button (gold, ink, outline-ink, outline-light, text link), InquiryForm, and one renderer per story block.

## Accessibility, SEO & performance

The target is WCAG 2.2 AA, Core Web Vitals in the "good" range on mobile, and complete metadata on every public page.

**Accessibility**

- Contrast: body text at least 4.5:1, large text 3:1, field borders and toggles 3:1. The prototype's palette already meets this; its lowest text pair is 5.5:1.
- Focus: a 2 px ink outline with a 4 px bone ring outside it, visible on both light and dark sections.
- Targets: every link and button at least 44 × 44 px.
- Hero slider: no autoplay; arrows and story cards are real buttons with labels; the slide text sits in an `aria-live="polite"` region.
- One `h1` per page. On Home it stays the site headline; slide titles are `h2`. This fixes the prototype, where the `h1` changed with each slide.
- Forms: visible labels, errors tied to fields, no placeholder-only labels.
- Motion: the slider's colour and progress transitions turn off under `prefers-reduced-motion`.
- Images: alt text is required at upload; decorative frames are hidden from screen readers.

**SEO**

- `generateMetadata` on every route, from the SEO plugin fields with `site-settings.defaultMeta` as fallback.
- Open Graph image: the project or post cover, else the default image.
- `sitemap.xml` and `robots.txt` from Next.js metadata routes; drafts and `/admin` are excluded.
- Structured data: `Person` on Home and About, `CreativeWork` on project pages, `BlogPosting` on journal entries.
- Canonical URLs on every page, and 308 redirects when slugs change.

**Performance**

| Metric | Target (mobile, 75th percentile) |
| --- | --- |
| Largest Contentful Paint | under 2.5 s |
| Interaction to Next Paint | under 200 ms |
| Cumulative Layout Shift | under 0.1 |

- Static rendering with on-demand revalidation, so pages are served from Vercel's cache.
- Only the hero slider, the form, the "More projects" button and video embeds ship client JavaScript.
- Every image has fixed aspect ratios, so nothing shifts as it loads.

## Environments, deployment & migrations

Three environments share one codebase. Schema changes reach production only through committed migrations that run on every deploy.

| Environment | App | Database | Media | Schema changes |
| --- | --- | --- | --- | --- |
| Local | `next dev` | A Neon dev branch or local Postgres | Blob (dev store) | Payload's push mode syncs automatically |
| Preview | Vercel preview deployment per branch | Neon preview branch created by the Vercel integration | Blob (shared store, `preview/` prefix) | Migrations run on build |
| Production | Vercel, Pro plan | Neon main branch | Blob (production store) | Migrations run on build |

| Variable | Set by | Used for |
| --- | --- | --- |
| `PAYLOAD_SECRET` | You, a long random string per environment | Signing sessions |
| `POSTGRES_URL` (or `DATABASE_URL`) | Neon integration | Database connection |
| `BLOB_READ_WRITE_TOKEN` | Connecting Blob in Vercel | Media uploads |
| `RESEND_API_KEY` | You, from Resend | Inquiry alerts |
| `NEXT_PUBLIC_SERVER_URL` | You, per environment | Live preview and absolute URLs |
| `PREVIEW_SECRET` | You | Draft-mode route |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Upstash integration (optional) | Rate limiting |

Migration workflow:

1. Change a collection or global locally; push mode updates the local database.
2. Before merging, run `payload migrate:create <name>` against a database that has not used push mode, and commit the file.
3. The Vercel build command is `payload migrate && next build`, so preview and production apply pending migrations before building.
4. Never mix push mode and migrations on the same database; Payload's docs warn against it.

Launch setup:

- Upgrade the Vercel team to Pro before the domain goes live.
- Put Vercel functions and the Neon database in the same region (see open questions).
- Verify the sending domain in Resend: add its SPF and DKIM DNS records.
- Use Neon's point-in-time restore as the backup; check the retention window on your Neon plan.
- A seed script creates the four disciplines, the categories, the globals and one sample project with revalidation turned off.

## Build order & acceptance criteria

The build runs in eight phases. Each phase is done when every box under it is ticked.

### 1. Foundation

- [ ] Next.js app created with Payload 3 mounted, admin reachable at `/admin` on a Vercel preview URL
- [ ] Neon, Blob and Resend connected; a 15 MB photo uploads from the admin; a test email arrives
- [ ] Build command runs migrations before `next build`

### 2. Content model

- [ ] Every collection, global and story block in this spec exists, with the listed fields and admin positions
- [ ] Access rules match the access table; a logged-out REST request for a draft project returns nothing
- [ ] Seed script fills a fresh database

### 3. Front-end shell

- [ ] Tokens, fonts, SiteHeader, SiteFooter, ChapterOpener, BookingFinale built
- [ ] Every route renders from CMS data, including the empty states

### 4. Pages

- [ ] Each page matches its prototype artboard at 1,440 px and works at 390 px with no horizontal scroll
- [ ] Hero slider, "More projects" and video click-to-load work by mouse, touch and keyboard

### 5. Publishing

- [ ] Publishing a project updates its page, its collection page and Home within a minute, with no redeploy
- [ ] Draft changes show only in live preview and draft mode
- [ ] A slug change redirects the old URL

### 6. Book Me

- [ ] A valid inquiry creates a `new` doc and an email whose reply goes to the visitor
- [ ] Invalid input shows field errors and moves focus to the first one
- [ ] A filled honeypot saves nothing and still shows success

### 7. Admin (Studio)

- [ ] Theme, logo, nav groups, inquiry badge and Overview dashboard in place
- [ ] Phase 2 extras (filter pills, two-panel inbox, accent swatches) scheduled or dropped

### 8. QA & launch

- [ ] Keyboard-only pass on every page and the admin's main flows; automated accessibility scan shows no serious issues
- [ ] Core Web Vitals targets met on a mid-range phone profile
- [ ] Metadata, sitemap and structured data validate
- [ ] Real content entered; Vercel on Pro; domain and Resend sending domain verified

## Out of scope & open questions

These are deliberately left out of launch:

- Private or password-protected galleries, and delivering full photo sets to clients
- Prints, a shop, or any payments
- Online booking, scheduling or availability calendars
- More than one editor role, translations, journal comments, a newsletter
- Uploading or hosting video files

Open questions:

- [ ] Final name, wordmark and all placeholder copy in \[brackets\]
- [ ] Region for Vercel functions and Neon. Singapore suits clients mostly in Southeast Asia; pick where most visitors are
- [ ] Should visitors get an automatic "I've got your message" email, or only the editor alert?
- [ ] How long are inquiries kept before archiving or deleting?
- [ ] Where do slug redirects live: a small `redirects` collection, or Payload's redirects plugin?
- [ ] Booking button wording: keep "Book Me" or switch to "Work with me"
- [ ] Analytics: Vercel Web Analytics, another tool, or none
- [ ] Are the phase 2 admin extras (filter pills, two-panel inbox, accent swatches) wanted at launch?
- [ ] Domain name and email address for `contactEmail`

### Sources

- [Payload docs: Storage adapters (Vercel Blob, `clientUploads`)](https://payloadcms.com/docs/v3/upload/storage-adapters.md)
- [Payload docs: Migrations](https://payloadcms.com/docs/v3/database/migrations.md)
- [Payload PR #16227: Vercel Postgres adapter moving to Neon's driver](https://github.com/payloadcms/payload/pull/16227)
- [Vercel docs: Hobby plan](https://vercel.com/docs/plans/hobby-plan)
- [Vercel docs: Fair use guidelines, commercial usage](https://vercel.com/docs/limits/fair-use-guidelines)
- [Creative Portfolio Prototype canvas](https://claude.ai/artifact/KLHKn717jgjPLW38tpBuD8)
