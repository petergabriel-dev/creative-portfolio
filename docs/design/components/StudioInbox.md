# StudioInbox

## Purpose

The two-panel inbox at `/admin/collections/inquiries` (screen 27): the editor reads Book Me inquiries, replies from their own email and moves each one through New → Replied → Archived. It replaces Payload's list view for `inquiries` (`admin.components.views.list.Component`). Sources: captures 27 at 1440 px and 390 px; the Build Spec section "Admin (Studio) customisation" (two-panel inbox) and "Book Me & inquiries flow" (statuses); the P6 owner decisions of 2026-11-12 (3–7), which add what capture 27 leaves out (see Usage).

## Anatomy

**Page** (inside Payload's default template, beside StudioNav): `<main>`, `--color-studio-page`, padding as [StudioOverview](StudioOverview.md) (`--space-8` block-start, `--space-12` block-end, `--space-5` inline below 768 px, `--space-12` from 768 px).

1. **Header:**
   - **Label:** `<p>` "Studio": `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
   - **Title:** `<h1>` "Inquiries": `--font-display`, `--fw-regular`, `--fs-studio-title`, `--lh-section`, uppercase, `--color-text`.
   - **Description:** `<p>` "Messages sent from the Book Me form. Reply from your own email, then mark them as replied.": `--fs-body`, `--color-text-muted`, `--space-3` above, max width `--measure-body` from 768 px.
2. **Status links**, `--space-7` below the header: `<nav aria-label="Inquiry status">` holding a `<ul>` of three links, New, Replied, Archived, in that order, `--space-3` apart, wrapping. Each link is a **pill**:
   - `--radius-pill`, min-height `--tap-min`, padding-inline `--space-5`, `--border-hairline` solid `--color-studio-field-border`, `--fs-sm`;
   - text: the status name (`--fw-semibold`, `--color-text`) then its count (`--fw-regular`), `--space-2` apart;
   - current: `--color-action` fill and border, `--color-on-action` text, `aria-current="true"`.
   - Each link goes to `?status=<status>` (page 1, newest selected).
3. **Panels**, `--space-7` below the status links: the list, then the detail.
4. **List** (`<ul>`, cards `--space-3` apart). Each **card** is an `<li>`: `position: relative`, `--color-studio-card`, `--border-hairline` solid `--color-studio-card-border`, `--radius-cms-card`, padding `--space-4` block and `--space-5` inline.
   - Row 1: the name as `<h2><a>`, `--fs-body`, `--fw-semibold`, `--color-text`, no underline, its `::after` stretched over the card (conventions: card links); the date received at the inline end, `<time datetime>` through `formatDate`, `--fs-sm`, `--color-text-muted`.
   - Row 2: `projectType`, `--fs-sm`, `--fw-semibold`, `--color-text`, `--space-1` above.
   - Row 3: the message excerpt (≤ 140 characters, cut on the server), `--fs-sm`, `--color-text-muted`, one line with an ellipsis (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`), `--space-1` above.
   - Selected card: `--color-studio-field-bg` fill, `--border-hairline` solid `--color-text`, `aria-current="true"` on its link.
   - The link goes to `?status=<tab>[&page=N]&id=<id>`.
