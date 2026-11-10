# Traps

Gotchas actually hit while building, with the fix that worked. Versions: Next.js 16.4.1, Payload 3.93.0, pnpm 11.10.0, Vercel CLI 65.

## Tooling

- **pnpm 11 ignores the `pnpm` field in `package.json`.** `onlyBuiltDependencies` there is skipped and install fails with `ERR_PNPM_IGNORED_BUILDS`. Put `allowBuilds: { esbuild: true }` in `pnpm-workspace.yaml`.
- **`next dev` (16.4) appends an agent-rules block to `AGENTS.md`.** It is re-added if removed. It sits outside Pi's managed markers; it is committed.
- **`eslint-config-next` 16 ships flat configs.** The template's `FlatCompat` import of `@eslint/eslintrc` fails under pnpm's strict layout. Import `eslint-config-next/core-web-vitals` and `/typescript` directly.
- **zsh:** quote URLs containing `?` (otherwise "no matches found"), and pass flags as separate words: a variable holding `--flag value` reaches the program as one argument.

## Vercel

- **New projects default to Node 26 and the "Other" framework preset.** Fixed in the repo with `engines.node: ^22.23.4` and `framework: nextjs` in `vercel.json`.
- **The project's first Git deployment was built as production**, even though it came from a PR branch. It failed safely because production has no `PAYLOAD_SECRET`. Fix: `vercel redeploy <deployment> --environment preview`.
- **CLI quirks:**
  - `vercel git connect <url>` fails to parse an SSH-alias remote (`git@github-personal:…`) even when given a URL; run it from a directory that is not a git repo, with `--project`.
  - `vercel link` and `vercel blob create-store` append `.env*` to `.gitignore`, which would hide `.env.example`. Revert that line; `.env*.local` already covers `.env.local`.
  - `vercel blob` commands inside the linked folder want `BLOB_STORE_ID` next to the OIDC token. Run them from an unlinked folder with `BLOB_READ_WRITE_TOKEN` set.
- **`vercel curl` may add a protection-bypass secret** to the project. It hasn't been used; protected previews are checked in a browser.

## Neon

- **Installing Neon with the CLI does not turn on preview branching.** Previews then share the `main` (production) branch; one early preview migrated `main` this way (schema only, no data). The setting can only be chosen in the dashboard when connecting the project. Verify it via `GET /v1/storage/stores/<id>`: `projectsMetadata[].deployments.actions` must include `Neon` for `preview`.
- **The Free plan allows 10 branches.** Previews then fail before building with `BUILD_FAILED` "Resource provisioning failed". Delete the preview deployments of merged branches and redeploy (see `dev-workflow.md`).
- Migrating over Neon's **pooled** `POSTGRES_URL` works; no unpooled URL is needed for `payload migrate`.

## Payload

- **Payload `serverURL` and CSRF.** <a id="payload-serverurl-and-csrf"></a>Setting `serverURL` adds it to Payload's CSRF allowlist, and the admin session is then ignored on any other origin, such as per-deployment preview URLs. It stays unset: live preview uses a relative `/next/preview?…` URL (the Studio resolves it against the current origin) and `RefreshRouteOnSave` gets `window.location.origin`, so no `serverURL` or `csrf` list is needed (P1, verified on a local production build).
- **`migrate:create` diffs the committed JSON snapshot**, not a database, and the migrate CLI sets `PAYLOAD_MIGRATING` so it never pushes.
  - Generated migrations contain whitespace that `git diff --check` flags; leave them as generated and exclude `src/migrations`.
  - It bakes the Blob prefix of the generating machine into the `media.prefix` column default (`'local'`). Harmless: Payload sets the prefix on every create.
- **Browser (client) uploads:**
  - The Blob token Payload issues has no size limit, and Payload uses the size the browser declares. The real size is measured in a `beforeOperation` hook.
  - Files land under `<prefix>/<uuid>/`, with all four sizes beside them.
