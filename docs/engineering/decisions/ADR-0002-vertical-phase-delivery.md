---
id: ADR-0002
title: Vertical phase delivery and source precedence
status: Active
date: 2026-11-10
readWhen: planning, starting or reviewing any build phase; resolving a conflict between the Build Spec and the captures
---

# ADR-0002: Vertical phase delivery and source precedence

## Decision

- **Eight vertical phases.**
  - The build runs in eight phases, P0–P7. Each phase has one scope spec in `docs/specs/`.
  - Each phase ships one feature end to end: its content model, its Studio editing views and its public pages.
- **Build Spec order replaced.** These phases replace the Build Spec's own eight-step, layer-by-layer build order. Its 22 acceptance boxes are each mapped to a closing phase in `docs/specs/README.md`.
- **Scope specs, not task plans.** A phase spec says what the phase delivers and how we know it is done. `/pi-plan` produces the task plan against the real code when the phase starts.
- **Source precedence**, highest first:
  1. the owner's decisions from 2026-11-10;
  2. `build-spec.md` (6 Nov 2026);
  3. the handoff captures (9 Nov 2026), which are the visual target.
- **Studio before P5.**
  - Collections use Payload's built-in views with no theme.
  - Each collection still gets its `admin.group`, list columns, `useAsTitle` and field positions from the Build Spec when it is created.
- **Studio target: the Build Spec level plus its extras.**
  - Built-in views, themed to the captures.
  - Custom Logo/Icon, "N new" badge and Overview dashboard (P5).
  - Collection filter pills, a two-panel inbox and accent swatches (P6).
  - The captures are the theme reference. Built-in views are not rebuilt to pixel-match them.

## Why

- Every phase can be demonstrated end to end.
- Payload wiring is proven in P1 instead of near the end: access rules, drafts, live preview and page refresh on publish.
- Content-model mistakes surface in the phase that first uses them.
- Custom admin work carries the most risk on Payload upgrades, and it is isolated in P5–P6.
- Scope specs stay valid as the code changes. Task plans are written against code that exists, so they don't go stale.

## Affects

Docs:

- `docs/specs/README.md`
- `docs/specs/phase-0-foundation.md`, `phase-1-portfolio.md`, `phase-2-journal.md`, `phase-3-book-me.md`, `phase-4-home-about.md`, `phase-5-studio-shell.md`, `phase-6-studio-extras.md`, `phase-7-launch.md`
- `docs/design/reference/creative-portfolio/README.md`

Code:

- None yet.

## Consequences

- Good: each phase ends in something working and deployed, on a Vercel preview.
- Good: shared pieces are built once in the phase that needs them first and reused later. The Story blocks (P1) and the publishing machinery are examples.
- Bad/risk: the Studio looks like default Payload until P5.
- Bad/risk: several Build Spec boxes span phases, so they close late (mostly in P4), as tracked in the coverage table.
- Bad/risk: P0 is larger than the Build Spec's Foundation step, because `site-settings` and `media` must exist for the header, footer and default metadata.

## Read when

- Planning, starting or reviewing any phase.
- The Build Spec, the captures and a later decision disagree.
- Deciding whether a Studio screen must match its capture.

## Supersedes

- None. This replaces the Build Spec's build order, which was not recorded as an ADR.
