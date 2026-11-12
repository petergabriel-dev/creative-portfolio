import type { ListViewServerProps } from 'payload'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // Drops Next-only props (scroll) so the markup is a plain anchor.
  default: ({ href, children, scroll: _scroll, ...rest }: { href: string; children: ReactNode; scroll?: boolean }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/components/studio/inboxActions', () => ({ setInquiryStatus: vi.fn() }))
vi.mock('@/lib/studio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/studio')>()),
  studioInbox: vi.fn(async () => emptyData),
}))

import { StudioInbox, StudioInboxView } from '@/components/studio/StudioInbox'
import type { StudioInboxData } from '@/lib/studio'
import { studioInbox } from '@/lib/studio'
import type { InquiryStatus } from '@/lib/studioInbox'

const emptyData: StudioInboxData = {
  query: { status: 'archived', page: 1, id: null },
  counts: { new: 2, replied: 1, archived: 0 },
  rows: [],
  selected: null,
  nextId: null,
  newerHref: null,
  olderHref: null,
}

const data = (status: InquiryStatus = 'new', overrides: Partial<StudioInboxData> = {}): StudioInboxData => ({
  query: { status, page: 1, id: 2 },
  counts: { new: 2, replied: 1, archived: 0 },
  rows: [
    {
      id: 2,
      name: '[Couple names]',
      projectType: 'Photography',
      receivedAt: '2026-11-06T02:00:00.000Z',
      excerpt: "Hi! We're getting married at [venue]…",
      href: `/admin/collections/inquiries?status=${status}&id=2`,
    },
    {
      id: 1,
      name: '[Band name]',
      projectType: 'Film & Video',
      receivedAt: '2026-10-30T02:00:00.000Z',
      excerpt: 'Our band has a single out in [month].',
      href: `/admin/collections/inquiries?status=${status}&id=1`,
    },
  ],
  selected: {
    id: 2,
    name: '[Couple names]',
    email: 'couple@example.com',
    projectType: 'Photography',
    timing: '',
    message: 'Line one\nLine two',
    status,
    receivedAt: '2026-11-06T02:00:00.000Z',
  },
  nextId: 1,
  newerHref: null,
  olderHref: null,
  ...overrides,
})

const render = (d: StudioInboxData) => renderToStaticMarkup(<StudioInboxView data={d} />)

describe('StudioInboxView: header and status links', () => {
  it('shows the label, title and description', () => {
    const html = render(data())
    expect(html).toContain('>Studio</p>')
    expect(html).toMatch(/<h1 class="[^"]*">Inquiries<\/h1>/)
    expect(html).toContain('Messages sent from the Book Me form. Reply from your own email, then mark them as replied.')
  })

  it('links the three statuses with their counts, the current one marked', () => {
    const html = render(data())
    expect(html).toContain('<nav aria-label="Inquiry status"')
    // The next/link mock writes href first (conventions: Tests).
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\?status=new&amp;id=" aria-current="true" class="[^"]*">New <span[^>]*>2<\/span><\/a>/)
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\?status=replied&amp;id=" class="[^"]*">Replied <span[^>]*>1<\/span><\/a>/)
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\?status=archived&amp;id=" class="[^"]*">Archived <span[^>]*>0<\/span><\/a>/)
    expect(html).not.toContain('>All')
  })
})

describe('StudioInboxView: list', () => {
  it('links each card by its name, marking the selected one', () => {
    const html = render(data())
    expect(html).toContain('<ul aria-label="Inquiries"')
    expect(html).toMatch(
      /<a href="\/admin\/collections\/inquiries\?status=new&amp;id=2" aria-current="true" class="[^"]*" data-inbox-select="">\[Couple names\]<\/a>/,
    )
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\?status=new&amp;id=1" class="[^"]*" data-inbox-select="">\[Band name\]<\/a>/)
    expect(html).toContain('<time dateTime="2026-11-06">6 Nov 2026</time>')
    expect(html).toContain('>Film &amp; Video</p>')
    expect(html).toContain('Our band has a single out in [month].')
  })

  it('pages with Newer and Older only when those pages exist', () => {
    expect(render(data())).not.toContain('aria-label="Inquiry pages"')
    const both = render(
      data('new', { newerHref: '/admin/collections/inquiries?status=new', olderHref: '/admin/collections/inquiries?status=new&page=3' }),
    )
    expect(both).toContain('<nav aria-label="Inquiry pages"')
    expect(both).toMatch(/href="\/admin\/collections\/inquiries\?status=new" class="[^"]*"><span aria-hidden="true">←<\/span> Newer<\/a>/)
    expect(both).toMatch(/href="\/admin\/collections\/inquiries\?status=new&amp;page=3" class="[^"]*">Older<span aria-hidden="true"> →<\/span><\/a>/)
    const olderOnly = render(data('new', { olderHref: '/admin/collections/inquiries?status=new&page=2' }))
    expect(olderOnly).not.toContain('Newer')
  })
})

