import { type MainRow, publishHooks } from '@/hooks/publishHooks'
import { postPublicPaths } from '@/lib/publishing'

/**
 * Publishing hooks for journal posts (Build Spec › Publishing): a public change refreshes the
 * entry (old and new URL), every journal list page and `/`. Draft saves refresh nothing.
 */
const hooks = publishHooks<MainRow>({
  collection: 'posts',
  publicPaths: (_req, row) => postPublicPaths({ published: row?._status === 'published', slug: row?.slug }),
})

export const recordPostSlug = hooks.beforeChange
export const revalidatePost = hooks.afterChange
export const revalidateDeletedPost = hooks.afterDelete
