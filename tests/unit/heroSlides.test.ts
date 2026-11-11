import { describe, expect, it } from 'vitest'

import { heroLinkHref, heroSlides, selectedWorkColumns, wrapIndex } from '@/lib/heroSlides'
import type { Home } from '@/payload-types'

type Slide = Home['heroSlides'][number]

const photography = { id: 1, slug: 'photography', name: 'Photography' }
const image = { id: 5, url: '/media/frame.webp', alt: 'A frame', width: 1600, height: 900 }
const project = (overrides: object = {}) => ({
  id: 9,
  slug: 'couple-wedding',
  title: '[Couple names] wedding',
  _status: 'published',
  collection: photography,
  ...overrides,
})

const slide = (overrides: Partial<Record<keyof Slide, unknown>> = {}) =>
  ({
    id: 'a',
    title: 'Photography',
    placeLine: 'Featured · [Project title]',
    body: 'Body copy.',
    link: { relationTo: 'disciplines', value: photography },
    linkLabel: 'View photography',
    image,
    cardKicker: 'Collection 01',
    tint: 'warm',
    ...overrides,
  }) as Slide

describe('heroLinkHref', () => {
  it('links a discipline to its collection page', () => {
    expect(heroLinkHref({ relationTo: 'disciplines', value: photography } as Slide['link'])).toBe('/portfolio/photography')
  })

  it('links a published project under its collection', () => {
    expect(heroLinkHref({ relationTo: 'projects', value: project() } as Slide['link'])).toBe(
      '/portfolio/photography/couple-wedding',
    )
  })

  it('gives null for anything the public cannot open', () => {
    const projects = (value: unknown) => heroLinkHref({ relationTo: 'projects', value } as Slide['link'])
    expect(projects(9)).toBeNull() // unreadable: comes back unpopulated
    expect(projects(project({ _status: 'draft' }))).toBeNull() // an editor's draft
    expect(projects(project({ collection: 3 }))).toBeNull() // collection not populated
    expect(projects(project({ slug: '' }))).toBeNull()
    expect(heroLinkHref({ relationTo: 'disciplines', value: 1 } as Slide['link'])).toBeNull()
    expect(heroLinkHref(null)).toBeNull()
    expect(heroLinkHref(undefined)).toBeNull()
  })
})

describe('heroSlides', () => {
  it('maps a slide into a plain view', () => {
    expect(heroSlides({ heroSlides: [slide()] }, 'Every moment has a story')).toEqual([
      {
        id: 'a',
        title: 'Photography',
        placeLine: 'Featured · [Project title]',
        body: 'Body copy.',
        link: { href: '/portfolio/photography', label: 'View photography' },
        image,
        cardKicker: 'Collection 01',
        tint: 'photo',
      },
    ])
  })

  it('shows the site headline for a blank title (owner decision 3)', () => {
    const [blank, spaces, missing] = heroSlides(
      { heroSlides: [slide({ title: '' }), slide({ title: '   ' }), slide({ title: null })] },
      'Every moment has a story',
    )
    expect([blank.title, spaces.title, missing.title]).toEqual(Array(3).fill('Every moment has a story'))
  })

  it('drops the secondary link when the target is not public or has no label', () => {
    const [draft, unlabelled] = heroSlides(
      {
        heroSlides: [
          slide({ link: { relationTo: 'projects', value: project({ _status: 'draft' }) } }),
          slide({ linkLabel: '  ' }),
        ],
      },
      'Headline',
    )
    expect(draft.link).toBeNull()
    expect(unlabelled.link).toBeNull()
  })

  it('keeps a missing image as null and falls back to the default tint and index ids', () => {
    const [view] = heroSlides({ heroSlides: [slide({ image: 5, tint: undefined, id: null })] }, 'Headline')
    expect(view.image).toBeNull()
    expect(view.tint).toBe('chapter')
    expect(view.id).toBe('0')
  })

  it('gives no slides for an unpublished global ({})', () => {
    expect(heroSlides({}, 'Headline')).toEqual([])
  })
})

describe('wrapIndex', () => {
  it('wraps past both ends, so the arrows never stop', () => {
    expect(wrapIndex(5, 5)).toBe(0) // Next on the last slide
    expect(wrapIndex(-1, 5)).toBe(4) // Previous on the first slide
    expect(wrapIndex(2, 5)).toBe(2)
    expect(wrapIndex(0, 1)).toBe(0)
    expect(wrapIndex(3, 0)).toBe(0)
  })
})

describe('selectedWorkColumns', () => {
  const items = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

  it('fills three columns in order, numbering down each one', () => {
    expect(selectedWorkColumns(items(9))).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ])
    expect(selectedWorkColumns(items(7))).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('uses fewer columns when there are few items, and none for no items', () => {
    expect(selectedWorkColumns(items(4))).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(selectedWorkColumns(items(1))).toEqual([[1]])
    expect(selectedWorkColumns([])).toEqual([])
  })
})
