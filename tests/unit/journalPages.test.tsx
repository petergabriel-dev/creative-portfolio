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

// notFound and permanentRedirect throw in Next; here they throw recognisable errors.
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND')
  },
  permanentRedirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`)
  },
}))

const settings = {
  name: 'Your Name',
  bookingLabel: 'Book Me',
  finaleHeadline: "Let's capture your story",
  socials: [],
}

/** 23 published posts: 10 + 10 + 3. */
let published = 23
const post = (n: number) => ({
  id: 100 - n,
  title: `Post ${n}`,
  slug: `post-${n}`,
  excerpt: `Excerpt ${n}`,
  cover: null,
  category: { id: 1, name: 'Process' },
  publishedAt: '2026-11-06T02:00:00.000Z',
})
const find = vi.fn(async ({ page, limit }: { page: number; limit: number }) => {
  const all = Array.from({ length: published }, (_, i) => post(i + 1))
  return { docs: all.slice((page - 1) * limit, page * limit), totalPages: Math.ceil(published / limit) }
})
const findGlobal = vi.fn(async () => settings)
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find, findGlobal }) }))

import LaterPage, { generateMetadata, generateStaticParams } from '@/app/(frontend)/journal/page/[n]/page'
import JournalPage from '@/app/(frontend)/journal/page'
import { getJournalPage, parsePageParam } from '@/lib/journal'

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)
const params = (n: string) => ({ params: Promise.resolve({ n }) }) as never
/** Rows on the page: each is one link to an entry. */
const rows = (out: string) => out.match(/href="\/journal\/post-\d+"/g)?.length ?? 0

beforeEach(() => {
  published = 23
  find.mockClear()
})

describe('parsePageParam', () => {
  it.each([
    ['1', 1],
    ['2', 2],
    ['12', 12],
  ])('accepts %s', (raw, page) => {
    expect(parsePageParam(raw)).toBe(page)
  })

  it.each(['0', '02', '-1', 'abc', '2.5', '', ' 2', '1e3', '99999999999999999999'])('rejects %j', (raw) => {
    expect(parsePageParam(raw)).toBeNull()
  })
})

describe('getJournalPage', () => {
  it('reads 10 published posts per page, newest first with a stable tie-breaker, access applied', async () => {
    const { posts, totalPages } = await getJournalPage(2)
    expect(posts).toHaveLength(10)
    expect(totalPages).toBe(3)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        sort: ['-publishedAt', '-id'],
        limit: 10,
        page: 2,
        draft: false,
        overrideAccess: false,
      }),
    )
  })
})

describe('/journal (page 1)', () => {
  it('shows the opener, 10 rows, pagination and the journal finale', async () => {
    const out = html(await JournalPage())
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toContain('Stories behind the pictures')
    expect(rows(out)).toBe(10)
    expect(out).toContain('href="/journal/post-1"')
    expect(out).toContain('Page 1 of 3')
    expect(out).toMatch(/href="\/journal\/page\/2"[^>]*>Older stories/)
    expect(out).toContain('Tell me about what you&#x27;re making')
    // The header stays outside <main>; no list cover loads with priority.
    expect(out.indexOf('<header')).toBeLessThan(out.indexOf('<main'))
    expect(out).not.toContain('data-priority')
  })

  it('hides the pagination with 10 posts or fewer, and shows one line when there are none', async () => {
    published = 10
    const single = html(await JournalPage())
    expect(rows(single)).toBe(10)
    expect(single).not.toContain('Journal pages')

    published = 0
    const empty = html(await JournalPage())
    expect(rows(empty)).toBe(0)
    expect(empty.match(/<main[^>]*>(.*?)<\/main>/)?.[1]).not.toContain('<ul')
    expect(empty).toContain('New work is on its way')
  })
})

describe('/journal/page/[n]', () => {
  it('prerenders pages 2 and on', async () => {
    expect(await generateStaticParams()).toEqual([{ n: '2' }, { n: '3' }])
    published = 7
    expect(await generateStaticParams()).toEqual([])
  })

  it('renders a later page with its own rows, and the last page without Older stories', async () => {
    const two = html(await LaterPage(params('2')))
    expect(rows(two)).toBe(10)
    expect(two).toContain('href="/journal/post-11"')
    expect(two).toMatch(/aria-current="page"[^>]*href="\/journal\/page\/2"|href="\/journal\/page\/2"[^>]*aria-current="page"/)

    const three = html(await LaterPage(params('3')))
    expect(rows(three)).toBe(3)
    expect(three).not.toContain('Older stories')
  })

  it('308s page 1 to /journal', async () => {
    await expect(LaterPage(params('1'))).rejects.toThrow('REDIRECT /journal')
  })

  it.each(['4', '99', '0', '02', 'abc', '2.5'])('returns a 404 for %j', async (raw) => {
    await expect(LaterPage(params(raw))).rejects.toThrow('NOT_FOUND')
  })

  it('titles and canonicalises a real page only', async () => {
    expect(await generateMetadata(params('2'))).toMatchObject({
      title: 'Journal · Page 2',
      alternates: { canonical: '/journal/page/2' },
    })
    expect(await generateMetadata(params('4'))).toEqual({})
    expect(await generateMetadata(params('1'))).toEqual({})
  })
})
