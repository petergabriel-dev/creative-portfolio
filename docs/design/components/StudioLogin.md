# StudioLogin

## Purpose

The Studio log-in screen at `/admin/login` (screen 20 and its error state). It replaces Payload's login view (`admin.components.views.login`) because Payload's form reports errors only as pop-up toasts, and capture 20--error shows an inline message tied to the form. Signing in still runs Payload's own login (lockout, password check, HTTP-only cookie). Sources: captures 20 and 20--error at 1440 px and mobile 20 at 390 px; the Build Spec sections "Admin (Studio) customisation" and "Access control & auth"; the P5 owner decisions of 2026-11-11 (`docs/specs/phase-5-studio-shell.md`).

## Anatomy

**Screen:** at least the full viewport height (`min-height: 100dvh`), two panels.

**Brand panel** (`--color-studio-nav-bg`, text `--color-on-dark-heading`): a flex column, padding `--space-12` block and `--space-8` inline below 1024 px; `--space-20` block and `--gutter` inline from 1024 px.

1. StudioBrand `full`, tone `dark` (see StudioNav).
2. **Headline block**, pushed to the bottom from 1024 px (`margin-block-start: auto`), `--space-14` below the brand below 1024 px:
   - a short rule: `--rule-short` wide, `--border-strong` high, `--color-on-dark-heading`, `--space-6` above the headline;
   - the headline `<p>`: `site-settings.headline`, `--font-display`, `--fw-regular`, `--fs-section`, `--lh-section`, uppercase, `--color-on-dark-heading`, `text-wrap: balance`. Without a headline the block shows the rule only;
   - "Back to the site": Button `text` → `/`, colour inherited, `--space-10` above.

**Form panel** (`--color-studio-page`): padding `--space-12` block and `--space-5` inline below 1024 px; from 1024 px the column is centred vertically with `--space-20` padding-inline-start. The column is at most `--measure-body` wide.

1. **Label:** `<p>` "Studio": `--fs-label`, `--fw-semibold`, `--tracking-label`, uppercase, `--color-text-muted`.
2. **Title:** `<h1>` "Log in": `--font-display`, `--fw-regular`, `--fs-studio-title`, `--lh-section`, uppercase, `--color-text`.
3. **Alert** (error states only), `--space-6` above: `<div id role="alert" tabindex="-1">`, `--color-studio-card` fill, a `--space-1` solid `--color-error` inline-start border, padding `--space-4` block and `--space-5` inline, `--fs-body`, `--fw-semibold`, `--color-error`.
4. **Form** (`<form noValidate>` posting to the login server action), `--space-6` above, fields `--space-6` apart:
   - **Email:** `<label for>` "Email" then `<input type="email" name="email" autocomplete="email" required>`.
   - **Password:** `<label for>` "Password" then `<input type="password" name="password" autocomplete="current-password" required>`.
   - **Redirect:** `<input type="hidden" name="redirect">`, the page's raw `?redirect=` value (checked on the server).
   - **Label:** `--fs-sm`, `--fw-semibold`, `--color-text`, sentence case, `--space-2` above the control.
   - **Control:** min-height `--tap-cms`, padding-inline `--space-4`, `--color-studio-field-bg` fill, `--border-hairline` solid `--color-studio-field-border`, `--radius-cms-field`, `--font-body` at `--fs-body`, `--color-text`.
