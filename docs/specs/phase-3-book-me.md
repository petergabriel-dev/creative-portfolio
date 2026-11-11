# Phase 3 — Book Me

Status: Done
Depends on: P0 (`site-settings`, shell), P1 (`disciplines` supply the project-type options)
Build Spec refs: Content model: collections › inquiries · Book Me & inquiries flow · Access control & auth · Front-end pages (Book Me) · Decisions & stack (Resend, optional Upstash) · Environments, deployment & migrations (variables)

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md) · design specs [InquiryForm](../design/components/InquiryForm.md) and [GoodToKnow](../design/components/GoodToKnow.md)

## Goal

A visitor sends an inquiry from `/book`. It is saved as an `inquiries` doc with status `new`, and the owner gets an email they can reply to directly. This is the site's primary action, so validation, spam handling, privacy and never losing an inquiry are non-negotiable.

## Owner decisions (2026-11-11)

These rank above the Build Spec (see the precedence rules in `README.md`).

1. **No auto-reply.** Visitors get no email; only the owner is alerted. Before a domain is verified Resend's test sender can't reach visitors anyway, and an auto-reply would let anyone make the site email any address.
2. **Alert failure:** the inquiry stays saved, the error is logged with the inquiry's ID only (never the visitor's name, email, timing or message), and the send is not retried.
3. **Retention:** nothing is deleted automatically. The owner archives or deletes inquiries by hand in the Studio. The written retention policy comes with the privacy copy in P7.
4. **Where the alert is sent:** `submitInquiry` sends it after `payload.create` has returned, inside its own error handling and bounded at 5 seconds. This replaces the Build Spec's `afterChange` hook: the save is committed before any email call, so an email error can never undo it, and seeded inquiries never send email.
5. **`projectType` is text**, not a select: it stores the label the visitor picked (a discipline name or "Something else"). The server checks it against the current disciplines. Old inquiries keep the label they were sent with if a discipline is later renamed or deleted.
6. **Timing check:** with JavaScript, the form sends the milliseconds since it appeared; under 3,000 counts as spam. A missing or malformed value (no JavaScript) skips this rule, and the honeypot still applies. `/book` stays a static page.
7. **Studio editing:** what the visitor sent (name, email, project type, timing, message) is read-only; the owner edits only status and notes. Nobody can create inquiries in the Studio.
8. **Status** is a plain select (`new` default, `replied`, `archived`) with no transition rule, so spam can go straight from `new` to `archived`.
9. **Sender:** the From address comes from the optional `EMAIL_FROM_ADDRESS` variable and defaults to Resend's test sender until P7 verifies the domain. On previews, `site-settings.contactEmail` must be the Resend account's own address for alerts to arrive.
10. **Plain-text alert:** subject "New inquiry · {project type} · {name}" (line breaks removed), one "Label: value" line per field, then a link to the inquiry in the Studio. Reply-to is the visitor's email.
11. **Focus:** invalid submit → first invalid field (without JavaScript, via `autofocus` in the page HTML); failed save → the form's error message; sent → the thank-you heading; "Send another inquiry" → Your name.
12. **Fixed copy:** the opener's context line ("Book me · photography, film, design & writing") and the "Working on" value are fixed text in `copy.ts`, worded as in capture 11; final wording in P7.
13. **Failed save:** if `payload.create` fails for any reason other than validation, the visitor never sees the thank-you. The form shows "Sorry — your message didn't send. Please try again, or email me at {contactEmail}." above the button and keeps everything they typed.

Design deviations from the captures are recorded in `docs/design/README.md`.

## In scope

**Content model** (fields and admin positions as in the Build Spec, except where the owner decisions above differ)
- `inquiries`:
  - no drafts or versions; `useAsTitle: name`;
  - list columns: name, project type, status and received (`createdAt`, labelled "Received"); newest first by default;
  - admin group Inbox, after Journal in the sidebar.
- `status` takes `new` (the default), `replied` or `archived`; any status can change to any other (owner decision 8).
- `notes` is private and never shown publicly.
- `projectType` is text (owner decision 5). The form offers one option per discipline, by its name, plus "Something else"; capture 11's shorter labels such as "Film or video" give way to the discipline names.
- Field limits are also set on the collection: name 1–120, timing up to 120, message 20–5,000 characters; email is an email field.
- Access:
  - only the editor can read, update and delete;
  - nobody can create through REST or the Studio, the editor included;
  - the `submitInquiry` server action and the guarded seed are the only code paths that write with `overrideAccess: true`.
