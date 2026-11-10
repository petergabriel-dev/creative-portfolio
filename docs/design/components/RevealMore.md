# RevealMore

## Purpose

Shows the first eight project cards and a "More projects" button that reveals the rest in place. Every card is already in the statically rendered page; nothing is fetched (owner decision 2026-11-10). Source: capture 03 and the Build Spec section "Front-end pages › Collection".

## Anatomy

1. **List:** `<ul role="list" id>` using the parent's grid class. Each card is wrapped in an `<li>`. Items from position `initial` onwards have the `hidden` attribute until they are revealed.
2. **Button** (only when there are more items than `initial`): Button `outline-ink`, size `primary`, labelled "More projects" (`copy.ts`). It is centred below the list, `--space-10` above it.

## Variants

- **More items than `initial`:** button shown.
- **`initial` or fewer:** no button; every item is visible.

## Sizes

One.

## States

- **Default:** first `initial` items visible, the rest hidden, button shown.
- **Hover, focus-visible, active:** from Button.
- **Revealed:** after a click (or Enter/Space) every item is visible, the button is removed, and focus moves to the first link in the first revealed item.
- Loading and error do not apply: there is no request.
- **Without JavaScript:** the first `initial` items show and the button does nothing.
  `ponytail:` accepted limitation; the upgrade path is rendering all items until hydration.

## Props/API

```ts
type RevealMoreProps = {
  children: React.ReactNode[] // one element per card
  initial?: number // default 8
  label: string // copy.ts "More projects"
  listClassName: string // grid layout from the page
  listId: string
}
```

Client component (`'use client'`). It is one of only two client components on the public site, with VideoEmbed (Build Spec "Accessibility, SEO & performance").

## Accessibility

- A native `<button type="button" aria-controls={listId}>`.
- Hidden items are removed from the accessibility tree and the tab order by `hidden`.
- After the reveal, focus moves to the first revealed card, so keyboard and screen-reader users land on the new content. The button is removed only after that move.
- Images in hidden items use `loading="lazy"` inside `display: none`, so they are not fetched until revealed. No hidden item gets `priority`.
- The button target is `--tap-primary` (52 px).

## Responsive

The button is centred at every width; the grid follows the parent (ProjectCard spec).

## Usage

The Projects chapter of `projects`-layout collection pages. Assumes tens of projects per collection; revisit with server fetching if a collection reaches about 100.

## Preview

[Open preview](../preview/index.html)
