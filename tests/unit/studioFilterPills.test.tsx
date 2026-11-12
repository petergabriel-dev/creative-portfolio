import type { ListViewServerProps } from 'payload'
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
vi.mock('@/lib/studio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/studio')>()),
  projectCountsByCollection: vi.fn(async () => counts),
}))

import { filterPillHref, StudioFilterPills, StudioFilterPillsView } from '@/components/studio/StudioFilterPills'
import type { ProjectCounts } from '@/lib/studio'
import { projectCountsByCollection } from '@/lib/studio'

const counts: ProjectCounts = {
  all: 8,
  items: [
    { id: 1, name: 'Photography', slug: 'photography', count: 3 },
    { id: 2, name: 'Film & Video', slug: 'film-video', count: 1 },
    { id: 4, name: 'Writing & More', slug: 'writing-more', count: 0 },
  ],
}

const render = (current: string | null, searchParams = {}) =>
  renderToStaticMarkup(
    <StudioFilterPillsView counts={counts} current={current} hrefFor={(slug) => filterPillHref(searchParams, slug)} />,
  )

describe('filterPillHref', () => {
  it('sets the collection, or sends it empty for All, and drops the page', () => {
    expect(filterPillHref({ collection: 'film-video', page: '3' }, 'photography')).toBe(
      '/admin/collections/projects?collection=photography',
    )
    expect(filterPillHref({ collection: 'film-video', page: '3' }, null)).toBe('/admin/collections/projects?collection=')
    expect(filterPillHref(undefined, null)).toBe('/admin/collections/projects?collection=')
  })

  it('keeps search, filter-builder conditions, sort and limit', () => {
    const href = filterPillHref(
      {
        search: 'wedding',
        'where[or][0][and][0][_status][equals]': 'draft',
        sort: '-year',
        limit: '25',
        columns: '["title","collection"]',
      },
      'photography',
    )
    const params = new URL(href, 'http://localhost').searchParams
    expect(params.get('search')).toBe('wedding')
    expect(params.get('where[or][0][and][0][_status][equals]')).toBe('draft')
    expect(params.get('sort')).toBe('-year')
    expect(params.get('limit')).toBe('25')
    expect(params.get('columns')).toBe('["title","collection"]')
    expect(params.get('collection')).toBe('photography')
    expect(params.has('page')).toBe(false)
  })

  it('keeps repeated values', () => {
    expect(filterPillHref({ tag: ['a', 'b'] }, null)).toBe('/admin/collections/projects?tag=a&tag=b&collection=')
  })
})

describe('StudioFilterPillsView', () => {
  it('lists All then every discipline in order with its count, empty ones included', () => {
    const html = render(null)
    expect(html).toContain('<nav aria-label="Filter by collection"')
    const names = [...html.matchAll(/<a [^>]*>([^<]+) <span[^>]*>(\d+)<\/span>/g)].map((m) => `${m[1]} ${m[2]}`)
    expect(names).toEqual(['All 8', 'Photography 3', 'Film &amp; Video 1', 'Writing &amp; More 0'])
  })

  it('marks only the current pill and names each count for screen readers', () => {
    const html = render('photography')
    expect(html.match(/aria-current="true"/g)).toHaveLength(1)
    expect(html).toMatch(/<a href="\/admin\/collections\/projects\?collection=photography" aria-current="true"/)
    expect(html).toMatch(/<a href="\/admin\/collections\/projects\?collection=" class="[^"]*">All /)
    expect(html).toContain('> projects</span>')
    expect(html).toContain('> project</span>')
  })

  it('marks All as current with no collection', () => {
    expect(render(null)).toMatch(/<a href="\/admin\/collections\/projects\?collection=" aria-current="true"/)
  })
})

describe('StudioFilterPills (beforeListTable)', () => {
  it('renders nothing without a logged-in editor', async () => {
    expect(await StudioFilterPills({ payload: {}, user: undefined } as unknown as ListViewServerProps)).toBeNull()
  })

  it('reads counts as the editor and marks the discipline in the URL', async () => {
    const payload = {}
    const user = { id: 7 }
    const node = await StudioFilterPills({
      payload,
      user,
      searchParams: { collection: 'film-video', search: 'x', page: '2' },
    } as unknown as ListViewServerProps)
    expect(projectCountsByCollection).toHaveBeenCalledWith({ payload, user })
    const html = renderToStaticMarkup(node!)
    expect(html).toMatch(/<a href="\/admin\/collections\/projects\?search=x&amp;collection=film-video" aria-current="true"/)
  })

  it('shows All as current for a slug that matches no discipline', async () => {
    const node = await StudioFilterPills({
      payload: {},
      user: { id: 7 },
      searchParams: { collection: 'sculpture' },
    } as unknown as ListViewServerProps)
    expect(renderToStaticMarkup(node!)).toMatch(/<a href="\/admin\/collections\/projects\?collection=" aria-current="true"/)
  })
})
