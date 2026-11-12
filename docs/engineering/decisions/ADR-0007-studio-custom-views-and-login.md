---
id: ADR-0007
title: Studio custom views - own log-in on Payload's login(), own sidebar and Overview
status: Active
date: 2026-11-12
readWhen: changing the Studio log-in, sidebar, Overview or theme; touching Payload admin components, auth, redirects or password-reset email; upgrading Payload
---

# ADR-0007: Studio custom views - own log-in on Payload's login(), own sidebar and Overview

## Decision

- **Own log-in view** (P5 owner decisions 5 and 6, 2026-11-11). `admin.components.views.login` renders `StudioLogin`. Its form posts through `useActionState` to a server action (`loginAction`) that calls Payload's `login()` from `@payloadcms/next/auth`. Payload keeps the password check, the lockout (5 tries, 15 minutes) and the HTTP-only cookie from `Users.ts`; the action only validates the form, maps `LockedAuth` and `AuthenticationError` to the owner's messages, and redirects. A locked account gets its own message (owner-accepted: it confirms the email is the editor's). Forgot and reset stay Payload's views.
- **Redirects stay in the Studio.** After logging in, and for a logged-in visit to `/admin/login`, the target is `safeStudioRedirect`: Payload's `getSafeRedirect`, then `/admin` paths only.
- **No credentials in logs.** The action logs an unexpected error's name only, and `next.config.ts` sets `logging.serverFunctions: false`, because Next's dev server otherwise prints each Server Function call with its arguments (the typed email).
- **Reset-email links from the trusted base URL.** `serverURL` stays unset ([traps.md](../traps.md#payload-serverurl-and-csrf)), so Payload's own reset email linked relative; `Users.ts` sets `auth.forgotPassword.generateEmailHTML` to `resetPasswordEmailHtml`, which builds the link from `adminBaseUrl()`, never the Host header.
- **Own sidebar** (owner decision 7). `admin.components.Nav` is `StudioNav`, a server component inside Payload's exported `NavWrapper` and `NavHamburger`: our groups, current link and the "N new" inquiries badge (one `count` per render, hidden at 0, no index on `status`; owner decision 8). Payload's open/closed behaviour is kept (owner decision 10): closed on each full load up to 1440 px, a full-width drawer up to 768 px (owner decision 9).
- **Own Overview** (owner decisions 1–4). `admin.components.views.dashboard` is `StudioOverview`, fed by `studioOverview()` in `src/lib/studio.ts`: every read as the editor (`overrideAccess: false`, `user`), at most nine Local API calls. Counts and live status come from main rows; rows show each doc's latest version, with Published, Draft and Unpublished changes chips.
- **Theme through variables.** The admin loads `tokens.css` and the site fonts; `custom.scss` maps Payload's CSS variables onto Studio tokens and lists each Payload class it still targets. Light only (`admin.theme: 'light'`).
- **Payload stays pinned at 3.93.0**; these views and class overrides are checked on every Payload upgrade.

## Why

- Payload's log-in form reports errors only as toasts; capture 20--error needs an inline message tied to the form, focus on it, and red field edges. CSS can't change that, so the view is ours, but the security-critical part (password check, lockout, cookie) stays in Payload's `login()` rather than being reimplemented.
- A server action matches the Book Me form convention and needs no client fetch code. (A log-in without JavaScript was the hope; Payload's admin renders every view on the client, so the Studio needs JavaScript regardless.)
- Payload's nav has no slot for a badge on one link; replacing only the nav content while reusing `NavWrapper`/`NavHamburger` keeps Payload's drawer and state machinery.
- Autosave writes a live doc's edits to its versions only, so an Overview built on main rows would miss work in progress and show stale draft titles.
- A reset link built from the request's Host header can be pointed at another site (host-header poisoning); the email base URL comes from deployment environment variables.

## Affects

Docs:

- `docs/specs/phase-5-studio-shell.md`
- `docs/specs/README.md`
- `docs/design/README.md`
- `docs/design/components/StudioNav.md`
- `docs/design/components/StudioOverview.md`
- `docs/design/components/StudioLogin.md`
- `docs/engineering/architecture.md`
- `docs/engineering/conventions.md`
- `docs/engineering/invariants.md`
- `docs/engineering/traps.md`
- `docs/engineering/decisions/ADR-0002-vertical-phase-delivery.md` (referenced, not superseded: the Studio is still Payload's admin, with custom views where the Build Spec asks for them)

Code:

- `src/payload.config.ts`
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/custom.scss`
- `src/app/(payload)/admin/importMap.js`
- `src/components/studio/StudioNav.tsx`
- `src/components/studio/StudioBrand.tsx`
- `src/components/studio/StudioOverview.tsx`
- `src/components/studio/StudioLogin.tsx`
- `src/components/studio/StudioLoginForm.tsx`
- `src/components/studio/loginAction.ts`
- `src/lib/studio.ts`
- `src/lib/studioLogin.ts`
- `src/collections/Users.ts`
- `src/copy.ts`
- `next.config.ts`

## Consequences

- Good: the Studio log-in matches captures 20 and 20--error, announces its errors and never redirects off the Studio; lockout and cookies are exactly Payload's.
- Good: the Overview shows real work in progress, and the badge costs one count per page.
- Good: password-reset links work on every preview and in production without setting `serverURL`.
- Bad/risk: the log-in view, sidebar and the classes in `custom.scss` depend on Payload internals (`views` keys, `NavWrapper`, the `minimal` template, `.nav*`, `.rs__control`); a Payload upgrade can break them. Pinning and the class list in `custom.scss` make that check explicit.
- Bad/risk: the Studio needs JavaScript; a log-in without it would need a page outside Payload's admin.
- Bad/risk: up to 1440 px the sidebar starts closed on each full load, unlike captures 21 and 42 (owner-accepted).