describe('StudioInboxView: detail', () => {
  it('heads the detail with the name as the focus target and a status chip', () => {
    const html = render(data())
    expect(html).toMatch(/<section aria-labelledby="inbox-detail-heading" class="[^"]*">/)
    expect(html).toMatch(/<h2 class="[^"]*" id="inbox-detail-heading" tabindex="-1">\[Couple names\]<\/h2>/i)
    expect(html).toMatch(/<span class="[^"]*">New<\/span><\/div><dl/)
  })

  it('lists the facts, saying when no timing was given, and keeps the message', () => {
    const html = render(data())
    expect(html).toContain('<dt>Project</dt><dd>Photography</dd>')
    expect(html).toMatch(/<dt>Timing<\/dt><dd><span class="[^"]*">Not given<\/span><\/dd>/)
    expect(html).toContain('<dt>Email</dt><dd>couple@example.com</dd>')
    expect(html).toContain('<dt>Received</dt><dd><time dateTime="2026-11-06">6 Nov 2026</time></dd>')
    expect(html).toContain('Line one\nLine two</p>')
  })

  it('links Reply by email to the visitor and Open full record to the edit view', () => {
    const html = render(data())
    expect(html).toMatch(/<a href="mailto:couple@example.com" class="[^"]*">Reply by email<\/a>/)
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries\/2" class="[^"]*">Open full record<span aria-hidden="true"> →<\/span><\/a>/)
  })

  it('gives no reply link for an address Payload would not accept', () => {
    const d = data()
    const html = render({ ...d, selected: { ...d.selected!, email: 'javascript:alert(1)' } })
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('Reply by email')
  })

  it.each([
    ['new', ['Mark as replied', 'Archive'], ['replied', 'archived']],
    ['replied', ['Archive', 'Mark as new'], ['archived', 'new']],
    ['archived', ['Mark as new'], ['new']],
  ] as const)('offers the %s inquiry only the other statuses, in order', (status, labels, values) => {
    const html = render(data(status))
    const buttons = [...html.matchAll(/<button[^>]*type="submit" value="([a-z]+)" name="status">([^<]+)<\/button>/g)]
    expect(buttons.map((m) => m[1])).toEqual(values)
    expect(buttons.map((m) => m[2])).toEqual(labels)
  })

  it('posts the id, tab, page and next inquiry with the status', () => {
    const html = render(data('replied', { query: { status: 'replied', page: 2, id: 2 } }))
    expect(html).toContain('<input type="hidden" name="id" value="2"/>')
    expect(html).toContain('<input type="hidden" name="tab" value="replied"/>')
    expect(html).toContain('<input type="hidden" name="page" value="2"/>')
    expect(html).toContain('<input type="hidden" name="next" value="1"/>')
  })

  it('has a polite live region, empty until a change', () => {
    expect(render(data())).toMatch(/<p class="[^"]*" role="status"><\/p>/)
  })
})

describe('StudioInboxView: empty tab', () => {
  it('shows Nothing waiting. as the focus target, with no list or detail', () => {
    const html = render(emptyData)
    expect(html).toMatch(/<p class="[^"]*" id="inbox-empty" tabindex="-1">Nothing waiting.<\/p>/i)
    expect(html).not.toContain('inbox-detail-heading')
    expect(html).not.toContain('aria-label="Inquiries"')
    expect(html).toContain('href="/admin/collections/inquiries?status=archived&amp;id=" aria-current="true"')
  })
})

describe('StudioInbox (list view)', () => {
  const user = { id: 7, collection: 'users' }

  it('renders nothing without a logged-in editor', async () => {
    const node = await StudioInbox({ payload: {}, user: undefined, searchParams: {} } as unknown as ListViewServerProps)
    expect(node).toBeNull()
  })

  it('reads the tab, page and selection from the URL as the editor', async () => {
    vi.mocked(studioInbox).mockClear()
    const payload = {}
    const node = await StudioInbox({
      payload,
      user,
      searchParams: { status: 'archived', page: '2', id: 'x' },
    } as unknown as ListViewServerProps)
    expect(studioInbox).toHaveBeenCalledWith({ payload, user }, { status: 'archived', page: 2, id: null })
    expect(renderToStaticMarkup(node!)).toContain('Nothing waiting.')
  })
})
