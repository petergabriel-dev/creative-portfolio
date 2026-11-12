import type { AdminViewServerProps } from 'payload'
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
vi.mock('@/lib/studio', () => ({ studioOverview: vi.fn(async () => empty) }))

import { StudioOverview, StudioOverviewView } from '@/components/studio/StudioOverview'
import type { StudioOverviewData } from '@/lib/studio'
import { studioOverview } from '@/lib/studio'

const empty: StudioOverviewData = {
  needsReply: { total: 0, rows: [] },
  drafts: { total: 0, rows: [] },
  home: { slideTitles: [], selectedWorkCount: 0 },
  recent: [],
}

const full: StudioOverviewData = {
  needsReply: {
    total: 5,
    rows: [{ id: 9, name: '[Couple names]', projectType: 'Photography', receivedAt: '2026-11-06T02:00:00.000Z', editUrl: '/admin/collections/inquiries/9' }],
  },
  drafts: {
    total: 3,
    rows: [
      { id: 2, collection: 'projects', title: '[Event name] highlight film', meta: 'Film & Video · Event film', thumbUrl: '/thumb.webp', editUrl: '/admin/collections/projects/2', updatedAt: '2026-11-05T00:00:00.000Z' },
    ],
  },
  home: { slideTitles: ['Every moment has a story', 'Photography'], selectedWorkCount: 10 },
  recent: [
    { id: 2, collection: 'projects', title: 'Live, edited', meta: 'Project · Wedding', thumbUrl: null, editUrl: '/admin/collections/projects/2', updatedAt: '2026-11-06T00:00:00.000Z', collectionName: 'Photography', status: 'changes' },
    { id: 5, collection: 'posts', title: 'A post', meta: 'Journal · Process', thumbUrl: null, editUrl: '/admin/collections/posts/5', updatedAt: '2026-11-05T00:00:00.000Z', collectionName: null, status: 'published' },
    { id: 3, collection: 'projects', title: 'Never live', meta: 'Project · Event', thumbUrl: null, editUrl: '/admin/collections/projects/3', updatedAt: '2026-11-04T00:00:00.000Z', collectionName: 'Film & Video', status: 'draft' },
  ],
}

const render = (data: StudioOverviewData) => renderToStaticMarkup(<StudioOverviewView data={data} />)
const text = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')

describe('StudioOverviewView', () => {
  it('has one h1 and a named section per panel', () => {
    const html = render(full)
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toMatch(/<h1[^>]*>Overview<\/h1>/)
    for (const id of ['overview-needs-reply', 'overview-drafts', 'overview-home', 'overview-recent']) {
      expect(html).toContain(`<section aria-labelledby="${id}"`)
      expect(html).toMatch(new RegExp(`<h2[^>]*id="${id}"`))
    }
  })

  it('links the actions and panel footers into the Studio', () => {
    const html = render(full)
    for (const href of [
      '/',
      '/admin/collections/projects/create',
      '/admin/collections/inquiries',
      '/admin/collections/projects',
      '/admin/collections/posts',
      '/admin/globals/home',
    ]) {
      expect(html).toContain(`href="${href}"`)
    }
  })

  it('shows the rows, counts, slides and the Selected work line', () => {
    const out = text(render(full))
    expect(out).toContain('5 new')
    expect(out).toContain('[Couple names] Photography 6 Nov 2026')
    expect(out).toContain('3 unpublished')
    expect(out).toContain('[Event name] highlight film Film & Video · Event film')
    expect(out).toMatch(/01 Every moment has a story 02 Photography/)
    expect(out).toContain('Selected work shows the first 9 of 10 pieces you')
  })

  it('links each row by its title only; Edit and the dash are hidden', () => {
    const html = render(full)
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\/9" class="[^"]*">\[Couple names\]<\/a>/)
    expect(html).toMatch(/<span aria-hidden="true" class="[^"]*">Edit<\/span>/)
    expect(html).toContain('<span aria-hidden="true">—</span>')
    expect(html).toMatch(/<img alt="" class="[^"]*" src="\/thumb.webp"/)
  })

  it('labels every status chip with text', () => {
    const out = text(render(full))
    expect(out).toContain('Unpublished changes')
    expect(out).toContain('Published')
    expect(out).toContain('Draft')
  })

  it('shows each empty line and no count pills when there is nothing', () => {
    const out = text(render(empty))
    for (const line of ['Nothing waiting.', 'No drafts.', 'No hero slides published yet.', 'Nothing edited yet.', 'Nothing is marked “On home” yet.']) {
      expect(out).toContain(line)
    }
    expect(out).not.toMatch(/\d+ new|\d+ unpublished/)
  })
})

describe('StudioOverview', () => {
  it('reads the Overview as the logged-in editor', async () => {
    const user = { id: 7 }
    const payload = {}
    const html = renderToStaticMarkup(
      (await StudioOverview({ initPageResult: { req: { user, payload } } } as unknown as AdminViewServerProps))!,
    )
    expect(studioOverview).toHaveBeenCalledWith({ payload, user })
    expect(html).toContain('Nothing waiting.')
  })

  it('renders nothing without a user', async () => {
    const result = await StudioOverview({ initPageResult: { req: { user: null, payload: {} } } } as unknown as AdminViewServerProps)
    expect(result).toBeNull()
  })
})
