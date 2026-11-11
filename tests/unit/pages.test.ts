import { beforeEach, describe, expect, it, vi } from 'vitest'

const findGlobal = vi.fn(async () => ({}))
const find = vi.fn(async () => ({ docs: [] }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find, findGlobal }) }))

import { getAbout, getHome } from '@/lib/pages'
import { getHomeProjects, SELECTED_WORK_LIMIT } from '@/lib/portfolio'

const editor = { id: 1, email: 'editor@example.com', collection: 'users' } as never

describe('Home and About reads (invariants 1 and 19)', () => {
  beforeEach(() => findGlobal.mockClear())

  it('reads the published version for visitors, with access applied', async () => {
    await getHome()
    await getAbout()
    expect(findGlobal).toHaveBeenCalledWith({ slug: 'home', depth: 2, draft: false, overrideAccess: false, user: undefined })
    expect(findGlobal).toHaveBeenCalledWith({ slug: 'about', depth: 1, draft: false, overrideAccess: false, user: undefined })
  })

  it('reads the latest draft only for an editor, still with access applied', async () => {
    await getHome(editor)
    await getAbout(editor)
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'home', draft: true, overrideAccess: false, user: editor }),
    )
    expect(findGlobal).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'about', draft: true, overrideAccess: false, user: editor }),
    )
  })

  it('passes through an unpublished global as {}', async () => {
    await expect(getHome()).resolves.toEqual({})
  })
})

describe('getHomeProjects', () => {
  it('reads published projects ticked for Selected work, in homeOrder, nine at most', async () => {
    await getHomeProjects()
    expect(SELECTED_WORK_LIMIT).toBe(9)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'projects',
        where: { showOnHome: { equals: true } },
        sort: ['homeOrder', '-year', 'title'],
        limit: 9,
        draft: false,
        overrideAccess: false,
      }),
    )
  })
})
