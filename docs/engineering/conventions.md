# Conventions

How code in this repo is written. Established in Phase 0.

## Code

- TypeScript, `strict`. Import from `src/` with the `@/` alias.
- **Server components by default.** A component becomes a client component only when it needs browser interaction. The public site has five: `RevealMore` ("More projects"), `VideoEmbed` (click-to-load), `LivePreviewListener` (draft mode only), `InquiryForm` (Book Me) and `HeroSlider` (Home). Add another only with the same justification. A client component gets plain, serializable props built on the server (e.g. `heroSlides()` in `src/lib/heroSlides.ts`) and imports no server code.
- **Forms post to server actions** through `useActionState`, so they work without JavaScript. Fields stay uncontrolled with `defaultValue` from the returned state (React resets the form after each action; a `<select>` also needs a `key` on that value to keep the choice). Focus moves in an effect with JavaScript, and through `autoFocus` in the server HTML without it.
- Payload config lives in TypeScript:
  - collections in `src/collections/`, globals in `src/globals/`, hooks in `src/hooks/`, access helpers in `src/access/`;
  - shared logic in `src/lib/`;
  - the seed in `src/seed/`;
  - shared field configs in `src/fields/` (`slugFields`), Story blocks in `src/blocks/story.ts` (shared unchanged by projects and posts);
  - story renderers in `src/components/story/`; rich text anywhere on the site renders through `SafeRichText` (safe link converters, story Text styles), and its field uses `safeRichTextEditor` from `src/blocks/story.ts`.
