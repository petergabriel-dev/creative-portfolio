import config from '@payload-config'
import { getPayload, type TypedUser } from 'payload'
import { cache } from 'react'

import type { About, Home } from '@/payload-types'

/**
 * Home and About reads for public pages, through the Local API with access applied
 * (`overrideAccess: false`; invariant 1). Visitors get the published version only: a global that
 * was never published, or was unpublished, comes back as `{}`, so every field may be missing and
 * the pages render their empty states. An editor checked by `draftEditor()` gets the latest draft
 * (invariant 19). React `cache` dedupes them per request.
 */

/** Home with hero slide links populated (depth 2: a project link needs its collection's slug). */
export const getHome = cache(async (editor: TypedUser | null = null): Promise<Partial<Home>> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'home',
    depth: 2,
    draft: editor !== null,
    overrideAccess: false,
    user: editor ?? undefined,
  })
})

/** About with its portrait populated. */
export const getAbout = cache(async (editor: TypedUser | null = null): Promise<Partial<About>> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'about',
    depth: 1,
    draft: editor !== null,
    overrideAccess: false,
    user: editor ?? undefined,
  })
})
