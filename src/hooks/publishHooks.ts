import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
  GlobalBeforeChangeHook,
  PayloadRequest,
} from 'payload'

import { appendPreviousSlug, type Revalidation } from '@/lib/publishing'

/**
 * Publishing hooks for drafts-enabled collections with public pages (projects, posts; ADR-0004).
 *
 * Payload hands hooks the *latest version* as the previous doc, and with autosave that is often a
 * draft that already holds the new slug. What the public sees is the main row instead: draft and
 * autosave saves only write versions, while publish, unpublish and delete rewrite the main row.
 * So these hooks snapshot the main row before a save and compare it afterwards.
 */

/** The main-row fields every such collection has. */
export type MainRow = {
  id: number | string
  slug?: string | null
  _status?: 'draft' | 'published' | null
  updatedAt: string
  previousSlugs?: string[] | null
}

/** Logs and swallows failures: the save already happened and must not be undone by a refresh. */
export function revalidatePaths(req: PayloadRequest, items: Revalidation[], reason: string) {
  const unique = new Map(
    items.map((item) => [typeof item === 'string' ? item : `${item.path} (${item.type})`, item] as const),
  )
  if (unique.size === 0) return
  req.payload.logger.info(`${reason}: revalidating ${[...unique.keys()].join(', ')}`)
  for (const [label, item] of unique) {
    try {
      if (typeof item === 'string') revalidatePath(item)
      else revalidatePath(item.path, item.type)
    } catch (error) {
      req.payload.logger.error({ err: error, msg: `${reason}: revalidating ${label} failed` })
    }
  }
}

/**
 * beforeChange records a published slug change in `previousSlugs` and snapshots the main row;
 * afterChange refreshes the old and new public pages only when the main row changed; afterDelete
 * refreshes a deleted doc's pages. `publicPaths` returns nothing for an unpublished row.
 */
export function publishHooks<Row extends MainRow>({
  collection,
  publicPaths,
}: {
  collection: 'projects' | 'posts'
  publicPaths: (req: PayloadRequest, row: Row | null | undefined) => Revalidation[] | Promise<Revalidation[]>
}) {
  const snapshotKey = (id: number | string) => `${collection}:mainRow:${id}`

  const readMainRow = (req: PayloadRequest, id: number | string) =>
    req.payload.findByID({
      collection,
      id,
      draft: false, // the main row, never a draft version
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
      req,
    }) as Promise<Row | null>

  const beforeChange: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
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

  const afterChange: CollectionAfterChangeHook = async ({ context, doc, operation, req }) => {
    if (context.disableRevalidate) return doc
    const before =
      operation === 'update' ? (req.context[snapshotKey(doc.id)] as Row | null | undefined) : null
    const after = await readMainRow(req, doc.id)

    // Draft and autosave saves leave the main row untouched: nothing public changed.
    if (before && after && before.updatedAt === after.updatedAt) return doc

    const paths = [...(await publicPaths(req, before)), ...(await publicPaths(req, after))]
    revalidatePaths(req, paths, `${collection} ${doc.id} ${operation}`)
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ context, doc, req }) => {
    if (context.disableRevalidate) return doc
    revalidatePaths(req, await publicPaths(req, doc as Row), `${collection} ${doc.id} deleted`)
    return doc
  }

  return { beforeChange, afterChange, afterDelete }
}

/**
 * Publishing hooks for drafts-enabled globals with one public page (home → `/`, about → `/about`;
 * P4). Same rule as `publishHooks`: a draft save only writes a version, while publish and
 * unpublish rewrite the global's main row (payload/dist/globals/operations/update.js), so
 * beforeChange snapshots the main row's `updatedAt` and afterChange refreshes `path` only when
 * it changed. A global that was never published has no main row (`findGlobal` returns `{}`).
 */
export function globalPublishHooks({ slug, path }: { slug: 'home' | 'about'; path: Revalidation }) {
  const snapshotKey = `${slug}:mainRowUpdatedAt`

  /** The published main row's `updatedAt`, or null while there is none. */
  const mainRowStamp = async (req: PayloadRequest): Promise<string | null> => {
    const row = await req.payload.findGlobal({ slug, draft: false, depth: 0, overrideAccess: true, req })
    return typeof row?.updatedAt === 'string' ? row.updatedAt : null
  }

  const beforeChange: GlobalBeforeChangeHook = async ({ data, req }) => {
    const stamp = await mainRowStamp(req)
    // After the nested read, which replaced req.context with a copy (see publishHooks).
    req.context[snapshotKey] = stamp
    return data
  }

  const afterChange: GlobalAfterChangeHook = async ({ context, doc, req }) => {
    if (context.disableRevalidate) return doc
    const before = req.context[snapshotKey] as string | null | undefined
    const after = await mainRowStamp(req)
    // Draft saves leave the main row untouched: nothing public changed.
    if (before !== undefined && before === after) return doc
    revalidatePaths(req, [path], `${slug} global changed`)
    return doc
  }

  return { beforeChange, afterChange }
}
