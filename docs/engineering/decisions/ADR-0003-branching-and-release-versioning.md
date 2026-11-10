---
id: ADR-0003
title: Branching, PR and CI gates, and release versioning
status: Active
date: 2026-11-10
readWhen: opening a branch or PR; merging into dev or main; tagging a release; changing CI, rulesets or Vercel deploy settings
---

# ADR-0003: Branching, PR and CI gates, and release versioning

## Decision

- **Branches:** `main` ← `dev` ← `<type>/p<N>-<slug>` (types `feat`, `fix`, `chore`, `docs`), one short-lived branch per plan task.
- **Every change reaches `dev` and `main` through a PR with green checks.** Direct pushes are rejected.
- **Required checks**, each pinned to the app that reports it:
  - `checks`: GitHub Actions (`.github/workflows/ci.yml`) running typecheck, lint and unit tests, with no secrets in GitHub;
  - `Vercel`: the preview deployment, which runs `payload migrate` and then `next build` against its own Neon branch.
- **GitHub rulesets** enforce it (repo is public, so rulesets are free):
  - `main` (id 26916482): merge commit only;
  - `dev` (id 26916483): squash only;
  - both: 0 required approvals, no bypass actors, force-push and deletion blocked.
  - Rebase merging is off and head branches are deleted after merge.
- **Merge methods:** squash into `dev` (one commit per task); merge commit into `main` (never squash or rebase `dev` into `main`).
- **Releases:** `dev` → `main` only when a phase meets its Definition of Done. The merge commit is tagged `v0.N.0`: P0 = `v0.1.0` … P6 = `v0.7.0`, P7 launch = `v1.0.0`.
- **No hotfix flow before launch.** Fixes go through `dev` and ship with the next phase. P7 defines the hotfix flow.
- **No production deployments until P7:** `git.deploymentEnabled.main: false` in `vercel.json`.

## Why

- One developer: a PR with CI catches breakage before it reaches `dev`, and 0 approvals is required because GitHub forbids approving your own PR.
- Squash keeps `dev` readable, one commit per task. A merge commit into `main` keeps `main` and `dev` on shared history; squashing `dev` into `main` would make every later release PR show old commits or conflict.
- `main` always equals the last finished phase, and tags give named rollback points.
- CI needs no secrets; the Vercel preview is the build-and-migrate check with real environment variables and an isolated database.
- A public production URL on an empty database would let anyone claim the admin account through Payload's create-first-user screen, so production stays off until P7 creates the owner user first.

## Affects

Docs:

- `docs/engineering/dev-workflow.md`
- `docs/engineering/invariants.md`
- `docs/specs/phase-7-launch.md`

Code:

- `.github/workflows/ci.yml`
- `vercel.json`

## Consequences

- Good: nothing reaches `dev` or `main` without a passing typecheck, lint, unit tests and a successful migrate-and-build.
- Good: each phase release is one reviewable PR with a tag.
- Bad/risk: every preview gets its own Neon branch, and the Free plan holds 10; old preview deployments must be cleaned up by hand when it fills.
- Bad/risk: even one-line docs changes need a branch, a PR and both checks.
- Bad/risk: the P7 hotfix flow will need the `dev` ruleset to allow merge commits for back-merging `main`.

## Read when

- Opening a branch or PR, or merging into `dev` or `main`.
- Tagging a release.
- Changing CI, the rulesets, or Vercel deploy settings.

## Supersedes

- None
