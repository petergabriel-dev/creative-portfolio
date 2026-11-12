import type { BaseFilter, Payload, TypedUser } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { collectionFilter, projectCountsByCollection, studioInbox } from '@/lib/studio'
import {
  excerpt,
  gmailReplyHref,
  INBOX_PATH,
  inboxHref,
  type InquiryStatus,
  nextSelection,
  parseInboxQuery,
  parsePositiveInt,
} from '@/lib/studioInbox'

const user = { id: 7, email: 'editor@example.com', collection: 'users' } as unknown as TypedUser

describe('parsePositiveInt', () => {
  it('accepts plain positive integers up to nine digits', () => {
    expect(parsePositiveInt('1')).toBe(1)
    expect(parsePositiveInt('42')).toBe(42)
    expect(parsePositiveInt('999999999')).toBe(999999999)
  })

  it.each(['0', '-1', '1.5', 'abc', '1;drop', ' 1', '01', '1e3', '', '1234567890', '0x10'])('rejects %j', (raw) => {
    expect(parsePositiveInt(raw)).toBeNull()
  })

  it('rejects non-strings', () => {
    expect(parsePositiveInt(5)).toBeNull()
    expect(parsePositiveInt(undefined)).toBeNull()
    expect(parsePositiveInt(null)).toBeNull()
  })
})

describe('parseInboxQuery', () => {
  it('defaults to the New tab, page 1, nothing selected', () => {
    expect(parseInboxQuery(undefined)).toEqual({ status: 'new', page: 1, id: null })
    expect(parseInboxQuery({})).toEqual({ status: 'new', page: 1, id: null })
  })

  it('reads a valid tab, page and id, taking the first of repeated values', () => {
    expect(parseInboxQuery({ status: 'archived', page: '3', id: '12' })).toEqual({ status: 'archived', page: 3, id: 12 })
    expect(parseInboxQuery({ status: ['replied', 'new'], page: ['2'], id: ['5', '6'] })).toEqual({
      status: 'replied',
      page: 2,
      id: 5,
    })
  })

  it('falls back on anything invalid', () => {
    expect(parseInboxQuery({ status: 'deleted', page: '0', id: '1;drop' })).toEqual({ status: 'new', page: 1, id: null })
    expect(parseInboxQuery({ status: 'all', page: '-2', id: 'abc' })).toEqual({ status: 'new', page: 1, id: null })
  })
})

describe('inboxHref', () => {
  it('always points at the inbox, page 1 left out and no selection sent empty', () => {
    expect(inboxHref({ status: 'new' })).toBe('/admin/collections/inquiries?status=new&id=')
    expect(inboxHref({ status: 'replied', page: 1, id: null })).toBe('/admin/collections/inquiries?status=replied&id=')
    expect(inboxHref({ status: 'archived', page: 3, id: 9 })).toBe('/admin/collections/inquiries?status=archived&page=3&id=9')
    expect(inboxHref({ status: 'new', id: 4 }).startsWith(`${INBOX_PATH}?`)).toBe(true)
  })
})

describe('excerpt', () => {
  it('collapses whitespace and keeps short messages whole', () => {
    expect(excerpt('  Hi!\n\nWe are   getting married.  ')).toBe('Hi! We are getting married.')
  })

  it('cuts long messages to 140 characters ending in an ellipsis', () => {
    const cut = excerpt('word '.repeat(100))
    expect(Array.from(cut)).toHaveLength(140)
    expect(cut.endsWith('…')).toBe(true)
  })

  it('never splits an emoji', () => {
    const cut = excerpt('📷'.repeat(200))
    expect(Array.from(cut).length).toBeLessThanOrEqual(140)
    expect(cut).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
  })
})

describe('nextSelection', () => {
  it('picks the next card, else the previous one, else none', () => {
    expect(nextSelection([1, 2, 3], 2)).toBe(3)
    expect(nextSelection([1, 2, 3], 3)).toBe(2)
    expect(nextSelection([5], 5)).toBeNull()
    expect(nextSelection([], 5)).toBeNull()
  })

  it('picks the first card when the selected inquiry is not on this page', () => {
    expect(nextSelection([4, 5], 9)).toBe(4)
  })
})

