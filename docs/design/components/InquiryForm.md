# InquiryForm

## Purpose

The Book Me inquiry form and the thank-you panel that replaces it: the site's primary action. Source: captures 11 (default), 11 errors (empty submit) and 11 sent, at 1440 px and 390 px; the Build Spec section "Book Me & inquiries flow"; and the P3 owner decisions of 2026-11-11 (`docs/specs/phase-3-book-me.md`). The "Sending…" and "failed" states are not drawn in the captures; they are specified here.

## Anatomy

**Form** (`<form aria-label>` from `copy.ts`, `noValidate`): a panel on `--color-surface-band`, padded `--space-6` below 768 px and `--space-12` from 768 px, square corners (`--radius-site`).

1. **Fields**, in DOM order. Each is a label, a control and an optional error, stacked with `--space-3` between label and control and `--space-2` between control and error:
   - **Your name**: `<input type="text" name="name" autocomplete="name" required>`.
   - **Email**: `<input type="email" name="email" autocomplete="email" required>`.
   - **What kind of project?**: native `<select name="projectType" required>`. First option "Choose one" with `value=""`; then one option per discipline, by its name, in Portfolio order; then "Something else".
   - **Timing (if you know it)**: `<input type="text" name="timing">`, placeholder "A date, a month, or not sure yet". Optional; no `required`.
   - **Tell me about it**: `<textarea name="message" rows="6" required>`, placeholder "What it's for, who it's for, and what you'd love it to feel like.", vertical resize only.
2. **Honeypot**: a wrapper `<div aria-hidden="true">` holding the label "Website" and `<input type="text" name="website" tabindex="-1" autocomplete="off">`. Visually hidden with clip (never `display: none`), so people never see or reach it and screen readers skip it.
3. **Elapsed time**: hidden `<input type="hidden" name="elapsedMs">`, empty in the server HTML and filled with JavaScript on submit (ms since the form mounted).
4. **Form message** (failed state only): a `<p>` above the button.
5. **Submit**: Button `ink`, size `primary`, `type="submit"`, label "Send inquiry", left-aligned, `--space-8` above.
6. **Status** (sending state only): visually hidden text with `role="status"`: "Sending…".

**Label:** `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text`.

**Control:** min-height `--tap-primary`, padding `--space-3` block and `--space-5` inline, `--color-field-bg` fill, `--border-hairline` border in `--color-text-muted`, `--radius-site`, `--font-body` at `--fs-body` / `--lh-body` in `--color-text`. Placeholder text in `--color-text-muted`. The select keeps the browser's native arrow. The textarea's min-height is `calc(var(--space-12) * 4)`.

**Field error:** `<p id>` under its control: `--fs-sm`, `--fw-semibold`, `--color-error`.

**Thank-you panel** (sent state): a block in the same column on `--color-surface-finale`, padded `--space-8` below 768 px and `--space-14` from 768 px, children `--space-5` apart:

1. **Label:** `<p>` "Inquiry sent": `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-booking`.
2. **Heading:** `<h2 tabindex="-1">` "Thank you — I'll be in touch soon": `--font-display`, `--fw-regular`, `--fs-card`, `--lh-card`, uppercase, `--color-on-dark-heading`, `text-wrap: balance`.
3. **Body:** `<p>` "I'll read your note and reply within {replyTime} so we can talk through your plans.": max-width `--measure-body`, `--fs-lead`, `--lh-body`, `--color-on-dark`. Without a reply time: "I'll read your note and reply soon so we can talk through your plans."
4. **Actions:** a row, row gap `--space-3`, column gap `--space-4`, `--space-2` above: Button `gold` size `primary` "Browse the portfolio" → `/portfolio`; Button `outline-light` size `primary` "Back to home" → `/`.
5. **Send another inquiry:** Button `text` linking to `/book`, `--space-3` above, colour inherited (`--color-on-dark-heading`).

All copy lives in `copy.ts`.

## Variants

- **Form**: states default, errors, sending and failed.
- **Thank-you panel**: replaces the form after a successful send, after a spam submission (silently), and after a no-JavaScript post that succeeds.

## Sizes

One. The thank-you heading scales with `--fs-card`.

## States

