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

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterHeading } from '@/components/site/ChapterHeading'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { DetailsStrip } from '@/components/site/DetailsStrip'
import { Filmstrip } from '@/components/site/Filmstrip'
import { MediaImage } from '@/components/ui/MediaImage'
import { openerTint } from '@/lib/openerTint'
import type { Media } from '@/payload-types'

const media = (id: number, extra: Partial<Media> = {}): Media =>
  ({
    id,
    alt: `Frame ${id}`,
    url: `https://abc.public.blob.vercel-storage.com/preview/x/frame-${id}.webp`,
    width: 1600,
    height: 1200,
    focalX: 30,
    focalY: 70,
    updatedAt: '',
    createdAt: '',
    ...extra,
  }) as Media

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)

describe('MediaImage', () => {
  it('renders the image with alt text from the media doc and its focal point', () => {
    const out = html(<MediaImage aspect="4:5" media={media(1)} sizes="100vw" />)
    expect(out).toContain('alt="Frame 1"')
    expect(out).toContain('object-position:30% 70%')
    expect(out).not.toContain('aria-hidden')
  })

  it('shows only a decorative frame when the media is missing or unpopulated', () => {
    for (const missing of [null, undefined, 5, media(2, { url: null })]) {
      const out = html(<MediaImage aspect="3:2" media={missing} sizes="100vw" />)
      expect(out).toMatch(/^<div aria-hidden="true"[^>]*><\/div>$/)
    }
  })

  it('uses the media dimensions for the original aspect, with a fallback', () => {
    expect(html(<MediaImage aspect="original" media={media(1)} sizes="100vw" />)).toContain('aspect-ratio:1600 / 1200')
    expect(
      html(<MediaImage aspect="original" media={media(1, { width: null, height: null })} sizes="100vw" />),
    ).toContain('aspect-ratio:3 / 2')
  })

  it('marks priority only when asked', () => {
    expect(html(<MediaImage aspect="21:9" media={media(1)} priority sizes="100vw" />)).toContain('data-priority="true"')
    expect(html(<MediaImage aspect="21:9" media={media(1)} sizes="100vw" />)).not.toContain('data-priority')
  })
})

describe('ChapterHeading', () => {
  it('numbers the chapter with two digits and labels the section heading', () => {
    const out = html(<ChapterHeading id="ch-1" number={1} title="Highlights" />)
    expect(out).toContain('Chapter 01')
    expect(out).toMatch(/<h2[^>]*id="ch-1"[^>]*>Highlights<\/h2>/)
    expect(html(<ChapterHeading number={12} title="T" />)).toContain('Chapter 12')
  })

  it('renders the aside only when given', () => {
    expect(html(<ChapterHeading aside="A best-of selection." number={1} title="T" />)).toContain('A best-of selection.')
    expect(html(<ChapterHeading number={1} title="T" />).match(/<div/g)).toHaveLength(2)
  })
})

describe('BookingFinale', () => {
  it('is a section named by its h2, with the label and a booking link', () => {
    const out = html(<BookingFinale body="Tell me about it." bookingLabel="Book Me" headline="Have a shoot in mind?" />)
    const id = out.match(/aria-labelledby="([^"]+)"/)?.[1]
    expect(id).toBeTruthy()
    expect(out).toContain(`id="${id}"`)
    expect(out).toContain('Book me</p>')
    expect(out).toMatch(/<a[^>]*href="\/book"[^>]*>Book Me<\/a>/)
    expect(out).toContain('Tell me about it.')
  })

  it('omits an empty body and adds the secondary action with a hidden arrow', () => {
    const out = html(
      <BookingFinale
        body="  "
        bookingLabel="Book Me"
        headline="H"
        secondary={{ label: 'Back to portfolio', href: '/portfolio' }}
      />,
    )
    expect(out.match(/<p/g)).toHaveLength(1) // only the label
    expect(out).toMatch(/href="\/portfolio"[^>]*><span aria-hidden="true">←<\/span>Back to portfolio/)
  })
})

describe('DetailsStrip', () => {
  it('lists facts as dt/dd pairs and drops empty values', () => {
    const out = html(
      <DetailsStrip
        items={[
          { label: 'Collection', value: 'Photography' },
          { label: 'Client', value: '  ' },
          { label: 'Year', value: 2026 },
          { label: 'My role', value: null },
        ]}
        tone="dark"
      />,
    )
    expect(out.match(/<dt/g)).toHaveLength(2)
    expect(out).toContain('<dd')
    expect(out).toContain('2026')
    expect(out).not.toContain('Client')
  })

  it('renders nothing when no fact has a value', () => {
    expect(html(<DetailsStrip items={[{ label: 'Client', value: '' }]} tone="light" />)).toBe('')
  })
})

describe('Filmstrip', () => {
  it('renders a list of the populated images only', () => {
    const out = html(
      <Filmstrip aspect="4:5" images={[media(1), 7, media(2)]} layout="strip" priority sizes="20vw" />,
    )
    expect(out).toContain('role="list"')
    // React 19 also emits <link rel="preload"> hints for early images, so match <li> exactly.
    expect(out.match(/<li[ >]/g)).toHaveLength(2)
    expect(out.match(/data-priority="true"/g)).toHaveLength(1)
  })

  it('renders nothing without a populated image', () => {
    expect(html(<Filmstrip aspect="1:1" images={[3, 4]} layout="pair" sizes="50vw" />)).toBe('')
    expect(html(<Filmstrip aspect="1:1" images={null} layout="strip" sizes="50vw" />)).toBe('')
  })
})

describe('ChapterOpener (P1)', () => {
  it('starts the context line with breadcrumb links and hidden separators', () => {
    const out = html(
      <ChapterOpener
        breadcrumb={[{ label: 'Portfolio', href: '/portfolio' }]}
        contextLine="Collection 01"
        header={null}
        title="Photography"
      />,
    )
    expect(out).toMatch(/<a[^>]*href="\/portfolio"[^>]*>Portfolio<\/a><span aria-hidden="true"> · <\/span>Collection 01/)
  })

  it('wraps lead and actions in a row container only for the split layout', () => {
    const split = html(
      <ChapterOpener actions={<span>Book</span>} contextLine="" header={null} layout="split" lead="Lead" title="T" />,
    )
    const stacked = html(
      <ChapterOpener actions={<span>Book</span>} contextLine="" header={null} lead="Lead" title="T" />,
    )
    expect(split).toMatch(/<div class="[^"]*split[^"]*"><p[^>]*>Lead<\/p><div/)
    expect(stacked).not.toMatch(/split/)
  })

  it('renders the details slot after the title', () => {
    const out = html(<ChapterOpener contextLine="x" details={<dl>facts</dl>} header={null} title="T" />)
    expect(out.indexOf('<dl>')).toBeGreaterThan(out.indexOf('<h1'))
  })
})

describe('openerTint', () => {
  it('maps every discipline tint option to its opener surface', () => {
    expect(['warm', 'plum', 'forest', 'clay', 'default'].map((v) => openerTint(v as never))).toEqual([
      'photo',
      'film',
      'design',
      'writing',
      'chapter',
    ])
    expect(openerTint(null)).toBe('chapter')
  })
})
