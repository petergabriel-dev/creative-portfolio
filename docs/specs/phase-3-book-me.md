# Phase 3 — Book Me

Status: Draft
Depends on: P0 (`site-settings`, shell), P1 (`disciplines` supply the project-type options)
Build Spec refs: Content model: collections › inquiries · Book Me & inquiries flow · Access control & auth · Front-end pages (Book Me) · Decisions & stack (Resend, optional Upstash) · Environments, deployment & migrations (variables)

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

A visitor sends an inquiry from `/book`. It is saved as an `inquiries` doc with status `new`, and the owner gets an email they can reply to directly. This is the site's primary action, so validation, spam handling, privacy and never losing an inquiry are non-negotiable.

## In scope

**Content model** (fields and admin positions exactly as in the Build Spec)
- `inquiries`:
  - no drafts; `useAsTitle: name`;
  - list columns: name, project type, status and received (`createdAt`); newest first by default;
  - admin group Inbox.
- `status` takes `new` (the default), `replied` or `archived`. It moves new → replied → archived, and any status can go back to `new`.
- `notes` is private and never shown publicly.
- `projectType` offers one option per discipline, plus "Something else".
  - The option labels are the discipline names. Capture 11 shows shorter labels such as "Film or video"; the Build Spec wins.
  - The server checks the submitted value against the current disciplines.
- Access:
  - only the editor can read, update and delete;
  - the public cannot create through REST;
  - the `submitInquiry` server action is the only code path that writes with `overrideAccess: true`.
- Only the form fields are stored. No IP address and no tracking data.

**Page and form** (`/book`)
- The opener, then Chapter 01 "Good to know" beside the inquiry form, then the footer. This is the only page with no booking finale.
- "Good to know" shows `site-settings.contactEmail`, `location` and `replyTime`, laid out as in capture 11.
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
  - On invalid input, each error sits under its field, linked with `aria-describedby` and `aria-invalid`, and focus moves to the first error.
  - Spam: if the honeypot is filled, or the form was sent less than 3 seconds after the page loaded, the visitor sees the normal success state and nothing is saved.
  - On valid input, the action calls `payload.create` on `inquiries` with `overrideAccess: true` and `status: new`.
- Thank-you panel, which replaces the form:
  - "Thank you — I'll be in touch soon";
  - the reply time;
  - links to Portfolio and Home;
  - "Send another inquiry", which shows an empty form again.

**Email alert**
- Resend is set up with `@payloadcms/email-resend`, using the `RESEND_API_KEY` variable.
- An `afterChange` hook runs on create only and sends:
  - to `site-settings.contactEmail`, with reply-to set to the visitor's email;
  - subject "New inquiry · {project type} · {name}";
  - a body with every field and a link to the inquiry in `/admin`.
- Proposed (an open question below): if sending fails, the inquiry stays saved and the error is logged. The hook never throws and never retries.

## Out of scope

- An auto-reply email to the visitor (open question).
- Upstash rate limiting. Add it only if the honeypot and the timing check prove insufficient; it needs owner approval if it costs money.
- The "N new" nav badge: P5.
- The two-panel inbox: P6. This phase uses Payload's default list and edit views.
- Verifying the production sending domain in Resend (SPF and DKIM): P7.

## Screens

- Site: [11 Book Me](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me.png), [11 field errors](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me--errors.png) and [11 thank-you](../design/reference/creative-portfolio/handoff/screens/desktop/11-book-me--sent.png), at 1440 px (`desktop/`) and 390 px (`mobile/`).
- The "Sending…" state is described but not drawn: the button reads "Sending…" and is disabled.
- Studio, working in default views: 27 Inquiries.

## Content model

`inquiries`. Field-level detail is in the Build Spec, under "Content model: collections › inquiries". Validation rules are under "Book Me & inquiries flow".

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/book` | The form posts to the `submitInquiry` server action. There is no client call to `/api`. |
| `/api/inquiries` | Editor only. A logged-out read or create is denied. |

## Acceptance criteria

- A valid inquiry creates a `new` doc. The alert email arrives at `contactEmail`, and replying to it goes to the visitor's address. This closes the Resend part of Build Spec box 1.2.
- Invalid input shows each field's Build Spec error message under the field and moves focus to the first error. The errors are announced by screen readers.
- A filled honeypot saves nothing and still shows the thank-you panel. So does a form sent within 3 seconds of the page loading.
- With JavaScript off, a valid form saves the inquiry and shows the thank-you panel, and an invalid one shows the errors.
- With JavaScript on, the button shows "Sending…" and is disabled while posting, and the page does not reload.
- A logged-out REST request can neither read nor create inquiries.
- If the email send is forced to fail, for example with a bad API key on a preview, the inquiry is still saved.
- The stored doc contains only the form fields and the system fields: no IP address, no user agent.
- Statuses can be changed in the admin, including back to `new`.
- Screen 11 and its error and thank-you states match their captures at 1440 px and work at 390 px.

## Seed data

A few inquiries in each status (`new`, `replied`, `archived`), with bracketed placeholder names and `example.com` emails. Seeding them sends no email.

## Open questions

- **Auto-reply.** Should visitors get an automatic "I've got your message" email, or only the editor alert? Non-blocking; the default is the editor alert only.
- **Retention.** How long are inquiries kept before they are archived or deleted? Non-blocking.
- **Email failure.** Confirm the proposal: if the alert fails, keep the inquiry, log the error, and don't retry. Non-blocking.

## Risks

- **Hook errors may undo the save.** With the Postgres adapter, an error thrown inside `afterChange` may roll back the create, and the inquiry would be lost. This is likely but not verified. The email call must catch its own errors; verify in `/pi-plan`.
- **The timing check versus caching.** If `/book` is statically cached, a page-load time rendered on the server is stale. The load time has to come from the client, or from a signed value. Visitors without JavaScript must not be wrongly flagged as spam; decide the rule in `/pi-plan`.
- **Project-type options are dynamic.** A Payload `select` field has fixed options, but these come from disciplines. Decide in `/pi-plan` between storing the label as text with server validation and a relationship plus "Something else".
- **Sender address.** Until a domain is verified, Resend only allows its test sender, so preview emails may be limited to the account owner's address.