- **Public reads** live in `src/lib/` (`getSiteSettings.ts`, `portfolio.ts`, `journal.ts`, `pages.ts`): React `cache`, Local API, `overrideAccess: false`, `draft: false`. Pages never build their own queries with other options. The one draft path is an editor checked by `draftEditor()` (`src/lib/draftEditor.ts`). Global reads return `{}` while unpublished, so their result is typed `Partial<…>`.
- **Publish hooks** compare the main row before and after a save (snapshot on `req.context`, written after any nested Local API call) and act only on public-state changes. A drafts-enabled collection with public pages builds its hooks with `publishHooks({ collection, publicPaths })`, and a drafts-enabled global with one page with `globalPublishHooks({ slug, path })` (both in `src/hooks/publishHooks.ts`); pure path logic lives in `src/lib/publishing.ts`.
- **Whole-route refreshes** use a route pattern with `type: 'page'`, written as the route file with its group (`'/(frontend)/journal/[slug]'`); keep the patterns as constants in `src/lib/publishing.ts`.
- **Slugs** use `slugFields(useAsSlug)` from `src/fields/slug.ts`: ASCII `toSlug`, a format validator and the hidden `previousSlugs` list.
- Each collection and global sets its `admin.group` and `useAsTitle` from the Build Spec when it is created.
- **Studio components** (P5, P6) live in `src/components/studio/`. App-wide ones are wired in `src/payload.config.ts` (`admin.components`: `Nav`, `graphics`, `views`); collection and field ones in their own config (`admin.components.views.list` on inquiries, `beforeListTable` on projects, a field's `admin.components.Field` on `site-settings.accent`). After changing any of that wiring, run `pnpm generate:importmap` with the normal `.env` and commit `importMap.js`; a dev server started with an empty `BLOB_READ_WRITE_TOKEN` rewrites it in a different order, so discard that churn.
- **Studio reads and writes** run as the logged-in editor (`overrideAccess: false`, `user`), never through `src/lib/` public reads. Reads live in `src/lib/studio.ts`; pure helpers take `payload` and `user` as arguments so tests pass a fake, and URL parsing and building for a view live in their own pure module (`src/lib/studioInbox.ts`). A Studio write is a server action next to its component (`inboxActions.ts`) that validates every field against an allowlist, gets the editor from `payload.auth({ headers })` and returns state instead of redirecting.
- **Studio client components** are split into a pure view that takes plain props (rendered in tests with `renderToStaticMarkup`) and a thin wrapper for the hooks (`useField`, `useActionState`, `useRouter`), as `StudioAccentSwatches` and `StudioInboxActions`.
- **Studio editor layout** uses only layout options that store nothing (P6 owner decision 1): unnamed `group` (a card), `row`, `collapsible`, unnamed `tabs`, `admin.position: 'sidebar'`, `admin.width`, `label`, `admin.description`. Keep the `tabs` field first where the SEO plugin adds its tab (traps.md). Check a layout change with `pnpm payload migrate:create <name> --skip-empty` (no file written) and `pnpm generate:types` (same properties).
- Mark intentional shortcuts with a `// ponytail:` comment that names the limitation and the upgrade path.
- **Dates** are shown only through `formatDate` / `isoDate` (`src/lib/date.ts`): Asia/Singapore time, "6 Nov 2026", month names from `copy.months`.

## Styling

- **CSS Modules** (`Component.module.css` next to the component). No Tailwind.
- **Card and row links:** the title is the link (`<h2><a>` / `<h3><a>`), and `.link::after { position: absolute; inset: 0 }` inside a `position: relative` block makes the whole card clickable. Call-to-action words ("Read story", "View project") are `aria-hidden` text, not links. Never wrap a whole card in one link named by `aria-labelledby` (WCAG 2.5.3).
- Use **semantic tokens** from `src/styles/tokens.css`. Hex values live only in its `@primitive` layer. Components never hard-code colours, sizes or spacing.
- Media queries cannot read custom properties, so breakpoints are literal in `@media` rules: the site breakpoint is `768px`; the header also uses `374px` and `1024px` (see `docs/design/components/SiteHeader.md`).
- Mobile-first: base styles are for small screens; wider layouts are added with `min-width` queries.
- Text that only screen readers need (Home's `h1`, a project title added to a caption link) uses the global `.visually-hidden` class from `src/styles/globals.css`.
- **Variants over copies:** a shared component that needs another look on one page gets a `variant` prop whose default renders exactly the old markup (CollectionTile `home`, JournalRow `card`).
- Motion: colour and border transitions only (and the hero's progress width), `--duration-fast`, switched off under `prefers-reduced-motion`.
- `docs/design/` specs are authoritative; `docs/design/reference/` is visual data only.
- **Studio CSS** (P5): Payload's own views are themed in `src/app/(payload)/custom.scss` by mapping Payload's CSS variables onto the Studio tokens (`--color-studio-*`), with no colour literals. Every Payload class it targets is listed in its header comment; prefer a variable to a class. Never `!important` or colour values: a colour Payload or a plugin writes inline is recorded as an exception instead (P6). Our Studio components use CSS Modules with the same tokens and set their own `font-size` (Payload's base is 13 px). The admin is light only (`admin.theme: 'light'`).

## Text

- All text that is not CMS content lives in `src/copy.ts`: nav labels, 404 copy, separators, the arrow, fallbacks.
- CMS values are trimmed and may be empty: components render nothing for a missing value rather than crash.

## Tests

- Unit tests in `tests/unit/*.test.ts(x)` run with Vitest in a node environment, with no database and no secrets, so CI can run them.
- Components are tested with `renderToStaticMarkup`; `next/link` is mocked as a plain `<a>` and `next/image` as a plain `<img>`. Pages are tested by rendering their default export with `next/navigation` (`notFound`, `permanentRedirect`) and `next/headers` mocked. Code that calls the Local API is tested with `payload` and `@payload-config` mocked (`vi.mock`); hook tests pass the request's *current* `req.context` and replace it on every nested call, like Payload does.
- CSS Module classes render hashed in tests (`_title_c2a338`), and the `next/link` mock writes `href` before `class`: match markup with regexes such as `/<a href="…" class="_link_\w+">/`.
- Live behaviour (auth, uploads, migrations, layouts) is verified locally against a throwaway database and recorded in the PR.

## Dependencies and generated files

- Every dependency version is pinned exactly (no `^`/`~`). pnpm 11 build approvals live in `pnpm-workspace.yaml` (`allowBuilds`).
- Generated files are regenerated, never edited by hand: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`, `src/migrations/*`. ESLint ignores them.

## Git

- Branch per task: `<type>/p<N>-<slug>` (`feat`, `fix`, `chore`, `docs`).
- Commit subjects use `type(scope): summary`, e.g. `feat(p0): …`; one commit per task, squashed into `dev`.
- Stage exact paths. Never commit `.pi/`, `.env*` or `.vercel/`.
- Run `git diff --cached --check -- . ':!src/migrations'` (generated migrations contain whitespace inside SQL strings).
