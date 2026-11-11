'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/**
 * Re-renders the page when the editor saves in the Studio's live preview pane. Mounted only in
 * draft mode; the Studio and the site share one origin, so Payload's serverURL stays unset.
 */
export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={typeof window === 'undefined' ? '' : window.location.origin}
    />
  )
}
