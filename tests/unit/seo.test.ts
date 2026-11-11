import { describe, expect, it } from 'vitest'

import { pageMetadata } from '@/lib/seo'
import type { Media } from '@/payload-types'

const cover = {
  id: 7,
  alt: 'Cover',
  url: 'https://blob.example/cover.jpg',
  sizes: { feature: { url: 'https://blob.example/cover-feature.webp' } },
} as Media

describe('pageMetadata', () => {
  it('uses the first populated image at the feature size', () => {
    const metadata = pageMetadata({ title: 'Photography', canonical: '/portfolio/photography', images: [3, cover] })
    expect(metadata.openGraph).toEqual({ images: [{ url: 'https://blob.example/cover-feature.webp', alt: 'Cover' }] })
  })

  it('leaves openGraph out without an image, so the layout default image stays', () => {
    const metadata = pageMetadata({ title: 'Writing & More', canonical: '/portfolio/writing-more', images: [null, 4] })
    expect('openGraph' in metadata).toBe(false)
    expect(metadata.alternates).toEqual({ canonical: '/portfolio/writing-more' })
  })

  it("prefers the editor's meta title as is and falls back to the page title", () => {
    expect(pageMetadata({ meta: { title: ' Custom ' }, title: 'Fallback', canonical: '/x', images: [] }).title).toEqual({
      absolute: 'Custom',
    })
    expect(pageMetadata({ title: 'Fallback', canonical: '/x', images: [] }).title).toBe('Fallback')
  })
})
