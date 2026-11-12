'use server'

import config from '@payload-config'
import { login } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { AuthenticationError, getPayload, LockedAuth } from 'payload'

import { formText, type LoginField, type LoginState, safeStudioRedirect } from '@/lib/studioLogin'

/**
 * The Studio log-in (P5 owner decision 5). Payload's own `login()` checks the password, applies the
 * lockout (5 tries, 15 minutes) and sets the HTTP-only cookie from the users collection's auth
 * config; this action only validates the form, maps Payload's errors to messages and redirects.
 * Nothing about the visitor is logged: an unexpected error logs its name only.
 */
export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formText(formData, 'email').trim()
  const password = formText(formData, 'password')

  const blank: LoginField[] = [...(email ? [] : ['email' as const]), ...(password ? [] : ['password' as const])]
  if (blank.length > 0) return { error: 'empty', email, invalid: blank }

  try {
    await login({ collection: 'users', config, email, password })
  } catch (error) {
    if (error instanceof LockedAuth) return { error: 'locked', email, invalid: [] }
    if (error instanceof AuthenticationError) return { error: 'invalid', email, invalid: ['email', 'password'] }
    const payload = await getPayload({ config })
    payload.logger.error(`Studio log-in failed (${error instanceof Error ? error.name : 'Error'})`)
    return { error: 'failed', email, invalid: [] }
  }

  // Outside the try: redirect() throws to finish the action.
  redirect(safeStudioRedirect(formText(formData, 'redirect')))
}