- Only the form fields are stored. No IP address and no tracking data.

**Page and form** (`/book`; specs [InquiryForm](../design/components/InquiryForm.md), [GoodToKnow](../design/components/GoodToKnow.md), layout in `docs/design/README.md`)
- The opener, then Chapter 01 "Good to know" beside the inquiry form (from 1024 px), then the footer. This is the only page with no booking finale. The header's Book Me pill carries `aria-current="page"`.
- The opener's lead ends with the reply time (`site-settings.replyTime`); "Good to know" shows `contactEmail` (as a mailto link), `location` and the fixed "Working on" line, as in capture 11.
- InquiryForm:
  - visible labels, never labels in placeholders only;
  - fields `name`, `email`, `projectType`, `timing` (optional) and `message`;
  - a hidden `website` honeypot, hidden from people and from screen readers, and skipped by Tab;
  - the submit button reads "Send inquiry".
- `submitInquiry` server action:
  - The form works without JavaScript.
  - With JavaScript, the button reads "Sending…" and is disabled while posting, and the page does not reload.
  - The server validates every field against the Build Spec table, with its exact error messages:
    - name: 1–120 characters;
    - email: a valid format;
    - projectType: one of the listed options;
    - timing: 0–120 characters;
    - message: 20–5,000 characters.
  - On invalid input, each error sits under its field, linked with `aria-describedby` and `aria-invalid`, and focus moves to the first error. Typed values stay.
  - Spam: if the honeypot is filled, or the timing check fires (owner decision 6), the visitor sees the normal success state and nothing is saved.
  - On valid input, the action calls `payload.create` on `inquiries` with `overrideAccess: true` and `status: new`. A failed save shows the failed state (owner decision 13).
- Thank-you panel, which replaces the form:
  - "Inquiry sent" label and "Thank you — I'll be in touch soon";
  - the reply time;
  - "Browse the portfolio" and "Back to home";
  - "Send another inquiry", which shows an empty form again.

**Email alert**
- Resend is set up with `@payloadcms/email-resend` when `RESEND_API_KEY` is set; the optional `EMAIL_FROM_ADDRESS` sets the From address. The same adapter also sends Payload's password-reset emails.
- After a successful create, `submitInquiry` sends (owner decisions 2, 4, 9, 10):
  - to `site-settings.contactEmail`, with reply-to set to the visitor's email;
  - subject "New inquiry · {project type} · {name}";
  - a plain-text body with every field and a link to the inquiry in `/admin`.
- If sending fails or takes over 5 seconds, the inquiry stays saved, the error is logged with the inquiry's ID only, and nothing is retried. The visitor still sees the thank-you.

## Out of scope

- An auto-reply email to the visitor (owner decision 1).
- Upstash rate limiting. Add it only if the honeypot and the timing check prove insufficient; it needs owner approval if it costs money.
- Automatic archiving or deletion (owner decision 3).
- The "N new" nav badge: P5.
- The two-panel inbox: P6. This phase uses Payload's default list and edit views.
- Verifying the production sending domain in Resend (SPF and DKIM): P7.

## Screens

- Site: [11 Book Me](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me.png), [11 field errors](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me--errors.png) and [11 thank-you](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me--sent.png), at 1440 px (`desktop/`) and 390 px (`mobile/`).
- The "Sending…" and failed-save states are specified in InquiryForm but not drawn.
- Studio, working in default views: 27 Inquiries.

## Content model

