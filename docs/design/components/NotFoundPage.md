# NotFoundPage

## Purpose

The 404 page for any unknown route, returned with HTTP status 404. Source: capture 12.

## Anatomy

1. ChapterOpener, tint `chapter`, with:
   - `header`: SiteHeader, tone `dark`, no current link.
   - `contextLine`: "404 · Page not found".
   - `title`: "Nothing here".
   - `lead`: "The page you're after has moved, or never existed. Try one of these instead."
   - `actions`: Button `outline-light`, size `primary`, "Back to home" → `/`; Button `text`, size `primary`, "Browse the portfolio" with trailing arrow → `/portfolio`.
2. SiteFooter.

All copy lives in `copy.ts`. Header and footer values come from `site-settings`.

## Variants

None.

## Sizes

Full page.

## States

- Default only. Header and footer handle empty `site-settings` values themselves.

## Props/API

A Next.js not-found route. It reads `site-settings` through the cached Local API getter (`overrideAccess: false`) and makes no `/api` requests.

## Accessibility

- One `h1` ("Nothing here").
- Landmarks: header, main (the opener), footer.
- Both actions are at least 44 px tall (`--tap-primary`).

## Responsive

As ChapterOpener, SiteHeader and SiteFooter. Below 768 px the two actions stack.

## Usage

Unknown routes must reach this page with status 404, while `/admin` and `/api/*` keep their own handling.

## Preview

[Open preview](../preview/index.html)
