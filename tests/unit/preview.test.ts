import { describe, expect, it } from 'vitest'

import { isSafePreviewPath, previewSecretMatches, previewUrl } from '@/lib/preview'

describe('isSafePreviewPath', () => {
  it.each(['/', '/portfolio', '/portfolio/photography/couple-wedding?x=1'])('allows %s', (path) => {
    expect(isSafePreviewPath(path)).toBe(true)
  })

  it.each([
    '//evil.example',
    '/\\evil.example',
    'https://evil.example',
    'javascript:alert(1)',
    'portfolio',
    '',
    ' /portfolio',
    '/portfolio\n//evil',
    null,
    undefined,
  ])('rejects %j', (path) => {
    expect(isSafePreviewPath(path)).toBe(false)
  })
})

describe('previewSecretMatches', () => {
  it('matches only the exact secret', () => {
    expect(previewSecretMatches('s3cret-value', 's3cret-value')).toBe(true)
    expect(previewSecretMatches('s3cret-valuX', 's3cret-value')).toBe(false)
    expect(previewSecretMatches('s3cret', 's3cret-value')).toBe(false)
  })

  it('never matches when the secret is unset or empty, or nothing is given', () => {
    expect(previewSecretMatches('', '')).toBe(false)
    expect(previewSecretMatches('anything', undefined)).toBe(false)
    expect(previewSecretMatches(null, 's3cret-value')).toBe(false)
  })
})

describe('previewUrl', () => {
  it('builds a relative draft-mode URL with the encoded path', () => {
    expect(previewUrl('/portfolio/photo/p', 'abc')).toBe('/next/preview?previewSecret=abc&path=%2Fportfolio%2Fphoto%2Fp')
  })

  it('returns null without a secret or for an unsafe path', () => {
    expect(previewUrl('/portfolio', '')).toBeNull()
    expect(previewUrl('//evil.example', 'abc')).toBeNull()
  })
})
