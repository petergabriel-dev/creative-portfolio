import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from 'next/cache'

import { About } from '@/globals/About'
import { Home } from '@/globals/Home'
import {
  blockCategoryDeleteInUse,
  revalidateCategory,
  revalidateDeletedCategory,
} from '@/hooks/categoryHooks'
import { globalPublishHooks } from '@/hooks/publishHooks'
import {
  recordDisciplineSlug,
  revalidateDeletedDiscipline,
  revalidateDiscipline,
} from '@/hooks/revalidateDiscipline'
import { recordPostSlug, revalidateDeletedPost, revalidatePost } from '@/hooks/revalidatePost'
import {
  recordProjectSlug,
  revalidateDeletedProject,
  revalidateProject,
} from '@/hooks/revalidateProject'
import {
  appendPreviousSlug,
  collectionPath,
  fillPublishedAt,
  journalPagePath,
  postPath,
  postPublicPaths,
  projectPath,
  projectPublicPaths,
} from '@/lib/publishing'

describe('paths', () => {
  it('nests projects under their collection slug', () => {
    expect(collectionPath('photography')).toBe('/portfolio/photography')
    expect(projectPath('photography', 'couple-wedding')).toBe('/portfolio/photography/couple-wedding')
  })

  it('lists the pages that show a published project, Home always included (P4)', () => {
    const state = { published: true, slug: 'p', disciplineSlug: 'photo' }
    expect(projectPublicPaths(state)).toEqual(['/portfolio/photo/p', '/portfolio/photo', '/'])
    expect(projectPublicPaths({ ...state, published: false })).toEqual([])
    expect(projectPublicPaths(null)).toEqual([])
    expect(projectPublicPaths({ ...state, disciplineSlug: null })).toEqual(['/'])
  })
})

describe('fillPublishedAt', () => {
  const run = (value: unknown, status?: 'draft' | 'published') =>
    fillPublishedAt({ value, data: status ? { _status: status } : {} } as Parameters<typeof fillPublishedAt>[0])

  it('fills an empty date with the publish time when the save publishes', () => {
    const before = Date.now()
    for (const empty of [undefined, null, '']) {
      const filled = run(empty, 'published')
      expect(typeof filled).toBe('string')
      expect(Date.parse(filled as string)).toBeGreaterThanOrEqual(before)
      expect(Date.parse(filled as string)).toBeLessThanOrEqual(Date.now())
    }
  })

  it('never overwrites a date the editor set', () => {
    expect(run('2026-11-06T02:00:00.000Z', 'published')).toBe('2026-11-06T02:00:00.000Z')
    expect(run('2030-01-01T00:00:00.000Z', 'published')).toBe('2030-01-01T00:00:00.000Z')
  })

  it('leaves draft, autosave and status-less saves untouched', () => {
    expect(run(undefined, 'draft')).toBeUndefined()
    expect(run(null, 'draft')).toBeNull()
    expect(run(undefined)).toBeUndefined()
  })
})

describe('appendPreviousSlug', () => {
  it('adds the old slug once, keeping earlier ones', () => {
    expect(appendPreviousSlug(['a'], 'b', 'c')).toEqual(['a', 'b'])
    expect(appendPreviousSlug(['a', 'b'], 'b', 'c')).toEqual(['a', 'b'])
  })

  it('drops the new slug when renaming back to an old one', () => {
    expect(appendPreviousSlug(['a', 'b'], 'c', 'a')).toEqual(['b', 'c'])
  })

  it('ignores junk and unchanged slugs, and keeps the latest entries', () => {
    expect(appendPreviousSlug(null, 'a', 'b')).toEqual(['a'])
    expect(appendPreviousSlug(['x', 3, ''], 'a', 'a')).toEqual(['x'])
    expect(appendPreviousSlug(['1', '2', '3'], '4', '5', 3)).toEqual(['2', '3', '4'])
  })
})

type Row = {
  id: number
  slug: string
  collection: number
  _status: 'draft' | 'published'
  updatedAt: string
  previousSlugs?: string[]
}

/**
 * A fake Payload request whose `projects` main row the test can change between hooks. Like
 * Payload's createLocalReq, every nested Local API call replaces req.context with a copy.
 */
