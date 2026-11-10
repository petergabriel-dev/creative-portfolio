import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { isSafePreviewPath, previewSecretMatches } from '@/lib/preview'

/**
 * Turns on Next.js draft mode for a logged-in editor, then opens the requested page
 * (Build Spec › Publishing). It needs all three: the preview secret, an editor session and a
 * site-relative path. Anything else gets a 403 and no draft-mode cookie.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')

  if (!previewSecretMatches(searchParams.get('previewSecret')) || !isSafePreviewPath(path)) {
    return new Response('Forbidden', { status: 403 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Forbidden', { status: 403 })

  ;(await draftMode()).enable()
  redirect(path)
}
