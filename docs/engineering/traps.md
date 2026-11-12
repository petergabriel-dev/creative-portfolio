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

- **A required relationship in a drafts-enabled collection is a nullable column with `ON DELETE set null`** (drafts may be incomplete). Deleting a category would silently clear it from every post (`posts.category_id`, migration `20261111_040428_p2_journal`); `src/hooks/categoryHooks.ts` blocks the delete instead (P2).
- **Defaulting a required field on publish** (`posts.publishedAt`) must happen in a field `beforeValidate` hook, like the slug fix above. The hook sees `data._status === 'published'` on a publish from the Studio, REST and the Local API, and nothing on draft or autosave saves (verified live, P2).
- **`payload.create({ draft: Boolean(x) })` fails typecheck when required fields are missing** ("Type 'boolean' is not assignable to type 'true'"). Use two calls: `draft: true` for the draft, all required fields for the published one (`src/seed/journal.ts`).
- **Anonymous REST `?draft=true` does not leak drafts:** with `publishedOnly` read access it returns only docs whose latest version is published, hides a published doc that has a newer draft (also by id), and `/api/<collection>/versions` is 403 (verified for posts and projects, P2).

- **A collection can define its own `createdAt`** (e.g. to label it "Received" and show it in the sidebar): Payload then skips its built-in timestamp field, and `@payloadcms/drizzle` still fills the value on create (P3).
- **`@payloadcms/email-resend` has no timeout** (a bare `fetch`) and throws `APIError` with a `status` and a message that echoes Resend's error, which can include addresses. Bound the send yourself and log only `name`/`status` (P3, ADR-0006).
- **A draft save of a global never touches its main row** (`payload/dist/globals/operations/update.js`: `isSavingDraft` skips `db.updateGlobal`/`createGlobal`); only publish and unpublish rewrite it. So the main-row `updatedAt` compare works for globals too (`globalPublishHooks`), and a global that was only ever saved as a draft has no main row at all (verified live, P4).
- **A draft (autosave) save of a collection doc never touches its main row either** (`payload/dist/collections/operations/utilities/update.js`: `if (!isSavingDraft)` guards `db.updateOne`). A live doc's pending edits, and every save of a draft-only doc after the first, exist only in its versions, so the main row's title and `updatedAt` go stale. The Studio's Drafts and Recently edited read the latest versions (`findVersions` with `latest: true`, one row per doc) and use the main row only for whether the doc is live (P5).
- **An editor's `findGlobal({ draft: false })` returns the main row even while the global is unpublished** (its `_status` is `draft`), unlike an anonymous read, which gets `{}`. Check `_status === 'published'` before showing it as live (the Overview's hero slides, P5).
- **Payload's password-reset email links relative while `serverURL` is unset.** `getRequestOrigin` (`payload/dist/utilities/getRequestOrigin.js`) uses the Host header only for an origin on a CORS/CSRF allowlist, else `''`, so the link was `/admin/reset/<token>` and Gmail opened `http:///admin/reset/…` (found on the PR #37 preview; broken since P3). `Users.ts` now builds the email with `adminBaseUrl()` (`auth.forgotPassword.generateEmailHTML`); never build it from the Host header.
- **Custom admin views replace built-ins by key** (`admin.components.views.login`, `.dashboard`; `views/Root/getRouteData.js` checks custom views first) and still render in the built-in template: the log-in in the `minimal` template, which centres a 480 px column and gets the class `login` (`.template-minimal.login` in `custom.scss` lets ours fill the screen). Create-first-user is handled by RootPage before any view.
- **`graphics.Logo` appears only on Payload's login and verify views**; forgot, reset and create-first-user have no logo. `graphics.Icon` is the app header's breadcrumb home link, an 18 px slot (size the icon to 100%, P5).
- **An unpublished global reads as `{}`**, not an error: with a `Where` access result and no matching row, `findGlobal` returns an empty object (`globals/operations/findOne.js`, Postgres). Type such reads `Partial<…>` and render an empty state (P4).
- **Upload filenames clash with files on disk, even with Blob storage.** `getSafeFileName` (`payload/dist/uploads/getSafeFilename.js`) renames an upload (`seed-frame-55.webp`) whenever `<staticDir>/<name>` exists locally, and the gitignored `./media` folder fills up with seed files from QA runs with an empty `BLOB_READ_WRITE_TOKEN`. The seed finds media by filename, so it then re-creates its media on every run. For a clean idempotency check, move `./media` aside, seed a fresh database twice, and put the folder back (P4).

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
- **A page's `openGraph: undefined` wipes the layout's Open Graph tags.** Next replaces a parent's `openGraph` with any key the page returns, even an undefined one, so a page without its own image lost the default image and every `og:` tag. Leave the key out instead (`pageMetadata` in `src/lib/seo.ts`; found in the P1 QA pass).
- **React 19 `renderToStaticMarkup` adds `<link rel="preload" as="image">`** for early `<img>` elements, so a test regex like `/<li/g` also matches `<link`. Match exact tags.