function setup(row: Row | null, disciplines: Record<number, string> = { 1: 'photography', 2: 'film' }) {
  const state = { row }
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  const req: { context: Record<string, unknown>; payload: object } = { context: {}, payload: {} }
  const findByID = vi.fn(async ({ collection, id }: { collection: string; id: number }) => {
    req.context = { ...req.context }
    return collection === 'projects' ? state.row : disciplines[id] ? { id, slug: disciplines[id] } : null
  })
  req.payload = { findByID, logger }
  return { state, req, logger }
}

type AnyArgs = never
type Setup = ReturnType<typeof setup>
/** Calls a hook the way Payload does: with the request's *current* context. */
const run = {
  before: (s: Setup, args: object) =>
    recordProjectSlug({ context: s.req.context, req: s.req, ...args } as AnyArgs),
  after: (s: Setup, args: object) =>
    revalidateProject({ context: s.req.context, req: s.req, ...args } as AnyArgs),
}

const published: Row = {
  id: 7,
  slug: 'old',
  collection: 1,
  _status: 'published',
  updatedAt: '2026-11-10T10:00:00.000Z',
  previousSlugs: ['oldest'],
}

const revalidated = () => vi.mocked(revalidatePath).mock.calls.map(([path]) => path)

describe('project publishing hooks', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('does nothing public on a draft or autosave save', async () => {
    const s = setup(published)
    const data = { _status: 'draft', slug: 'new' } as Record<string, unknown>
    await run.before(s, { data, operation: 'update', originalDoc: { id: 7, slug: 'new' } })
    expect(data.previousSlugs).toBeUndefined()
    // The main row is untouched by a draft save.
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('records the old slug and refreshes old and new pages when a rename is published', async () => {
    const s = setup(published)
    const data = { _status: 'published', slug: 'new' } as Record<string, unknown>
    // originalDoc is the autosaved draft, which already has the new slug.
    await run.before(s, { data, operation: 'update', originalDoc: { id: 7, slug: 'new' } })
    expect(data.previousSlugs).toEqual(['oldest', 'old'])

    s.state.row = { ...published, slug: 'new', previousSlugs: ['oldest', 'old'], updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(
      ['/', '/(frontend)/journal/[slug]', '/portfolio/photography', '/portfolio/photography/new', '/portfolio/photography/old'].sort(),
    )
  })

  it('records no old slug on a first publish', async () => {
    const draftOnly: Row = { ...published, _status: 'draft' }
    const s = setup(draftOnly)
    const data = { _status: 'published', slug: 'new' } as Record<string, unknown>
    await run.before(s, { data, operation: 'update', originalDoc: { id: 7, slug: 'new' } })
    expect(data.previousSlugs).toBeUndefined()

    s.state.row = { ...draftOnly, _status: 'published', slug: 'new', updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(['/', '/(frontend)/journal/[slug]', '/portfolio/photography', '/portfolio/photography/new'])
  })

  it('refreshes the old pages, Home included, on unpublish', async () => {
    const s = setup(published)
    await run.before(s, { data: { _status: 'draft' }, operation: 'update', originalDoc: published })
    s.state.row = { ...published, _status: 'draft', updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(['/', '/(frontend)/journal/[slug]', '/portfolio/photography', '/portfolio/photography/old'])
  })

  it('refreshes both collections when a project moves', async () => {
    const s = setup(published)
    await run.before(s, { data: { _status: 'published' }, operation: 'update', originalDoc: published })
    s.state.row = { ...published, collection: 2, updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(
      ['/', '/(frontend)/journal/[slug]', '/portfolio/film', '/portfolio/film/old', '/portfolio/photography', '/portfolio/photography/old'].sort(),
    )
  })

  it('refreshes the new pages when a project is created published, and nothing for a draft', async () => {
    const s = setup(published)
    await run.after(s, { doc: { id: 7 }, operation: 'create' })
    expect(revalidated().sort()).toEqual(['/', '/(frontend)/journal/[slug]', '/portfolio/photography', '/portfolio/photography/old'])

    vi.mocked(revalidatePath).mockClear()
    const draft = setup({ ...published, _status: 'draft' })
    await run.after(draft, { doc: { id: 7 }, operation: 'create' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('skips refreshing under disableRevalidate but still records old slugs', async () => {
    const s = setup(published)
    s.req.context.disableRevalidate = true // as the seed passes it
    const data = { _status: 'published', slug: 'new' } as Record<string, unknown>
    await run.before(s, { data, operation: 'update', originalDoc: published })
    expect(data.previousSlugs).toEqual(['oldest', 'old'])
    s.state.row = { ...published, slug: 'new', updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('refreshes Home only, with a warning, when the collection is missing', async () => {
    const orphan = { ...published, collection: 99 }
    const s = setup(orphan)
    await run.after(s, { doc: { id: 7 }, operation: 'create' })
    expect(revalidated()).toEqual(['/', '/(frontend)/journal/[slug]'])
    expect(s.logger.warn).toHaveBeenCalled()
  })

  it('logs a failed refresh instead of failing the save', async () => {
    vi.mocked(revalidatePath).mockImplementationOnce(() => {
      throw new Error('static generation store missing')
    })
    const s = setup(published)
    await expect(run.after(s, { doc: { id: 7 }, operation: 'create' })).resolves.toEqual({ id: 7 })
    expect(s.logger.error).toHaveBeenCalled()
  })

  it('refreshes the pages of a deleted published project only', async () => {
    const s = setup(null)
    await revalidateDeletedProject({ context: s.req.context, doc: published, req: s.req } as AnyArgs)
    expect(revalidated().sort()).toEqual(['/', '/(frontend)/journal/[slug]', '/portfolio/photography', '/portfolio/photography/old'])

    vi.mocked(revalidatePath).mockClear()
    const draftDoc = { ...published, _status: 'draft' }
    await revalidateDeletedProject({ context: s.req.context, doc: draftDoc, req: s.req } as AnyArgs)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('discipline publishing hooks', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('records the old slug when the slug changes', () => {
    const data = { slug: 'film-video' } as Record<string, unknown>
    recordDisciplineSlug({
      data,
      operation: 'update',
      originalDoc: { slug: 'film', previousSlugs: ['movies'] },
    } as AnyArgs)
    expect(data.previousSlugs).toEqual(['movies', 'film'])

    const unchanged = { name: 'Film' } as Record<string, unknown>
    recordDisciplineSlug({ data: unchanged, operation: 'update', originalDoc: { slug: 'film' } } as AnyArgs)
    expect(unchanged.previousSlugs).toBeUndefined()
  })

  it('refreshes every page on change and delete, except under disableRevalidate', () => {
    const s = setup(null)
    revalidateDiscipline({ context: {}, doc: { slug: 'film' }, req: s.req } as AnyArgs)
    revalidateDeletedDiscipline({ context: {}, doc: { slug: 'film' }, req: s.req } as AnyArgs)
    expect(vi.mocked(revalidatePath).mock.calls).toEqual([
      ['/', 'layout'],
      ['/', 'layout'],
    ])

    vi.mocked(revalidatePath).mockClear()
    const off = { context: { disableRevalidate: true }, doc: { slug: 'film' }, req: s.req }
    revalidateDiscipline(off as AnyArgs)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('journal paths (P2)', () => {
  it('puts page 1 at /journal, later pages under /journal/page/N and entries under /journal', () => {
    expect(journalPagePath(1)).toBe('/journal')
    expect(journalPagePath(2)).toBe('/journal/page/2')
    expect(postPath('quiet-minutes')).toBe('/journal/quiet-minutes')
  })

  it('lists the pages that show a published post, and none for an unpublished one', () => {
    expect(postPublicPaths({ published: true, slug: 'quiet' })).toEqual([
      '/journal/quiet',
      '/journal',
      { path: '/(frontend)/journal/page/[n]', type: 'page' },
      '/',
    ])
    expect(postPublicPaths({ published: false, slug: 'quiet' })).toEqual([])
    expect(postPublicPaths(null)).toEqual([])
  })
})

type PostRow = {
  id: number
  slug: string
  _status: 'draft' | 'published'
  updatedAt: string
  previousSlugs?: string[]
}

/** Like setup(), for the `posts` main row. */
function setupPost(row: PostRow | null) {
  const state = { row }
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  const req: { context: Record<string, unknown>; payload: object } = { context: {}, payload: {} }
  const findByID = vi.fn(async ({ collection }: { collection: string }) => {
    req.context = { ...req.context }
    return collection === 'posts' ? state.row : null
  })
  req.payload = { findByID, logger }
  return { state, req, logger }
}

type PostSetup = ReturnType<typeof setupPost>
const runPost = {
  before: (s: PostSetup, args: object) =>
    recordPostSlug({ context: s.req.context, req: s.req, ...args } as AnyArgs),
  after: (s: PostSetup, args: object) =>
    revalidatePost({ context: s.req.context, req: s.req, ...args } as AnyArgs),
}

const publishedPost: PostRow = {
  id: 3,
  slug: 'quiet',
  _status: 'published',
  updatedAt: '2026-11-10T10:00:00.000Z',
  previousSlugs: [],
}
const later = '2026-11-11T10:00:00.000Z'
const calls = () => vi.mocked(revalidatePath).mock.calls
const LIST_PAGES = ['/(frontend)/journal/page/[n]', 'page']

describe('post publishing hooks (P2)', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('does nothing public on a draft or autosave save', async () => {
    const s = setupPost(publishedPost)
    const data = { _status: 'draft', slug: 'loud' } as Record<string, unknown>
    await runPost.before(s, { data, operation: 'update', originalDoc: { id: 3, slug: 'loud' } })
    expect(data.previousSlugs).toBeUndefined()
    await runPost.after(s, { doc: { id: 3 }, operation: 'update' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('refreshes the entry, every list page and Home on first publish', async () => {
    const s = setupPost({ ...publishedPost, _status: 'draft' })
    const data = { _status: 'published' } as Record<string, unknown>
    await runPost.before(s, { data, operation: 'update', originalDoc: { id: 3, slug: 'quiet' } })
    expect(data.previousSlugs).toBeUndefined()
    s.state.row = { ...publishedPost, updatedAt: later }
    await runPost.after(s, { doc: { id: 3 }, operation: 'update' })
    expect(calls()).toEqual([['/journal/quiet'], ['/journal'], LIST_PAGES, ['/']])
  })

  it('records the old slug and refreshes old and new entries when a rename is published', async () => {
    const s = setupPost(publishedPost)
    const data = { _status: 'published', slug: 'loud' } as Record<string, unknown>
    // originalDoc is the autosaved draft, which already has the new slug.
    await runPost.before(s, { data, operation: 'update', originalDoc: { id: 3, slug: 'loud' } })
    expect(data.previousSlugs).toEqual(['quiet'])
    s.state.row = { ...publishedPost, slug: 'loud', previousSlugs: ['quiet'], updatedAt: later }
    await runPost.after(s, { doc: { id: 3 }, operation: 'update' })
    // Shared pages are refreshed once.
    expect(calls()).toEqual([['/journal/quiet'], ['/journal'], LIST_PAGES, ['/'], ['/journal/loud']])
  })

  it('refreshes the old pages on unpublish', async () => {
    const s = setupPost(publishedPost)
    await runPost.before(s, { data: { _status: 'draft' }, operation: 'update', originalDoc: publishedPost })
    s.state.row = { ...publishedPost, _status: 'draft', updatedAt: later }
    await runPost.after(s, { doc: { id: 3 }, operation: 'update' })
    expect(calls()).toEqual([['/journal/quiet'], ['/journal'], LIST_PAGES, ['/']])
  })

  it('refreshes a deleted published post only, and skips everything under disableRevalidate', async () => {
    const s = setupPost(null)
    await revalidateDeletedPost({ context: {}, doc: publishedPost, req: s.req } as AnyArgs)
    expect(calls()).toEqual([['/journal/quiet'], ['/journal'], LIST_PAGES, ['/']])

    vi.mocked(revalidatePath).mockClear()
    await revalidateDeletedPost({ context: {}, doc: { ...publishedPost, _status: 'draft' }, req: s.req } as AnyArgs)
    await revalidateDeletedPost({ context: { disableRevalidate: true }, doc: publishedPost, req: s.req } as AnyArgs)
    const seeded = setupPost(publishedPost)
    seeded.req.context.disableRevalidate = true
    await runPost.after(seeded, { doc: { id: 3 }, operation: 'create' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('project changes refresh journal entries (P2)', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('refreshes every journal entry by route pattern when a project is published, not on drafts', async () => {
    const s = setup(published)
    await run.after(s, { doc: { id: 7 }, operation: 'create' })
    expect(calls()).toContainEqual(['/(frontend)/journal/[slug]', 'page'])

    vi.mocked(revalidatePath).mockClear()
    const draft = setup({ ...published, _status: 'draft' })
    await run.after(draft, { doc: { id: 7 }, operation: 'create' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('global publishing hooks (P4)', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  /**
   * A fake request whose global main row the test can change between hooks; `{}` is what
   * findGlobal returns before the first publish. Like createLocalReq, every nested call replaces
   * req.context with a copy, so a snapshot written to a stale context would be lost.
   */
  function globalSetup(row: { updatedAt?: string }) {
    const state = { row }
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
    const req: { context: Record<string, unknown>; payload: object } = { context: {}, payload: {} }
    const findGlobal = vi.fn(async () => {
      req.context = { ...req.context }
      return state.row
    })
    req.payload = { findGlobal, logger }
    return { state, req, findGlobal }
  }

  type GlobalSetup = ReturnType<typeof globalSetup>
  const hooks = globalPublishHooks({ slug: 'home', path: '/' })
  const before = (s: GlobalSetup, h = hooks) =>
    h.beforeChange({ context: s.req.context, data: {}, req: s.req } as AnyArgs)
  const after = (s: GlobalSetup, h = hooks) =>
    h.afterChange({ context: s.req.context, doc: {}, req: s.req } as AnyArgs)

  const live = { updatedAt: '2026-11-11T10:00:00.000Z' }

  it('refreshes nothing on a draft save, which leaves the main row untouched', async () => {
    const s = globalSetup(live)
    await before(s)
    await after(s)
    expect(revalidatePath).not.toHaveBeenCalled()

    // A draft save of a global that was never published: still no main row.
    const fresh = globalSetup({})
    await before(fresh)
    await after(fresh)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('refreshes its page on the first publish, a publish and an unpublish', async () => {
    const first = globalSetup({})
    await before(first)
    first.state.row = live
    await after(first)
    expect(revalidated()).toEqual(['/'])

    vi.mocked(revalidatePath).mockClear()
    const s = globalSetup(live)
    await before(s)
    s.state.row = { updatedAt: '2026-11-11T11:00:00.000Z' } // publish or unpublish rewrites the row
    await after(s)
    expect(revalidated()).toEqual(['/'])
  })

  it('reads the main row, never a draft, with access overridden', async () => {
    const s = globalSetup(live)
    await before(s)
    expect(s.findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'home', draft: false, overrideAccess: true, depth: 0 }),
    )
  })

  it('skips refreshing under disableRevalidate', async () => {
    const s = globalSetup({})
    s.req.context.disableRevalidate = true // as the seed passes it
    await before(s)
    s.state.row = live
    await after(s)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('wires Home to / and About to /about', async () => {
    for (const [config, path] of [
      [Home, '/'],
      [About, '/about'],
    ] as const) {
      vi.mocked(revalidatePath).mockClear()
      const wired = { beforeChange: config.hooks!.beforeChange![0], afterChange: config.hooks!.afterChange![0] }
      const s = globalSetup({})
      await before(s, wired as typeof hooks)
      s.state.row = live
      await after(s, wired as typeof hooks)
      expect(revalidated()).toEqual([path])
    }
  })
})

describe('category hooks (P2)', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('refreshes every page on save and delete, except under disableRevalidate', () => {
    const s = setup(null)
    revalidateCategory({ context: {}, doc: { slug: 'process' }, req: s.req } as AnyArgs)
    revalidateDeletedCategory({ context: {}, doc: { slug: 'process' }, req: s.req } as AnyArgs)
    expect(calls()).toEqual([
      ['/', 'layout'],
      ['/', 'layout'],
    ])

    vi.mocked(revalidatePath).mockClear()
    revalidateCategory({ context: { disableRevalidate: true }, doc: { slug: 'process' }, req: s.req } as AnyArgs)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  const deleteWith = (totalDocs: number) => {
    const count = vi.fn(async () => ({ totalDocs }))
    const req = { payload: { count } }
    return { count, attempt: () => blockCategoryDeleteInUse({ id: 5, req } as AnyArgs) }
  }

  it('refuses to delete a category that posts use, with a clear message', async () => {
    const { count, attempt } = deleteWith(2)
    await expect(attempt()).rejects.toMatchObject({
      status: 400,
      message: 'Used by 2 posts. Move them to another category first.',
    })
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'posts', where: { category: { equals: 5 } }, overrideAccess: true }),
    )
    await expect(deleteWith(1).attempt()).rejects.toMatchObject({
      message: 'Used by 1 post. Move it to another category first.',
    })
  })

  it('allows deleting an unused category', async () => {
    await expect(deleteWith(0).attempt()).resolves.toBeUndefined()
  })
})
