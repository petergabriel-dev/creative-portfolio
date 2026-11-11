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
import { CollectionTile } from '@/components/site/CollectionTile'
import { DetailsStrip } from '@/components/site/DetailsStrip'
import { Filmstrip } from '@/components/site/Filmstrip'
import { JournalRow } from '@/components/site/JournalRow'
import { Pagination } from '@/components/site/Pagination'
import { SelectedWork } from '@/components/site/SelectedWork'
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

/** The opening tag of the first element of `tag` whose attributes contain `marker`. */
const openingTag = (out: string, tag: string, marker: string) =>
  out.match(new RegExp(`<${tag}\\b[^>]*${marker.replace(/[[\]/.*+?^${}()|\\]/g, '\\$&')}[^>]*>`))?.[0] ?? ''

describe('JournalRow (P2)', () => {
  const row = (extra: Partial<Parameters<typeof JournalRow>[0]> = {}) =>
    html(
      <JournalRow
        categoryName="Process"
        cover={media(4)}
        excerpt="Before a shoot, there's a pause."
        href="/journal/quiet"
        publishedAt="2026-11-06T02:00:00.000Z"
        title="The quiet minutes"
        {...extra}
      />,
    )

  it('links only the h2 title (name = visible label), with category · date, excerpt and a hidden cue', () => {
    const out = row()
    expect(out).toMatch(/<h2[^>]*><a href="\/journal\/quiet"[^>]*>The quiet minutes<\/a><\/h2>/)
    expect(out.match(/<a\b/g)).toHaveLength(1)
    expect(out).not.toContain('aria-labelledby')
    expect(out).toContain('Process<span aria-hidden="true"> · </span><time dateTime="2026-11-06">6 Nov 2026</time>')
    expect(out).toMatch(/<p class="[^"]*">Before a shoot, there&#x27;s a pause\.<\/p>/)
    // "Read story" is a visual cue only; the stretched title link covers it.
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*">Read story →<\/span>/)
  })

  it('never marks the cover as priority', () => {
    expect(row()).not.toContain('data-priority')
  })

  it('drops a missing category or date with its separator, and the meta line when both are missing', () => {
    for (const blank of [null, '  ']) {
      const noCategory = row({ categoryName: blank })
      expect(noCategory).not.toContain('<span aria-hidden="true"> · </span>')
      expect(noCategory).toContain('<time dateTime="2026-11-06">6 Nov 2026</time>')
    }
    const noDate = row({ publishedAt: null })
    expect(noDate).not.toContain('<time')
    expect(noDate).not.toContain('<span aria-hidden="true"> · </span>')
    expect(noDate).toContain('>Process</span>')
    const neither = row({ categoryName: null, publishedAt: 'not a date' })
    expect(neither).not.toContain('Process')
    expect(neither).not.toContain('<time')
    expect(neither).toMatch(/<div class="[^"]*"><h2/)
  })

  it('can render an h3 title', () => {
    expect(row({ headingLevel: 'h3' })).toMatch(/<h3[^>]*><a [^>]*>The quiet minutes<\/a><\/h3>/)
  })
})

describe('Pagination (P2)', () => {
  const pageHref = (n: number) => (n === 1 ? '/journal' : `/journal/page/${n}`)
  const pagination = (current: number, total: number) =>
    html(<Pagination current={current} pageHref={pageHref} perPage={10} total={total} />)

  it('renders nothing for a single page', () => {
    expect(pagination(1, 1)).toBe('')
    expect(pagination(1, 0)).toBe('')
  })

  it('is a named nav with status, numbered page links and Older stories', () => {
    const out = pagination(1, 3)
    expect(out).toMatch(/^<nav aria-label="Journal pages"/)
    expect(out).toContain('Page 1 of 3<span aria-hidden="true"> · </span>10 stories per page')
    const first = openingTag(out, 'a', 'href="/journal"')
    expect(first).toContain('aria-current="page"')
    expect(first).toContain('aria-label="Page 1"')
    for (const n of [2, 3]) {
      const link = openingTag(out, 'a', `href="/journal/page/${n}"`)
      expect(link).toContain(`aria-label="Page ${n}"`)
      expect(link).not.toContain('aria-current')
    }
    expect(out.match(/aria-current="page"/g)).toHaveLength(1)
    // Button joins label and arrow with a non-breaking space.
    expect(out).toMatch(/href="\/journal\/page\/2"[^>]*>Older stories<span aria-hidden="true"> →<\/span><\/a>/)
  })

  it('marks the current page and drops Older stories on the last page', () => {
    const out = pagination(3, 3)
    expect(openingTag(out, 'a', 'href="/journal/page/3"')).toContain('aria-current="page"')
    expect(openingTag(out, 'a', 'href="/journal"')).not.toContain('aria-current')
    expect(out).not.toContain('Older stories')
  })
})

