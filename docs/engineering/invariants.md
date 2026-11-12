# Invariants

Rules that must not break. Each one names where it is enforced.

## Data access

1. **Public reads go through the Local API with access applied.** Front-end queries pass `overrideAccess: false` (and `draft: false` where drafts exist). Examples: `src/lib/getSiteSettings.ts`, `src/lib/portfolio.ts`, `src/lib/journal.ts`, `src/lib/pages.ts`. Anonymous project, post, `home` and `about` reads are published-only (`src/access/publishedOnly.ts`), including REST requests with `?draft=true`; an unpublished global reads as `{}`.
2. **Writes with `overrideAccess: true` happen in exactly two places:** the `submitInquiry` server action (`src/app/(frontend)/book/actions.ts`, after server-side validation in `src/lib/inquiry.ts`) and the guarded, offline seed (`src/seed/`), which has no user to act as.
3. **GraphQL stays off.** `graphQL.disable: true` in `src/payload.config.ts`, and the GraphQL routes are not present. `/api/graphql` returns 404.
4. **Public pages never call `/api`.** The REST API serves the Studio only.

## Database

5. **Push mode only on a database on this machine.** `push: isLocalDatabaseUrl(POSTGRES_URL)` in `src/payload.config.ts`. Neon changes only through committed migrations, and push and migrations are never mixed on one database.
6. **Migrations run before the build.** The Vercel build command is `pnpm payload migrate && pnpm build`; a failing migration fails the deploy.
7. **Neon is never connected to the Vercel Development environment.** Local work uses Docker Postgres.

## Seed

8. **The seed is guarded and non-destructive** (`src/seed/guard.ts`, `src/seed/index.ts`, `src/seed/portfolio.ts`, `src/seed/journal.ts`, `src/seed/pages.ts`):
   - it refuses `VERCEL_ENV=production`, and any non-local database unless `SEED_ALLOW_REMOTE=true`;
   - it never creates or changes users;
   - it never overwrites filled-in site-settings, fills `home` and `about` only while they have no version at all (published or draft), and creates media, disciplines, projects, categories and posts only when missing (found by filename or slug);
   - every write passes `context.disableRevalidate`.

## Security

