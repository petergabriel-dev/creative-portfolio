import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

/**
 * Site settings for public pages, read once per request through the Local API
 * with access control applied (`overrideAccess: false`).
 */
export const getSiteSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    draft: false,
    overrideAccess: false,
  })
})
