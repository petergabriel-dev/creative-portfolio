# Phase 6 — Studio extras

Status: Draft
Depends on: P5 (theme, nav, badge)
Build Spec refs: Admin (Studio) customisation (the phase-2 rows: collection filter pills, two-panel inbox, accent swatches) · Book Me & inquiries flow (statuses) · Globals › site-settings (`accent`) · Design system

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

Build the three Studio extras the Build Spec marks as optional "phase 2". The owner decided on 2026-11-10 to include them at launch. The phase also brings every remaining Studio screen (22–31) in line with its capture at the theme level. This closes Build Spec box 7.2.

## In scope

**Collection filter pills** (on the Projects list, screen 22)
- A small custom component above Payload's list view.
- Pills: "All", then one per discipline in `order`, each with its project count, for example "Photography 3".
- Choosing a pill sets the list's collection filter. "All" clears it.
- The pills work together with the built-in search and status filter.
- Built as real buttons or links. The selected pill is marked with `aria-pressed` or `aria-current`, and each pill is reachable by keyboard.

**Two-panel inbox** (a custom list view for `inquiries`, screen 27)
- A header with the line "Messages sent from the Book Me form. Reply from your own email, then mark them as replied."
- A status filter with counts: New, Replied, Archived.
- Left panel: the inquiries, newest first. Each shows the name, the date, `projectType` and a message excerpt.
  - Capture 27 shows extra detail such as "Photography — wedding". Inquiries do not store a sub-type, so only `projectType` is shown.
- Right panel: the selected inquiry.
  - It shows the name, a status chip, Project, Timing, Email, Received and the full message.
  - Actions: "Reply by email" (a `mailto:` link to the visitor), "Mark as replied" and "Archive".
- Status changes follow the Build Spec: new → replied → archived, and any status can go back to `new`. Each change updates the "N new" badge on the next page load.
- `notes` stays editable from the inquiry's edit view.
- It is keyboard operable:
  - moving through the list selects an inquiry;
  - the detail panel's heading takes focus or is announced;
  - the status actions are buttons.

**Accent swatches** (a custom field component for `site-settings.accent`, screen 29)
- Label: "Accent colour · Book Me buttons and progress only".
- Four round swatches: Gold `#E9B44C` (the default), Terracotta `#E07A5F`, Sage `#9FC3A8` and Off-white `#F3F1EC`.
- A live "Book Me" button preview in the selected accent.
- The swatches behave as a radio group, with a visible name for each and arrow-key selection. They store the same select values the field already uses.

**Theme pass on screens 22–31**
- Compare each built-in view with its capture at 1440 px and 390 px, including the states 23--seo and 24--list.
- Fix differences that the theme stylesheet and Payload's admin options can fix: spacing, type, colours, chips, cards and buttons.
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

No changes. The pills read `disciplines` and the project counts. The inbox reads and updates `inquiries.status`. The swatches write `site-settings.accent`.

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/admin/collections/projects` | The built-in list with the filter pills above it |
| `/admin/collections/inquiries` | The two-panel inbox replaces the default list view |
| `/admin/globals/site-settings` | The `accent` field renders as swatches |

## Acceptance criteria

- Build Spec box 7.2: the filter pills, two-panel inbox and accent swatches are built and in use.
- **Pills.** Choosing one shows only that collection's projects, and its count equals the number of projects in it. They work with search and the status filter.
- **Inbox:**
  - "Mark as replied", "Archive" and returning to `new` update the status, the filter counts and the nav badge;
  - "Reply by email" opens a `mailto:` link to the visitor's address;
  - the inbox works by keyboard alone.
- **Swatches.** Choosing a swatch and saving changes the site's booking button colour without a redeploy. The swatches work by keyboard as a radio group.
- **Theme pass.** Screens 22–31, including states 23--seo and 24--list, are consistent with their captures at 1440 px and 390 px at the theme level. axe finds no WCAG 2.2 AA violations on them.
- No new custom component hard-codes a colour value.

## Seed data

No new seed. P1–P4 data covers the pills, and P3's inquiries cover every inbox status.

## Open questions

None specific to this phase.

## Risks

- **Custom list view.** Replacing the inquiries list view must keep Payload's access control and pagination. Check that many inquiries still load page by page.
- **Accent contrast.** Off-white `#F3F1EC` is nearly the bone page colour. Wherever a Book Me button or progress line appears on a light background, it may fail the 3:1 non-text contrast rule. Check every accent against every background it appears on, and add an outline or ink text if needed.
- **Upgrades.** Custom admin views and field components depend on Payload's component API. Pin the version and re-test after upgrades.
