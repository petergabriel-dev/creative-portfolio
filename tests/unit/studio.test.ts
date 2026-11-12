import type { Payload, TypedUser } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { copy } from '@/copy'
import { newInquiryCount, studioOverview } from '@/lib/studio'

const user = { id: 7, email: 'editor@example.com', collection: 'users' } as unknown as TypedUser

const discipline = (name: string) => ({ id: 1, name, slug: 'x' })
const category = (name: string) => ({ id: 2, name, slug: 'y' })
const media = (thumb: string) => ({ id: 3, url: '/full.webp', sizes: { thumb: { url: thumb } } })

/** A latest-version doc as `findVersions` returns it at depth 1. */
const version = (parent: number, updatedAt: string, data: Record<string, unknown>) => ({
  id: parent * 100,
  parent,
  updatedAt,
  version: data,
})

/** The `latest and parent in` filter the drafts query sends. */
type ParentWhere = { and?: [unknown, { parent?: { in?: number[] } }] }

type Fixture = {
  inquiries?: { docs: unknown[]; totalDocs: number }
  projects?: { id: number; _status: 'draft' | 'published'; showOnHome?: boolean }[]
  posts?: { id: number; _status: 'draft' | 'published' }[]
  home?: Record<string, unknown>
  headline?: string
  versions?: { projects?: ReturnType<typeof version>[]; posts?: ReturnType<typeof version>[] }
  newCount?: number
}

/** A Payload stand-in that answers each Local API call from the fixture and records it. */
function fakePayload(f: Fixture) {
  const parentsOf = (where: unknown): number[] | null =>
    (where as ParentWhere | undefined)?.and?.[1]?.parent?.in ?? null
  const payload = {
    count: vi.fn(async () => ({ totalDocs: f.newCount ?? 0 })),
    find: vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'inquiries') return f.inquiries ?? { docs: [], totalDocs: 0 }
      const docs = collection === 'projects' ? (f.projects ?? []) : (f.posts ?? [])
      return { docs, totalDocs: docs.length }
    }),
    findGlobal: vi.fn(async ({ slug }: { slug: string }) =>
      slug === 'home' ? (f.home ?? {}) : { headline: f.headline ?? 'Every moment has a story' },
    ),
    findVersions: vi.fn(async ({ collection, where, limit }: { collection: 'projects' | 'posts'; where: unknown; limit: number }) => {
      const all = [...(f.versions?.[collection] ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      const parents = parentsOf(where)
      const docs = (parents ? all.filter((v) => parents.includes(v.parent)) : all).slice(0, limit)
      return { docs, totalDocs: docs.length }
    }),
  }
  return payload
}

const run = (f: Fixture) => {
  const payload = fakePayload(f)
  return { payload, result: studioOverview({ payload: payload as unknown as Payload, user }) }
}

const allCalls = (payload: ReturnType<typeof fakePayload>) =>
  [payload.count, payload.find, payload.findGlobal, payload.findVersions].flatMap((fn) =>
    fn.mock.calls.map((call) => call[0] as Record<string, unknown>),
  )

describe('newInquiryCount', () => {
  it('counts new inquiries as the editor, through access control', async () => {
    const payload = fakePayload({ newCount: 3 })
    await expect(newInquiryCount({ payload: payload as unknown as Payload, user })).resolves.toBe(3)
    expect(payload.count).toHaveBeenCalledTimes(1)
    expect(payload.count).toHaveBeenCalledWith({
      collection: 'inquiries',
      where: { status: { equals: 'new' } },
      overrideAccess: false,
      user,
    })
  })
})

