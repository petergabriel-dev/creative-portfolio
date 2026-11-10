import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import type { Discipline, Project } from '@/payload-types'

/**
 * Portfolio reads for public pages, through the Local API with access applied
 * (`overrideAccess: false`, `draft: false`; invariant 1). React `cache` dedupes them per request.
 */

/** Every discipline in Portfolio order (`order`), highlights populated. */
export const getDisciplines = cache(async (): Promise<Discipline[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'disciplines',
    sort: 'order',
    depth: 1,
    pagination: false,
    overrideAccess: false,
  })
  return docs
})

export type DisciplineMatch =
  | { discipline: Discipline; position: number; redirect: false }
  | { discipline: Discipline; position: number; redirect: true }

/**
 * Finds a discipline by its current slug, else by a previous slug (a renamed collection, owner
 * decision 1). A current slug always wins; among old slugs the most recently updated doc wins.
 * `position` is the 1-based place in Portfolio order ("Collection 01").
 */
export const findDiscipline = cache(async (slug: string): Promise<DisciplineMatch | null> => {
  const disciplines = await getDisciplines()
  const position = (discipline: Discipline) => disciplines.indexOf(discipline) + 1
  const current = disciplines.find((discipline) => discipline.slug === slug)
  if (current) return { discipline: current, position: position(current), redirect: false }
  const renamed = disciplines
    .filter((discipline) => discipline.previousSlugs?.includes(slug))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  return renamed ? { discipline: renamed, position: position(renamed), redirect: true } : null
})

export type ProjectSummary = Pick<
  Project,
  'id' | 'title' | 'slug' | 'projectType' | 'year' | 'client' | 'summary' | 'cover'
>

/** A discipline's published projects, newest year first, then by title. */
export const getPublishedProjects = cache(async (disciplineId: number): Promise<ProjectSummary[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { collection: { equals: disciplineId } },
    sort: ['-year', 'title'],
    depth: 1,
    pagination: false,
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      projectType: true,
      year: true,
      client: true,
      summary: true,
      cover: true,
    },
  })
  return docs as ProjectSummary[]
})
