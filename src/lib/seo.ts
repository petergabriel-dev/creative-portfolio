import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

type Meta = { title?: string | null; description?: string | null; image?: Media | number | null } | null | undefined

/** Open Graph images for the first populated media, at the `feature` size; undefined when there is none. */
export function ogImages(...candidates: (Media | number | null | undefined)[]): Metadata['openGraph'] {
  const media = candidates.find((candidate): candidate is Media => typeof candidate === 'object' && !!candidate?.url)
  if (!media) return undefined
  return { images: [{ url: media.sizes?.feature?.url || media.url!, alt: media.alt }] }
}

/**
 * Page metadata from the SEO plugin's `meta` group with fallbacks (Build Spec › SEO). A meta title
 * the editor wrote is used as is; a fallback title gets the site's title template.
 */
export function pageMetadata({
  meta,
  title,
  description,
  canonical,
  images,
}: {
  meta?: Meta
  title: string
  description?: string | null
  canonical: string
  images: (Media | number | null | undefined)[]
}): Metadata {
  const metaTitle = meta?.title?.trim()
  const openGraph = ogImages(meta?.image, ...images)
  return {
    title: metaTitle ? { absolute: metaTitle } : title,
    description: meta?.description?.trim() || description || undefined,
    alternates: { canonical },
    // Leave the key out without an image: Next replaces the layout's openGraph (and its default
    // image) with any key a page returns, even `openGraph: undefined`.
    ...(openGraph && { openGraph }),
  }
}