- **`revalidatePath` route patterns must include the route group.** Next tags each page with its file path (`/(frontend)/journal/[slug]/page`, `next/dist/server/lib/implicit-tags.js`) and `revalidatePath` does not strip groups, so `revalidatePath('/journal/[slug]', 'page')` matches nothing. Use `'/(frontend)/journal/[slug]'` (verified live: a publish regenerated `/journal/page/2`, and unpublishing a project dropped its link from entries; ADR-0005).
- **A folder named `page`** (`src/app/(frontend)/journal/page/[n]/page.tsx`) is a normal segment; only `page.tsx` files are special (`next build` lists `/journal/page/[n]` as ●).

- **React 19 resets a form after its action.** Uncontrolled inputs and textareas return to their `defaultValue`, so pass the returned values as `defaultValue` to keep what the visitor typed. A `<select>` returns to the option it was **first** rendered with, even when `defaultValue` changes; give it `key={value}` so it remounts with the returned choice (found in the P3 live check: "Film & Video" was lost after an invalid submit).
- **`autoFocus` only works in server HTML here.** React's server render writes `autofocus=""` (also on a heading or paragraph with `tabIndex={-1}`), which moves focus for visitors without JavaScript. On the client React applies it only when a form control mounts, never on updates or other elements, so move focus in an effect after an action result.
- **The form's `onSubmit` runs before React builds the action's `FormData`**, so a hidden input set there (`elapsedMs`) is sent (verified live, P3).
- **A no-JavaScript post of a `useActionState` server action re-renders a static page with the result**; the page stays ○ in `next build` (P3).
- **Next 16's dev server prints every Server Function call with its arguments** (`└─ ƒ loginAction({"email":"…",…}, {})`), so a `useActionState` action's previous state, with the typed email, landed in the terminal. `logging: { serverFunctions: false }` in `next.config.ts` turns it off (P5; passwords never appeared).
- **Spam timing before validation gives a false "thank you".** If the 3-second rule runs first, someone who clicks Send on an empty form straight away is told it was sent. Check the honeypot, then the fields, then the timing (P3).
- **Rows inside a narrow column need a container query, not a viewport media query.** At 1024 px the Book Me "Good to know" column is about 290 px, and side-by-side rows split the email address mid-word; `container-type: inline-size` with `@container (min-width: 400px)` fixed it (P3).
- **A `<header>` inside a named `<section>` is no longer the banner landmark.** The Home hero holds the SiteHeader, so its wrapper is a `div` (like ChapterOpener), not a `section aria-labelledby` (P4).
- **A partly visible button in an `overflow-x: auto` row stays clipped when it gets keyboard focus.** Chrome scrolls a focused element into view only when it is fully hidden; story cards ended up about 5% visible. `onFocus={(e) => e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })}` fixes it (HeroSlider, P4).

