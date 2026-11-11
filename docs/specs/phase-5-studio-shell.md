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
5. **Own login view.** `/admin/login` is our view (`admin.components.views.login`), because Payload's form shows errors only as toasts. It posts to a server action that calls Payload's `login()` (`@payloadcms/next/auth`), so lockout, password checks and the HTTP-only cookie stay Payload's. (A no-JavaScript log-in isn't possible: Payload's admin layout renders every view on the client, found in T6.) Redirects go only through `getSafeRedirect` (`payload/shared`). Forgot password and reset stay Payload's views, themed.
6. **Login messages:** blank field "Enter your email and password to log in."; wrong details "That email and password don't match." (never says which); locked "This account is locked after too many wrong tries. Try again in 15 minutes." (accepted: it confirms the email is the editor's); anything else "Something went wrong. Try again."
7. **Own sidebar.** `admin.components.Nav` is our server component (Payload's nav has no place for a badge on one link). It reuses Payload's `NavWrapper` and `NavHamburger`; Payload's collapsible groups and gear menu are dropped.
8. **Badge** hidden when there are no `new` inquiries. No database index on `inquiries.status`: one editor's table stays small, and a plain count avoids a migration.
9. **Phones:** up to 768 px (Payload's mobile breakpoint) the sidebar stays in Payload's full-width drawer behind the app-header menu button, on every Studio screen. This replaces capture 21's sidebar stacked open at 390 px.
10. **Sidebar open/closed** (decided during T4): Payload's behaviour is kept. Up to 1440 px every full page load starts with the sidebar closed (the menu button opens it; it stays open while moving around the Studio); wider screens remember the choice. QA opens it before comparing with captures 21 and 42.

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
- Custom `graphics.Logo` and `graphics.Icon`: the lens mark plus the site name, with "Studio · CMS" in gold underneath (where Payload draws its logo on a bone page, its login and verify views, the label is muted, since gold on bone is 1.7:1).
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
| `/admin/forgot`, `/admin/reset/:token`, `/admin/create-first-user` | Payload's views, themed (Payload draws no logo on them) |

## Acceptance criteria

- Theme, logo, nav groups, the inquiry badge and the Overview dashboard are all in place (Build Spec box 7.1).
- The badge count equals the number of `new` inquiries. After an inquiry's status changes, the count updates the next time a page loads.
- Each Overview panel shows correct data for seeded content (2 new inquiries; "3 unpublished"; the published hero slides; "the first 9 of 10"), each empty state shows its line, an autosaved edit to a live project shows "Unpublished changes", and each link opens the right admin view.
- Login, each login error (blank, wrong, locked, failed), a failed-attempt lockout, the logged-in redirect and the safe `?redirect=` all work. "Forgot password?" sends a reset email on a preview. Create-first-user still appears while `users` is empty.
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

## QA log (2026-11-11)

Run on `docs/p5-qa` (plan `p5-studio-shell`, T1–T6 committed on stacked local branches, not yet pushed). The checks used a local production build (`pnpm build`, `pnpm start`) on a fresh database: all 8 migrations (P5 needs none: `payload migrate:create --skip-empty` wrote no file), seeded twice with the local `./media` folder moved aside (traps.md), an empty `BLOB_READ_WRITE_TOKEN` and an empty `RESEND_API_KEY`, so emails were logged rather than sent. Rows marked "Tn" cite that task's verification on `pnpm dev` with the same code. axe is axe-core 4.14 from the project's own dependencies (WCAG 2.2 AA tags).

| Criterion | Result | Evidence |
|---|---|---|
| Theme, logo, nav groups, inquiry badge and Overview dashboard in place (Build Spec box 7.1) | Pass | Every Studio view is on the tokens (bone page, Inter, pill buttons, dual focus ring, light only), with our sidebar (Overview, Portfolio, Journal, Inbox, Library, Settings, Admin), the gold badge and the Overview at `/admin` (T2, T4, T5, final build) |
| The badge equals the number of `new` inquiries and updates on the next page load; hidden at 0 | Pass | T4: "Inquiries, 2 new" → "1 new" → no badge as inquiries were set to replied, back again on restore. Final build: "2 new", then "1 new" after the keyboard pass replied to one |
| Each Overview panel shows correct seeded data; each link opens the right view | Pass | Final build: "2 new", "3 unpublished" (2 projects, 1 post), five hero slides in order, "Selected work shows the first 9 of 10 pieces…", four recent rows with chips. T5: an autosaved edit to a live project topped Recently edited as "Unpublished changes"; New project, Edit Home page, an inquiry, All posts and a recent project each opened the right view |
| Overview empty states (owner decision 4) | Pass | Fresh database before seeding: "Nothing waiting.", "No drafts.", "No hero slides published yet.", "Nothing is marked “On home” yet.", "Nothing edited yet."; no count pills, no badge, at 1440 and 390 px |
| Log-in, its errors and the failed-attempt lockout | Pass | Final build: logging in through the form sets `payload-token` HttpOnly, `SameSite=Lax`, `Secure`. T6: blank fields mark only the blank ones; wrong details show "That email and password don't match." with focus on the alert, the email kept and the password cleared; a throwaway user locked after 5 wrong tries (`lock_until` set) and the right password then showed the lock message |
| Redirects stay in the Studio | Pass | T6: `?redirect=/admin/collections/posts` landed there; `?redirect=https://example.com` landed on `/admin`; a logged-in visit to `/admin/login` went to `/admin` (or to a safe `?redirect=`). Unit tests cover `//`, `/\`, `/%2F`, `javascript:` and non-Studio paths |
| Log-in without JavaScript | Not possible (recorded) | Payload's admin layout renders every view on the client: the server HTML body of `/admin/*` is empty and the content is only in the RSC payload, Payload's own log-in included (T6). The form still posts to a server action; no client fetch code |
| Create-first-user while `users` is empty (invariant 10) | Pass | Final build and T6: `/admin/login` went to `/admin/create-first-user` on an empty `users` table |
| "Forgot password?" sends a reset email | Fixed; preview re-check pending | Locally the link opens Payload's view and submitting logged "Email attempted without being configured. To: 'qa@example.com', Subject: 'Reset Your Password'". On the PR #37 preview the email arrived through Resend, but its link was relative (`/admin/reset/…`, opened as `http:///admin/reset/…`): with `serverURL` unset, Payload links from the Host header only for an allow-listed origin. The users collection now sends its own reset email whose link uses the trusted email base URL (`adminBaseUrl`), never the Host header (unit-tested) |
| Screens 20, 20--error, 21 and 42 match their captures at 1440 px | Pass, with recorded deviations | Screenshots against the captures (T4, T5, T6, final build). The sidebar was opened first: Payload starts it closed on each full load up to 1440 px (owner decision 10). Deviations are recorded in `docs/design/README.md` |
| Screens 20 and 21 match at 390 px; all four work at 390 px with no horizontal scroll | Pass | 21 at 390 px without its stacked sidebar (owner decision 9). No horizontal scroll at 320, 390, 768, 1024 and 1440 px on the log-in (both states), the Overview and forgot. With the phone drawer open, Payload's own layout lets the page scroll sideways behind it; identical with Payload's default nav (T4) |
| Keyboard pass of the admin's main flows | Pass after one fix | Final build, keyboard only: logged in (Email is the first stop after Back to the site), Overview → a draft project (Tab, Enter), title edited and published (Publish changes reached by Tab; REST `_status: published`), an inquiry opened from the list, status set to Replied in the select and saved, sidebar opened with the menu button, Log out → `/admin/login` with the cookie cleared. Every stop showed the ring except Payload's select fields, now fixed (below) |
| axe: no WCAG 2.2 AA violations on the themed views | Pass on P5 views; Payload exceptions recorded | 0 violations on the log-in (default and error), forgot, the Overview and the sidebar at 1440 and 390 px. The project editor and inquiries list report only findings inside Payload's components, identical to the pre-P5 baseline taken in T2 (list below) |
| No admin stylesheet rule hard-codes a colour value | Pass | No hex or `rgb()` in `custom.scss` or `src/components/studio/*.css` |
| `next build`: public routes keep their rendering (invariant 22) | Pass | `/`, `/about`, `/portfolio`, `/journal` and `/book` ○; collection, project, `/journal/page/[n]` and `/journal/[slug]` ● |
| The full seed (P0–P4) fills a fresh database; a second run creates nothing | Pass | Run 1 created 54 docs, run 2 created 0: 23 projects, 12 posts, 4 disciplines, 4 categories, 4 inquiries, 7 media, 1 version each of `home` and `about`; `users` held only the QA editor (the seed creates none) |
| DoD: code health | Pass | typecheck, lint, 405 unit tests (45 new in P5) |
| DoD: Vercel preview | Pending | The branch is not pushed yet (owner to approve the push and PR) |

### Fixes made during QA

- **The app header's lens icon was cropped to a "C".** Payload's breadcrumb home slot is 18 px and StudioBrand's icon was `--mark-size` (26 px); the icon now fills the slot (`StudioBrand.module.css`).
- **The password-reset email linked to a relative URL** (found by the owner on the preview, a bug since P3 added Resend). `Users.ts` sets `auth.forgotPassword.generateEmailHTML` to `resetPasswordEmailHtml` (`src/lib/studioLogin.ts`): an absolute link from `adminBaseUrl()` (`NEXT_PUBLIC_SERVER_URL`, else the Vercel branch or deployment URL), escaped; wording in `copy.ts`.
- **Payload's select fields showed no keyboard focus ring.** react-select keeps focus on an inner input and forces `outline: 0 !important` on the control; `custom.scss` now draws the dual ring on `.rs__control` as two shadows while its input is `:focus-visible` (mouse clicks show no ring).

### Studio accessibility (same policy as P0–P4)

These sit inside Payload's built-in components and go to P6 (screens 22–31) and upstream Payload. They match the pre-P5 baseline:

- Project editor: array and block row headers without a name (`aria-command-name` ×15), react-select indicators inside `aria-hidden` (`aria-hidden-focus` ×14), the Lexical editor (`aria-input-field-name` ×2), unnamed popup, upload and row buttons (`button-name` ×26), the Versions tab (`label-content-name-mismatch` ×1), react-select inputs without a label (`label` ×7), document tabs (`list` ×1); at 390 px also the document controls strip (`scrollable-region-focusable` ×1) and the upload card's edit/remove buttons (`target-size` ×10).
- Inquiries list: row checkboxes without a name (`label` ×4).
- Payload's resting field border is `--color-studio-card-border` (1.5:1 on white, as Payload's own grey); a 3:1 field edge in Payload's editors is left to P6.

### Deferred owner checks

These are recorded as deferred, not passed:

- the Vercel preview: `checks` and `Vercel` green, the Studio browsed on the preview, and a real reset email through Resend (to the Resend account's address while the test sender is in use);
- a screen-reader pass of the sidebar badge, the Overview panels and the log-in alert;
- the sidebar drawer on a real phone.

### Follow-ups

- Push the P5 branches and open the PR into `dev` (owner approval); when the preview rows pass, set Status to `Done` here and in `docs/specs/README.md`.
- P6: Payload's field edges (3:1), the exceptions above, and screens 22–31.
- `next.config.ts` now sets `logging.serverFunctions: false`, so the dev server no longer prints Server Function arguments (the typed email on the log-in and Book Me forms).
