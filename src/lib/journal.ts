import config from '@payload-config'
import { getPayload, type TypedUser } from 'payload'
import { cache } from 'react'

import { projectPath } from '@/lib/publishing'
import type { Post } from '@/payload-types'

/**
 * Journal reads for public pages, through the Local API with access applied
 * (`overrideAccess: false`, `draft: false`; invariant 1). React `cache` dedupes them per request.
 */

/** Posts per list page (Build Spec › Front-end pages › Journal). */
export const JOURNAL_PAGE_SIZE = 10

export type PostSummary = Pick<Post, 'id' | 'title' | 'slug' | 'excerpt' | 'cover' | 'category' | 'publishedAt'>

/**
 * One page of published posts, newest first. The id breaks ties, so posts sharing a date keep
 * their place across pages. A page past the last one comes back empty.
 */
export const getJournalPage = cache(
  async (page: number): Promise<{ posts: PostSummary[]; totalPages: number }> => {
    const payload = await getPayload({ config })
    const { docs, totalPages } = await payload.find({
      collection: 'posts',
      sort: ['-publishedAt', '-id'],
      limit: JOURNAL_PAGE_SIZE,
      page,
      depth: 1,
      draft: false,
      overrideAccess: false,
      select: { title: true, slug: true, excerpt: true, cover: true, category: true, publishedAt: true },
    })
    return { posts: docs as PostSummary[], totalPages }
  },
)

/**
 * The N in /journal/page/N: a plain whole number ("2", never "02", "0" or "2.5"). Returns 1 for
 * "1" (the caller redirects to /journal) and null for anything else (a 404).
 */
export function parsePageParam(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null
  const page = Number(raw)
  return Number.isSafeInteger(page) ? page : null
}

export type PostMatch = {
  post: Post
  /** True when the URL used an old slug: 308 to the current one. */
  redirect: boolean
}

/**
 * Finds a post by its slug, else by a previous slug (ADR-0004; the most recently updated doc
 * wins). Depth 2 populates the category, the cover and each related project's collection.
 */
export const findPost = cache(
  async (
    slug: string,
    /** A logged-in editor in draft mode sees the latest draft; everyone else the published post. */
    editor: TypedUser | null = null,
  ): Promise<PostMatch | null> => {
    const payload = await getPayload({ config })
    const query = {
      collection: 'posts',
      depth: 2,
      limit: 1,
      draft: editor !== null,
      overrideAccess: false,
      user: editor ?? undefined,
    } as const
    let redirect = false
    let { docs } = await payload.find({ ...query, where: { slug: { equals: slug } } })
    if (!docs[0]) {
      redirect = true
      ;({ docs } = await payload.find({
        ...query,
        where: { previousSlugs: { in: [slug] } },
        sort: '-updatedAt',
      }))
    }
    return docs[0] ? { post: docs[0], redirect } : null
  },
)

/** Every published post's slug, for generateStaticParams. */
export const getPublishedPostSlugs = cache(async (): Promise<string[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    depth: 0,
    pagination: false,
    draft: false,
    overrideAccess: false,
    select: { slug: true },
  })
  return docs.map((post) => post.slug)
})

/**
 * "See the work" links: related projects that are published and whose collection is known.
 * Unpublished ones come back unpopulated for visitors (or as drafts for an editor) and are skipped.
 */
export function relatedWork(post: Pick<Post, 'relatedProjects'>): { title: string; href: string }[] {
  return (post.relatedProjects ?? []).flatMap((project) => {
    if (typeof project !== 'object' || project === null || project._status !== 'published') return []
    const discipline = typeof project.collection === 'object' ? project.collection : null
    return discipline?.slug && project.slug
      ? [{ title: project.title, href: projectPath(discipline.slug, project.slug) }]
      : []
  })
}
