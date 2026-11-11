import config from '@payload-config'
import { getPayload, type TypedUser } from 'payload'
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

export type HomeProject = Pick<Project, 'id' | 'title' | 'slug' | 'cover' | 'collection'>

/** Most projects in Home's Selected work (Build Spec › Globals › home). */
export const SELECTED_WORK_LIMIT = 9

/**
 * Home's Selected work: published projects with "Show in Selected work" ticked, in `homeOrder`
 * (projects without one last), then newest year and title; nine at most. Depth 1 populates the
 * cover and the collection (its name and slug make the caption and the URL).
 */
export const getHomeProjects = cache(async (): Promise<HomeProject[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { showOnHome: { equals: true } },
    sort: ['homeOrder', '-year', 'title'],
    limit: SELECTED_WORK_LIMIT,
    depth: 1,
    draft: false,
    overrideAccess: false,
    select: { title: true, slug: true, cover: true, collection: true },
  })
  return docs as HomeProject[]
})

export type ProjectMatch = {
  project: Project
  /** The discipline the project belongs to now (populated). */
  discipline: Discipline
  /** Canonical URL: /portfolio/<discipline slug>/<project slug>. */
  canonical: string
  /** True when the requested URL is not the canonical one (old slug or wrong collection segment). */
  redirect: boolean
}

/**
 * Finds a published project by its slug (unique across projects), else by a previous slug (owner
 * decision 1). Any URL that isn't the canonical one should 308 there: an old project slug, an old
 * collection slug, or a project that moved collection.
 */
export const findProject = cache(
  async (
    collectionSlug: string,
    projectSlug: string,
    /** A logged-in editor in draft mode sees the latest draft; everyone else the published doc. */
    editor: TypedUser | null = null,
  ): Promise<ProjectMatch | null> => {
    const payload = await getPayload({ config })
    const query = {
      collection: 'projects',
      depth: 1,
      limit: 1,
      draft: editor !== null,
      overrideAccess: false,
      user: editor ?? undefined,
    } as const
    let byOldSlug = false
    let { docs } = await payload.find({ ...query, where: { slug: { equals: projectSlug } } })
    if (!docs[0]) {
      byOldSlug = true
      ;({ docs } = await payload.find({
        ...query,
        where: { previousSlugs: { in: [projectSlug] } },
        sort: '-updatedAt',
      }))
    }
    const project = docs[0]
    const discipline = project && typeof project.collection === 'object' ? project.collection : null
    if (!project || !discipline) return null
    const canonical = `/portfolio/${discipline.slug}/${project.slug}`
    return { project, discipline, canonical, redirect: byOldSlug || discipline.slug !== collectionSlug }
  },
)

/** Every published project with its discipline slug, for generateStaticParams. */
export const getPublishedProjectParams = cache(async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 1,
    pagination: false,
    draft: false,
    overrideAccess: false,
    select: { slug: true, collection: true },
  })
  return docs.flatMap((project) =>
    typeof project.collection === 'object' && project.collection
      ? [{ collection: project.collection.slug, project: project.slug }]
      : [],
  )
})
