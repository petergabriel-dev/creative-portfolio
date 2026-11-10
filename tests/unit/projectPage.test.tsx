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
  default: ({ alt, src, fill: _fill, priority: _priority, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} src={src as string} {...rest} />
  ),
}))

const photography = { id: 1, slug: 'photography', name: 'Photography' }
const projects: Record<string, unknown>[] = [
  { id: 10, slug: 'couple-wedding', previousSlugs: ['old-wedding'], collection: photography, updatedAt: '2026-11-02' },
]
const find = vi.fn(async ({ where }: { where: Record<string, { equals?: string; in?: string[] }> }) => {
  if (where.slug) return { docs: projects.filter((p) => p.slug === where.slug.equals) }
  const old = where.previousSlugs?.in?.[0]
  return { docs: projects.filter((p) => (p.previousSlugs as string[]).includes(old ?? '')) }
})
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

import { StoryBlocks, storySections } from '@/components/story/StoryBlocks'
import { VideoEmbed } from '@/components/story/VideoEmbed'
import { findProject } from '@/lib/portfolio'
import type { Media, Project } from '@/payload-types'

type Story = NonNullable<Project['story']>
const media = (id: number, extra: Partial<Media> = {}) =>
  ({ id, alt: `Frame ${id}`, url: `https://x.public.blob.vercel-storage.com/f${id}.webp`, width: 1600, height: 1200, ...extra }) as Media

const text = (url: string) =>
  ({
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', text: 'Before ', format: 0, version: 1 },
            { type: 'link', fields: { linkType: 'custom', url, newTab: false }, children: [{ type: 'text', text: 'the link', format: 0, version: 1 }], version: 3 },
          ],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as never

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)

describe('storySections', () => {
  it('numbers chapters in order and groups the blocks after each one', () => {
    const blocks = [
      { blockType: 'quote', quote: 'Lead-in' },
      { blockType: 'chapter', heading: 'The brief' },
      { blockType: 'quote', quote: 'A' },
      { blockType: 'chapter', heading: 'The work' },
    ] as Story
    expect(storySections(blocks).map((s) => [s.chapter?.number ?? null, s.chapter?.heading ?? null, s.blocks.length])).toEqual([
      [null, null, 1],
      [1, 'The brief', 1],
      [2, 'The work', 0],
    ])
    expect(storySections(null)).toEqual([])
  })
})

describe('StoryBlocks', () => {
  it('renders each chapter as a section named by its heading', () => {
    const out = html(<StoryBlocks blocks={[{ blockType: 'chapter', heading: 'The brief' }] as Story} />)
    expect(out).toMatch(/<section aria-labelledby="chapter-1"/)
    expect(out).toContain('Chapter 01')
    expect(out).toMatch(/<h2[^>]*id="chapter-1"[^>]*>The brief<\/h2>/)
  })

  it('keeps safe links and drops unsafe ones to plain text', () => {
    expect(html(<StoryBlocks blocks={[{ blockType: 'text', body: text('https://example.com') }] as Story} />)).toContain(
      '<a href="https://example.com">the link</a>',
    )
    const unsafe = html(<StoryBlocks blocks={[{ blockType: 'text', body: text('javascript:alert(1)') }] as Story} />)
    expect(unsafe).not.toContain('javascript:')
    expect(unsafe).not.toContain('<a ')
    expect(unsafe).toContain('the link')
  })

  it('captions an image with the block caption, else the media caption, and the credit', () => {
    const image = (extra: object) => html(<StoryBlocks blocks={[{ blockType: 'image', image: media(1, { caption: 'Media caption', credit: 'Ann' }), width: 'contained', aspect: '3:2', ...extra }] as Story} />)
    expect(image({ caption: 'Block caption' })).toContain('Block caption · Ann</figcaption>')
    expect(image({})).toContain('Media caption · Ann</figcaption>')
  })

  it('renders full-bleed images outside the padded story column', () => {
    const out = html(
      <StoryBlocks
        blocks={[
          { blockType: 'quote', quote: 'Q' },
          { blockType: 'image', image: media(1), width: 'full-bleed', aspect: '21:9' },
        ] as Story}
      />,
    )
    expect(out).toMatch(/class="[^"]*column[^"]*">.*Q.*<\/div><div class="[^"]*bleed[^"]*"><div><figure/)
  })

  it('skips blocks with missing data instead of crashing', () => {
    const out = html(
      <StoryBlocks
        blocks={[
          { blockType: 'image', image: 3, width: 'contained', aspect: '3:2' },
          { blockType: 'video', url: 'https://example.com/not-a-video' },
          { blockType: 'quote', quote: '  ' },
        ] as Story}
      />,
    )
    expect(out).toBe('')
  })
})

describe('VideoEmbed', () => {
  it('starts as a labelled play button with no iframe and nothing from the provider', () => {
    const out = html(<VideoEmbed caption="The film" embedUrl="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ" />)
    expect(out).toMatch(/<button aria-label="Play video: The film"[^>]*type="button"/)
    expect(out).not.toContain('<iframe')
    expect(out).not.toMatch(/youtube|vimeo|ytimg/)
    expect(out).toContain('<figcaption')
  })

  it('shows the poster when there is one', () => {
    expect(html(<VideoEmbed embedUrl="https://player.vimeo.com/video/1?dnt=1" poster={media(5)} />)).toContain('alt="Frame 5"')
  })
})

describe('findProject', () => {
  it('matches the canonical URL without a redirect', async () => {
    expect(await findProject('photography', 'couple-wedding')).toMatchObject({
      canonical: '/portfolio/photography/couple-wedding',
      redirect: false,
    })
  })

  it('redirects a wrong collection segment and an old project slug to the canonical URL', async () => {
    expect(await findProject('film', 'couple-wedding')).toMatchObject({ canonical: '/portfolio/photography/couple-wedding', redirect: true })
    expect(await findProject('photography', 'old-wedding')).toMatchObject({ canonical: '/portfolio/photography/couple-wedding', redirect: true })
  })

  it('returns null for an unknown project and reads published only', async () => {
    expect(await findProject('photography', 'nope')).toBeNull()
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ draft: false, overrideAccess: false }))
  })
})
