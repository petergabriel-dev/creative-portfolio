import config from '@payload-config'
import { draftMode, headers } from 'next/headers'
import { getPayload } from 'payload'

/**
 * The editor behind a draft-mode request, checked at render time (invariant 19). The draft-mode
 * cookie is the same for every visitor of a deployment, so on its own it never unlocks drafts.
 * headers() is only read inside draft mode, so public requests keep the static page (invariant 22).
 * Shared by the project and journal entry pages.
 */
export async function draftEditor() {
  if (!(await draftMode()).isEnabled) return null
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ?? null
}
