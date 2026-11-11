---
id: ADR-0006
title: Inquiry submission - save first, then alert; text project type; client timing check
status: Active
date: 2026-11-11
readWhen: changing the Book Me form, the submitInquiry action, the inquiries collection or its access; touching email sending, Resend or spam checks; logging anything about an inquiry
---

# ADR-0006: Inquiry submission - save first, then alert; text project type; client timing check

## Decision

- **Save first, then alert** (P3 owner decision 4, 2026-11-11). The `submitInquiry` server action (`src/app/(frontend)/book/actions.ts`) validates, calls `payload.create` with `overrideAccess: true`, and only after it returns sends the owner alert with `payload.sendEmail`. This replaces the Build Spec's `afterChange` hook. The send is awaited inside its own error handling and bounded at 5 seconds; a failure or timeout is logged and never retried, and the visitor still sees the thank-you (owner decision 2).
- **What a failed save shows** (owner decision 13). A Payload validation error maps to the Build Spec field messages; any other create error answers `failed`, keeping the visitor's text, never `sent`.
- **Order of checks**: a filled honeypot is spam whatever else was sent; then field validation; then, only for input that would be saved, the timing rule.
- **Timing rule** (owner decision 6). With JavaScript the form sends `elapsedMs`, the milliseconds since it mounted, set in `onSubmit`; under 3,000 is spam. A missing or malformed value (no JavaScript) skips the rule. Spam answers `sent` and saves nothing. `/book` stays static.
- **`projectType` is text** (owner decision 5): a snapshot of the label picked, a discipline name or "Something else", validated against the current disciplines. The Build Spec's `select` can't hold options that live in the database.
- **Inquiries are private and created only by the server.** Create access is denied to everyone, the editor included; read, update and delete are editor-only. Visitor fields are read-only in the Studio; status is a plain select with no transition rule (owner decisions 7, 8).
- **No visitor data in logs.** Failures log the inquiry ID and the error's name and HTTP status only; error messages are never logged, because Resend's can echo the addresses it was given.
- **Email**: `@payloadcms/email-resend` is Payload's adapter when `RESEND_API_KEY` is set, otherwise Payload logs emails to the console. The From address is `EMAIL_FROM_ADDRESS`, defaulting to Resend's test sender until the domain is verified in P7 (owner decision 9). The alert is plain text with reply-to set to the visitor (owner decision 10). No auto-reply (owner decision 1).

## Why

- With the Postgres adapter, hooks run inside the create's transaction: an error escaping an `afterChange` hook rolls the insert back, and the Resend call would hold the transaction open. Sending after the create returns makes losing an inquiry to an email problem impossible, and the seed never sends email without a skip flag.
- A false "thank you" for a lost inquiry is the worst outcome for the site's primary action, so a failed save must look like a failure.
- Validation before the timing rule: in live checks, a fast empty submit otherwise got the thank-you with nothing saved.
- A server-rendered load time would be stale on a static page; the client's own elapsed time avoids clock skew and keeps the page static. It is forgeable and only catches fast JavaScript bots; the honeypot covers the rest, and paid rate limiting (Upstash) needs owner approval.
- A text snapshot keeps each inquiry's record true to what the visitor chose even if disciplines are renamed or deleted, and avoids the required-relationship trap seen with categories.

## Affects

Docs:

- `docs/specs/phase-3-book-me.md`
- `docs/specs/README.md`
- `docs/design/components/InquiryForm.md`
- `docs/engineering/architecture.md`
- `docs/engineering/invariants.md`
- `docs/engineering/conventions.md`
- `docs/engineering/dev-workflow.md`
- `docs/engineering/traps.md`

Code:

- `src/app/(frontend)/book/actions.ts`
- `src/app/(frontend)/book/page.tsx`
- `src/components/site/InquiryForm.tsx`
- `src/lib/inquiry.ts`
- `src/collections/Inquiries.ts`
- `src/payload.config.ts`
- `src/seed/inquiries.ts`
- `.env.example`

## Consequences

- Good: an inquiry is never lost to an email failure, and the visitor never sees success for a lost one.
- Good: `/book` is static and works without JavaScript; spam gets no signal that it was caught.
- Good: no visitor data reaches logs or a second store.
- Bad/risk: the alert adds up to 5 seconds to a submit when Resend is slow.
- Bad/risk: the timing value can be forged; a bot that waits and skips the honeypot gets through until rate limiting is added.
- Bad/risk: our email check copies Payload's pattern; if Payload changes it, the mismatch shows as the email field's message (handled), and the copy needs updating on Payload upgrades.
- Bad/risk: `projectType` labels in old inquiries can differ from current discipline names.

## Read when

- changing the Book Me form, `submitInquiry`, the `inquiries` collection or its access
- touching email sending, Resend settings or spam checks
- logging anything about an inquiry

## Supersedes

- None. Overrides the Build Spec's `afterChange` alert hook and its `projectType` select.