describe('studioOverview: access and cost', () => {
  it('runs every call as the editor with access control, never overriding it', async () => {
    const { payload, result } = run({
      projects: [{ id: 1, _status: 'draft' }],
      posts: [{ id: 5, _status: 'draft' }],
      versions: {
        projects: [version(1, '2026-11-10T00:00:00.000Z', { title: 'P', _status: 'draft' })],
        posts: [version(5, '2026-11-09T00:00:00.000Z', { title: 'Q', _status: 'draft' })],
      },
    })
    await result
    const calls = allCalls(payload)
    expect(calls.length).toBeGreaterThan(0)
    for (const call of calls) {
      expect(call.overrideAccess).toBe(false)
      expect(call.user).toBe(user)
    }
  })

  it('makes at most nine Local API calls', async () => {
    const { payload, result } = run({
      projects: [{ id: 1, _status: 'draft' }],
      posts: [{ id: 5, _status: 'draft' }],
    })
    await result
    expect(allCalls(payload).length).toBeLessThanOrEqual(9)
  })

  it('reads main rows unpublished-aware (draft: false) and globals as published', async () => {
    const { payload, result } = run({})
    await result
    for (const [args] of payload.find.mock.calls) {
      if ((args as { collection: string }).collection !== 'inquiries') {
        expect(args).toMatchObject({ draft: false, pagination: false, depth: 0 })
      }
    }
    for (const [args] of payload.findGlobal.mock.calls) expect(args).toMatchObject({ draft: false })
  })
})

describe('studioOverview: Needs a reply', () => {
  it('lists the newest new inquiries with the total and links into the inbox (P6 decision 7)', async () => {
    const { payload, result } = run({
      inquiries: {
        totalDocs: 5,
        docs: [{ id: 9, name: ' [Couple names] ', projectType: 'Photography', createdAt: '2026-11-06T02:00:00.000Z' }],
      },
    })
    const { needsReply } = await result
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'inquiries', where: { status: { equals: 'new' } }, sort: '-createdAt', limit: 3 }),
    )
    expect(needsReply).toEqual({
      total: 5,
      rows: [
        {
          id: 9,
          name: '[Couple names]',
          projectType: 'Photography',
          receivedAt: '2026-11-06T02:00:00.000Z',
          editUrl: '/admin/collections/inquiries?status=new&id=9',
        },
      ],
    })
  })
})

describe('studioOverview: Drafts', () => {
  it('counts draft main rows and shows their latest versions, newest first, at most three', async () => {
    const { payload, result } = run({
      projects: [
        { id: 1, _status: 'draft' },
        { id: 2, _status: 'draft' },
        { id: 3, _status: 'published' },
      ],
      posts: [
        { id: 5, _status: 'draft' },
        { id: 6, _status: 'draft' },
      ],
      versions: {
        projects: [
          version(1, '2026-11-01T00:00:00.000Z', { title: 'Old project', _status: 'draft' }),
          version(2, '2026-11-04T00:00:00.000Z', { title: 'Newest project', _status: 'draft', collection: discipline('Film & Video'), projectType: 'Event film', cover: media('/thumb.webp') }),
          // A live project with a newer autosaved draft: not a draft (owner decision 2).
          version(3, '2026-11-05T00:00:00.000Z', { title: 'Live project', _status: 'draft' }),
        ],
        posts: [
          version(5, '2026-11-03T00:00:00.000Z', { title: 'Post', _status: 'draft', category: category('Process') }),
          version(6, '2026-11-02T00:00:00.000Z', { title: 'Older post', _status: 'draft' }),
        ],
      },
    })
    const { drafts } = await result
    expect(drafts.total).toBe(4)
    expect(drafts.rows.map((r) => r.title)).toEqual(['Newest project', 'Post', 'Older post'])
    expect(drafts.rows[0]).toEqual({
      id: 2,
      collection: 'projects',
      title: 'Newest project',
      meta: 'Film & Video · Event film',
      thumbUrl: '/thumb.webp',
      editUrl: '/admin/collections/projects/2',
      updatedAt: '2026-11-04T00:00:00.000Z',
    })
    expect(drafts.rows[1].meta).toBe('Journal · Process')
    const draftQueries = payload.findVersions.mock.calls.filter(([args]) => JSON.stringify(args).includes('"in"'))
    expect(draftQueries.map(([args]) => (args as { where: ParentWhere }).where.and?.[1].parent?.in)).toEqual([[1, 2], [5, 6]])
  })

  it('shows the latest version, not the stale main row, and falls back to Untitled', async () => {
    const { result } = run({
      projects: [{ id: 1, _status: 'draft' }],
      versions: { projects: [version(1, '2026-11-01T00:00:00.000Z', { title: '  ', _status: 'draft' })] },
    })
    const { drafts } = await result
    expect(drafts.rows[0].title).toBe(copy.studio.untitled)
  })

  it('skips the version queries when there are no drafts', async () => {
    const { payload, result } = run({ projects: [{ id: 3, _status: 'published' }] })
    const { drafts } = await result
    expect(drafts).toEqual({ total: 0, rows: [] })
    expect(payload.findVersions.mock.calls.every(([args]) => !JSON.stringify(args).includes('"in"'))).toBe(true)
  })
})