5. **Pager** (only with more than 20 inquiries on the tab), `--space-5` below the list: `<nav aria-label="Inquiry pages">` with Button `text` links "← Newer" (to page N−1) and "Older →" (to page N+1), each shown only when that page exists, `--space-6` apart.
6. **Detail** (`<section aria-labelledby="inbox-detail-heading">`): `--color-studio-card`, `--border-hairline` solid `--color-studio-card-border`, `--radius-cms-card`, padding `--space-6` below 768 px and `--space-10` from 768 px.
   - **Head:** a row, `justify-content: space-between`, `align-items: start`, `--space-4` gap, `--space-6` padding-block-end and a `--border-hairline` `--color-studio-row-rule` bottom border:
     - `<h2 id="inbox-detail-heading" tabIndex={-1}>` the name: `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-text`, `overflow-wrap: anywhere`;
     - the **status chip** (see below).
   - **Facts:** a `<dl>`, `--space-6` padding-block, a `--color-studio-row-rule` bottom border. Four groups: Project (`projectType`), Timing (`timing`, or "Not given" in `--color-text-muted`), Email (the address as text), Received (`<time>` through `formatDate`). `<dt>`: `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`; `<dd>`: `--fs-body`, `--color-text`, `--space-1` above, `overflow-wrap: anywhere`.
   - **Message:** `<p>`, `--fs-lead`, `--lh-body-loose`, `--color-text`, `white-space: pre-line` (keeps the visitor's line breaks), `--space-6` padding-block-start, max width `--measure-story`.
   - **Actions** (StudioInboxActions), `--space-7` above: a row of Buttons, `--space-3` apart, wrapping:
     - "Reply by email": Button `ink` link to `mailto:<email>`, only when the stored email passes `EMAIL_PATTERN` (`src/lib/inquiry.ts`);
     - the status buttons for the inquiry's status, Button `outline-ink`, `type="submit"`, in one `<form>` posting to `setInquiryStatus` (each button carries its target status as `name="status"` `value`):

       | Status | Buttons, in order |
       |---|---|
       | New | Mark as replied · Archive |
       | Replied | Archive · Mark as new |
       | Archived | Mark as new |

     - "Open full record": Button `text` with the trailing arrow, to `/admin/collections/inquiries/<id>` (notes, delete), `--space-5` above the row on its own line.
   - **Notice:** a visually hidden `role="status"` region, owned by StudioInboxActions; **error:** `role="alert"` `<p>` below the actions, `--color-error`, `--fw-semibold`, `--space-4` above.
7. **Empty tab:** in place of list and detail, one card (as the detail card) holding `<p>` "Nothing waiting.", `--fs-body`, `--color-text-muted`.

**Status chip:** `--radius-pill`, min-height `--space-6`, padding-inline `--space-3`, `--fs-label`, `--fw-semibold`, text always shown:

| Status | Text | Fill | Text colour |
|---|---|---|---|
| New | New | `--color-chip-new-bg` | `--color-chip-new-fg` |
| Replied | Replied | `--color-chip-replied-bg` | `--color-chip-replied-fg` |
| Archived | Archived | `--color-chip-archived-bg` | `--color-chip-archived-fg` |

All copy (label, title, description, status names, "Not given", "Nothing waiting.", fact labels, action labels, "Open full record", "Newer", "Older", notices, errors) lives in `copy.ts`.

## Variants

- Tab: New, Replied, Archived (no "All" tab).
- The selected inquiry's status picks its buttons (table above).
- With or without a reply link (email check).

## Sizes

One. The title uses the fixed `--fs-studio-title`, as the Overview.

## States

| State | What changes |
|---|---|
| Default | The New tab, page 1, newest inquiry selected |
| Selected by URL | `?id=` names an inquiry on the current tab: it is selected, even if it is on another page than the one shown. An `id` that is missing, not found or of another status falls back to the first card of the page |
| Hover | Card: border `--color-text`; status pill: border `--color-text`; Buttons per Button |
| Focus-visible | Global dual ring on the card's name link (the ring follows the link box), pills, pager links and Buttons; the detail heading shows the ring when focused by script |
| Active | Same as hover |
| Pending | While a status change runs: the status buttons are `disabled` and the form has `aria-busy="true"`; nothing else moves |
| Success | The page moves to the same tab with the next inquiry selected (the previous one if the changed one was last; none if the tab is now empty), the notice ("Marked as replied.", "Archived." or "Marked as new.") is written into the live region, focus moves to the new detail heading, or to the "Nothing waiting." card's text when the tab is empty. Counts and the sidebar badge are fresh |
| Error | "Couldn't change the status. Try again." in the alert; status unchanged, no navigation |
| Signed out | "You're logged out. Log in again to change the status." in the alert |
| Empty | The tab's empty card |
| Loading | None: the page is a server component, rendered complete |
| Disabled | Status buttons while pending only |

Selecting a card (Enter on its link) moves focus to the detail heading after the new page renders, never on the first load of the inbox.

## Props/API

```ts
// admin.components.views.list.Component (server). Payload passes list-view serverProps.
type StudioInboxProps = { payload: Payload; user: TypedUser | null; searchParams: Record<string, string | string[] | undefined> }

// src/lib/studioInbox.ts (pure) and src/lib/studio.ts (reads as the editor)
type InquiryStatus = 'new' | 'replied' | 'archived'
type InboxQuery = { status: InquiryStatus; page: number; id: number | null }
type InboxRow = { id: number; name: string; projectType: string; receivedAt: string; excerpt: string; href: string }
type InboxSelected = { id: number; name: string; email: string; projectType: string; timing: string; message: string; status: InquiryStatus; receivedAt: string }
type StudioInboxData = {
  query: InboxQuery
  counts: Record<InquiryStatus, number>
  rows: InboxRow[]
  selected: InboxSelected | null
  nextId: number | null // the card to select after a status change
  newerHref: string | null
  olderHref: string | null
}

// StudioInboxActions ('use client'): at a stable place in the tree, never keyed by inquiry
type StudioInboxActionsProps = { id: number; status: InquiryStatus; tab: InquiryStatus; page: number; nextId: number | null; replyHref: string | null }

// setInquiryStatus (server action) result
type InboxActionState = { ok: true; notice: string; href: string; at: number } | { ok: false; error: 'failed' | 'signedOut' } | null
```

A pure `StudioInboxView({ data })` renders every state in tests without a database.

## Accessibility

- One `<h1>` ("Inquiries"). The list cards' names are `<h2>`; the detail heading is an `<h2>` with `tabIndex={-1}` as the focus target.
- Status links and the pager are `<nav>` landmarks with labels; the current status link and the selected card link carry `aria-current="true"` (they are links that navigate, not ARIA tabs).
- Keyboard: Tab moves through status links, card name links, pager links and the detail's actions; Enter on a card selects it and focus moves to the detail heading. The interpretation of the spec's "moving through the list selects an inquiry" is Tab + Enter: selection does not follow focus, because each selection loads the page.
- Status buttons are real `<button>`s in a `<form>`; "Reply by email" and "Open full record" are links.
- Announcements: the success notice goes into a `role="status"` region that is already in the page before the text changes; errors use `role="alert"`. A repeated notice re-announces (the state carries a timestamp and the region is cleared first).
- The status chip, counts and selected state are text or `aria-current`, never colour alone.
- Targets: card links cover the whole card; pills and pager links ≥ `--tap-min`; Buttons per Button.
- Contrast (computed 2026-11-12): `--ink` / `--muted` on `--surface` 16.7:1 / 6.6:1 and on `--bone` 15.4:1 / 6.1:1; New chip `--bone` on `--ink` 15.4:1; Replied chip 7.8:1; Archived chip 5.5:1; current pill `--bone` on `--ink` 15.4:1; pill edge `--field-border` on `--bone` 3.2:1; selected card edge `--ink` on `--field-bg` 17.4:1 (the selection is also `aria-current`). Card borders and rules are decorative.
- Motion: border and colour transitions over `--duration-fast`, none under `prefers-reduced-motion`.

## Responsive

- **Below 1024 px:** one column, in order: header, status links (wrapping), list, pager, detail (capture 27 at 390 px). Facts stack one group per line, `--space-4` apart. Action Buttons wrap, one per line on a phone.
- **1024 px and up:** two columns, `grid-template-columns: minmax(var(--grid-min-tile), 1fr) minmax(0, 2.5fr)`, gap `--space-7`, `align-items: start`. Facts sit in columns of at least `--grid-min-detail` (`repeat(auto-fit, minmax(min(var(--grid-min-detail), 100%), 1fr))`, gap `--space-6`): four in a wide detail, as capture 27, fewer at 1024 px so an email doesn't break mid-word (found in T4 QA).
- 1024 px is the Studio's literal breakpoint here, as in the site header and the log-in.
- No horizontal scroll at 320 px. Long names, emails and unbroken message words wrap (`overflow-wrap: anywhere`).

## Usage

- Only at `/admin/collections/inquiries`. The Overview's "Needs a reply" rows link here with the inquiry selected (`?status=new&id=<id>`), and its "Open inquiries" link opens the default New tab.
- Changes from capture 27 (owner decisions 2026-11-12, recorded in `docs/design/README.md`):
  - status buttons depend on the status, and "Mark as new" returns an inquiry to New;
  - "Open full record →" reaches notes and delete, which the inbox doesn't show;
  - "Newer" and "Older" page through more than 20 inquiries;
  - the cards and the detail show `projectType` only ("Photography"); capture 27's "Photography — wedding" has no matching field;
  - there is no bulk select, bulk delete or search.
- Payload's app header bar stays above the page, as on every Studio view.

## Preview

[Open preview](../preview/index.html#pv-studio-inbox)