5. **Actions**, `--space-7` above: a row, `justify-content: space-between`, `align-items: center`, wrapping with `--space-4` gap: Button `ink` size `default`, `type="submit"`, "Log in"; Button `text` "Forgot password?" → `/admin/forgot` (Payload's own view).
6. **Lock note:** `<p>` "After 5 wrong tries the account locks for 15 minutes.": `--fs-sm`, `--color-text-muted`, `--space-6` above.

All copy lives in `copy.ts`.

## Variants

One screen with a default state and four error messages:

| Error | When | Message | Fields marked invalid |
|---|---|---|---|
| `empty` | Email or password left blank; Payload is not called | "Enter your email and password to log in." | Each blank field |
| `invalid` | Payload's `AuthenticationError` (unknown email or wrong password; never says which) | "That email and password don't match." | Both |
| `locked` | Payload's `LockedAuth` (5 wrong tries; 15 minutes) | "This account is locked after too many wrong tries. Try again in 15 minutes." | None |
| `failed` | Anything else | "Something went wrong. Try again." | None |

The `locked` message confirms the email belongs to the editor; accepted by the owner (2026-11-11) so a locked owner knows why the right password fails.

## Sizes

One. The title is the fixed `--fs-studio-title`; the headline scales with `--fs-section`.

## States

| State | What changes |
|---|---|
| Default | Empty fields, no alert |
| Hover | Field border `--color-text`; Buttons per the Button spec |
| Focus-visible | Global dual focus ring; on the brand panel the bone halo carries it |
| Pending | (JavaScript) the submit Button is `disabled` (`--opacity-disabled`) and reads "Logging in…"; a visually hidden `role="status"` says the same |
| Error | The alert shows its message; each field marked invalid gets a 2 px `--color-error` edge (border colour plus an inset `--border-hairline` shadow, so nothing shifts), `aria-invalid="true"` and `aria-describedby` → the alert. The typed email stays; the password is cleared |
| Success | A server redirect to the safe target (`/admin` by default); nothing renders |
| Active | Same as hover |
| Loading, empty | Not applicable |

## Props/API

```ts
// admin.components.views.login: a server component
type StudioLoginProps = {
  initPageResult: InitPageResult // req.user: a logged-in user is redirected before render
  searchParams: { redirect?: string | string[] }
}

// The client form (useActionState)
type StudioLoginFormProps = { redirect: string }
type LoginState = { error: 'empty' | 'invalid' | 'locked' | 'failed' | null; email: string }
```

- The form posts to a `'use server'` action that calls Payload's `login()` from `@payloadcms/next/auth`, so it works without JavaScript.
- Success and the logged-in visit both redirect to `getSafeRedirect({ redirectTo, fallbackTo: '/admin' })` from `payload/shared`: never an absolute or protocol-relative URL.
- The action logs only an unexpected error's `name`; never the email, password or message.

## Accessibility

- One `<h1>` ("Log in"); the headline on the brand panel is a `<p>`.
- Visible `<label for>` on both fields; `type="email"`, `autocomplete` email / current-password; `required` stays for assistive technology while `noValidate` lets the server's message show.
- **Focus:** after an error the alert gets focus (with JavaScript in an effect; without JavaScript the server HTML puts `autofocus` on it). The alert's `role="alert"` announces it.
- Fields marked invalid point at the alert with `aria-describedby`.
- Targets: fields `--tap-cms` (48 px); Buttons ≥ 44 px; "Back to the site" and "Forgot password?" meet 44 × 44 px through Button `text`.
- Contrast (computed 2026-11-11):
  - brand panel: headline, back link and brand name `--bone` on `--ink` 15.4:1; "Studio · CMS" gold on `--ink` 9.2:1;
  - form panel: labels and title `--ink` on `--bone` 15.4:1; "Studio" label and lock note `--muted` on `--bone` 6.1:1;
  - field border `--field-border` on `--bone` 3.2:1 and on white 3.6:1 (non-text, 3:1 required); typed text `--ink` on white 17.4:1;
  - alert text `--error` on `--surface` 7.3:1; error edge `--error` on white 7.6:1.

## Responsive

- **From 1024 px:** two equal columns (`1fr 1fr`), full height, as capture 20.
- **Below 1024 px:** the brand panel becomes a band above the form (mobile capture 20): brand, then the rule, headline and "Back to the site"; the form follows at full width.
- No horizontal scroll at 320 px. A long headline wraps (balanced); a long site name wraps to two lines.

## Usage

- Only at `/admin/login`. Payload's forgot-password, reset and create-first-user views stay built in and themed by `custom.scss`; Payload 3.93 draws no logo on them.
- Motion: border and colour transitions over `--duration-fast`, none under `prefers-reduced-motion`.

## Preview

[Open preview](../preview/index.html#pv-studio-login)
