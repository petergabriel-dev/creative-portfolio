import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
} from 'payload'

import { revalidateSite } from '@/hooks/revalidateLayout'
import { appendPreviousSlug } from '@/lib/publishing'

/**
 * Disciplines have no drafts, so every save is live: a slug change records the old slug for
 * 308 redirects right away.
 */
export const recordDisciplineSlug: CollectionBeforeChangeHook = ({ data, operation, originalDoc }) => {
  const oldSlug = originalDoc?.slug
  const newSlug = data.slug ?? oldSlug
  if (operation === 'update' && typeof oldSlug === 'string' && typeof newSlug === 'string' && oldSlug !== newSlug) {
    data.previousSlugs = appendPreviousSlug(originalDoc?.previousSlugs, oldSlug, newSlug)
  }
  return data
}

/**
 * A discipline's name, tint and slug appear on /portfolio, its collection page, every project page
 * under it (breadcrumb, details, URL) and Home, so any change refreshes the whole site
 * (P1 owner decision 4; `revalidatePath('/portfolio', 'layout')` needs a layout file there).
 */
export const revalidateDiscipline: CollectionAfterChangeHook = ({ context, doc, req }) => {
  revalidateSite(context, req, `discipline ${doc.slug} changed`)
  return doc
}

export const revalidateDeletedDiscipline: CollectionAfterDeleteHook = ({ context, doc, req }) => {
  revalidateSite(context, req, `discipline ${doc?.slug} deleted`)
  return doc
}