## Studio (Payload admin)

- **Payload's default admin has accessibility gaps.** Its own CSS lives in `@layer payload-default`, so `src/app/(payload)/custom.scss` overrides it without `!important`: a focus ring (the default focus was barely visible on inputs and invisible on links), stronger help-text colours and 24 px array controls. Since P5 all of it is on the Studio tokens.
  - P1 added readable inactive tab labels (Payload dims them to 50% opacity), upload dropzone text and the blocks field's "Add" label.
  - Remaining axe findings sit in Payload's markup (empty `aria-label` on row checkboxes, unnamed popup buttons, react-select labels, drag handles, the Lexical editor, document tabs) and are recorded in the P0 and P1 QA logs as exceptions.
- **Payload's admin renders on the client.** The server HTML body of `/admin/*` is empty (the content is only in the RSC payload), so no Studio screen, Payload's log-in included, works without JavaScript, and `curl` sees `200` where the browser is redirected (create-first-user) (P5).
- **Payload's admin text is 13 px.** Our Studio components set their own base `font-size`; unsized text in them came out at 13 px (P5).
- **react-select forces `outline: 0 !important`** on its control, so Payload's select and relationship fields showed no keyboard focus. The dual ring is drawn as two `box-shadow`s on `.rs__control:has(input:focus-visible)` (P5).
- **Payload's nav shell:** `.nav__wrap` sets `align-items: flex-start` (custom nav links shrink to their text unless the nav stretches them); `.nav__scroll`'s block-start padding is the app-header height, which keeps the template's menu button off the brand. The nav closes on every full page load up to 1440 px (`@payloadcms/ui` `Nav/context.js`, `largeBreak`) and is a full-width drawer up to 768 px; with the drawer open, the page behind it scrolls sideways (the same with Payload's default nav) (P5).
- **Payload's resting field border is `--theme-elevation-150`**, which the Studio maps to `--color-studio-card-border` (1.5:1 on white, as Payload's own grey); `--theme-elevation-250` is the hover edge. P6 gives text inputs, textareas, selects and upload boxes `--color-studio-field-border` (3:1) by class instead, since the variable is also the card border.
- **A custom list view (`admin.components.views.list`) still runs Payload's own list query first** (`@payloadcms/next/dist/views/List/index.js`), then renders the override with `payload`, `user` (field-read-filtered) and `searchParams` inside Payload's `ListQueryProvider`. The inbox ignores that query: one small wasted read per load (P6).
- **`ListQueryProvider` rewrites the list URL on load** with `history.replaceState(null, …)`: it appends `limit`, `sort` and `depth` and keeps unknown keys (`status`, `page`, `id`, `collection` survive). The `null` state wipes what Next's router stores on that history entry, and Next ignores Back/Forward to an entry without it: the URL changes, the page doesn't. `StudioInboxFocus` re-runs such a navigation with `router.replace` on a `popstate` whose state is `null` (P6, verified live). It also keeps the first URL's query in state and merges it back into the address bar after every client navigation, so a parameter a link leaves out comes back (after "All", `collection=photography` returned and a reload filtered again). Links that clear a value send it empty (`id=`, `collection=`): the empty value wins the merge and Payload's `sanitizeQuery` drops it (P6 QA).
- **Payload's list view reads latest versions** (`find({ draft: true })`), and the Local API's `count` has no `draft` option. Counts that must match the list rows (the filter pills) come from one `find({ draft: true, select })`, grouped in code (P6).
- **`admin.baseFilter`** is ANDed with the list's `where` and search, and Payload also runs it for Lexical internal-link drawers. REST ignores it (`/api/projects?collection=…` returns every project), so relationship pickers, which load through REST, are unaffected. Return `null` when the parameter is absent (P6).
- **A collection's `admin.description` shows on its list and above every edit form** (`DocumentHeader`'s `AfterHeader`), and becomes a JSDoc line in `payload-types.ts`. `pnpm dev` regenerates that file itself; commit the regenerated version (P6).
- **Unnamed `group`s, `row`s and `admin.position` store nothing**, but moving a field reorders its type's properties in `payload-types.ts`. Check with `migrate:create --skip-empty` (no file) and the types diff (same keys) (P6).
- **Restyling top-level groups as cards:** Payload bleeds them into the gutter (`margin: 0 -60px 40px`), lays the header out as a shrink-wrapped column and gives the description `width: 100%`. Untitled groups inside rows carry `.group-field--gutter` (a left rule). See the P6 section of `custom.scss` (P6).
- **Payload's upload card needs about 370 px.** In a `row`, a 25% upload beside a 75% group wraps onto two lines at 1440 px (flex items wrap before they shrink); Home and About use 30% / 33% (P6).
- **List relationship cells load their labels lazily** and show "<No Collection>" until the row scrolls into view; a screenshot at 390 px looks like missing data. Scroll each row into view before reading cells (P6).
- **The SEO plugin's checklist writes inline colours** (`#9a9a9a` help text 2.7:1, white on `#ff0000` 4.0:1). The stylesheet can't override them without `!important` and colour values (invariant 18), so they are recorded as exceptions (P6 QA log).
- **A `mailto:` link does nothing without a mail handler.** Next's `Link` leaves non-local URLs to the browser, and a browser with no `mailto:` handler (the owner uses Gmail in Brave) opens nothing, with no error to see. The inbox opens Gmail's compose window instead and offers "Copy email" (P6 owner decision 10). Scripted QA can't open a `mailto:` either: check the `href`.
- **`navigator.clipboard` needs a secure context** (https, or `localhost` in development) and may be refused; it is `undefined` on plain http. "Copy email" announces a failure line rather than staying silent. In Playwright, grant `clipboard-read` and `clipboard-write` for the origin to read it back (P6).
- **Vercel runtime logs carry no HTTP status codes** (`vercel logs --json` lists only console output per request). Protected previews can't be `curl`ed without a bypass, so status codes are checked on a local production build.