describe('ChapterHeading label detail (P4)', () => {
  it('adds the detail after a hidden separator, and ignores an empty one', () => {
    const out = html(<ChapterHeading labelDetail="Behind the camera" number={2} title="Hi, I'm Your Name" />)
    expect(out).toMatch(/<p class="_label_\w+">Chapter 02<span aria-hidden="true"> · <\/span>Behind the camera<\/p>/)
    expect(html(<ChapterHeading labelDetail="  " number={2} title="T" />)).toMatch(/<p class="_label_\w+">Chapter 02<\/p>/)
  })
})

describe('CollectionTile home variant (P4)', () => {
  const tile = (variant?: 'home') =>
    html(<CollectionTile href="/portfolio/photography" image={media(1)} index={1} intro="People." name="Photography" variant={variant} />)

  it('drops the label, uses 4:5, an h3 and "View gallery"', () => {
    const out = tile('home')
    expect(out).not.toContain('Collection 01')
    expect(out).toContain('r4x5')
    expect(out).toMatch(/<h3 class="_title_\w+"><a href="\/portfolio\/photography" class="_link_\w+">Photography<\/a><\/h3>/)
    expect(out).toContain('View gallery')
  })

  it('keeps the Portfolio tile as before by default', () => {
    const out = tile()
    expect(out).toContain('Collection 01')
    expect(out).toContain('r3x4')
    expect(out).toMatch(/<h2 class="_title_\w+">/)
    expect(out).toContain('View collection')
  })
})

describe('JournalRow card variant (P4)', () => {
  const props = { title: 'The quiet minutes', href: '/journal/quiet', excerpt: 'A pause.', categoryName: 'Process' }

  it('is a stacked card with an h3 title link and no call to action', () => {
    const out = html(<JournalRow {...props} headingLevel="h3" variant="card" />)
    expect(out).toMatch(/^<div class="_card_\w+">/)
    expect(out).toMatch(/<h3 class="_title_\w+"><a href="\/journal\/quiet" class="_link_\w+">The quiet minutes<\/a><\/h3>/)
    expect(out).not.toContain('Read story')
    expect(out).not.toContain('data-priority')
  })

  it('keeps the row as before by default', () => {
    const out = html(<JournalRow {...props} />)
    expect(out).toMatch(/^<div class="_row_\w+">/)
    expect(out).toContain('Read story')
  })
})

describe('SelectedWork (P4)', () => {
  const item = (n: number) => ({
    number: n,
    collectionName: 'Photography',
    title: `Project ${n}`,
    href: `/portfolio/photography/project-${n}`,
    cover: media(n),
  })

  it('names each caption link by its visible caption plus the hidden project title', () => {
    const out = html(<SelectedWork items={[item(1)]} />)
    expect(out).toMatch(
      /<a href="\/portfolio\/photography\/project-1" class="_caption_\w+"><span>01<\/span> <span>Photography<\/span><span class="visually-hidden">, Project 1<\/span><\/a>/,
    )
    // The image is decorative inside the tile: the link names it.
    expect(out).toContain('alt=""')
    expect(out).not.toContain('alt="Frame 1"')
  })

  it('renders three lists in order, numbering down each column', () => {
    const out = html(<SelectedWork items={Array.from({ length: 9 }, (_, i) => item(i + 1))} />)
    expect(out.match(/<ul class="_column_\w+" role="list">/g)).toHaveLength(3)
    const numbers = [...out.matchAll(/<span>(\d\d)<\/span>/g)].map(([, n]) => n)
    expect(numbers).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09'])
    expect(out.split('<ul')[1]).toContain('project-3"')
    expect(out.split('<ul')[1]).not.toContain('project-4"')
  })

  it('renders nothing without items, and a tinted frame for a missing cover', () => {
    expect(html(<SelectedWork items={[]} />)).toBe('')
    expect(html(<SelectedWork items={[{ ...item(1), cover: null }]} />)).toContain('aria-hidden="true"')
  })
})
