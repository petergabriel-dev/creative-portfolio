# Conventions

How code in this repo is written. Established in Phase 0.

## Code

- TypeScript, `strict`. Import from `src/` with the `@/` alias.
- **Server components by default.** A component becomes a client component only when it needs browser interaction; none do in P0.
- Payload config lives in TypeScript:
  - collections in `src/collections/`, globals in `src/globals/`, hooks in `src/hooks/`, access helpers in `src/access/`;
  - shared logic in `src/lib/`;
  - the seed in `src/seed/`.
- Each collection and global sets its `admin.group` and `useAsTitle` from the Build Spec when it is created.
- Mark intentional shortcuts with a `// ponytail:` comment that names the limitation and the upgrade path.

## Styling

- **CSS Modules** (`Component.module.css` next to the component). No Tailwind.
- Use **semantic tokens** from `src/styles/tokens.css`. Hex values live only in its `@primitive` layer. Components never hard-code colours, sizes or spacing.
- Media queries cannot read custom properties, so breakpoints are literal in `@media` rules: the site breakpoint is `768px`; the header also uses `374px` and `1024px` (see `docs/design/components/SiteHeader.md`).
- Mobile-first: base styles are for small screens; wider layouts are added with `min-width` queries.
- Motion: colour and border transitions only, `--duration-fast`, switched off under `prefers-reduced-motion`.
- `docs/design/` specs are authoritative; `docs/design/reference/` is visual data only.

## Text

- All text that is not CMS content lives in `src/copy.ts`: nav labels, 404 copy, separators, the arrow, fallbacks.
- CMS values are trimmed and may be empty: components render nothing for a missing value rather than crash.

## Tests

- Unit tests in `tests/unit/*.test.ts(x)` run with Vitest in a node environment, with no database and no secrets, so CI can run them.
- Components are tested with `renderToStaticMarkup`; `next/link` is mocked as a plain `<a>`.
- Live behaviour (auth, uploads, migrations, layouts) is verified locally against a throwaway database and recorded in the PR.

## Dependencies and generated files

- Every dependency version is pinned exactly (no `^`/`~`). pnpm 11 build approvals live in `pnpm-workspace.yaml` (`allowBuilds`).
- Generated files are regenerated, never edited by hand: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`, `src/migrations/*`. ESLint ignores them.

## Git

- Branch per task: `<type>/p<N>-<slug>` (`feat`, `fix`, `chore`, `docs`).
- Commit subjects use `type(scope): summary`, e.g. `feat(p0): …`; one commit per task, squashed into `dev`.
- Stage exact paths. Never commit `.pi/`, `.env*` or `.vercel/`.
- Run `git diff --cached --check -- . ':!src/migrations'` (generated migrations contain whitespace inside SQL strings).