## Local machine

- The shell's default `node` may be a newer Homebrew version than 22; pnpm then warns about `engines`. CI and Vercel use 22.
- Writes to `.git`, the source tree and the network fail with "Operation not permitted" when the Pi build lease has expired (it lasts about 4 hours). Approve it again in Pi (`/build-lease approve`).
- Claude Code's auto mode refuses force-pushes and bulk `vercel rm` from a computed ID list. Merge `origin/dev` into a stacked branch instead of rebasing a pushed one, and run deployment cleanup commands yourself (`! npx vercel@latest rm <ids…> --yes -Q ~/.vercel-portfolio`).
- `playwright-cli` blocks `file:` URLs: serve the folder with `python3 -I -m http.server <port> --bind 127.0.0.1`. It has no touch or device emulation; dispatch synthetic touch events, then `click()`, and say so in the report.
- zsh treats `=word` as a command path: `echo ====` fails with "=== not found". Quote separators.
- **`playwright-cli`'s default session can be another project's browser** (a tab on another local app); `open`, `eval` and `resize` then act there. Use a named session for project QA (`playwright-cli -s=p5 …`) (P5).
- **`curl` globs square brackets**, so a Payload REST query with `where[status][equals]=new` silently returns nothing (and a PATCH to `/api/inquiries/` 308s). Pass `-g` (P5).
- **A `[role=alert]` locator also matches Next's route announcer** (`#__next-route-announcer__`), so Playwright fails in strict mode; target the alert by id (P5).
- **A dirty Studio form blocks scripted QA:** leaving it opens a `beforeunload` dialog, and every later `playwright-cli run-code` fails with "does not handle the modal state". Run `playwright-cli dialog-accept`, and start scripts that edit fields with `page.on('dialog', (d) => d.accept())` (P6).
- **`pnpm generate:importmap` and `generate:types` read `.env` only**; the Blob token lives in `.env.local`. Their output was identical with and without it in P6, but to match `pnpm dev`, load it into a subshell first: `(set -a; . ./.env.local; set +a; pnpm generate:importmap)`. Stage `importMap.js` before a QA dev server with an empty token, then `git checkout --` it afterwards (P6).

