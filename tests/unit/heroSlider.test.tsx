import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, priority, fill: _fill, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} data-priority={priority ? 'true' : undefined} src={src as string} {...rest} />
  ),
}))

import { HeroSlider } from '@/components/site/HeroSlider'
import type { HeroSlideView } from '@/lib/heroSlides'

const view = (n: number, overrides: Partial<HeroSlideView> = {}): HeroSlideView => ({
  id: `s${n}`,
  title: n === 1 ? 'Every moment has a story' : `Collection title ${n}`,
  placeLine: 'Featured · [Project title]',
  body: 'Body copy.',
  link: { href: `/portfolio/c${n}`, label: `View ${n}` },
  image: { id: n, url: `https://x/${n}.webp`, alt: `Photo ${n}`, focalX: 40, focalY: 60 } as never,
  cardKicker: `Collection 0${n}`,
  tint: n === 1 ? 'chapter' : 'photo',
  ...overrides,
})

// React 19 puts a <link rel="preload"> for the priority image first (traps.md); drop it.
const render = (slides: HeroSlideView[], bookingLabel = 'Book Me') =>
  renderToStaticMarkup(
    <HeroSlider bookingLabel={bookingLabel} header={<header>HEADER</header>} headline="Every moment has a story" slides={slides} />,
  ).replace(/^<link [^>]*\/>/, '')

const three = [view(1), view(2), view(3)]

describe('HeroSlider (P4)', () => {
  it('keeps one h1, the hidden site headline, and makes the slide title an h2', () => {
    const out = render(three)
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toContain('<h1 class="visually-hidden">Every moment has a story</h1>')
    expect(out).toMatch(/<h2 class="_title_\w+">Every moment has a story<\/h2>/)
  })

  it('is a div, not a landmark, with the header inside it', () => {
    const out = render(three)
    expect(out).toMatch(/^<div class="_hero_\w+">/) // the chapter tint adds no class
    expect(out).not.toContain('undefined')
    expect(out).not.toMatch(/^<section/)
    expect(out).toContain('<header>HEADER</header>')
  })

  it('puts the slide text, its position and its buttons in a polite live region', () => {
    const live = render(three).split('aria-live="polite"')[1].split('role="group"')[0]
    expect(live).toContain('<p class="visually-hidden">Story 1 of 3</p>')
    expect(live).toContain('Featured · [Project title]')
    expect(live).toMatch(/href="\/book"[^>]*>Book Me<\/a>/)
    expect(live).toMatch(/href="\/portfolio\/c1"[^>]*>View 1<\/a>/)
  })

  it('has one story card button per slide, named by its visible text, the current one marked', () => {
    const out = render(three)
    expect(out).toMatch(/aria-label="More stories" class="_cards_\w+" role="group"/)
    const cards = out.match(/<button aria-current="true"[^>]*>.*?<\/button>|<button class="_card_\w+"[^>]*>.*?<\/button>/g) ?? []
    expect(cards).toHaveLength(3)
    expect(out.match(/aria-current="true"/g)).toHaveLength(1)
    expect(cards[0]).toContain('aria-current="true"')
    expect(cards[1]).toMatch(/Collection 02<\/span> <span class="_cardTitle_\w+">Collection title 2<\/span>/)
    expect(cards.join('')).not.toContain('aria-label')
  })

  it('has labelled arrows that are never disabled, and hides the progress and counter', () => {
    const out = render(three)
    expect(out).toMatch(/<button aria-label="Previous story"[^>]*type="button">/)
    expect(out).toMatch(/<button aria-label="Next story"[^>]*type="button">/)
    expect(out).not.toContain('disabled')
    expect(out).toMatch(/<span aria-hidden="true" class="_counter_\w+">01<\/span>/)
    expect(out.match(/style="width:33.3/g)).toHaveLength(2) // top bar and the line by the arrows
  })

  it('loads only the current photo, with priority on slide 1', () => {
    const out = render(three)
    expect(out.match(/<img /g)).toHaveLength(1)
    expect(out).toContain('alt="Photo 1"')
    expect(out).toContain('data-priority="true"')
    expect(out).toContain('object-position:40% 60%')
  })

  it('shows a single slide without any controls or position', () => {
    const out = render([view(1)])
    expect(out).not.toContain('role="group"')
    expect(out).not.toContain('Previous story')
    expect(out).not.toContain('Story 1 of 1')
    expect(out).not.toContain('style="width')
    expect(out).toContain('<h1 class="visually-hidden">')
  })

  it('leaves out the secondary button without a public link, and Book Me without a label', () => {
    const noLink = render([view(1, { link: null }), view(2)])
    expect(noLink.split('role="group"')[0]).not.toContain('href="/portfolio/c1"')
    expect(noLink).toContain('>Book Me</a>')
    expect(render([view(1)], '  ')).not.toContain('href="/book"')
  })

  it('shows the tint and the scrim without a photo', () => {
    const out = render([view(2, { image: null })])
    expect(out).not.toContain('<img')
    expect(out).toMatch(/^<div class="_hero_\w+ _photo_\w+">/)
    expect(out).toMatch(/<div aria-hidden="true" class="_scrim_\w+"><\/div>/)
  })
})