describe('gmailReplyHref', () => {
  const params = (href: string | null) => {
    const url = new URL(href!)
    return { base: `${url.origin}${url.pathname}`, all: Object.fromEntries(url.searchParams) }
  }

  it('opens Gmail compose addressed to the visitor, with the subject and the contact account', () => {
    expect(params(gmailReplyHref(' ana@example.com ', 'owner@example.com'))).toEqual({
      base: 'https://mail.google.com/mail/',
      all: { view: 'cm', fs: '1', to: 'ana@example.com', su: 'Re: your Book Me inquiry', authuser: 'owner@example.com' },
    })
  })

  it.each([null, '', '  ', 'not-an-email'])('leaves the account out for %j', (account) => {
    expect(params(gmailReplyHref('ana@example.com', account)).all).not.toHaveProperty('authuser')
  })

  it('encodes every value, so nothing in an address adds parameters', () => {
    const href = gmailReplyHref('a?bcc=x&cc=y@example.com', null)!
    expect(href).toContain('to=a%3Fbcc%3Dx%26cc%3Dy%40example.com')
    expect(Object.keys(params(href).all).sort()).toEqual(['fs', 'su', 'to', 'view'])
  })

  it.each(['not-an-email', 'javascript:alert(1)', 'a@b', '', 'ana@example.com?subject=x'])('gives no link for %j', (email) => {
    expect(gmailReplyHref(email, 'owner@example.com')).toBeNull()
  })
})

type Doc = {
  id: number
  name: string
  email: string
  projectType: string
  timing: string | null
  message: string
  status: InquiryStatus
  createdAt: string
}

const inquiry = (id: number, status: InquiryStatus, day: number, extra: Partial<Doc> = {}): Doc => ({
  id,
  name: ` Name ${id} `,
  email: `person${id}@example.com`,
  projectType: 'Photography',
  timing: null,
  message: `Message ${id}, long enough to be a real inquiry.`,
  status,
  createdAt: new Date(Date.UTC(2026, 9, day)).toISOString(),
  ...extra,
})

type Where = { status: { equals: InquiryStatus } }

/** A Payload stand-in for the inbox: counts, a newest-first page, findByID and site-settings, all recorded. */
function inboxPayload(docs: Doc[], contactEmail: unknown = 'owner@example.com') {
  const ofStatus = (where: Where) =>
    docs.filter((d) => d.status === where.status.equals).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return {
    count: vi.fn(async ({ where }: { where: Where }) => ({ totalDocs: ofStatus(where).length })),
    find: vi.fn(async ({ where, limit, page }: { where: Where; limit: number; page: number }) => {
      const all = ofStatus(where)
      return { docs: all.slice((page - 1) * limit, page * limit), totalDocs: all.length }
    }),
    findByID: vi.fn(async ({ id }: { id: number }) => docs.find((d) => d.id === id) ?? null),
    findGlobal: vi.fn(async () => ({ contactEmail })),
  }
}

const inbox = async (
  docs: Doc[],
  query: { status?: InquiryStatus; page?: number; id?: number | null } = {},
  contactEmail?: unknown,
) => {
  const payload = inboxPayload(docs, contactEmail)
  const data = await studioInbox(
    { payload: payload as unknown as Payload, user },
    { status: query.status ?? 'new', page: query.page ?? 1, id: query.id ?? null },
  )
  return { payload, data }
}

const callsOf = (payload: ReturnType<typeof inboxPayload>) =>
  [payload.count, payload.find, payload.findByID, payload.findGlobal].flatMap((fn) => fn.mock.calls.map((c) => c[0] as Record<string, unknown>))

const seed = [
  inquiry(1, 'new', 1),
  inquiry(2, 'new', 3),
  inquiry(3, 'new', 2),
  inquiry(4, 'replied', 4),
  inquiry(5, 'archived', 5),
]

