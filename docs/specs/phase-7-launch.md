# Phase 7 — Launch

Status: Draft
Depends on: P0–P6
Build Spec refs: Accessibility, SEO & performance · Publishing: drafts, preview & revalidation (sitemap) · Environments, deployment & migrations (production, launch setup) · Out of scope & open questions

Sources: [`build-spec.md`](../design/reference/creative-portfolio/build-spec.md) · [handoff](../design/reference/creative-portfolio/handoff/README.md) · [roadmap and shared rules](README.md)

## Goal

Finish SEO, prove accessibility and performance across the whole site and Studio, load the real content, and put the site live on its domain. This closes the four Build Spec "QA & launch" boxes, 8.1 to 8.4.

## In scope

**SEO completion**
- `sitemap.xml` and `robots.txt` come from Next.js metadata routes.
  - The sitemap lists published projects, posts and disciplines, plus the static pages.
  - Drafts and `/admin` are left out, and `robots.txt` disallows `/admin`.
- The sitemap is refreshed whenever a project, post or discipline is published, unpublished or deleted. This adds to the P1 and P2 refresh hooks.
- Structured data, as JSON-LD:
  - `Person` on Home and About, built from `site-settings`;
  - `CreativeWork` on project pages;
  - `BlogPosting` on journal entries.
- Check every route's `generateMetadata`, canonical URL and Open Graph image against the Build Spec SEO rules, and fill any gaps left by P0–P4.

**QA**
- A keyboard-only pass on every public page and on the admin's main flows. Main flows: log in; Overview; edit and publish a project; edit and publish a post; handle an inquiry in the inbox; edit `site-settings`, `home` and `about`; log out.
- An automated accessibility scan (axe) of every public page and every Studio screen, with no serious issues. The Definition of Done already requires zero WCAG 2.2 AA violations in each phase.
- A manual screen-reader check of the hero slider, the Book Me form errors and the two-panel inbox.
- Core Web Vitals on a mid-range phone profile:
  - Largest Contentful Paint under 2.5 s;
  - Interaction to Next Paint under 200 ms;
  - Cumulative Layout Shift under 0.1.
  - Measured as lab results against production-like content before go-live. Field results at the 75th percentile need real traffic and an analytics choice (see Open questions).
- Performance rules to confirm:
  - pages are rendered statically and refreshed on demand;
  - client JavaScript is limited to the hero slider, the form, "More projects" and video embeds;
  - every image has a fixed aspect ratio.

**Content**
- The owner enters the real content in the production Studio:
  - `site-settings`, including name, contact email, socials and default metadata;
  - all four disciplines, the projects, the posts and categories;
  - `home` hero slides, Selected work and `about`.
- No `[bracketed]` placeholder text remains on any public page or in `copy.ts`.
- The seed never runs against production. The production database starts from migrations alone, and its first user is created on first run.

**Production and ops** (each item that costs money needs the owner's approval first)
- Upgrade the Vercel team to **Pro** before the domain goes live. Hobby is non-commercial only.
- Production uses the Neon main branch and the production Blob store. Variables are set by name only: `PAYLOAD_SECRET` (a new value for production), `POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `NEXT_PUBLIC_SERVER_URL` and `PREVIEW_SECRET`.
- The Vercel functions and the Neon database run in the same region (the P0 decision).
- Connect the domain to Vercel.
- Verify the Resend sending domain by adding its SPF and DKIM DNS records. Inquiry alerts then come from that domain.
- Backup: rely on Neon point-in-time restore, and record the retention window of the Neon plan in use.

## Out of scope

- Everything the Build Spec lists as out of scope for launch:
  - private or password-protected galleries, and delivering full photo sets to clients;
  - prints, a shop, or any payments;
  - online booking, scheduling or availability calendars;
  - more than one editor role, translations, journal comments or a newsletter;
  - uploading or hosting video files.
- Upstash rate limiting, unless spam gets past the honeypot after launch. Adding it then needs owner approval.

## Screens

All site screens (01–12, 40, 41) and all Studio screens (20–31, 42) are in scope for the final QA pass. No new screens.

## Content model

No changes.

## Routes & behaviour

| Route | Behaviour |
|---|---|
| `/sitemap.xml` | Published projects, posts and disciplines, plus the static pages. Refreshed on publish, unpublish and delete |
| `/robots.txt` | Allows the public site and disallows `/admin` |

## Acceptance criteria

- **8.1:**
  - a keyboard-only pass on every page and the admin's main flows succeeds;
  - the automated accessibility scan shows no serious issues.
- **8.2:** Core Web Vitals targets are met on a mid-range phone profile: LCP under 2.5 s, INP under 200 ms and CLS under 0.1.
- **8.3:**
  - metadata, the sitemap and the structured data validate;
  - the sitemap holds no drafts and no `/admin` URLs;
  - publishing or unpublishing a project updates the sitemap without a redeploy.
- **8.4:**
  - the real content is entered;
  - Vercel is on Pro;
  - the domain is live;
  - the Resend sending domain is verified, and a production test inquiry delivers an alert from it.
- **Production state:**
  - production holds no seed data and no placeholder copy;
  - the Neon point-in-time restore window is recorded;
  - every Build Spec acceptance box in the [README coverage table](README.md#build-spec-coverage) is closed.

## Seed data

None. Production must never be seeded.

## Open questions

- **Analytics.** Vercel Web Analytics, another tool, or none? Non-blocking. It decides how field Core Web Vitals are tracked after launch.
- **Booking label.** "Book Me" or "Work with me"? It can be changed in `site-settings.bookingLabel` with no code change. Non-blocking.
- **Final copy.** What are the final name and wordmark, and the copy for every `[bracketed]` placeholder? It must be settled before go-live.
- **Domain and email.** What are the domain name and the `contactEmail` address? It must be settled before go-live.

## Risks

- **DNS timing.** Domain and email DNS changes take time to propagate. Start the Resend domain verification early, because inquiry alerts depend on it.
- **Plan timing.** Upgrading to Vercel Pro late can delay go-live. Get approval and upgrade before the domain switch.
- **Placeholder copy.** Bracketed copy can hide in `copy.ts` or in unused globals. Search the code and the published content for `[` before go-live.
