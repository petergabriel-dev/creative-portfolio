import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeDeleteHook,
} from 'payload'

import { revalidateSite } from '@/hooks/revalidateLayout'

/**
 * A category used by any post can't be deleted (P2 owner decision 3): the database would set the
 * posts' required category to null. Counts main rows, so published posts and never-published
 * drafts both block the delete.
 */
export const blockCategoryDeleteInUse: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const { totalDocs } = await req.payload.count({
    collection: 'posts',
    where: { category: { equals: id } },
    overrideAccess: true,
    req,
  })
  if (totalDocs > 0) {
    const posts = totalDocs === 1 ? '1 post. Move it' : `${totalDocs} posts. Move them`
    throw new APIError(`Used by ${posts} to another category first.`, 400, undefined, true)
  }
}

/**
 * A category's name shows on journal entries and lists (and Home cards in P4), so any change
 * refreshes the whole site (P2 owner decision 2).
 */
export const revalidateCategory: CollectionAfterChangeHook = ({ context, doc, req }) => {
  revalidateSite(context, req, `category ${doc.slug} changed`)
  return doc
}

export const revalidateDeletedCategory: CollectionAfterDeleteHook = ({ context, doc, req }) => {
  revalidateSite(context, req, `category ${doc?.slug} deleted`)
  return doc
}
