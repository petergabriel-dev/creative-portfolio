import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from 'next/cache'

import {
  recordDisciplineSlug,
  revalidateDeletedDiscipline,
  revalidateDiscipline,
} from '@/hooks/revalidateDiscipline'
import {
  recordProjectSlug,
  revalidateDeletedProject,
  revalidateProject,
} from '@/hooks/revalidateProject'
import {
  appendPreviousSlug,
  collectionPath,
  projectPath,
  projectPublicPaths,
} from '@/lib/publishing'

describe('paths', () => {
  it('nests projects under their collection slug', () => {
    expect(collectionPath('photography')).toBe('/portfolio/photography')
    expect(projectPath('photography', 'couple-wedding')).toBe('/portfolio/photography/couple-wedding')
  })

  it('lists the pages that show a published project', () => {
    const state = { published: true, slug: 'p', disciplineSlug: 'photo', showOnHome: false }
    expect(projectPublicPaths(state)).toEqual(['/portfolio/photo/p', '/portfolio/photo'])
    expect(projectPublicPaths({ ...state, showOnHome: true })).toContain('/')
    expect(projectPublicPaths({ ...state, published: false })).toEqual([])
    expect(projectPublicPaths(null)).toEqual([])
    expect(projectPublicPaths({ ...state, disciplineSlug: null, showOnHome: true })).toEqual(['/'])
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
  showOnHome?: boolean
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
  showOnHome: false,
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
      ['/portfolio/photography', '/portfolio/photography/new', '/portfolio/photography/old'].sort(),
    )
  })

  it('records no old slug on a first publish', async () => {
    const draftOnly: Row = { ...published, _status: 'draft', showOnHome: true }
    const s = setup(draftOnly)
    const data = { _status: 'published', slug: 'new' } as Record<string, unknown>
    await run.before(s, { data, operation: 'update', originalDoc: { id: 7, slug: 'new' } })
    expect(data.previousSlugs).toBeUndefined()

    s.state.row = { ...draftOnly, _status: 'published', slug: 'new', updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(['/', '/portfolio/photography', '/portfolio/photography/new'])
  })

  it('refreshes the old pages, Home included, on unpublish', async () => {
    const onHome = { ...published, showOnHome: true }
    const s = setup(onHome)
    await run.before(s, { data: { _status: 'draft' }, operation: 'update', originalDoc: onHome })
    s.state.row = { ...onHome, _status: 'draft', updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(['/', '/portfolio/photography', '/portfolio/photography/old'])
  })

  it('refreshes both collections when a project moves', async () => {
    const s = setup(published)
    await run.before(s, { data: { _status: 'published' }, operation: 'update', originalDoc: published })
    s.state.row = { ...published, collection: 2, updatedAt: '2026-11-10T11:00:00.000Z' }
    await run.after(s, { doc: { id: 7 }, operation: 'update' })
    expect(revalidated().sort()).toEqual(
      ['/portfolio/film', '/portfolio/film/old', '/portfolio/photography', '/portfolio/photography/old'].sort(),
    )
  })

  it('refreshes the new pages when a project is created published, and nothing for a draft', async () => {
    const s = setup(published)
    await run.after(s, { doc: { id: 7 }, operation: 'create' })
    expect(revalidated().sort()).toEqual(['/portfolio/photography', '/portfolio/photography/old'])

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
    const orphan = { ...published, collection: 99, showOnHome: true }
    const s = setup(orphan)
    await run.after(s, { doc: { id: 7 }, operation: 'create' })
    expect(revalidated()).toEqual(['/'])
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
    expect(revalidated().sort()).toEqual(['/portfolio/photography', '/portfolio/photography/old'])

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
