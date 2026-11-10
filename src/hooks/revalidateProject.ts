import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from 'payload'

import { appendPreviousSlug, projectPublicPaths } from '@/lib/publishing'
import type { Project } from '@/payload-types'

/**
 * Publishing hooks for projects (Build Spec › Publishing).
 *
 * Payload hands hooks the *latest version* as the previous doc, and with autosave that is often a
 * draft that already holds the new slug. What the public sees is the main row instead: draft and
 * autosave saves only write versions, while publish, unpublish and delete rewrite the main row.
 * So these hooks snapshot the main row before a save and compare it afterwards.
 */

type MainRow = Pick<
  Project,
  'id' | 'slug' | 'collection' | 'showOnHome' | '_status' | 'updatedAt' | 'previousSlugs'
>

const snapshotKey = (id: number | string) => `projects:mainRow:${id}`

async function readMainRow(req: PayloadRequest, id: number | string): Promise<MainRow | null> {
  return req.payload.findByID({
    collection: 'projects',
    id,
    draft: false, // the main row, never a draft version
    depth: 0,
    overrideAccess: true,
    disableErrors: true,
    req,
  })
}

async function publicPaths(req: PayloadRequest, row: MainRow | null | undefined): Promise<string[]> {
  if (row?._status !== 'published') return []
  const disciplineId = typeof row.collection === 'object' ? row.collection?.id : row.collection
  const discipline =
    disciplineId == null
      ? null
      : await req.payload.findByID({
          collection: 'disciplines',
          id: disciplineId,
          depth: 0,
          overrideAccess: true,
          disableErrors: true,
          select: { slug: true },
          req,
        })
  if (!discipline?.slug) {
    req.payload.logger.warn(`project ${row.id}: its collection was not found; refreshing Home only`)
  }
  return projectPublicPaths({
    published: true,
    slug: row.slug,
    disciplineSlug: discipline?.slug,
    showOnHome: row.showOnHome,
  })
}

/** Logs and swallows failures: the save already happened and must not be undone by a refresh. */
function revalidatePaths(req: PayloadRequest, paths: string[], reason: string) {
  if (paths.length === 0) return
  req.payload.logger.info(`${reason}: revalidating ${paths.join(', ')}`)
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      req.payload.logger.error({ err: error, msg: `${reason}: revalidating ${path} failed` })
    }
  }
}

/**
 * Snapshots the published state and, when a publish changes the published slug, records the old
 * slug for 308 redirects. Draft saves never touch `previousSlugs`.
 */
export const recordProjectSlug: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || originalDoc?.id == null) return data
  const before = await readMainRow(req, originalDoc.id)
  // Write to req.context *after* the read: a nested Local API call given `req` replaces
  // req.context with a copy, so the hook's own `context` argument is stale by now. Later
  // replacements spread existing keys, so afterChange still sees this snapshot.
  req.context[snapshotKey(originalDoc.id)] = before

  const newSlug = data.slug ?? originalDoc.slug
  if (
    data._status === 'published' &&
    before?._status === 'published' &&
    before.slug &&
    typeof newSlug === 'string' &&
    before.slug !== newSlug
  ) {
    data.previousSlugs = appendPreviousSlug(before.previousSlugs, before.slug, newSlug)
  }
  return data
}

/** Refreshes the old and new public pages, but only when the published state changed. */
export const revalidateProject: CollectionAfterChangeHook = async ({ context, doc, operation, req }) => {
  if (context.disableRevalidate) return doc
  const before =
    operation === 'update' ? (req.context[snapshotKey(doc.id)] as MainRow | null | undefined) : null
  const after = await readMainRow(req, doc.id)

  // Draft and autosave saves leave the main row untouched: nothing public changed.
  if (before && after && before.updatedAt === after.updatedAt) return doc

  const paths = new Set([...(await publicPaths(req, before)), ...(await publicPaths(req, after))])
  revalidatePaths(req, [...paths], `project ${doc.id} ${operation}`)
  return doc
}

/** Deleting a published project refreshes the pages that showed it. */
export const revalidateDeletedProject: CollectionAfterDeleteHook = async ({ context, doc, req }) => {
  if (context.disableRevalidate) return doc
  revalidatePaths(req, await publicPaths(req, doc as MainRow), `project ${doc.id} deleted`)
  return doc
}
