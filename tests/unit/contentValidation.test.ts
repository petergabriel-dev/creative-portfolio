import { describe, expect, it } from 'vitest'

import { safeHref, validateSafeHref } from '@/lib/safeHref'
import { toSlug, validateSlug } from '@/lib/slug'
import { parseVideoUrl, validateVideoUrl } from '@/lib/video'

describe('parseVideoUrl', () => {
  it.each([
    ['https://www.youtube.com/watch?v=aqz-KE-bpKQ', 'aqz-KE-bpKQ'],
    ['https://youtube.com/watch?v=aqz-KE-bpKQ&t=30s', 'aqz-KE-bpKQ'],
    ['https://m.youtube.com/watch?v=aqz-KE-bpKQ', 'aqz-KE-bpKQ'],
    ['https://youtu.be/aqz-KE-bpKQ?si=x', 'aqz-KE-bpKQ'],
    ['https://www.youtube.com/embed/aqz-KE-bpKQ', 'aqz-KE-bpKQ'],
    ['https://www.youtube.com/shorts/aqz-KE-bpKQ', 'aqz-KE-bpKQ'],
    ['https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ', 'aqz-KE-bpKQ'],
  ])('reads the YouTube id from %s and embeds via youtube-nocookie', (url, id) => {
    expect(parseVideoUrl(url)).toEqual({
      provider: 'youtube',
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    })
  })

  it.each([
    ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871?dnt=1'],
    ['https://vimeo.com/channels/staffpicks/76979871', 'https://player.vimeo.com/video/76979871?dnt=1'],
    ['https://player.vimeo.com/video/76979871', 'https://player.vimeo.com/video/76979871?dnt=1'],
    ['https://vimeo.com/76979871/a1b2c3d4e5', 'https://player.vimeo.com/video/76979871?dnt=1&h=a1b2c3d4e5'],
    [
      'https://player.vimeo.com/video/76979871?h=a1b2c3d4e5',
      'https://player.vimeo.com/video/76979871?dnt=1&h=a1b2c3d4e5',
    ],
  ])('builds a dnt=1 Vimeo embed from %s', (url, embedUrl) => {
    expect(parseVideoUrl(url)).toMatchObject({ provider: 'vimeo', id: '76979871', embedUrl })
  })

  it.each([
    'https://example.com/watch?v=aqz-KE-bpKQ',
    'https://youtube.com.evil.example/watch?v=aqz-KE-bpKQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/channel/abc',
    'https://vimeo.com/about',
    'javascript:alert(1)',
    'ftp://vimeo.com/76979871',
    'not a url',
    '',
    undefined,
  ])('rejects %s', (url) => {
    expect(parseVideoUrl(url)).toBeNull()
  })

  it('names Vimeo and YouTube in the validation message', () => {
    expect(validateVideoUrl('https://example.com/video')).toMatch(/Vimeo or YouTube/)
    expect(validateVideoUrl('')).toBe('This field is required.')
    expect(validateVideoUrl('https://youtu.be/aqz-KE-bpKQ')).toBe(true)
  })
})

describe('safeHref', () => {
  it.each(['https://example.com/a?b=c#d', 'http://example.com', 'mailto:hi@example.com', '/portfolio/photography'])(
    'allows %s',
    (href) => {
      expect(safeHref(href)).toBe(href)
      expect(validateSafeHref(href)).toBe(true)
    },
  )

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'java\tscript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example',
    '/\\evil.example',
    'www.example.com',
    '#section',
    '',
    null,
  ])('rejects %s', (href) => {
    expect(safeHref(href)).toBeNull()
    expect(validateSafeHref(href)).toMatch(/https:\/\//)
  })
})

describe('slugs', () => {
  it.each([
    ['Photography', 'photography'],
    ['Film & Video', 'film-video'],
    ['Design & Illustration', 'design-illustration'],
    ['[Couple names] wedding', 'couple-names-wedding'],
    ['Ça va — déjà vu!', 'ca-va-deja-vu'],
    ['  2024: The   Year  ', '2024-the-year'],
    ['', ''],
  ])('turns %j into %j', (input, slug) => {
    expect(toSlug(input)).toBe(slug)
  })

  it('accepts only lowercase words joined by single hyphens', () => {
    expect(validateSlug('film-video')).toBe(true)
    expect(validateSlug('2024-the-year')).toBe(true)
    for (const bad of ['Film-Video', 'film--video', '-film', 'film-', 'film video', 'film_video', 'café']) {
      expect(validateSlug(bad)).toMatch(/lowercase/)
    }
    expect(validateSlug('')).toBe('This field is required.')
    expect(validateSlug(undefined)).toBe('This field is required.')
  })
})