| State | When | What changes |
|---|---|---|
| Default | Page load, or "Send another inquiry" | Empty fields, no messages |
| Hover | Pointer over a control | Border `--color-text` |
| Focus-visible | Keyboard or click focus | Global dual focus ring from `tokens.css` |
| Error | Invalid submit | Per invalid field: a 2 px edge in `--color-error` (border colour plus an inset `--border-hairline` shadow, so nothing shifts), `aria-invalid="true"`, the message below. Other fields unchanged. Typed values stay. |
| Sending | Between submit and response (JavaScript only) | Button label "Sending…", native `disabled` (`--opacity-disabled`); status text "Sending…" |
| Failed | The save itself failed (not a validation error) | Form message above the button, `--fs-sm`, `--fw-semibold`, `--color-error`, `tabindex="-1"`: "Sorry — your message didn't send. Please try again, or email me at {contactEmail}." The address is a `mailto:` link; without a contact email the sentence ends after "try again." Typed values stay. |
| Sent | Saved, or spam | The thank-you panel replaces the form |
| Disabled | Same as sending | — |
| Empty | Not applicable | — |

Error messages are the Build Spec's, word for word:

| Field | Message |
|---|---|
| name | "Please add your name." |
| email | "Please check your email address." |
| projectType | "Please choose the kind of project." |
| message | "Tell me a little more — at least a sentence or two." |
| timing, website | none |

## Props/API

```ts
type InquiryFormState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: Partial<Record<'name' | 'email' | 'projectType' | 'message', string>>; values: InquiryValues }
  | { status: 'failed'; values: InquiryValues }
  | { status: 'sent' }

type InquiryValues = { name: string; email: string; projectType: string; timing: string; message: string }

type InquiryFormProps = {
  options: string[] // discipline names in Portfolio order; "Something else" is appended from copy.ts
  contactEmail: string // may be empty
  replyTime: string // may be empty
}
```

A client component (the site's fourth client island). It posts to the `submitInquiry` server action through `useActionState`, so the same form works without JavaScript. A pure view takes `state` and `pending` so every state can be rendered in tests.

## Accessibility

- Every control has a visible `<label for>`; placeholders never replace labels.
- `noValidate` lets the server's messages show instead of the browser's bubbles; `required` stays on required controls so assistive technology announces them.
- Each error is linked with `aria-describedby` from its control and the control gets `aria-invalid="true"`; nothing else carries `aria-invalid`.
- **Focus** (owner decisions 2026-11-11):
  - Invalid submit with JavaScript: focus moves to the first invalid field in DOM order. Without JavaScript: the server HTML puts `autofocus` on that field only.
  - Failed save: focus moves to the form message.
  - Sent: focus moves to the thank-you heading.
  - "Send another inquiry" with JavaScript: an empty form, focus on Your name. Without JavaScript the link loads `/book` again.
- The honeypot is `aria-hidden`, `tabindex="-1"` and never focusable by Tab.
- Targets: controls `--tap-primary` (52 px) high; buttons per the Button spec; the text link meets 44 × 44 px.
- Contrast (computed 2026-11-11):
  - labels `--ink` on `--stone` 14.0:1; input text on `--surface` 16.7:1; placeholder `--muted` on `--surface` 6.6:1;
  - field border `--muted` on `--stone` 5.5:1 and on `--surface` 6.6:1 (non-text, 3:1 required). `--field-border` would give only 2.9:1 on stone, so it is not used here;
  - errors `--error` on `--stone` 6.1:1;
  - thank-you panel on ink: label in every accent ≥ 5.9:1, heading 15.4:1, body 10.5:1.

## Responsive

- **Below 768 px:** one column; fields full width; the thank-you actions wrap.
- **768 px and up:** a two-column grid, column gap `--space-5`, row gap `--space-6`: Your name | Email, then What kind of project? | Timing, then Tell me about it across both columns, then the button.
- The panel sits beside GoodToKnow from 1024 px (see the Book Me page layout in `docs/design/README.md`).
- No horizontal scroll at 320 px. Long option names wrap inside the select's own popup; the closed select truncates with the browser's default.

## Usage

- Only on `/book`, as Chapter 01's second column.
- Motion: border colour transitions over `--duration-fast`; none under `prefers-reduced-motion`.
- Never show the thank-you panel for a failed save: it would tell the visitor a lost inquiry had been sent.

## Preview

[Open preview](../preview/index.html)
