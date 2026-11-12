import { getSafeRedirect } from 'payload/shared'

import { copy } from '@/copy'

/** The Studio's home; every log-in redirect stays under it. */
export const STUDIO_HOME = '/admin'

export type LoginError = 'empty' | 'invalid' | 'locked' | 'failed'
export type LoginField = 'email' | 'password'

/** What the log-in action returns to the form (docs/design/components/StudioLogin.md). */
export type LoginState = {
  error: LoginError | null
  /** The typed email, kept after an error; the password never comes back. */
  email: string
  /** Fields to mark invalid: blank ones for `empty`, both for `invalid`, none otherwise. */
  invalid: LoginField[]
}

export const INITIAL_LOGIN_STATE: LoginState = { error: null, email: '', invalid: [] }

/**
 * Where to go after logging in: the `?redirect=` value when Payload's `getSafeRedirect` accepts it
 * (same origin, no protocol-relative, encoded-slash, backslash or scheme tricks) **and** it is a
 * Studio path once dot-segments are resolved; otherwise `/admin`. Never an absolute URL.
 */
export function safeStudioRedirect(redirectTo: unknown): string {
  const target = getSafeRedirect({
    redirectTo: typeof redirectTo === 'string' ? redirectTo : '',
    fallbackTo: STUDIO_HOME,
  })
  // Check the path the browser will actually open: the URL parser resolves dot-segments
  // (`/admin/../api`, `/admin/%2e%2e/`), which a string prefix test would let through.
  const { pathname, search, hash } = new URL(target, 'http://localhost')
  const inStudio = pathname === STUDIO_HOME || pathname.startsWith(`${STUDIO_HOME}/`)
  return inStudio ? `${pathname}${search}${hash}` : STUDIO_HOME
}

/** A form field as a string; anything else (a File, a missing key) reads as ''. */
export const formText = (formData: FormData, name: string) => {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** Payload's reset view under the Studio (`admin.routes.reset`, Payload's default). */
const RESET_ROUTE = `${STUDIO_HOME}/reset`

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

/**
 * The password-reset email. Payload builds its link from `serverURL`, which stays unset (traps.md),
 * and otherwise from the request's Host header only when that origin is allow-listed, so its own
 * email carries a relative link. This one uses the trusted email base URL (`adminBaseUrl`), never
 * the Host header, so the link can't be pointed at another site.
 */
export function resetPasswordEmailHtml(token: string, baseUrl: string): string {
  const url = escapeHtml(`${baseUrl}${RESET_ROUTE}/${encodeURIComponent(token)}`)
  const t = copy.studio.resetEmail
  return `<p>${escapeHtml(t.intro)}</p><p><a href="${url}">${url}</a></p><p>${escapeHtml(t.ignore)}</p>`
}
