# Phase 6 — Studio extras

Status: Done
Depends on: P5 (theme, nav, badge)
Build Spec refs: Admin (Studio) customisation (the phase-2 rows: collection filter pills, two-panel inbox, accent swatches) · Book Me & inquiries flow (statuses) · Globals › site-settings (`accent`) · Design system

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

Build the three Studio extras the Build Spec marks as optional "phase 2". The owner decided on 2026-11-10 to include them at launch. The phase also brings every remaining Studio screen (22–31) in line with its capture at the theme level. This closes Build Spec box 7.2.

## Owner decisions (2026-11-12)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **Theme pass scope.** The theme stylesheet plus layout-only Payload options: `row`, `collapsible`, unnamed `tabs`, unnamed `group` (titled cards), `admin.position: 'sidebar'`, `admin.width`, field labels and descriptions, and collection and global descriptions. Nothing that changes the database schema (no named groups or tabs, no new fields, no migration) and no new custom views or page headers beyond the three extras. Left out: placeholders, `admin.condition`, translated button text (i18n overrides), the SEO plugin's `fields` override and a "View page" preview link on collections.
2. **Description lines.** The capture lines go on Projects (22), Posts (25) and Media (28), accepting that Payload also shows a collection's description above each of its edit forms, and on Site settings, Home and About.
3. **Inbox actions by status.** The current status is never offered:
   - New: Reply by email, Mark as replied, Archive.
   - Replied: Reply by email, Archive, Mark as new.
   - Archived: Reply by email, Mark as new.
   - Every inquiry also has an "Open full record →" link to its edit view, where `notes` are edited and the inquiry can be deleted. The inbox has no notes field.
4. **Inbox flow.** It opens on the New tab with the newest inquiry selected; there is no "All" tab. The tab, page and selected inquiry are kept in the URL, so reload and back work. After a status change the inbox stays on the tab, selects the next inquiry (the previous one if it was last), announces the change (for example "Marked as replied.") and moves focus to the new detail heading. A tab with no inquiries shows "Nothing waiting."
5. **No bulk actions.** The inbox has no bulk select, bulk delete or search. Archive is the everyday "done" or spam move; a permanent delete goes one at a time through "Open full record →" and Payload's own Delete, with its confirm.
6. **Paging.** 20 inquiries per page, newest first, with "Newer" and "Older" links.
7. **Overview links.** The Overview's "Needs a reply" rows open the inbox with that inquiry selected, instead of Payload's edit view.
8. **Filter pills.** A pill sets `?collection=<slug>` on the Projects list. Its count is the collection's total number of projects, drafts included, and does not change with search or other filters. Every discipline shows, in `order`, even with no projects.
9. **Accent swatches.** Each swatch shows its name, so the choice is not made by colour alone (WCAG 1.4.1); capture 29 shows none. Every swatch has a ring with at least 3:1 contrast against the card, so off-white stays visible. The Book Me preview sits on an ink panel, where every accent passes.
10. **Reply in Gmail** (2026-11-12, after the v0.7.0 release). The owner replies from Gmail in the browser, where the inbox's `mailto:` "Reply by email" opened nothing. It becomes "Reply in Gmail ↗": Gmail's compose window in a new tab, addressed to the visitor with the subject "Re: your Book Me inquiry" and the Google account matching Site settings › Contact email. A "Copy email" button beside it copies the visitor's address and announces "Email copied." This replaces "Reply by email" in decision 3.

## In scope

**Collection filter pills** (on the Projects list, screen 22)
- A small custom component above Payload's list view.
- Pills: "All", then one per discipline in `order`, each with its project count (drafts included), for example "Photography 3" (owner decision 8).
- Choosing a pill sets `?collection=<slug>`, which filters the list; "All" removes it.
- The pills work together with the built-in search and with conditions from Payload's filter builder, such as status.
- Built as links. The selected pill is marked with `aria-current`, and each pill is reachable by keyboard.

**Two-panel inbox** (a custom list view for `inquiries`, screen 27)
- A header with the line "Messages sent from the Book Me form. Reply from your own email, then mark them as replied."
- A status filter with counts: New, Replied, Archived. No "All" tab (owner decision 4).
- Left panel: the inquiries, newest first, 20 per page with "Newer" and "Older" links (owner decision 6). Each shows the name, the date, `projectType` and a message excerpt.
  - Capture 27 shows extra detail such as "Photography — wedding". Inquiries do not store a sub-type, so only `projectType` is shown.
