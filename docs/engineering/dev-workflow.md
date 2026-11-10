# Dev workflow

How to set up, run, change and ship this project. Facts here were verified while building Phase 0 (2026-11-10).

## Prerequisites

- **Node 22**, at least 22.23.4 (`package.json` `engines`; `.nvmrc` says `22`). CI and Vercel use Node 22.
- **pnpm 11.10.0**, pinned in `package.json` `packageManager` (corepack picks it up).
- **Docker**, for the local Postgres database.

## First run

1. `pnpm install`
2. Copy `.env.example` to `.env` and fill it in (names below). For local development:
   - `POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:5432/portfolio` (the docker compose database; local-only credentials).
   - `PAYLOAD_SECRET`: any long random string, e.g. `openssl rand -hex 32`.
3. `docker compose up -d` starts Postgres 17 on `127.0.0.1:5432`.
4. `pnpm dev`, then open `http://localhost:3000/admin` and create the first user.
5. Optional: `pnpm seed` fills site-settings and one placeholder image (see [Seed](#seed)).

## Environment variables

Names only; values never go in the repo, docs, CI or logs.

| Name | Local | Preview (Vercel) | Production (Vercel) |
|---|---|---|---|
| `PAYLOAD_SECRET` | `.env` | Vercel env (secret) | not set until P7 |
| `POSTGRES_URL` | `.env` (docker) | Neon integration, per-preview branch | Neon integration, `main` branch |
| `BLOB_READ_WRITE_TOKEN` | `.env.local` (Development env) or empty | Blob store | not set until P7 |
| `NEXT_PUBLIC_SERVER_URL` | optional | not set | not set until P7 |
| `ENABLE_EXPERIMENTAL_COREPACK` | — | `1` | `1` |
| `SEED_ALLOW_REMOTE` | only to seed a non-local DB on purpose | — | never |

- Neon is **never** connected to the Development environment: local work always uses Docker Postgres.
- `.env`, `.env*.local` and `.vercel/` are gitignored. `.env.local` is written by `vercel link` / `vercel env pull`.
- Payload `serverURL` is deliberately unset in P0 (see [traps](traps.md#payload-serverurl-and-csrf)).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next.js dev server with Payload at `/admin` |
| `pnpm build` / `pnpm start` | Production build / serve it locally |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm lint` | ESLint (flat config from `eslint-config-next`) |
| `pnpm test` | Vitest unit tests in `tests/unit/` (node environment, no DB) |
| `pnpm generate:types` | Regenerates `src/payload-types.ts` after schema changes |
| `pnpm generate:importmap` | Regenerates the admin import map after adding admin components |
| `pnpm payload <cmd>` | Payload CLI (`migrate:create`, `migrate`, `migrate:status`, …) |
| `pnpm seed` | Runs `src/seed/index.ts` through `payload run` |

## Database and migrations

- **Push mode** keeps the local Docker database in sync with the code automatically. It is only enabled when `POSTGRES_URL` points at this machine (`isLocalDatabaseUrl` in `src/payload.config.ts`), so it can never touch Neon.
- **Neon** (previews and production) only ever changes through committed migrations.
- After changing a collection, global or field:
  1. Let push mode update your local DB (`pnpm dev`) and check the change.
  2. `pnpm generate:types` (and `pnpm generate:importmap` if admin components changed).
  3. `pnpm payload migrate:create <short_name>`. It diffs the code schema against the latest committed snapshot in `src/migrations/*.json`, not against a database, and the CLI never pushes.
  4. Commit the new `.ts` and `.json` files and the updated `src/migrations/index.ts`.
- The Vercel build command (`vercel.json`) is `pnpm payload migrate && pnpm build`: pending migrations run first, and a failing migration fails the deploy.
- To test migrations locally, never use the push-mode `portfolio` database. Use a throwaway one:
  ```sh
  docker compose exec -T postgres psql -U postgres -c 'CREATE DATABASE migrate_check'
  POSTGRES_URL=postgres://postgres:postgres@127.0.0.1:5432/migrate_check pnpm payload migrate
  docker compose exec -T postgres psql -U postgres -c 'DROP DATABASE migrate_check'
  ```
- The root layout reads site-settings, so `pnpm build` needs a migrated database (a throwaway one as above works).

## Seed

`pnpm seed` creates one placeholder image (`seed-placeholder.webp`, alt "[Placeholder image]") and fills site-settings with bracketed placeholder copy.

- Safe to run twice: the image is found by filename, and site-settings is only filled while it is empty. It never overwrites real edits and never touches users.
- It refuses `VERCEL_ENV=production`, a missing `POSTGRES_URL`, and any non-local database unless `SEED_ALLOW_REMOTE=true` is set on purpose (e.g. to seed a Neon preview branch).
- Writes pass `context.disableRevalidate`, because `revalidatePath` only works inside a Next.js request.

## Media locally

- With `BLOB_READ_WRITE_TOKEN` set (from `.env.local`), uploads go to the shared Blob store under `local/`.
- With it empty (`BLOB_READ_WRITE_TOKEN= pnpm dev`), the storage plugin is disabled and uploads land in the gitignored `./media` folder. Use this for throwaway QA so the shared store stays clean.

## Branches, PRs and releases

Recorded in [ADR-0003](decisions/README.md).

- `main` ← `dev` ← `<type>/p<N>-<slug>` (types: `feat`, `fix`, `chore`, `docs`), one branch per plan task.
- Every change reaches `dev` and `main` through a PR with green checks; direct pushes are rejected.
  - Into `dev`: **squash** merge (one commit per task).
  - Into `main`: **merge commit** only, opened when a phase meets its Definition of Done.
- Each phase is tagged on `main`: P0 = `v0.1.0` … P6 = `v0.7.0`, P7 = `v1.0.0`. No hotfix flow before launch: fixes go through `dev`.
- Head branches are deleted automatically after merge; rebase merging is disabled.

### Required checks

| Check | Source | What it runs |
|---|---|---|
| `checks` | GitHub Actions (app id 15368), `.github/workflows/ci.yml` | `pnpm install --frozen-lockfile`, typecheck, lint, unit tests; no secrets |
| `Vercel` | Vercel commit status (app id 8329) | Preview build: migrate, then `next build` |

GitHub rulesets (both active, no bypass actors, 0 required approvals because GitHub forbids self-approval):

| Branch | Ruleset id | Merge method | Also blocks |
|---|---|---|---|
| `main` | 26916482 | merge commit | force-push, deletion |
| `dev` | 26916483 | squash | force-push, deletion |

## Vercel

- Project `creative-portfolio` in scope `peter-s-projects13` (Hobby). Git-connected to `petergabriel-dev/creative-portfolio`, production branch `main`.
- `vercel.json`: `framework: nextjs`, `regions: ["sin1"]` (Singapore), the migrate-then-build command, and `git.deploymentEnabled.main: false` (**no production deployments until P7**).
- Deployment protection: Vercel Authentication on all deployments except custom domains. Previews need a Vercel login.
- CLI: this project uses a separate CLI login so the default one is untouched. Pass `-Q ~/.vercel-portfolio` to every `vercel` command (as a separate shell word in zsh).

## Neon

- Database `creative-portfolio-db`, Free plan, region `sin1` (AWS `ap-southeast-1`), connected to **Production and Preview only**.
- Every preview deployment gets its own Neon branch (`preview/<git-branch>`), forked from `main`, and its build migrates that branch. That setting ("Create database branch for deployment → Preview") can only be set in the dashboard when connecting the project.
- **Cleanup is manual.** The Free plan allows 10 branches. When a preview fails with "Resource provisioning failed", delete the Vercel preview deployments of merged branches (`vercel rm <deployment> --yes -Q ~/.vercel-portfolio`); Neon deletes a preview branch once its deployments are gone. Then `vercel redeploy <deployment> --environment preview`.
- Each new preview branch starts without users: create the admin user on the preview when you need to log in.
- **Deferred option: one shared preview branch.** Disconnect Neon from Preview and point the Preview `POSTGRES_URL` at a permanent `preview` branch. That removes the limit and keeps one admin user across previews, but every PR migrates the same database (an abandoned PR's schema changes stay behind, and two open schema PRs can break each other), and the connection string becomes a manually pasted secret. Not adopted (owner decision 2026-11-10).

## Blob

- Store `creative-portfolio-media`, public, region `sin1`, connected to Preview and Development.
- Prefixes: `preview/` on Vercel previews, `local/` for local development; production gets its own store in P7.
- Files rejected for size after a browser upload stay in the store; clean them up manually (see [traps](traps.md#rejected-client-uploads-leave-orphans)).

## Production (P7)

Production deploys stay disabled until P7. Before enabling them: create a production `PAYLOAD_SECRET` and Blob store, deploy while the `*.vercel.app` URL is still behind Vercel Authentication, create the owner user, then connect the domain. See `docs/specs/phase-7-launch.md`.

## Local verification recipes

- **Auth, uploads, settings:** run `pnpm dev` against a throwaway database (`POSTGRES_URL=…/<db> pnpm dev`), exercise the REST API with a test user, then stop the server and drop the database.
- **Visual QA:** a temporary route under `src/app/(frontend)/` that renders the component's stress cases, plus `playwright-cli` screenshots at 320, 390, 768 and 1440 px. Delete the route before committing; `playwright-cli` writes a `.playwright-cli/` folder into the current directory, so run it from a scratch directory.
