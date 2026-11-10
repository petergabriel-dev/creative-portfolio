import { describe, expect, it } from 'vitest'

import imageLoader, { mediaSizeFor, mediaSizeUrl } from '@/lib/media/imageLoader'

const BLOB = 'https://abc123.public.blob.vercel-storage.com/preview/sunset-cliffs.jpg'

describe('mediaSizeFor', () => {
  it('picks the smallest size at least as wide as requested', () => {
    expect(mediaSizeFor(300)).toBe('thumb')
    expect(mediaSizeFor(480)).toBe('thumb')
    expect(mediaSizeFor(481)).toBe('card')
    expect(mediaSizeFor(961)).toBe('feature')
    expect(mediaSizeFor(2560)).toBe('hero')
  })

  it('falls back to the largest size for wider requests', () => {
    expect(mediaSizeFor(3000)).toBe('hero')
  })
})

describe('mediaSizeUrl', () => {
  it('points at the generated WebP next to the original', () => {
    expect(mediaSizeUrl(BLOB, 960)).toBe(
      'https://abc123.public.blob.vercel-storage.com/preview/sunset-cliffs-card.webp',
    )
  })

  it('keeps dots inside the name and drops query strings', () => {
    expect(
      mediaSizeUrl('https://abc123.public.blob.vercel-storage.com/local/v1.2-shot.PNG?x=1', 3000),
    ).toBe('https://abc123.public.blob.vercel-storage.com/local/v1.2-shot-hero.webp')
  })
})

describe('imageLoader', () => {
  it('rewrites Blob media to a size URL', () => {
    expect(imageLoader({ src: BLOB, width: 480 })).toBe(
      'https://abc123.public.blob.vercel-storage.com/preview/sunset-cliffs-thumb.webp',
    )
  })

  it('never produces a /_next/image URL and leaves other sources alone', () => {
    expect(imageLoader({ src: '/logo.svg', width: 960 })).toBe('/logo.svg')
    expect(imageLoader({ src: BLOB, width: 1600 })).not.toContain('/_next/image')
  })
})