- Right panel: the selected inquiry.
  - It shows the name, a status chip, Project, Timing, Email, Received and the full message.
  - Actions depend on the status (owner decision 3): "Reply in Gmail ↗" (Gmail's compose window, new tab) and "Copy email" (owner decision 10), then "Mark as replied", "Archive" or "Mark as new".
  - An "Open full record →" link opens the inquiry's edit view.
- Status changes follow the Build Spec: new → replied → archived, and any status can go back to `new`. Each change updates the filter counts and the "N new" badge.
- The tab, page and selected inquiry live in the URL; after a status change the inbox selects the next inquiry on the same tab (owner decision 4).
- `notes` and deleting stay in the inquiry's edit view. The inbox has no bulk actions and no search (owner decision 5).
- It is keyboard operable:
  - Tab moves through the list, where each name is a link, and Enter selects an inquiry;
  - the detail panel's heading takes focus after a selection or a status change, and the change is announced;
  - the status actions are buttons.
- The Overview's "Needs a reply" rows open the inbox with that inquiry selected (owner decision 7).

**Accent swatches** (a custom field component for `site-settings.accent`, screen 29)
- Label: "Accent colour · Book Me buttons and progress only".
- Four round swatches: Gold `#E9B44C` (the default), Terracotta `#E07A5F`, Sage `#9FC3A8` and Off-white `#F3F1EC`.
- A live "Book Me" button preview in the selected accent, on an ink panel.
- The swatches behave as a radio group, with a visible name for each and arrow-key selection. Each has a ring with at least 3:1 contrast against the card (owner decision 9). They store the same select values the field already uses.

**Theme pass on screens 22–31**
- Compare each built-in view with its capture at 1440 px and 390 px, including the states 23--seo and 24--list.
- Fix differences that the theme stylesheet and the layout-only admin options in owner decision 1 can fix: spacing, type, colours, chips, cards, buttons, field grouping, rows, labels and description lines.
- Payload's resting field edges reach 3:1 (left from P5).
- Differences these can't fix are recorded as deviations in `docs/design/README.md`, not built.
- Status chips use the handoff's added chip tokens: published and draft, background and foreground.
- Built-in list and edit views are not rebuilt to pixel-match their captures (owner decision, 2026-11-10).

## Out of scope

- Editing categories inline from the posts list (drawn on screen 25). Categories keep Payload's default views, as in the Build Spec.
- A custom media library view (screen 28). It gets the theme pass only.
- New fields or collections.

## Screens

Theme-level visual match, at 1440 px (`desktop/`) and 390 px (`mobile/`):

- [22 Projects list](../design/reference/creative-portfolio/handoff/screens/desktop/22-cms-projects.png);
- [23 Project editor](../design/reference/creative-portfolio/handoff/screens/desktop/23-cms-project-editor.png) and [23 SEO tab](../design/reference/creative-portfolio/handoff/screens/desktop/23-cms-project-editor--seo.png);
- [24 Collection editor](../design/reference/creative-portfolio/handoff/screens/desktop/24-cms-collection-editor.png) and [24 list layout](../design/reference/creative-portfolio/handoff/screens/desktop/24-cms-collection-editor--list.png);
- [25 Journal](../design/reference/creative-portfolio/handoff/screens/desktop/25-cms-journal.png);
- [26 Post editor](../design/reference/creative-portfolio/handoff/screens/desktop/26-cms-post-editor.png);
- [27 Inquiries](../design/reference/creative-portfolio/handoff/screens/desktop/27-cms-inquiries.png);
- [28 Media](../design/reference/creative-portfolio/handoff/screens/desktop/28-cms-media.png);
- [29 Site settings](../design/reference/creative-portfolio/handoff/screens/desktop/29-cms-site-settings.png);
- [30 Home page](../design/reference/creative-portfolio/handoff/screens/desktop/30-cms-home.png);
- [31 About page](../design/reference/creative-portfolio/handoff/screens/desktop/31-cms-about.png).

## Content model

No changes. The pills read `disciplines` and the project counts. The inbox reads and updates `inquiries.status`. The swatches write `site-settings.accent`. The theme pass changes only field layout, labels and descriptions, so no migration is created.

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/admin/collections/projects` | The built-in list with the filter pills above it; `?collection=<slug>` filters it |
| `/admin/collections/inquiries` | The two-panel inbox replaces the default list view; `?status=`, `?page=` and `?id=` hold the tab, page and selected inquiry |
| `/admin/globals/site-settings` | The `accent` field renders as swatches |

## Acceptance criteria

- Build Spec box 7.2: the filter pills, two-panel inbox and accent swatches are built and in use.
- **Pills.** Choosing one shows only that collection's projects, and its count equals the number of projects in it. They work with search and with a status condition from the filter builder.
- **Inbox:**
  - "Mark as replied", "Archive" and returning to `new` update the status, the filter counts and the nav badge;
  - after a change the next inquiry on the tab is selected, the change is announced and focus is on its heading;
  - "Reply in Gmail" opens Gmail's compose window in a new tab, addressed to the visitor; "Copy email" copies the visitor's address and announces it (owner decision 10; it replaced the `mailto:` "Reply by email" after release);
  - more than 20 inquiries on a tab page through "Newer" and "Older", and reload or back keeps the tab, page and selection;
  - an Overview "Needs a reply" row opens the inbox with that inquiry selected;
  - the inbox works by keyboard alone.
- **Swatches.** Choosing a swatch and saving changes the site's booking button colour without a redeploy. The swatches work by keyboard as a radio group.
- **Theme pass.** Screens 22–31, including states 23--seo and 24--list, are consistent with their captures at 1440 px and 390 px at the theme level. axe finds no WCAG 2.2 AA violations on them.
- No new custom component hard-codes a colour value.
- No migration: `payload migrate:create --skip-empty` writes no file.

## Seed data

No new seed. P1–P4 data covers the pills, and P3's inquiries cover every inbox status. Paging is checked in QA with extra inquiries inserted by SQL into a throwaway database.

## Open questions

None specific to this phase.

## Risks

- **Custom list view.** Replacing the inquiries list view must keep Payload's access control and pagination. Check that many inquiries still load page by page.
- **Accent contrast.** Off-white `#F3F1EC` is nearly the bone page colour. Wherever a Book Me button or progress line appears on a light background, it may fail the 3:1 non-text contrast rule. Checked 2026-11-12: every gold button on the site sits on a dark surface (openers, BookingFinale, hero), so P6 changes nothing on the site; in the Studio the swatch ring and the ink preview panel cover it (owner decision 9).
- **Upgrades.** Custom admin views and field components depend on Payload's component API. Pin the version and re-test after upgrades.

## QA log (2026-11-12)

Run on `docs/p6-qa` (plan `p6-studio-extras`, T1–T11 committed on stacked local branches, pushed as `feat/p6-studio-extras`, PR #39). The checks used a local production build (`pnpm build`, `pnpm start`) on a fresh database: the 8 committed migrations (P6 needs none: `payload migrate:create --skip-empty` wrote no file), seeded twice with the local `./media` folder moved aside (traps.md), plus 45 inquiries inserted by SQL (43 new, one with a very long name, email and unbroken word, one replied with an address Payload wouldn't accept; dev-workflow.md), with an empty `BLOB_READ_WRITE_TOKEN` and `RESEND_API_KEY`. Rows marked "Tn" cite that task's verification on `pnpm dev` with the same code. axe is axe-core 4.14 from the project's own dependencies (WCAG 2.2 AA tags).

| Criterion | Result | Evidence |
|---|---|---|
| Build Spec box 7.2: filter pills, two-panel inbox and accent swatches built and in use | Pass | All three on the production build: the inbox at `/admin/collections/inquiries`, the pills above the Projects list, the swatches on Site settings |
| Pills: a pill shows only its collection, and its count equals its rows | Pass | All 23, Photography 11 ("1-10 of 11"), Film & Video 4 ("1-4 of 4"); Enter on a pill filters, reload keeps it; an unknown slug shows All as current |
| Pills work with search and a status condition | Pass | Photography plus a draft condition from the filter builder: 1 row; Photography plus "wedding": 2 rows. REST ignores `?collection=` (23 either way), so relationship pickers are unaffected (T5) |
| Inbox: status changes update the status, the counts and the nav badge | Pass | Keyboard "Mark as replied": New 46 → 45, Replied 3 → 4, badge "45 new"; "Mark as new" on the only archived inquiry: Archived 1 → 0 (T4 and final build) |
| Inbox: the next inquiry is selected, the change announced, focus on its heading | Pass | After "Mark as replied" the next card was selected, the live region read "Marked as replied." and focus was on `#inbox-detail-heading`; emptying a tab focused "Nothing waiting." and announced "Marked as new." |
| "Reply by email" opens a `mailto:` link to the visitor | Pass | `mailto:qa21@example.com`; no link for `not-an-email`; header characters in the local part are encoded (unit test) |
| More than 20 page through Newer and Older; reload and Back keep tab, page and selection | Pass after one fix | Page 2 with `id=25` survived a reload; Older reached page 3 (6 cards). Back, Back to the first-loaded page, and Forward each showed the right inquiry. The address bar kept a stale `id` after Older; fixed below |
| The Overview's Needs a reply rows open the inbox with that inquiry selected | Pass | Rows link to `?status=new&id=<id>` and land on it |
| The inbox works by keyboard alone | Pass | Tab and Enter select a card (focus moves to its heading); status buttons by Enter; a tab change keeps focus on the tab |
| A failed change keeps the inquiry and says so | Pass | An inquiry deleted under the open page: "Couldn't change the status. Try again.", URL and selection unchanged, buttons enabled; the log line read "Inquiry 5 status change failed (NotFound)" |
| Access | Pass | Logged-out inbox → `/admin/login?redirect=<inbox URL>`; logged-out REST read and create of inquiries 403; `/api/graphql` 404. Every Studio Local API call runs as the editor (unit tests, invariant 28) |
| Swatches: a keyboard radio group; saving changes the site's booking colour without a redeploy | Pass | Arrow keys moved gold → terracotta; the preview followed the swatch and the Booking button label; Save stored `terracotta`; the static `/portfolio` (`x-nextjs-cache: HIT`) then drew its Book Me buttons in rgb(224, 122, 95) instead of rgb(233, 180, 76) |
| Theme pass: screens 22–31 with 23--seo and 24--list consistent with their captures at 1440 and 390 px | Pass, with recorded deviations | Screenshots against the captures (T7–T9). Cards, labels, rows, sidebar cards, titles, chips and 3:1 field edges in place; what layout-only config and CSS can't reach is listed in `docs/design/README.md` › "Studio theme pass (P6)" |
| axe: no WCAG 2.2 AA violations on the screens | Pass on P6 components; Payload exceptions recorded | 0 on the inbox (1440, 390), the pills and the swatch field. Screens 22–31 report only findings inside Payload's components, matching the P2, P4 and P5 baselines (list below), plus the SEO plugin's inline colours, new to the log |
| No new custom component hard-codes a colour value | Pass | No hex, `rgb()` or `!important` in the P6 CSS Modules or the P6 section of `custom.scss` |
| No migration | Pass | `payload migrate:create --skip-empty` wrote no file (T7, T8, final); a fresh database migrated with the 8 committed migrations |
| No horizontal scroll | Pass | 390 and 1440 px on all twelve screens; 320 px on the inbox, Projects list, Site settings and the Overview |
| `next build`: public routes keep their rendering (invariant 22) | Pass | `/`, `/about`, `/portfolio`, `/journal` and `/book` ○; collection, project, `/journal/page/[n]` and `/journal/[slug]` ● |
| The seed fills a fresh database; a second run creates nothing | Pass | Run 1 created 54 docs, run 2 created 0 (23 projects, 12 posts, 4 disciplines, 4 categories, 4 inquiries, 7 media); `users` empty before the QA editor was registered |
| DoD: code health | Pass | typecheck, lint, 506 unit tests (101 new in P6) |
| DoD: Vercel preview | Pass | PR #39: `checks` and `Vercel` green (the preview build migrated its Neon branch and built). An owner look at the Studio on the protected preview is a deferred check (below) |

### Fixes made during QA

- **A stale `id` or `collection` came back to the address bar.** Payload's list wrapper keeps the first URL's query in state and merges it back after every client navigation, so links that left a parameter out let the old one return: after Older the bar still read `id=25`, and after "All" it read `collection=photography`, so a reload showed a different inquiry or re-filtered the list. Links that clear a value now send it empty (`id=`, `collection=`); Payload drops the empty key (`inboxHref`, `filterPillHref`, unit tests updated; traps.md).
- During the tasks: Back/Forward after a full load (Payload sets `history.state` to `null`; `StudioInboxFocus` re-runs the navigation, T4); fact columns at 1024 px (auto-fit, T4); the slide image column (30%, T8); card gutters and header layout (T9).

### Studio accessibility (same policy as P0–P5)

These sit inside Payload's built-in components and go to upstream Payload. They match the earlier baselines, with each editor's counts depending on how many rows it holds:

- Projects, Posts and Media lists (22, 25, 28): row checkboxes without a name (`label` ×10 / ×10 / ×7) and the pagination arrows (`button-name` ×2).
- Project editor (23): as P5's baseline (`aria-command-name` ×15, `aria-hidden-focus` ×14, `aria-input-field-name` ×2, `button-name` ×26, `label-content-name-mismatch` ×1, `label` ×7, `list` ×1; at 390 px also `scrollable-region-focusable` ×1 and `target-size` ×10).
- Post editor (26): as P2's baseline (`button-name` ×13, `aria-command-name` ×6, `aria-hidden-focus` ×8, `label` ×5, `aria-input-field-name` ×2, `list` ×1, `label-content-name-mismatch` ×1, `nested-interactive` ×1, `target-size` ×1).
- Collection editor (24), Site settings (29), Home (30) and About (31): the same kinds (block and array row headers, react-select parts, popup buttons, the Lexical editor, document tabs). Home's array-row popups give `nested-interactive` ×3 and `target-size` ×3 (P4 logged ×5).
- **New: the SEO tab (23--seo, and the same plugin on 24 and 26).** `@payloadcms/plugin-seo` writes inline colours: help text and its links `#9a9a9a` on the card (2.7:1) and white on `#ff0000` "Missing" / "No image" (4.0:1), `color-contrast` ×8. A stylesheet fix would need `!important` and colour values (invariant 18), and hiding the checklist was left out of scope (owner decision 1), so this is recorded for the plugin upstream.

### Deferred owner checks

These are recorded as deferred, not passed:

- a screen-reader pass of the inbox's announcements and focus moves, the swatch radio group and the filter pills;
- the inbox and the editors on a real phone;
- an owner look at the themed screens 22–31 on the preview.

### Follow-ups

- Merge the P6 PR into `dev` after `checks` and `Vercel` pass; release P6 to `main` as `v0.7.0`, as for earlier phases.
- On each Payload upgrade: re-check the inbox list-view props, `ListQueryProvider`'s URL handling (the empty-parameter and Back/Forward workarounds), `baseFilter`, the swatch field props and the classes listed in `custom.scss` (ADR-0008).
- Upstream: the SEO plugin's inline colours and Payload's unnamed controls above.
- Left by choice: Payload still runs its own list query before the inbox renders (one small read per load); the inbox has no bulk actions or search (owner decision 5).

### After release: Reply in Gmail (2026-11-12)

The owner found that "Reply by email" did nothing: they reply from Gmail in Brave, which has no `mailto:` handler. Owner decision 10 replaced it (branch `fix/p6-gmail-reply`). Checked on `pnpm dev` with a fresh, seeded throwaway database:

| Criterion | Result | Evidence |
|---|---|---|
| "Reply in Gmail" opens Gmail's compose window for the visitor | Pass | `href` `https://mail.google.com/mail/?view=cm&fs=1&to=client-2%40example.com&su=Re%3A+your+Book+Me+inquiry&authuser=hello%40example.com` (the seed's contact email); a click opened a new tab with no `window.opener`, which went to Google's sign-in (the QA browser has no Google account) |
| It says it opens a new tab | Pass | Accessible name "Reply in Gmail ↗ (opens in a new tab)"; the ↗ is `aria-hidden` |
| No Gmail link for an address Payload wouldn't accept | Pass | Unit tests (`gmailReplyHref`, the view) |
| "Copy email" copies the address and says so | Pass | Enter on it put `client-2@example.com` on the clipboard and the live region read "Email copied."; without the Clipboard API it read "Couldn't copy. Select the address above." |
| Keyboard | Pass | Tab moves from "Reply in Gmail" to "Copy email", then to the status buttons |
| axe and layout | Pass | 0 violations on the inbox at 1440 and 390 px; no horizontal scroll at 320, 390 and 1440 px |
| Code health | Pass | typecheck, lint, 518 unit tests |

Deferred owner check: on the preview, signed into Gmail in Brave, "Reply in Gmail" opens a prefilled compose window from the contact-email account.