describe('studioOverview: On the home page', () => {
  it('lists the published slide titles in order, a blank title showing the headline', async () => {
    const { result } = run({
      headline: 'Every moment has a story',
      home: { _status: 'published', heroSlides: [{ id: 'a', title: '' }, { id: 'b', title: ' Photography ' }] },
    })
    const { home } = await result
    expect(home.slideTitles).toEqual(['Every moment has a story', 'Photography'])
  })

  it('shows no slides while home is unpublished, even to the editor', async () => {
    const { result } = run({ home: { _status: 'draft', heroSlides: [{ id: 'a', title: 'Hidden' }] } })
    expect((await result).home.slideTitles).toEqual([])
  })

  it('counts only published projects marked for Selected work', async () => {
    const { result } = run({
      projects: [
        { id: 1, _status: 'published', showOnHome: true },
        { id: 2, _status: 'published', showOnHome: true },
        { id: 3, _status: 'draft', showOnHome: true },
        { id: 4, _status: 'published', showOnHome: false },
      ],
    })
    expect((await result).home.selectedWorkCount).toBe(2)
  })
})

describe('studioOverview: Recently edited', () => {
  it('merges both collections newest first, four at most, with the right chip', async () => {
    const { result } = run({
      projects: [
        { id: 1, _status: 'published' },
        { id: 2, _status: 'published' },
        { id: 3, _status: 'draft' },
      ],
      posts: [{ id: 5, _status: 'published' }],
      versions: {
        projects: [
          version(1, '2026-11-01T00:00:00.000Z', { title: 'Too old', _status: 'published' }),
          version(2, '2026-11-06T00:00:00.000Z', { title: 'Live, edited', _status: 'draft', collection: discipline('Photography'), projectType: 'Wedding' }),
          version(3, '2026-11-04T00:00:00.000Z', { title: 'Never live', _status: 'draft' }),
        ],
        posts: [
          version(5, '2026-11-05T00:00:00.000Z', { title: 'Published post', _status: 'published', category: category('Process') }),
          version(6, '2026-11-03T00:00:00.000Z', { title: 'Fourth', _status: 'published' }),
        ],
      },
    })
    const { recent } = await result
    expect(recent.map((r) => [r.title, r.status])).toEqual([
      ['Live, edited', 'changes'],
      ['Published post', 'published'],
      ['Never live', 'draft'],
      ['Fourth', 'published'],
    ])
    expect(recent[0]).toMatchObject({ meta: 'Project · Wedding', collectionName: 'Photography', editUrl: '/admin/collections/projects/2' })
    expect(recent[1]).toMatchObject({ meta: 'Journal · Process', collectionName: null, editUrl: '/admin/collections/posts/5' })
  })
})

describe('copy.studio.selectedWorkLine', () => {
  it('words the count, saying Home shows only the first nine', () => {
    expect(copy.studio.selectedWorkLine(0)).toBe('Nothing is marked “On home” yet.')
    expect(copy.studio.selectedWorkLine(1)).toBe("Selected work shows 1 piece you've marked “On home”.")
    expect(copy.studio.selectedWorkLine(9)).toBe("Selected work shows 9 pieces you've marked “On home”.")
    expect(copy.studio.selectedWorkLine(10)).toBe("Selected work shows the first 9 of 10 pieces you've marked “On home”.")
  })
})