describe('studioInbox: access and cost', () => {
  it('runs every call as the editor through access control, at most six calls', async () => {
    const { payload } = await inbox(seed, { id: 4 })
    const calls = callsOf(payload)
    expect(calls.length).toBeLessThanOrEqual(6)
    for (const call of calls) {
      expect(call.overrideAccess).toBe(false)
      expect(call.user).toBe(user)
    }
  })

  it('reads only the contact email from site-settings, as the reply account', async () => {
    const { payload, data } = await inbox(seed)
    expect(payload.findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'site-settings', select: { contactEmail: true }, overrideAccess: false, user }),
    )
    expect(data.replyAccount).toBe('owner@example.com')
  })

  it.each([[null], [''], ['not-an-email'], [42]])('has no reply account for a contact email of %j', async (contactEmail) => {
    const payload = inboxPayload(seed, contactEmail)
    const data = await studioInbox({ payload: payload as unknown as Payload, user }, { status: 'new', page: 1, id: null })
    expect(data.replyAccount).toBeNull()
  })

  it('reads one page of the tab, newest first, 20 at a time', async () => {
    const { payload } = await inbox(seed)
    expect(payload.find).toHaveBeenCalledTimes(1)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'inquiries',
        where: { status: { equals: 'new' } },
        sort: '-createdAt',
        limit: 20,
        page: 1,
        depth: 0,
      }),
    )
    expect(payload.findByID).not.toHaveBeenCalled()
  })
})

describe('studioInbox: tab, rows and selection', () => {
  it('counts every status and selects the newest inquiry by default', async () => {
    const { data } = await inbox(seed)
    expect(data.counts).toEqual({ new: 3, replied: 1, archived: 1 })
    expect(data.rows.map((r) => r.id)).toEqual([2, 3, 1])
    expect(data.rows[0]).toMatchObject({
      name: 'Name 2',
      projectType: 'Photography',
      excerpt: 'Message 2, long enough to be a real inquiry.',
      href: '/admin/collections/inquiries?status=new&id=2',
    })
    expect(data.selected).toMatchObject({ id: 2, name: 'Name 2', email: 'person2@example.com', status: 'new', timing: '' })
    expect(data.query).toEqual({ status: 'new', page: 1, id: 2 })
    expect(data.nextId).toBe(3)
    expect(data.newerHref).toBeNull()
    expect(data.olderHref).toBeNull()
  })

  it('selects the inquiry in the URL when it has the tab status', async () => {
    const { data } = await inbox(seed, { id: 3 })
    expect(data.selected?.id).toBe(3)
    expect(data.nextId).toBe(1)
  })

  it('falls back to the first card for an id of another status or one that does not exist', async () => {
    expect((await inbox(seed, { id: 4 })).data.selected?.id).toBe(2)
    expect((await inbox(seed, { id: 99 })).data.selected?.id).toBe(2)
  })

  it('shows an empty tab with nothing selected', async () => {
    const { data } = await inbox([inquiry(1, 'new', 1)], { status: 'archived' })
    expect(data.rows).toEqual([])
    expect(data.selected).toBeNull()
    expect(data.nextId).toBeNull()
    expect(data.query).toEqual({ status: 'archived', page: 1, id: null })
  })

  it('keeps the visitor’s line breaks in the selected message', async () => {
    const { data } = await inbox([inquiry(1, 'new', 1, { message: 'Line one\nLine two' })])
    expect(data.selected?.message).toBe('Line one\nLine two')
    expect(data.rows[0].excerpt).toBe('Line one Line two')
  })
})