- **axe versions disagree.** P1's QA injected axe-core 4.10.2 from cdnjs and logged 0 violations; axe-core 4.14 (already in `node_modules/.pnpm`) flags whole-card links named by `aria-labelledby` as `label-content-name-mismatch` (serious, WCAG 2.5.3). Claude Code's auto mode also refuses injecting the CDN script into a page. Inject the local copy instead: `playwright-cli run-code --filename <script>` with `page.addScriptTag({ path: '<repo>/node_modules/.pnpm/axe-core@<version>/node_modules/axe-core/axe.min.js' })`, then `axe.run`.
- **Playwright clicks and `elementFromPoint` outside the viewport hit nothing**, which looks like a broken stretched link. Call `scrollIntoViewIfNeeded()` on the target before reading its box and clicking.
- **Studio live preview size menu:** Payload's breakpoint control is a popup (`.live-preview-toolbar-controls__breakpoint`), not a `<select>`; scripted option clicks timed out in P2. Check Mobile/Tablet/Desktop switching by hand.
- **Never screenshot or snapshot the Studio with the live preview open:** its frame URL carries `PREVIEW_SECRET`. Read the frame's content (e.g. its `h1`) through the DOM instead.
- macOS `sips -c H W --cropOffset 0 0` centres the crop; use `--cropOffset 1 1` for a top-left crop of long screenshots.
- `Intl.DateTimeFormat('en-GB', { month: 'short' })` writes September as "Sept" on Node 22; `formatDate` takes month names from `copy.months` (`src/lib/date.ts`).
- **Studio blank under `pnpm dev` at `127.0.0.1`.** Next 16 dev blocks its dev resources for a non-allowed origin, so the admin rendered nothing and the HMR socket failed. Browse `http://localhost:<port>` (curl to 127.0.0.1 is fine).
- **`playwright-cli` writes `.playwright-cli/`** (snapshots, console logs) into the current folder, which is the repo; delete it before committing. Its `snapshot` can return a stale accessibility tree on Payload's edit view (fields marked disabled that are editable); trust screenshots and a real action read back through REST.
- **Check scripts run with `pnpm payload run` from outside the repo** compile as CommonJS: no top-level await, bare imports resolve from the script's folder, and CommonJS undici 7.30 fails on Node 25 with "TypeError: Illegal constructor". Name the script `.mts`, import packages by absolute `node_modules` path, and `await` the work at top level (`payload run` exits without awaiting a floating promise).
- In tests, the `next/link` mock renders `href` before the other attributes, and `Button` joins its label and trailing arrow with a non-breaking space (U+00A0); match attributes individually and the arrow with `\u00a0→`.
- **Headless `playwright-cli` Chrome reports `prefers-reduced-motion: reduce` by default**, so transitions read `0s`. Run `playwright-cli set-reduced-motion no-preference` before checking motion, and `reduce` to check that it switches off (P4).
- **Production builds minify CSS Module class names**, so browser checks with `[class*=_hero_]` find nothing. Use structural selectors (`h1.visually-hidden`, `[role=group]`, `[aria-live]`) (P4).
- **`playwright-cli goto file://…` is blocked.** Serve the repo with `python3 -I -m http.server <port> --bind 127.0.0.1` in the background (and stop it afterwards) to look at `docs/design/preview/` (P4).
- **Seeding a migrated throwaway database without push:** `NODE_ENV=production BLOB_READ_WRITE_TOKEN= POSTGRES_URL=…/<db> pnpm seed` (production turns push off, an empty token keeps uploads out of the shared Blob store), then `pnpm build` and `pnpm start -p <port>` against the same database (P4).
