import { getSafeRedirect } from 'payload/shared'

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
 * Studio path; otherwise `/admin`. Never an absolute URL.
 */
export function safeStudioRedirect(redirectTo: unknown): string {
  const target = getSafeRedirect({
    redirectTo: typeof redirectTo === 'string' ? redirectTo : '',
    fallbackTo: STUDIO_HOME,
  })
  const inStudio = target === STUDIO_HOME || target.startsWith(`${STUDIO_HOME}/`) || target.startsWith(`${STUDIO_HOME}?`)
  return inStudio ? target : STUDIO_HOME
}

/** A form field as a string; anything else (a File, a missing key) reads as ''. */
export const formText = (formData: FormData, name: string) => {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}