describe('studioInbox: paging', () => {
  const many = Array.from({ length: 45 }, (_, i) => inquiry(i + 1, 'new', 1 + (i % 28), { createdAt: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString() }))

  it('pages through 20 at a time with Newer and Older links', async () => {
    const { data } = await inbox(many, { page: 2 })
    expect(data.rows).toHaveLength(20)
    expect(data.rows[0].id).toBe(25)
    expect(data.rows[0].href).toBe('/admin/collections/inquiries?status=new&page=2&id=25')
    expect(data.newerHref).toBe('/admin/collections/inquiries?status=new&id=')
    expect(data.olderHref).toBe('/admin/collections/inquiries?status=new&page=3&id=')
  })

  it('clamps a page past the end to the last page', async () => {
    const { payload, data } = await inbox(many, { page: 9 })
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    expect(data.query.page).toBe(3)
    expect(data.rows).toHaveLength(5)
    expect(data.olderHref).toBeNull()
    expect(data.newerHref).toBe('/admin/collections/inquiries?status=new&page=2&id=')
  })

  it('selects an inquiry from another page of the same tab', async () => {
    const { data } = await inbox(many, { page: 1, id: 3 })
    expect(data.selected?.id).toBe(3)
    expect(data.rows.map((r) => r.id)).not.toContain(3)
    expect(data.nextId).toBe(45)
  })
})

describe('projectCountsByCollection', () => {
  const disciplines = [
    { id: 1, name: 'Photography', slug: 'photography' },
    { id: 2, name: 'Film & Video', slug: 'film-video' },
    { id: 4, name: 'Writing & More', slug: 'writing-more' },
  ]
  const projects = [{ collection: 1 }, { collection: 1 }, { collection: { id: 2 } }, { collection: 1 }, { collection: null }]

  function countsPayload() {
    return {
      find: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'disciplines' ? { docs: disciplines } : { docs: projects },
      ),
    }
  }

  it('counts every project once, drafts included, per discipline in order, keeping empty ones', async () => {
    const payload = countsPayload()
    const counts = await projectCountsByCollection({ payload: payload as unknown as Payload, user })
    expect(counts).toEqual({
      all: 5,
      items: [
        { id: 1, name: 'Photography', slug: 'photography', count: 3 },
        { id: 2, name: 'Film & Video', slug: 'film-video', count: 1 },
        { id: 4, name: 'Writing & More', slug: 'writing-more', count: 0 },
      ],
    })
  })

  it('reads latest versions (as the list view does) and disciplines in order, as the editor', async () => {
    const payload = countsPayload()
    await projectCountsByCollection({ payload: payload as unknown as Payload, user })
    expect(payload.find).toHaveBeenCalledTimes(2)
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'projects', draft: true, pagination: false, overrideAccess: false, user }),
    )
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'disciplines', sort: 'order', pagination: false, overrideAccess: false, user }),
    )
  })
})

describe('collectionFilter (projects baseFilter)', () => {
  const run = (query: Record<string, unknown> | undefined, withUser = true) => {
    const find = vi.fn(async ({ where }: { where: { slug: { equals: string } } }) => ({
      docs: where.slug.equals === 'photography' ? [{ id: 1 }] : [],
    }))
    const req = { query, user: withUser ? user : null, payload: { find } }
    const result = collectionFilter({ req, limit: 10, page: 1, sort: '' } as unknown as Parameters<BaseFilter>[0])
    return { find, result }
  }

  it('narrows the list to the discipline in ?collection=, looked up as the editor', async () => {
    const { find, result } = run({ collection: 'photography' })
    await expect(result).resolves.toEqual({ collection: { equals: 1 } })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'disciplines', where: { slug: { equals: 'photography' } }, overrideAccess: false, user }),
    )
  })

  it('adds no filter without the parameter (Payload also runs this for relationship drawers)', async () => {
    const { find, result } = run({})
    await expect(result).resolves.toBeNull()
    expect(find).not.toHaveBeenCalled()
    await expect(run(undefined).result).resolves.toBeNull()
  })

  it.each([['Photo graphy'], ['../x'], ['a'.repeat(101)], [['photography']], ['photography;drop']])(
    'ignores a malformed value %j without querying',
    async (value) => {
      const { find, result } = run({ collection: value })
      await expect(result).resolves.toBeNull()
      expect(find).not.toHaveBeenCalled()
    },
  )

  it('adds no filter for an unknown slug or without a logged-in editor', async () => {
    await expect(run({ collection: 'sculpture' }).result).resolves.toBeNull()
    const signedOut = run({ collection: 'photography' }, false)
    await expect(signedOut.result).resolves.toBeNull()
    expect(signedOut.find).not.toHaveBeenCalled()
  })
})
