import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, fill: _fill, priority, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} data-priority={priority ? 'true' : undefined} src={src as string} {...rest} />
  ),
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`)
  },
}))

// Draft mode and the editor session are switched per test.
const session = { draftMode: false, user: null as null | { id: number } }
const headers = vi.fn(async () => new Headers())
vi.mock('next/headers', () => ({
  draftMode: async () => ({ isEnabled: session.draftMode }),
  headers: () => headers(),
}))

vi.mock('@/components/story/LivePreviewListener', () => ({
  LivePreviewListener: () => <div data-live-preview="" />,
}))

const photography = { id: 1, slug: 'photography', name: 'Photography' }
const project = (id: number, title: string, slug: string, status: 'published' | 'draft' = 'published') => ({
  id,
  title,
  slug,
  _status: status,
  collection: photography,
})
const quiet = {
  id: 3,
  title: 'The quiet minutes',
  slug: 'quiet',
  previousSlugs: ['the-quiet'],
  excerpt: "Before a shoot, there's a pause.",
  cover: { id: 9, alt: 'Cover', url: 'https://x.public.blob.vercel-storage.com/c.webp', width: 1600, height: 900 },
  category: { id: 1, name: 'Process' },
  publishedAt: '2026-11-06T02:00:00.000Z',
  story: [{ blockType: 'quote', quote: 'The important part had already started.' }],
  relatedProjects: [project(10, '[Couple names] wedding', 'couple-names-wedding')],
  updatedAt: '2026-11-06T02:00:00.000Z',
}
let posts: Record<string, unknown>[] = []
type Where = { slug?: { equals: string }; previousSlugs?: { in: string[] } }
const find = vi.fn(async ({ where }: { where?: Where }) => {
  if (where?.slug) return { docs: posts.filter((p) => p.slug === where.slug!.equals) }
  if (where?.previousSlugs) {
    const old = where.previousSlugs.in[0]
    return { docs: posts.filter((p) => (p.previousSlugs as string[]).includes(old)) }
  }
  return { docs: posts }
})
const findGlobal = vi.fn(async () => ({ name: 'Your Name', bookingLabel: 'Book Me', finaleHeadline: "Let's capture your story", socials: [] }))
const auth = vi.fn(async () => ({ user: session.user }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find, findGlobal, auth }) }))

import EntryPage, { generateMetadata, generateStaticParams } from '@/app/(frontend)/journal/[slug]/page'
import { JournalEntryFooter } from '@/components/site/JournalEntryFooter'
import { findPost, relatedWork } from '@/lib/journal'

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)
const params = (slug: string) => ({ params: Promise.resolve({ slug }) }) as never

beforeEach(() => {
  posts = [quiet]
  session.draftMode = false
  session.user = null
  find.mockClear()
  auth.mockClear()
  headers.mockClear()
})

describe('findPost', () => {
  it('finds a post by its current slug without a redirect, reading published only', async () => {
    expect(await findPost('quiet')).toMatchObject({ post: { id: 3 }, redirect: false })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'posts', draft: false, overrideAccess: false, user: undefined }),
    )
  })

  it('redirects an old slug, preferring the most recently updated post', async () => {
    expect(await findPost('the-quiet')).toMatchObject({ post: { slug: 'quiet' }, redirect: true })
    expect(find).toHaveBeenLastCalledWith(expect.objectContaining({ sort: '-updatedAt' }))
  })

  it('returns null for an unknown slug', async () => {
    expect(await findPost('nope')).toBeNull()
  })

  it('reads drafts only for a given editor, with their user', async () => {
    const editor = { id: 1 } as never
    await findPost('quiet-editor', editor)
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ draft: true, overrideAccess: false, user: editor }))
  })
})

describe('relatedWork', () => {
  it('keeps published projects with a known collection only', () => {
    const related = relatedWork({
      relatedProjects: [
        project(10, 'Shown', 'shown'),
        project(11, 'Draft', 'draft', 'draft'),
        12, // unpopulated: not readable by this visitor
        { ...project(13, 'No collection', 'orphan'), collection: 7 },
      ] as never,
    })
    expect(related).toEqual([{ title: 'Shown', href: '/portfolio/photography/shown' }])
    expect(relatedWork({ relatedProjects: null })).toEqual([])
  })
})

describe('JournalEntryFooter', () => {
  it('always links back to the journal', () => {
    const out = html(<JournalEntryFooter related={[]} />)
    expect(out).toMatch(/href="\/journal"[^>]*><span aria-hidden="true">←<\/span>Back to journal<\/a>/)
    expect(out).not.toContain('See the work')
  })

  it('shows one "See the work" link for one project (capture 10)', () => {
    const out = html(<JournalEntryFooter related={[{ title: 'A', href: '/portfolio/p/a' }]} />)
    expect(out).toMatch(/href="\/portfolio\/p\/a"[^>]*>See the work<span aria-hidden="true"> →<\/span><\/a>/)
    expect(out).not.toContain('<ul')
  })

  it('lists several projects by title under a "See the work" label', () => {
    const out = html(
      <JournalEntryFooter
        related={[
          { title: 'First project', href: '/portfolio/p/a' },
          { title: 'Second project', href: '/portfolio/p/b' },
        ]}
      />,
    )
    expect(out).toMatch(/<p class="[^"]*">See the work<\/p><ul class="[^"]*" role="list">/)
    expect(out).toMatch(/href="\/portfolio\/p\/a"[^>]*>First project<span/)
    expect(out).toMatch(/href="\/portfolio\/p\/b"[^>]*>Second project<span/)
    // No two links share the name "See the work".
    expect(out).not.toMatch(/>See the work<span/)
  })
})

describe('/journal/[slug]', () => {
  it('prerenders every published post', async () => {
    expect(await generateStaticParams()).toEqual([{ slug: 'quiet' }])
  })

  it('renders the entry: breadcrumb, category · date, title, excerpt, priority cover, story, footer, finale', async () => {
    const out = html(await EntryPage(params('quiet')))
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toMatch(/<h1[^>]*>The quiet minutes<\/h1>/)
    expect(out).toMatch(/href="\/journal"[^>]*>Journal<\/a>/)
    expect(out).toContain('Process · 6 Nov 2026')
    expect(out).toContain('Before a shoot, there&#x27;s a pause.')
    expect(out).toMatch(/<img alt="Cover" data-priority="true"/)
    expect(out).toMatch(/<article>.*The important part had already started\..*<\/article>/)
    expect(out).toMatch(/href="\/portfolio\/photography\/couple-names-wedding"[^>]*>See the work/)
    expect(out).toContain('Tell me about what you&#x27;re making')
    expect(out.indexOf('<header')).toBeLessThan(out.indexOf('<main'))
    expect(out).not.toContain('data-live-preview')
  })

  it('308s an old slug and 404s an unknown one', async () => {
    await expect(EntryPage(params('the-quiet'))).rejects.toThrow('REDIRECT /journal/quiet')
    await expect(EntryPage(params('nope'))).rejects.toThrow('NOT_FOUND')
  })

  it('never reads headers outside draft mode', async () => {
    await EntryPage(params('quiet'))
    expect(headers).not.toHaveBeenCalled()
    expect(auth).not.toHaveBeenCalled()
  })

  it('in draft mode without an editor session, shows only the published post', async () => {
    session.draftMode = true
    const out = html(await EntryPage(params('quiet')))
    expect(auth).toHaveBeenCalled()
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ draft: false, user: undefined }))
    expect(out).not.toContain('data-live-preview')
  })

  it('in draft mode with an editor, reads drafts and listens for live preview', async () => {
    session.draftMode = true
    session.user = { id: 1 }
    const out = html(await EntryPage(params('quiet')))
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ draft: true, user: { id: 1 } }))
    expect(out).toContain('data-live-preview')
  })

  it('drops a missing category and its separator from the context line', async () => {
    posts = [{ ...quiet, category: 4 }]
    const out = html(await EntryPage(params('quiet')))
    expect(out).toContain('>6 Nov 2026<')
    expect(out).not.toContain('Process')
  })

  it('builds metadata from the SEO fields with the canonical entry URL', async () => {
    expect(await generateMetadata(params('quiet'))).toMatchObject({
      title: 'The quiet minutes',
      description: "Before a shoot, there's a pause.",
      alternates: { canonical: '/journal/quiet' },
    })
    expect(await generateMetadata(params('the-quiet'))).toEqual({})
  })
})