9. **Secrets never enter the repo, docs, CI or logs.** Docs name environment variables only. `.env`, `.env*.local` and `.vercel/` are gitignored; `.env.example` holds names only.
10. **A deployment that may have an empty `users` table is never publicly reachable.** Payload's create-first-user screen is open while the table is empty. Previews stay behind Vercel Authentication, and production deploys stay disabled (`git.deploymentEnabled.main: false`) until P7, which creates the owner user before the site is exposed.
11. **Auth limits:** `maxLoginAttempts` 5, `lockTime` 15 minutes, no public sign-up. Cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production (`src/collections/Users.ts`).
12. **Uploads:** JPEG, PNG or WebP only (checked from the file's bytes), at most 25 MB, measured server-side for both direct and browser uploads (`src/lib/media/uploadLimit.ts`, `upload.limits.fileSize`).
13. **Links from CMS data are safe.**
    - Social URLs are http(s) only: validated on save (`src/lib/validateHttpUrl.ts`) and filtered again before rendering (`safeSocialLinks`).
    - Rich-text links are http(s), `mailto:` or site-relative only: validated on save (the link `url` field of `safeRichTextEditor`, used by the Text block and About's sections) and again at render (the `link`/`autolink` converters in `StoryBlocks`, shared through `SafeRichText`). Both use `src/lib/safeHref.ts`; anything else renders as plain text.

## Images

14. **Images load from Blob through the custom loader.** `images.loader: 'custom'` with `src/lib/media/imageLoader.ts`; Vercel image optimisation (`/_next/image`) is never called.

## Platform

15. **Vercel functions and the database share a region:** Vercel `sin1`, Neon `aws-ap-southeast-1`.
16. **Every change to `main` and `dev` goes through a PR** with `checks` and `Vercel` green (GitHub rulesets; see `dev-workflow.md`).

## Front end

17. **Accessibility basics hold on every page:**
    - one `h1` per page (on Home it is the site headline, visually hidden; slide titles are `h2`);
    - the dual focus ring from `tokens.css` is never removed;
    - every link and button is at least 44 × 44 px;
    - the site header stays outside `<main>` and outside any named `<section>` (the Home hero wraps it in a `div`), so it keeps its banner role;
    - no horizontal scroll at 320 px;
    - a link's accessible name contains its visible label (WCAG 2.5.3): cards and rows link their title and stretch its click area with `::after`, never a whole-block link named by `aria-labelledby` (axe-core 4.14 flags that as serious).
18. **Components use named tokens only**; hex values exist only in the `@primitive` layer of `src/styles/tokens.css`. The Studio stylesheet (`src/app/(payload)/custom.scss`) and `src/components/studio/*.css` hold none either.

## Drafts and embeds

19. **Drafts reach editors only.**
    - `/next/preview` enables draft mode only with a matching non-empty `PREVIEW_SECRET` (constant-time), an editor session and a site-relative path. Otherwise it returns 403 and sets no cookie, so it is never an open redirect (`src/lib/preview.ts`).
    - A page passes `draft: true` only when draft mode is on **and** `payload.auth({ headers })` returns a user, checked at render time (`src/lib/draftEditor.ts`, shared by the project, journal entry, Home and About pages). The draft-mode cookie is the same for every visitor of a deployment and never unlocks drafts on its own.
20. **Video embeds don't contact the provider before a click.** The video URL must be YouTube or Vimeo; the embed URL is rebuilt from the parsed id (`youtube-nocookie.com`, Vimeo `dnt=1`; `src/lib/video.ts`) and the iframe mounts only after the click. No provider thumbnail, preconnect or oEmbed call.

## Publishing

21. **Pages refresh, and old slugs are recorded, only when the published state changes.** Draft and autosave saves never call `revalidatePath` and never touch `previousSlugs` (`src/hooks/publishHooks.ts` for projects, posts and — through `globalPublishHooks` — the `home` and `about` globals, `src/hooks/revalidateDiscipline.ts`, `src/hooks/categoryHooks.ts`).
22. **Public pages stay static.** `headers()`/`cookies()` are read only inside the draft-mode branch of a page (`src/lib/draftEditor.ts`), and no public page reads `searchParams`; `next build` must list `/`, `/about`, `/portfolio`, `/journal` and `/book` as ○ and the collection, project, `/journal/page/[n]` and `/journal/[slug]` pages as ●. The `submitInquiry` server action doesn't make `/book` dynamic.
23. **A category in use can't be deleted.** `src/hooks/categoryHooks.ts` refuses the delete with a 400 while any post's main row uses it; otherwise the database would set those posts' required category to null.

## Inquiries

24. **Inquiries are never readable outside the Studio, and only the server creates them.** `inquiries` access (`src/collections/Inquiries.ts`): read, update and delete for the logged-in editor; create denied to everyone, the editor included. A logged-out REST request can neither read nor create one.
25. **An inquiry is saved before any email is sent, and never lost to one.** `submitInquiry` calls `payload.sendEmail` only after `payload.create` returns; send failures and timeouts are caught, logged and never retried. A failed save never answers `sent` ([ADR-0006](decisions/ADR-0006-inquiry-submission.md)).
26. **Only the form fields are stored, and no visitor data is logged.** The create writes `name`, `email`, `projectType`, `timing`, `message` and `status: 'new'`, nothing else (no IP address, user agent or other form keys). Inquiry log lines carry the inquiry ID and an error's name and HTTP status, never its message or any field (`tests/unit/inquiryAction.test.ts`).
27. **Spam gets the normal success state and saves nothing.** A filled honeypot, or a valid form sent under 3 seconds after it appeared, answers `sent` without a create (`validateInquiry` in `src/lib/inquiry.ts`).

## Studio

28. **Studio reads and writes run as the editor.** The inquiry badge, the Overview, the inbox, the filter pills and the projects `baseFilter` (`src/lib/studio.ts`) pass `overrideAccess: false` with the logged-in `user` on every Local API call; nothing in the Studio reads or writes with `overrideAccess: true` (`tests/unit/studio.test.ts`, `tests/unit/studioInbox.test.ts`). The inbox's `setInquiryStatus` server action (`src/components/studio/inboxActions.ts`), a public endpoint like every server action:
    - checks every field before any database call (status and tab from `new`, `replied`, `archived`; ids and page positive integers);
    - gets the editor from the session (`payload.auth`) and writes nothing without one;
    - updates only `status`, as that editor;
    - returns a URL built only by `inboxHref()`, so it never points outside the inbox;
    - logs the inquiry ID and the error's name only (invariant 26) (`tests/unit/inboxActions.test.ts`).
29. **The Studio log-in goes only through Payload.** `loginAction` (`src/components/studio/loginAction.ts`) calls Payload's `login()`, so the password check, the lockout (invariant 11) and the HTTP-only cookie stay Payload's. After logging in, and for a logged-in visit to `/admin/login`, it redirects only through `safeStudioRedirect` (`src/lib/studioLogin.ts`: Payload's `getSafeRedirect`, then `/admin` paths only). It logs an unexpected error's name only, never the email or password, and `next.config.ts` keeps `logging.serverFunctions: false` so the dev server never prints action arguments (`tests/unit/studioLogin.test.tsx`).
30. **Links in emails use the trusted base URL, never the request's Host header.** The inquiry alert and the password-reset email (`Users.ts` `auth.forgotPassword.generateEmailHTML` → `resetPasswordEmailHtml`) build links from `adminBaseUrl()`.
31. **The Studio keeps the dual focus ring on every focusable element**, Payload's included: `custom.scss` adds it to `:focus-visible` and, as shadows, to react-select controls (`.rs__control:has(input:focus-visible)`), which force `outline: 0 !important`. Dark mode stays off (`admin.theme: 'light'`): the Studio tokens have no dark values.
