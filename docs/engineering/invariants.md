# Invariants

Rules that must not break. Each one names where it is enforced.

## Data access

1. **Public reads go through the Local API with access applied.** Front-end queries pass `overrideAccess: false` (and `draft: false` where drafts exist). Examples: `src/lib/getSiteSettings.ts`, `src/lib/portfolio.ts`, `src/lib/journal.ts`. Anonymous project and post reads are published-only (`src/access/publishedOnly.ts`), including REST requests with `?draft=true`.
2. **Writes with `overrideAccess: true` happen in exactly two places:** the `submitInquiry` server action (P3, after server-side validation) and the guarded, offline seed (`src/seed/index.ts`), which has no user to act as.
3. **GraphQL stays off.** `graphQL.disable: true` in `src/payload.config.ts`, and the GraphQL routes are not present. `/api/graphql` returns 404.
4. **Public pages never call `/api`.** The REST API serves the Studio only.

## Database

5. **Push mode only on a database on this machine.** `push: isLocalDatabaseUrl(POSTGRES_URL)` in `src/payload.config.ts`. Neon changes only through committed migrations, and push and migrations are never mixed on one database.
6. **Migrations run before the build.** The Vercel build command is `pnpm payload migrate && pnpm build`; a failing migration fails the deploy.
7. **Neon is never connected to the Vercel Development environment.** Local work uses Docker Postgres.

## Seed

8. **The seed is guarded and non-destructive** (`src/seed/guard.ts`, `src/seed/index.ts`, `src/seed/portfolio.ts`, `src/seed/journal.ts`):
   - it refuses `VERCEL_ENV=production`, and any non-local database unless `SEED_ALLOW_REMOTE=true`;
   - it never creates or changes users;
   - it never overwrites filled-in site-settings, and creates media, disciplines, projects, categories and posts only when missing (found by filename or slug);
   - every write passes `context.disableRevalidate`.

## Security

9. **Secrets never enter the repo, docs, CI or logs.** Docs name environment variables only. `.env`, `.env*.local` and `.vercel/` are gitignored; `.env.example` holds names only.
10. **A deployment that may have an empty `users` table is never publicly reachable.** Payload's create-first-user screen is open while the table is empty. Previews stay behind Vercel Authentication, and production deploys stay disabled (`git.deploymentEnabled.main: false`) until P7, which creates the owner user before the site is exposed.
11. **Auth limits:** `maxLoginAttempts` 5, `lockTime` 15 minutes, no public sign-up. Cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production (`src/collections/Users.ts`).
12. **Uploads:** JPEG, PNG or WebP only (checked from the file's bytes), at most 25 MB, measured server-side for both direct and browser uploads (`src/lib/media/uploadLimit.ts`, `upload.limits.fileSize`).
13. **Links from CMS data are safe.**
    - Social URLs are http(s) only: validated on save (`src/lib/validateHttpUrl.ts`) and filtered again before rendering (`safeSocialLinks`).
    - Rich-text links are http(s), `mailto:` or site-relative only: validated on save (the Text block's link `url` field) and again at render (the `link`/`autolink` converters in `StoryBlocks`). Both use `src/lib/safeHref.ts`; anything else renders as plain text.

## Images

14. **Images load from Blob through the custom loader.** `images.loader: 'custom'` with `src/lib/media/imageLoader.ts`; Vercel image optimisation (`/_next/image`) is never called.

## Platform

15. **Vercel functions and the database share a region:** Vercel `sin1`, Neon `aws-ap-southeast-1`.
16. **Every change to `main` and `dev` goes through a PR** with `checks` and `Vercel` green (GitHub rulesets; see `dev-workflow.md`).

## Front end

17. **Accessibility basics hold on every page:**
    - one `h1` per page;
    - the dual focus ring from `tokens.css` is never removed;
    - every link and button is at least 44 × 44 px;
    - the site header stays outside `<main>`;
    - no horizontal scroll at 320 px;
    - a link's accessible name contains its visible label (WCAG 2.5.3): cards and rows link their title and stretch its click area with `::after`, never a whole-block link named by `aria-labelledby` (axe-core 4.14 flags that as serious).
18. **Components use named tokens only**; hex values exist only in the `@primitive` layer of `src/styles/tokens.css`.

## Drafts and embeds

19. **Drafts reach editors only.**
    - `/next/preview` enables draft mode only with a matching non-empty `PREVIEW_SECRET` (constant-time), an editor session and a site-relative path. Otherwise it returns 403 and sets no cookie, so it is never an open redirect (`src/lib/preview.ts`).
    - A page passes `draft: true` only when draft mode is on **and** `payload.auth({ headers })` returns a user, checked at render time (`src/lib/draftEditor.ts`, shared by the project and journal entry pages). The draft-mode cookie is the same for every visitor of a deployment and never unlocks drafts on its own.
20. **Video embeds don't contact the provider before a click.** The video URL must be YouTube or Vimeo; the embed URL is rebuilt from the parsed id (`youtube-nocookie.com`, Vimeo `dnt=1`; `src/lib/video.ts`) and the iframe mounts only after the click. No provider thumbnail, preconnect or oEmbed call.

## Publishing

21. **Pages refresh, and old slugs are recorded, only when the published state changes.** Draft and autosave saves never call `revalidatePath` and never touch `previousSlugs` (`src/hooks/publishHooks.ts` for projects and posts, `src/hooks/revalidateDiscipline.ts`, `src/hooks/categoryHooks.ts`).
22. **Public pages stay static.** `headers()`/`cookies()` are read only inside the draft-mode branch of a page (`src/lib/draftEditor.ts`), and no public page reads `searchParams`; `next build` must list `/portfolio` and `/journal` as ○ and the collection, project, `/journal/page/[n]` and `/journal/[slug]` pages as ●.
23. **A category in use can't be deleted.** `src/hooks/categoryHooks.ts` refuses the delete with a 400 while any post's main row uses it; otherwise the database would set those posts' required category to null.
