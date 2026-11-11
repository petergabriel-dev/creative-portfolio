import type { PayloadRequest } from 'payload'

import { type MainRow, publishHooks } from '@/hooks/publishHooks'
import { JOURNAL_ENTRIES, projectPublicPaths, type Revalidation } from '@/lib/publishing'
import type { Project } from '@/payload-types'

/** Publishing hooks for projects (Build Spec › Publishing), built on the shared main-row hooks. */

type ProjectRow = MainRow & Pick<Project, 'collection'>

async function projectPaths(req: PayloadRequest, row: ProjectRow | null | undefined): Promise<Revalidation[]> {
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
  return [
    ...projectPublicPaths({ published: true, slug: row.slug, disciplineSlug: discipline?.slug }),
    // Journal entries link to projects ("See the work"), so every public change refreshes them all
    // (P2 owner decision 6).
    JOURNAL_ENTRIES,
  ]
}

const hooks = publishHooks<ProjectRow>({ collection: 'projects', publicPaths: projectPaths })

/** Snapshots the published state; records the old slug when a publish changes the published slug. */
export const recordProjectSlug = hooks.beforeChange
/** Refreshes the old and new public pages, but only when the published state changed. */
export const revalidateProject = hooks.afterChange
/** Deleting a published project refreshes the pages that showed it. */
export const revalidateDeletedProject = hooks.afterDelete
