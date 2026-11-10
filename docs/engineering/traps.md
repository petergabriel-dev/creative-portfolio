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

- **Payload `serverURL` and CSRF.** <a id="payload-serverurl-and-csrf"></a>Setting `serverURL` adds it to Payload's CSRF allowlist, and the admin session is then ignored on any other origin, such as per-deployment preview URLs. It stays unset in P0; P1 sets it together with a `csrf` list for live preview.
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

## Next.js

- **The 404 needs JavaScript to display.** With two root layouts, `notFound()` from `(frontend)/[...slug]` is handled by Next's error-recovery path: HTTP 404, a minimal `__next_error__` HTML shell, and the page drawn from the RSC payload.
  - It is correct in any browser with JavaScript, and blank without it.
  - Neither a same-segment `not-found.tsx` nor `dynamic = 'force-static'` changes this.
  - `force-static` would also cache every random URL for a year, so the catch-all stays dynamic.
  - `global-not-found` is experimental in 16.4 and static, so it would show stale settings.
- **`next build` needs a migrated database**, because the root layout reads site-settings while prerendering.

## Local machine

- The shell's default `node` may be a newer Homebrew version than 22; pnpm then warns about `engines`. CI and Vercel use 22.
- Writes to `.git`, the source tree and the network fail with "Operation not permitted" when the Pi build lease has expired. Approve it again in Pi (`/build-lease approve`).