- **Rejected client uploads leave orphans.** <a id="rejected-client-uploads-leave-orphans"></a>The browser has already put the file in Blob when the server refuses it (e.g. over 25 MB). Delete such files manually.
- **`adminThumbnail: 'thumb'` returns 500** with `disablePayloadAccessControl`: it points at `/api/media/file/…`, which then looks on local disk. Use a function that returns the Blob `thumb` URL.
- **Deleting a media item used as the required default SEO image fails with a 500** (database NOT NULL on `site_settings.default_meta_image_id`). Nothing is lost. Choose another image in site-settings first.
- **`revalidatePath` only works inside a Next.js request.** Scripts and seeds pass `context.disableRevalidate`.
- **`previousDoc` in hooks is the latest *version*, not the published doc.** With autosave it is often a draft that already holds the new slug, so `previousDoc.slug !== doc.slug` misses renames on publish. What the public sees is the **main row**: draft and autosave saves only write versions, while publish, unpublish and delete rewrite it. Read it with `findByID({ draft: false, overrideAccess: true, req })` in `beforeChange` and compare it after the save (`src/hooks/revalidateProject.ts`).
- **Nested Local API calls replace `req.context`.** `createLocalReq` sets `req.context` to a spread copy whenever a call is given `req`, so writing to a hook's own `context` argument *after* such a call stores data on a stale object that later hooks never see. Write to `req.context` after the call; later copies spread existing keys. Test fakes must mimic the replacement, or they miss the bug.
- **`slugField` (experimental) can't create without a slug.** Its slug is generated in a `beforeChange` hook on the hidden `generateSlug` checkbox, but field validation runs alongside the hooks (`Promise.all` in `traverseFields`), so any non-draft create without a slug fails "required" (REST, Local API, Studio). Fix: a `beforeValidate` hook on the slug field that fills `toSlug(title)` on create (`src/fields/slug.ts`).
- **Payload's default slugify** keeps double hyphens and drops accented letters ("Film & Video" → `film--video`). Pass `slugify` to `slugField` (we use `toSlug` in `src/lib/slug.ts`).
- **The generated down migration for P1 fails.** It drops `projects`/`disciplines` with `CASCADE` before `DROP CONSTRAINT payload_locked_documents_rels_*_fk`, which CASCADE already removed. The up migration is fine and is all Vercel runs. Generated files stay unedited; roll back by restoring the Neon branch, or hand-fix with `IF EXISTS` if ever needed.
- **SEO plugin `tabbedUI`** keeps sidebar fields top-level only when the collection's first field is a `tabs` field; otherwise it moves every field, sidebar ones included, into its "Content" tab.
- **Lexical's link check accepts `javascript:`** (`validateUrl` only demands a dot for http/https/ftp), and the default `LinkJSXConverter` writes `fields.url` unchanged into `href`. Override the link `url` validator and the `link`/`autolink` converters (`src/blocks/story.ts`, `StoryBlocks`).
- **Hook edits aren't hot-reloaded by `next dev`.** After changing a collection hook module, restart `pnpm dev` before verifying it live; the old hook kept running (a debug log never appeared).
- **`pnpm dev` with `BLOB_READ_WRITE_TOKEN=` empty rewrites `importMap.js` in a different order** (the Blob plugin is disabled). Restore the file (`git restore`) before committing unrelated work.
- **REST `where[...]` queries with curl need `-g`.** curl treats `[ ]` as URL globs and fails silently with `-s`.
- **Never print snapshots of editor pages.** The Studio's "Preview" link contains `PREVIEW_SECRET` in its URL; redact `previewSecret=…` in any QA output, and rotate the secret if it is ever shown.

## Next.js

- **Preview builds can fail transiently in `next/font/google`** (Turbopack): "Can't resolve '@vercel/turbopack-next/internal/font/google/font'" / "next/font/google queries have exactly one entry". The same commit built fine on redeploy (`vercel redeploy <deployment> --environment preview`).

- **The 404 needs JavaScript to display.** With two root layouts, `notFound()` from `(frontend)/[...slug]` is handled by Next's error-recovery path: HTTP 404, a minimal `__next_error__` HTML shell, and the page drawn from the RSC payload.
  - It is correct in any browser with JavaScript, and blank without it.
  - Neither a same-segment `not-found.tsx` nor `dynamic = 'force-static'` changes this.
  - `force-static` would also cache every random URL for a year, so the catch-all stays dynamic.
  - `global-not-found` is experimental in 16.4 and static, so it would show stale settings.
- **`next build` needs a migrated database**, because the root layout reads site-settings while prerendering.
- **`revalidatePath(path, 'layout')` targets a `layout.tsx` at that segment.** `/portfolio` has none, so discipline changes use `revalidatePath('/', 'layout')`.
- **`headers()`/`cookies()` make a page dynamic for everyone.** Read them only inside `if ((await draftMode()).isEnabled)`. Calling `draftMode()` itself keeps pages prerendered (verified in the build route table).
- **`permanentRedirect` returns a real 308** from a page server component when it runs before anything streams (verified with `curl`); inside a streamed response it falls back to a client-side meta redirect.
- **Canonical links are path-relative** until `metadataBase` is set (P7, with the domain).
- **React 19 `renderToStaticMarkup` adds `<link rel="preload" as="image">`** for early `<img>` elements, so a test regex like `/<li/g` also matches `<link`. Match exact tags.

## Studio (Payload admin)

- **Payload's default admin has accessibility gaps.** Its own CSS lives in `@layer payload-default`, so `src/app/(payload)/custom.scss` overrides it without `!important`: a focus ring (the default focus was barely visible on inputs and invisible on links), stronger help-text colours and 24 px array controls.
  - Remaining axe findings sit in Payload's markup (empty `aria-label` on row checkboxes, unnamed popup buttons, react-select labels, drag handle, document tabs) and are recorded in the P0 QA log as exceptions.
- **Vercel runtime logs carry no HTTP status codes** (`vercel logs --json` lists only console output per request). Protected previews can't be `curl`ed without a bypass, so status codes are checked on a local production build.

## Local machine

- The shell's default `node` may be a newer Homebrew version than 22; pnpm then warns about `engines`. CI and Vercel use 22.
- Writes to `.git`, the source tree and the network fail with "Operation not permitted" when the Pi build lease has expired (it lasts about 4 hours). Approve it again in Pi (`/build-lease approve`).
- Claude Code's auto mode refuses force-pushes and bulk `vercel rm` from a computed ID list. Merge `origin/dev` into a stacked branch instead of rebasing a pushed one, and run deployment cleanup commands yourself (`! npx vercel@latest rm <ids…> --yes -Q ~/.vercel-portfolio`).
- `playwright-cli` blocks `file:` URLs: serve the folder with `python3 -I -m http.server <port> --bind 127.0.0.1`. It has no touch or device emulation; dispatch synthetic touch events, then `click()`, and say so in the report.
- zsh treats `=word` as a command path: `echo ====` fails with "=== not found". Quote separators.
