import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

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
