# Phase 5 — Studio shell

Status: Draft
Depends on: P3 (the inquiries the badge counts, and Resend for password reset email), P4 (every collection and global exists)
Build Spec refs: Admin (Studio) customisation · Access control & auth · Design system · Content model: collections › users

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

The Payload admin becomes the "Studio". It gets one theme, its own logo, grouped navigation with a "N new" inquiries badge, an Overview dashboard and a themed login. This closes Build Spec admin box 7.1. The phase-2 extras (filter pills, two-panel inbox, accent swatches) are P6.

## In scope

**Theme** (one admin stylesheet)
- Loads Bebas Neue and Inter.
- Colours:
  - ink `#1B1A17` for the nav;
  - bone `#F3F1EC` for the page;
  - `#FBFAF7` cards with `#D6D0C6` borders and a 10 px radius.
- Pill buttons, and the dual focus ring: a 2 px ink outline with a 4 px bone ring.
- Light mode only at launch, so dark mode is turned off in the admin (for example through Payload's admin theme setting; verify in `/pi-plan`).
- The stylesheet uses the canonical token variables from P0. It contains no hard-coded colour values.
- It applies to every admin view. P6 then refines screens 22–31 against their captures.

**Logo and icon**
- Custom `graphics.Logo` and `graphics.Icon`: the lens mark plus the site name, with "Studio · CMS" in gold underneath.
- The name comes from `site-settings.name`.

**Navigation**
- Payload's default nav with `admin.group`, in this order:
  - Overview;
  - Portfolio: Projects, Collections;
  - Journal: Posts, Categories;
  - Inbox: Inquiries;
  - Library: Media;
  - Settings: Site settings, Home page, About page;
  - Admin: Users.
- The Build Spec lists the Admin (Users) group, but capture 42 leaves it out. The Build Spec wins, and the Admin group keeps the capture's styling.
- A custom nav component shows a "N new" badge on Inquiries, counting inquiries with `status: new`. Proposal (not in the Build Spec): hide the badge when the count is 0.
- Sidebar footer: "View the site ↗", "Signed in as {users.name}" and "Log out".

**Overview dashboard** (custom view at `/admin`)
- A greeting, "Good to see you. Here's what needs you today.", plus "View site" and "New project" actions.
- Four panels, each linking into the admin:
  - Needs a reply: the newest `new` inquiries, with a count and "Open inquiries →";
  - Drafts: unpublished projects and posts, with a count;
  - On the home page: projects with `showOnHome`, in `homeOrder`;
  - Recently edited: the latest updated docs.
- Every panel query goes through access control as the logged-in editor.

**Login** (`/admin/login`)
- Themed to match capture 20:
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

Each is checked at 1440 px (sidebar 264 px wide) and at 390 px. Screen 42 has no 390 px capture, so at that width it only has to work, with no horizontal scroll.

## Content model

No new fields. The badge and the Overview read `inquiries`, `projects`, `posts`, `home` and `site-settings`.

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/admin` | The Overview dashboard replaces Payload's default dashboard |
| `/admin/login` | Themed login, with lockout after 5 failed attempts |
| Every `/admin/*` view | Theme, logo and grouped nav with the badge |

## Acceptance criteria

- Theme, logo, nav groups, the inquiry badge and the Overview dashboard are all in place (Build Spec box 7.1).
- The badge count equals the number of `new` inquiries. After an inquiry's status changes, the count updates the next time a page loads.
- Each Overview panel shows correct data for seeded content, and each link opens the right admin view.
- Login, the login error and a failed-attempt lockout all work. "Forgot password?" sends a reset email on a preview.
- Screens 20, 20--error, 21 and 42 match their captures at 1440 px. Screens 20 and 21 also match at 390 px, and all four work at 390 px with no horizontal scroll.
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
- **Badge cost.** The badge runs a count query on every admin page. Keep it to a single indexed `count` on `status`.
- **Login override.** A custom login view must keep Payload's own auth behaviour: lockout, reset and HTTP-only cookies.
