# StudioNav

## Purpose

The Studio sidebar on every admin view (screen 42), and **StudioBrand**, the lens mark + site name + "Studio · CMS" block that the sidebar, the login (StudioLogin) and Payload's `graphics.Logo` and `graphics.Icon` share. Sources: captures 42 and 21 (1440 px), mobile 21; the Build Spec section "Admin (Studio) customisation"; the P5 owner decisions of 2026-11-11 (`docs/specs/phase-5-studio-shell.md`).

It replaces Payload's default nav (white, collapsible groups, gear menu, icon logout). It reuses Payload's exported `NavWrapper` (base class `nav`) and `NavHamburger`, so the drawer, its open/closed state and the app-header toggle stay Payload's.

## Anatomy

**Sidebar** (`NavWrapper`, then `<nav aria-label="Studio">`): `--color-studio-nav-bg`, full height, padding `--space-8` block-end and `--space-4` inline. The block-start padding stays Payload's (`--app-header-height`), so the template's menu button above the brand never covers it (capture 42 starts the brand `--space-10` from the top; P5). Links stretch to the full width. Children in order:

1. **StudioBrand** `full`, tone `dark`, inset `--space-3` so it lines up with the link text.
2. **Overview link**, `--space-7` below the brand: a 2 × 2 grid icon (four `--border-hairline` squares, `--space-5` box, `currentColor`, `aria-hidden`) then "Overview", `--space-3` apart.
3. **Groups**, in this order (Build Spec; capture 42 leaves out Admin, the Build Spec wins), each `--space-4` below the previous item:

   | Group label | Links → href |
   |---|---|
   | Portfolio | Projects → `/admin/collections/projects`; Collections → `/admin/collections/disciplines` |
   | Journal | Posts → `/admin/collections/posts`; Categories → `/admin/collections/categories` |
   | Inbox | Inquiries → `/admin/collections/inquiries` (+ badge) |
   | Library | Media → `/admin/collections/media` |
   | Settings | Site settings → `/admin/globals/site-settings`; Home page → `/admin/globals/home`; About page → `/admin/globals/about` |
   | Admin | Users → `/admin/collections/users` |

   - **Group label:** `<p id>` with `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-studio-nav-label`, inset `--space-3`, `--space-2` above its list.
   - **List:** `<ul aria-labelledby>` (the label's id), no bullets.
4. **Rule:** `--border-hairline` solid `--color-studio-nav-rule`, `--space-6` above and `--space-4` below.
5. **Footer**, inset `--space-3`, items `--space-2` apart:
   - "View the site" + `↗` (`aria-hidden`) + visually hidden "(opens in a new tab)": `<a href="/" target="_blank" rel="noopener">`, `--fs-sm`, `--fw-medium`, `--color-studio-nav-text-strong`, underlined at `--underline-offset`.
   - "Signed in as {name}": `<p>`, `--fs-sm`, `--color-studio-nav-label`. `{name}` is `users.name`, trimmed; the email when the name is blank.
   - "Log out": `<a href="/admin/logout">`, same style as "View the site".
6. **`NavHamburger`** (Payload's close button), drawer only.

**Link** (Overview and every group link): flex row, `align-items: center`, min-height `--tap-min`, padding-inline `--space-3`, `--radius-cms-field`, `--fs-sm`, `--fw-regular`, `--color-studio-nav-text`, no underline.

**Badge** (Inquiries only, while the count of `new` inquiries is above 0): pushed to the link's inline end (`margin-inline-start: auto`), a pill (`--radius-pill`), min-height `--space-6`, padding-inline `--space-2`, `--color-studio-accent` fill, `--color-on-studio-accent` text, `--fs-label`, `--fw-semibold`, text "{n} new". A visually hidden ", " before it so the link's name reads "Inquiries, 3 new".

**StudioBrand `full`:** a block (not a link):

- Row 1: LensMark (`--mark-size`, `currentColor`, `aria-hidden`) and the site name, `--space-3` apart: `--fs-sm`, `--fw-semibold`, `--tracking-wordmark`, uppercase, clamped to two lines (as Wordmark). Without a name: `copy.site.fallbackName`.
- Row 2, `--space-4` below: "Studio · CMS" (separator from `copy.ts`), `--fs-label`, `--fw-semibold`, `--tracking-wordmark`, uppercase.

**StudioBrand `icon`:** the LensMark alone at `--mark-size`, `currentColor`, plus visually hidden "Studio" so a link that wraps it (Payload's app header) has a name.

All copy (group labels, link labels, "Studio · CMS", footer text, "{n} new", "(opens in a new tab)") lives in `copy.ts`.

## Variants

| Component | Variant | Use |
|---|---|---|
| StudioBrand | `full`, tone `dark`: name `--color-studio-nav-text-strong`, label `--color-studio-accent` | Sidebar, login left panel |
| StudioBrand | `full`, tone `light`: name `--color-text`, label `--color-text-muted` | `graphics.Logo`, which Payload 3.93 draws only on its login and verify views (bone page; its forgot, reset and create-first-user views have no logo). Gold on bone is 1.7:1, so the light tone never uses gold |
| StudioBrand | `icon` | `graphics.Icon` (app header, collapsed nav) |
| Badge | shown / hidden | Hidden when there are no `new` inquiries (owner decision) |

## Sizes

One. The sidebar is `--studio-nav-width` wide from 769 px.

## States

| State | What changes |
|---|---|
| Default | As in Anatomy |
| Hover | Link text `--color-studio-nav-text-strong`; footer links' underline thickens to `--border-strong` |
| Focus-visible | Global dual focus ring; on the ink sidebar the `--focus-halo-color` (bone) halo carries it |
| Current | `aria-current="page"`, `--color-studio-nav-current` fill, `--color-studio-nav-text-strong`, `--fw-semibold` (the weight is the non-colour cue) |
| Active | Same as hover |
| Empty | No `new` inquiries: no badge |
| Open / closed | Payload's: the app header's menu button toggles it at every width |
| Disabled, loading, error | Not applicable (server-rendered links) |

**Current link:** worked out on the server from the route segments. Overview is current only on `/admin` itself; a collection or global link is current on its list, its create view and any of its documents (the path equals the href or starts with `{href}/`).

## Props/API

```ts
// graphics.Logo → <StudioBrand variant="full" tone="light" />; graphics.Icon → <StudioBrand variant="icon" />
type StudioBrandProps = {
  variant: 'full' | 'icon'
  tone?: 'dark' | 'light' // full only, default 'dark'
}

// admin.components.Nav: a server component; Payload passes these server props
type StudioNavProps = {
  payload: Payload
  user: User | null
  params?: { segments?: string[] }
}
```

The name comes from `site-settings` (`getSiteSettings()`); the badge count from `newInquiryCount(payload, user)` in `src/lib/studio.ts` (one `count` per render, `overrideAccess: false`). Server components only; the drawer behaviour is Payload's client code.

## Accessibility

- `<nav aria-label="Studio">`; each group is a list named by its visible label.
- Tab order follows the visual order: Overview, the groups top to bottom, View the site, Log out.
- The current link has `aria-current="page"` and a weight change, not only a fill.
- The badge text is part of the link's name ("Inquiries, 3 new"); it updates on the next page load.
- "View the site" says it opens a new tab (visually hidden text) and uses `rel="noopener"`.
- Every link is at least `--tap-min` (44 px) high; the footer links are `inline-flex` with `--tap-min` min-height.
- Contrast (computed 2026-11-11):
  - links `--on-dark` on `--ink` 10.5:1; current text `--bone` on `--ink-raised` 11.2:1;
  - group labels and "Signed in as" `--on-ink-muted` on `--ink` 8.2:1;
  - "Studio · CMS" `--accent-gold` on `--ink` 9.2:1; badge text `--ink` on `--accent-gold` 9.2:1;
  - footer links and brand name `--bone` on `--ink` 15.4:1;
  - light tone: name `--ink` on `--bone` 15.4:1, label `--muted` on `--bone` 6.1:1;
  - `--ink-raised` fill (1.4:1) and `--ink-rule` (1.5:1) against `--ink` are decorative; current state is also carried by weight and `aria-current`.
- Focus ring on the ink sidebar: ink outline 1:1, bone halo 15.4:1.

## Responsive

- **From 769 px:** when open, the sidebar sits beside the page, `--studio-nav-width` (264 px) wide (Payload's `--nav-width` is set to it). Payload's open/closed behaviour is kept (owner decision 2026-11-11): up to 1440 px every full page load starts with it closed, the app header's menu button opens it, and it stays open while moving around the Studio; wider screens remember the editor's choice. Captures 21 and 42 show it open at 1440 px.
- **Up to 768 px:** Payload's full-width drawer, closed with `NavHamburger` (owner decision 2026-11-11; capture 21 at 390 px stacks the sidebar open above the page instead). The drawer content is this same sidebar. With the drawer open, Payload's own layout lets the page scroll sideways behind it (measured with Payload's default nav too); it is closed again on navigation.
- Long site names wrap and stop at two lines; long labels wrap inside the link.
- No horizontal scroll at 320 px.

## Usage

- `admin.components.Nav` on every view in Payload's default template.
- StudioBrand: the sidebar, StudioLogin's left panel, `graphics.Logo` and `graphics.Icon`.
- Motion: link colour transitions over `--duration-fast`, none under `prefers-reduced-motion`. The drawer slide is Payload's own.

## Preview

[Open preview](../preview/index.html#pv-studio-nav)
