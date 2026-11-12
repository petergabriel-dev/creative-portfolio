# Phase 6 — Studio extras

Status: In progress
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
  - Actions depend on the status (owner decision 3): "Reply by email" (a `mailto:` link to the visitor), then "Mark as replied", "Archive" or "Mark as new".
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
  - "Reply by email" opens a `mailto:` link to the visitor's address;
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
