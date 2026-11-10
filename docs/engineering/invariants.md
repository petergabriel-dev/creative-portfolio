# Invariants

Rules that must not break. Each one names where it is enforced.

## Data access

1. **Public reads go through the Local API with access applied.** Front-end queries pass `overrideAccess: false` (and `draft: false` where drafts exist). Example: `src/lib/getSiteSettings.ts`.
2. **Writes with `overrideAccess: true` happen in exactly two places:** the `submitInquiry` server action (P3, after server-side validation) and the guarded, offline seed (`src/seed/index.ts`), which has no user to act as.
3. **GraphQL stays off.** `graphQL.disable: true` in `src/payload.config.ts`, and the GraphQL routes are not present. `/api/graphql` returns 404.
4. **Public pages never call `/api`.** The REST API serves the Studio only.

## Database

5. **Push mode only on a database on this machine.** `push: isLocalDatabaseUrl(POSTGRES_URL)` in `src/payload.config.ts`. Neon changes only through committed migrations, and push and migrations are never mixed on one database.
6. **Migrations run before the build.** The Vercel build command is `pnpm payload migrate && pnpm build`; a failing migration fails the deploy.
7. **Neon is never connected to the Vercel Development environment.** Local work uses Docker Postgres.

## Seed

8. **The seed is guarded and non-destructive** (`src/seed/guard.ts`, `src/seed/index.ts`):
   - it refuses `VERCEL_ENV=production`, and any non-local database unless `SEED_ALLOW_REMOTE=true`;
   - it never creates or changes users;
   - it never overwrites filled-in site-settings;
   - every write passes `context.disableRevalidate`.

## Security

9. **Secrets never enter the repo, docs, CI or logs.** Docs name environment variables only. `.env`, `.env*.local` and `.vercel/` are gitignored; `.env.example` holds names only.
10. **A deployment that may have an empty `users` table is never publicly reachable.** Payload's create-first-user screen is open while the table is empty. Previews stay behind Vercel Authentication, and production deploys stay disabled (`git.deploymentEnabled.main: false`) until P7, which creates the owner user before the site is exposed.
11. **Auth limits:** `maxLoginAttempts` 5, `lockTime` 15 minutes, no public sign-up. Cookies are HTTP-only, `SameSite=Lax`, and `Secure` in production (`src/collections/Users.ts`).
12. **Uploads:** JPEG, PNG or WebP only (checked from the file's bytes), at most 25 MB, measured server-side for both direct and browser uploads (`src/lib/media/uploadLimit.ts`, `upload.limits.fileSize`).
13. **Links from CMS data are http(s) only.** Social URLs are validated on save (`src/lib/validateHttpUrl.ts`) and filtered again before rendering (`safeSocialLinks`).

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
    - no horizontal scroll at 320 px.
18. **Components use named tokens only**; hex values exist only in the `@primitive` layer of `src/styles/tokens.css`.