`inquiries`. Field-level detail is in the Build Spec, under "Content model: collections › inquiries", with the owner decisions above. Validation rules are under "Book Me & inquiries flow".

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/book` | Static. The form posts to the `submitInquiry` server action. There is no client call to `/api`. |
| `/api/inquiries` | Read, update and delete for the editor only; create denied to everyone. A logged-out read or create is denied. |

Discipline saves already refresh every page (`revalidateSite`), so `/book`'s project-type options stay current with no new refresh hook.

## Acceptance criteria

- A valid inquiry creates a `new` doc. The alert email arrives at `contactEmail`, and replying to it goes to the visitor's address. This closes the Resend part of Build Spec box 1.2.
- Invalid input shows each field's Build Spec error message under the field and moves focus to the first error. The errors are announced by screen readers. Typed values stay.
- A filled honeypot saves nothing and still shows the thank-you panel. So does a form sent within 3 seconds of the form appearing (with JavaScript).
- With JavaScript off, a valid form saves the inquiry and shows the thank-you panel, and an invalid one shows the errors with focus on the first.
- With JavaScript on, the button shows "Sending…" and is disabled while posting, and the page does not reload.
- A logged-out REST request can neither read nor create inquiries; a logged-in editor cannot create one either.
- If the email send is forced to fail, for example with a bad API key, the inquiry is still saved and the log line holds only its ID.
- If the save itself fails, the visitor sees the failed-save message, never the thank-you, and keeps their text.
- The stored doc contains only the form fields and the system fields: no IP address, no user agent.
- Statuses can be changed in the admin, including back to `new`; visitor fields are read-only.
- Screen 11 and its error and thank-you states match their captures at 1440 px and work at 390 px.

## Seed data

Four inquiries: two `new`, one `replied`, one `archived`, with bracketed placeholder names and `example.com` emails, found by email so a second run adds nothing. Seeding them sends no email.

## Open questions

None. The three earlier questions (auto-reply, retention, email failure) are owner decisions 1–3.

## Risks

- **Progressive enhancement on a static page.** A no-JavaScript post of the form must re-render `/book` with the action's result. Verify on a production build with JavaScript disabled.
- **React form reset.** React 19 resets a form after its action, so fields must take their default values from the returned state for typed text to survive an invalid or failed submit.
- **Payload's email check.** The server's email rule copies Payload's own pattern; if they ever differ, a Payload validation error on create is shown as the email field's message, never as success.
- **Sender address.** Until a domain is verified, Resend's test sender is expected to deliver only to the account owner's address, so preview alerts go to that address (owner decision 9).
- **Spam volume.** Resend's free plan sends 100 emails a day. Past that, alerts stop but inquiries still save; Upstash rate limiting needs owner approval if paid.

## QA log (2026-11-11)

Run on the final `dev` code (`d1a8291`, PR #31) plus the Studio stylesheet fix below, as a local production build on a fresh database (all 7 migrations, seeded twice, `contactEmail` set to Resend's `delivered@resend.dev` test inbox). Plan `p3-book-me`, tasks 1–8; T1 was the P2 release (PR #30, `v0.3.0`), and the per-task commits T2–T7 were on `feat/p3-book-me`, squash-merged as #31 (ADR-0003). Rows marked "Tn" cite that task's verification on the same kind of build of the same code; the rest were re-run on the final build. axe is axe-core 4.14 from the project's own dependencies (WCAG 2.2 AA tags).

| Criterion | Result | Evidence |
|---|---|---|
| `inquiries` with the Build Spec fields and admin positions, owner decisions 5, 7, 8 | Pass | Migration `20261111_083526_p3_inquiries` applies on a fresh database after P2's. Studio: Inbox group; list columns Name, Project Type, Status, Received, newest first; no "Create New", menu offers only Delete; visitor fields read-only (T3). Table columns: `id`, `name`, `email`, `project_type`, `timing`, `message`, `status`, `notes`, `created_at`, `updated_at` |
| A valid inquiry creates a `new` doc; the alert reaches `contactEmail` with reply-to the visitor | Pass locally; preview inbox **deferred** | Valid submit → row with status `new`, no alert failure logged; Resend accepted a live send to `delivered@resend.dev` and returned an id (T4). Reply-to: the adapter maps `replyTo` to Resend's `reply_to` (read in its source, T4); the send-only API key can't read emails back. Arrival in the owner's own inbox on a Vercel preview, and replying from it, is an owner check not yet run |
| Invalid input shows each Build Spec message under its field, moves focus to the first, and is announced | Pass | Empty submit → 4 messages, focus on Your name; partly invalid → focus on Email, every typed value kept (dropdown included). Each error is linked by `aria-describedby`, its control `aria-invalid="true"`; unit tests for the markup |
| A filled honeypot, or a form sent within 3 seconds, shows the thank-you and saves nothing | Pass | Honeypot submit and a submit 0.1 s after the form appeared → thank-you, 0 rows. A fast **empty** submit shows the errors (no false thank-you; fixed in T6) |
| JavaScript off: valid saves and thanks; invalid shows the errors | Pass | JS-disabled context: empty submit → 4 errors, `autofocus` on Your name; valid → thank-you with its heading focused, row saved (timing rule skipped) |
| JavaScript on: "Sending…", disabled, no reload | Pass | Button read "Sending…" and was disabled mid-request, with the status text "Sending…" (T6); a `window` marker survived submit and "Send another inquiry" |
| A logged-out REST request can neither read nor create inquiries | Pass | `GET /api/inquiries` and `/api/inquiries/1` → 403; anonymous `POST` → 403; logged-in editor `POST` → 403; anonymous update and delete → 403 (T3); `/api/graphql` → 404 |
| A forced alert failure still saves the inquiry | Pass | Server run with an invalid `RESEND_API_KEY`: thank-you shown, row saved, log `Inquiry 7: alert email failed (APIError/401)`; 0 log lines contain the visitor's details |
| A failed save never shows the thank-you and keeps the text | Pass | A temporary `CHECK (false)` constraint made inserts fail: the failed-save message appeared with focus, all values kept, 0 rows; log `Inquiry not saved (Error)` only |
| Only the form fields and system fields are stored | Pass | Column list above; the create writes the five fields and `status: 'new'` only (unit test with extra `ip`, `status`, `notes` keys) |
| Statuses change in the admin, including back to `new` | Pass | REST as the editor: archived → new → archived; Studio by keyboard: new → replied, saved |
| `next build`: `/book` ○ | Pass | Route table on the final build; `/book` served with `x-nextjs-cache: HIT` |
| Screen 11 and its error and thank-you states match at 1440 px and work at 390 px | Pass, with recorded deviations | Screenshots at 1440 and 390 against captures 11, 11 errors and 11 sent (T6); no horizontal scroll at 320, 375, 390, 768, 1024, 1280 and 1440 px. Deviations: opener title wraps wider (shared ChapterOpener, as in P2); field borders darker for contrast; "Good to know" heading at `--fs-section`; the form column is two thirds of the content width, wider than the capture's panel; Good to know rows stack between 1024 and about 1279 px |
| Seed runs twice without duplicates | Pass | 4 inquiries, 12 posts and 23 projects after both runs; 0 users |
| DoD: keyboard | Pass | `/book`: header → Good to know email link → five fields → Send inquiry → footer; the honeypot is skipped; dual ring on each stop. Thank-you: Browse the portfolio → Back to home → Send another inquiry. Inquiry editor: Status and Notes reachable, read-only fields skipped; status changed and saved by keyboard |
| DoD: axe WCAG 2.2 AA | Pass on site pages; Studio exceptions recorded | 0 violations on `/book` default, errors, failed and sent at 1440 and 390 px |
| DoD: code health | Pass | typecheck, lint, 294 unit tests |
| DoD: Vercel preview | Pass (builds only) | PR #31 `checks` and `Vercel` green (its preview migrated its own Neon branch); `dev`'s deployment of `d1a8291` succeeded. Protected previews were not browsed |

### Studio accessibility (same policy as P0–P2)

This task added to `src/app/(payload)/custom.scss`:

- On a read-only date field (the inquiry's "Received"), Payload renders an enabled, unnamed clear button that does nothing. It is now hidden: `button-name` 2 → 1 on the inquiry editor, and one dead tab stop fewer.

These remain inside Payload's built-in components and go to the P6 theme (screen 27) and upstream Payload:

- Inquiries list: row-select checkboxes with an empty `aria-label` (`label` ×9).
- Inquiry editor: the status select's react-select indicators inside `aria-hidden` (`aria-hidden-focus` ×2); the document menu button (`button-name` ×1); the react-select input and the read-only date input without a linked label (`label` ×2); document tabs (`list` ×1).

### Follow-ups

- **Owner check (deferred):** on a preview, create the admin user, set Contact email to the Resend signup address, send an inquiry, and confirm the alert arrives and a reply goes to the visitor's address.
- Release P3 to `main` as `v0.4.0` (merge commit, annotated tag) at the start of P4, as P2 was released at the start of P3. Pass `--subject "Release P3 Book Me (v0.4.0) (#N)"` to `gh pr merge` so the merge title matches P1's.
- Delete the PR #31 preview deployment and its Neon branch once merged work is no longer being reviewed.
- P7: verify the sending domain, set `EMAIL_FROM_ADDRESS`, write the inquiry retention policy with the privacy copy, and final wording for "Working on" and the opener line.
- From P1/P2, still open: favicon, `metadataBase` (P7); opener title width.
