# Phase 5 — Studio shell

Status: In progress
Depends on: P3 (the inquiries the badge counts, and Resend for password reset email), P4 (every collection and global exists)
Build Spec refs: Admin (Studio) customisation · Access control & auth · Design system · Content model: collections › users

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md) · design specs [StudioNav](../design/components/StudioNav.md), [StudioOverview](../design/components/StudioOverview.md), [StudioLogin](../design/components/StudioLogin.md) and the Studio theme table in [`docs/design/README.md`](../design/README.md)

## Goal

The Payload admin becomes the "Studio". It gets one theme, its own logo, grouped navigation with a "N new" inquiries badge, an Overview dashboard and a themed login. This closes Build Spec admin box 7.1. The phase-2 extras (filter pills, two-panel inbox, accent swatches) are P6.

## Owner decisions (2026-11-11)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **"On the home page" panel** follows capture 21's shape: the published `home` global's hero slide titles in order (a blank title shows `site-settings.headline`), then a line counting the published projects marked for Selected work, then "Edit Home page →" to the `home` global. This replaces "projects with `showOnHome`, in `homeOrder`" and the capture's "Edit in site settings". With more than nine marked, the line says "the first 9 of N".
2. **Drafts panel** covers draft projects **and** posts. "Draft" means the doc is not live (main `_status: draft`: never published, or unpublished); a live doc with newer autosaved edits is not a draft. Rows show each doc's latest saved version. Footer links: "All projects →" and "All posts →".
3. **Recently edited** lists the 4 latest saved projects and posts (their latest version, since autosave never updates a live doc's main record), with three chips: Published, Draft and "Unpublished changes" (live, with a newer draft). Globals and inquiries are left out.
4. **Empty panels stay** with a short line ("Nothing waiting.", "No drafts.", "No hero slides published yet.", "Nothing edited yet."); count pills are hidden at 0. Row limits: Needs a reply 3, Drafts 3, hero slides all (up to 6), Recently edited 4.
5. **Own login view.** `/admin/login` is our view (`admin.components.views.login`), because Payload's form shows errors only as toasts. It posts to a server action that calls Payload's `login()` (`@payloadcms/next/auth`), so lockout, password checks and the HTTP-only cookie stay Payload's, and it works without JavaScript. Redirects go only through `getSafeRedirect` (`payload/shared`). Forgot password and reset stay Payload's views, themed.
6. **Login messages:** blank field "Enter your email and password to log in."; wrong details "That email and password don't match." (never says which); locked "This account is locked after too many wrong tries. Try again in 15 minutes." (accepted: it confirms the email is the editor's); anything else "Something went wrong. Try again."
7. **Own sidebar.** `admin.components.Nav` is our server component (Payload's nav has no place for a badge on one link). It reuses Payload's `NavWrapper` and `NavHamburger`; Payload's collapsible groups and gear menu are dropped.
8. **Badge** hidden when there are no `new` inquiries. No database index on `inquiries.status`: one editor's table stays small, and a plain count avoids a migration.
9. **Phones:** below 1024 px the sidebar stays in Payload's drawer behind the app-header menu button, on every Studio screen. This replaces capture 21's sidebar stacked open at 390 px.

Design deviations from the captures are recorded in `docs/design/README.md`.

## In scope

**Theme** (one admin stylesheet)
- Loads Bebas Neue and Inter.
- Colours:
  - ink `#1B1A17` for the nav;
  - bone `#F3F1EC` for the page;
  - `#FBFAF7` cards with `#D6D0C6` borders and a 10 px radius.
- Pill buttons, and the dual focus ring: a 2 px ink outline with a 4 px bone ring.
- Light mode only at launch: `admin.theme: 'light'` turns the admin's dark theme off.
- The stylesheet uses the canonical token variables (the Studio tokens added in P5), mapping Payload's own CSS variables onto them (table in `docs/design/README.md`). It contains no hard-coded colour values.
- It applies to every admin view. P6 then refines screens 22–31 against their captures.

**Logo and icon**
- Custom `graphics.Logo` and `graphics.Icon`: the lens mark plus the site name, with "Studio · CMS" in gold underneath (on the bone minimal views the label is muted, since gold on bone is 1.7:1).
- The name comes from `site-settings.name`.

**Navigation** (our sidebar, owner decision 7)
- Groups in this order:
  - Overview;
  - Portfolio: Projects, Collections;
  - Journal: Posts, Categories;
  - Inbox: Inquiries;
  - Library: Media;
  - Settings: Site settings, Home page, About page;
  - Admin: Users.
- The Build Spec lists the Admin (Users) group, but capture 42 leaves it out. The Build Spec wins, and the Admin group keeps the capture's styling.
- The sidebar shows a "N new" badge on Inquiries, counting inquiries with `status: new`, hidden when the count is 0 (owner decision 8).
- Sidebar footer: "View the site ↗", "Signed in as {users.name}" and "Log out".

**Overview dashboard** (custom view at `/admin`)
- A greeting, "Good to see you. Here's what needs you today.", plus "View site" and "New project" actions.
- Four panels, each linking into the admin (owner decisions 1–4):
  - Needs a reply: the 3 newest `new` inquiries, with a count and "Open inquiries →";
  - Drafts: draft projects and posts, with a count, "All projects →" and "All posts →";
  - On the home page: the published hero slides in order, the Selected work line and "Edit Home page →";
  - Recently edited: the 4 latest saved projects and posts, with a status chip.
- Every panel query goes through access control as the logged-in editor.

**Login** (`/admin/login`, our view, owner decisions 5 and 6)
- Matches capture 20:
  - the logo, with "Studio · CMS";
  - the site headline;
  - a "Back to the site" link;
  - Email and Password with visible labels;
  - "Log in" and "Forgot password?";
  - the lockout note "After 5 wrong tries the account locks for 15 minutes".
- The error state shows the sign-in error as in 20--error, tied to the form so screen readers announce it.
- "Forgot password?" uses Payload's built-in reset, which sends email through the P3 Resend adapter.

## Out of scope

- Collection filter pills, the two-panel inbox and accent swatches: P6.
- Checking screens 22–31 against their captures: P6.
- A dark admin theme: not at launch.

## Screens

Visual match is required this phase for these four:

- [20 Log in](../design/reference/creative-portfolio/handoff/screens/desktop/20-cms-login.png) and [20 sign-in error](../design/reference/creative-portfolio/handoff/screens/desktop/20-cms-login--error.png);
- [21 Overview](../design/reference/creative-portfolio/handoff/screens/desktop/21-cms-overview.png);
- [42 Studio sidebar](../design/reference/creative-portfolio/handoff/screens/desktop/42-cms-sidebar.png).

Each is checked at 1440 px (sidebar 264 px wide) and at 390 px. Screen 42 has no 390 px capture, so at that width it only has to work, with no horizontal scroll. At 390 px, screen 21 is matched without its stacked sidebar (owner decision 9).

## Content model

No new fields. The badge and the Overview read `inquiries`, `projects`, `posts`, `home` and `site-settings`.

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/admin` | The Overview dashboard replaces Payload's default dashboard |
| `/admin/login` | Our login view, through Payload's `login()`: lockout after 5 failed attempts; a logged-in visit and a successful log-in go to `?redirect=` when it is a safe `/admin` path, else `/admin` |
| Every `/admin/*` view | Theme, logo and grouped nav with the badge |
| `/admin/forgot`, `/admin/reset/:token`, `/admin/create-first-user` | Payload's views, themed, with the Studio logo |

## Acceptance criteria

- Theme, logo, nav groups, the inquiry badge and the Overview dashboard are all in place (Build Spec box 7.1).
- The badge count equals the number of `new` inquiries. After an inquiry's status changes, the count updates the next time a page loads.
- Each Overview panel shows correct data for seeded content (2 new inquiries; "3 unpublished"; the published hero slides; "the first 9 of 10"), each empty state shows its line, an autosaved edit to a live project shows "Unpublished changes", and each link opens the right admin view.
- Login, each login error (blank, wrong, locked, failed), a failed-attempt lockout, the logged-in redirect and the safe `?redirect=` all work, also without JavaScript. "Forgot password?" sends a reset email on a preview. Create-first-user still appears while `users` is empty.
- Screens 20, 20--error, 21 and 42 match their captures at 1440 px. Screens 20 and 21 also match at 390 px (21 without its stacked sidebar, owner decision 9), and all four work at 390 px with no horizontal scroll.
- **Keyboard pass of the admin's main flows** (log in; open the Overview; open, edit and publish a project; change an inquiry's status; log out):
  - every control can be reached and the focus ring is visible;
  - axe finds no WCAG 2.2 AA violations on the themed views.
- No admin stylesheet rule hard-codes a colour value.

## Seed data

No new seed. P0–P4 data fills the Overview panels.

## Open questions

None specific to this phase.

## Risks

- **Upgrade breakage.** CSS overrides of the Payload admin can break on Payload upgrades. Prefer Payload's own CSS variables and component slots over deep selectors, and pin the Payload version.
- **Badge cost.** The badge runs a count query on every admin page. Keep it to a single `count` on `status`; no index (owner decision 8), revisited only if the table grows.
- **Login override.** Our login view must keep Payload's own auth behaviour: lockout, reset and HTTP-only cookies. It calls Payload's `login()` rather than reimplementing it, and redirects only through `getSafeRedirect`.
- **Stale main records.** Autosave writes drafts to the versions table only, so the Overview shows each doc's latest version rather than its main record.
