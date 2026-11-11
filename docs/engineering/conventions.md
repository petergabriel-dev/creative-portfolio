# Conventions

How code in this repo is written. Established in Phase 0.

## Code

- TypeScript, `strict`. Import from `src/` with the `@/` alias.
- **Server components by default.** A component becomes a client component only when it needs browser interaction. The public site has four: `RevealMore` ("More projects"), `VideoEmbed` (click-to-load), `LivePreviewListener` (draft mode only) and `InquiryForm` (Book Me). Add another only with the same justification.
- **Forms post to server actions** through `useActionState`, so they work without JavaScript. Fields stay uncontrolled with `defaultValue` from the returned state (React resets the form after each action; a `<select>` also needs a `key` on that value to keep the choice). Focus moves in an effect with JavaScript, and through `autoFocus` in the server HTML without it.
- Payload config lives in TypeScript:
  - collections in `src/collections/`, globals in `src/globals/`, hooks in `src/hooks/`, access helpers in `src/access/`;
  - shared logic in `src/lib/`;
  - the seed in `src/seed/`;
  - shared field configs in `src/fields/` (`slugFields`), Story blocks in `src/blocks/story.ts` (shared unchanged by projects and posts);
  - story renderers in `src/components/story/`.
- **Public reads** live in `src/lib/` (`getSiteSettings.ts`, `portfolio.ts`, `journal.ts`): React `cache`, Local API, `overrideAccess: false`, `draft: false`. Pages never build their own queries with other options. The one draft path is an editor checked by `draftEditor()` (`src/lib/draftEditor.ts`).
- **Publish hooks** compare the main row before and after a save (snapshot on `req.context`, written after any nested Local API call) and act only on public-state changes. A drafts-enabled collection with public pages builds its hooks with `publishHooks({ collection, publicPaths })` (`src/hooks/publishHooks.ts`); pure path logic lives in `src/lib/publishing.ts`.
- **Whole-route refreshes** use a route pattern with `type: 'page'`, written as the route file with its group (`'/(frontend)/journal/[slug]'`); keep the patterns as constants in `src/lib/publishing.ts`.
- **Slugs** use `slugFields(useAsSlug)` from `src/fields/slug.ts`: ASCII `toSlug`, a format validator and the hidden `previousSlugs` list.
- Each collection and global sets its `admin.group` and `useAsTitle` from the Build Spec when it is created.
- Mark intentional shortcuts with a `// ponytail:` comment that names the limitation and the upgrade path.
- **Dates** are shown only through `formatDate` / `isoDate` (`src/lib/date.ts`): Asia/Singapore time, "6 Nov 2026", month names from `copy.months`.

## Styling

- **CSS Modules** (`Component.module.css` next to the component). No Tailwind.
- **Card and row links:** the title is the link (`<h2><a>` / `<h3><a>`), and `.link::after { position: absolute; inset: 0 }` inside a `position: relative` block makes the whole card clickable. Call-to-action words ("Read story", "View project") are `aria-hidden` text, not links. Never wrap a whole card in one link named by `aria-labelledby` (WCAG 2.5.3).
- Use **semantic tokens** from `src/styles/tokens.css`. Hex values live only in its `@primitive` layer. Components never hard-code colours, sizes or spacing.
- Media queries cannot read custom properties, so breakpoints are literal in `@media` rules: the site breakpoint is `768px`; the header also uses `374px` and `1024px` (see `docs/design/components/SiteHeader.md`).
- Mobile-first: base styles are for small screens; wider layouts are added with `min-width` queries.
- Motion: colour and border transitions only, `--duration-fast`, switched off under `prefers-reduced-motion`.
- `docs/design/` specs are authoritative; `docs/design/reference/` is visual data only.
- Studio CSS goes in `src/app/(payload)/custom.scss`, using Payload's theme variables (`--theme-text`, `--theme-elevation-*`) so light and dark admin themes keep contrast. The P5 theme moves it onto the design tokens.

## Text

- All text that is not CMS content lives in `src/copy.ts`: nav labels, 404 copy, separators, the arrow, fallbacks.
- CMS values are trimmed and may be empty: components render nothing for a missing value rather than crash.

## Tests

- Unit tests in `tests/unit/*.test.ts(x)` run with Vitest in a node environment, with no database and no secrets, so CI can run them.
- Components are tested with `renderToStaticMarkup`; `next/link` is mocked as a plain `<a>` and `next/image` as a plain `<img>`. Pages are tested by rendering their default export with `next/navigation` (`notFound`, `permanentRedirect`) and `next/headers` mocked. Code that calls the Local API is tested with `payload` and `@payload-config` mocked (`vi.mock`); hook tests pass the request's *current* `req.context` and replace it on every nested call, like Payload does.
- Live behaviour (auth, uploads, migrations, layouts) is verified locally against a throwaway database and recorded in the PR.

## Dependencies and generated files

- Every dependency version is pinned exactly (no `^`/`~`). pnpm 11 build approvals live in `pnpm-workspace.yaml` (`allowBuilds`).
- Generated files are regenerated, never edited by hand: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`, `src/migrations/*`. ESLint ignores them.

## Git

- Branch per task: `<type>/p<N>-<slug>` (`feat`, `fix`, `chore`, `docs`).
- Commit subjects use `type(scope): summary`, e.g. `feat(p0): …`; one commit per task, squashed into `dev`.
- Stage exact paths. Never commit `.pi/`, `.env*` or `.vercel/`.
- Run `git diff --cached --check -- . ':!src/migrations'` (generated migrations contain whitespace inside SQL strings).
