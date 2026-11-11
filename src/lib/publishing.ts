import type { FieldHook } from 'payload'

/** URL of a collection (discipline) page. */
export const collectionPath = (disciplineSlug: string) => `/portfolio/${disciplineSlug}`

/** URL of a project page: projects nest under their collection's slug. */
export const projectPath = (disciplineSlug: string, projectSlug: string) =>
  `/portfolio/${disciplineSlug}/${projectSlug}`

/** What the public sees of one project: the last published state (the main row). */
export type PublicProjectState = {
  published: boolean
  slug?: string | null
  disciplineSlug?: string | null
  showOnHome?: boolean | null
}

/**
 * Pages that show this project state (Build Spec › Publishing): its page, its collection page,
 * and `/` when it is on Home. An unpublished state shows nowhere. A missing discipline skips
 * the portfolio paths but still refreshes Home.
 */
export function projectPublicPaths(state: PublicProjectState | null | undefined): string[] {
  if (!state?.published) return []
  const paths: string[] = []
  if (state.disciplineSlug) {
    if (state.slug) paths.push(projectPath(state.disciplineSlug, state.slug))
    paths.push(collectionPath(state.disciplineSlug))
  }
  if (state.showOnHome) paths.push('/')
  return paths
}

/**
 * A post's `publishedAt` defaults to its first publish (Build Spec › posts; P2 owner decision 4):
 * filled with the current time only when empty and the save publishes. A date the editor set is
 * never overwritten, and draft or autosave saves leave it empty. Runs in `beforeValidate`, because
 * the field is required on publish and validation runs alongside `beforeChange` (P1 slug trap).
 */
export const fillPublishedAt: FieldHook = ({ value, data }) =>
  value || data?._status !== 'published' ? value : new Date().toISOString()

/**
 * Adds a doc's old published slug to its `previousSlugs`, so old URLs keep 308-redirecting in
 * one hop. Drops the new slug (renaming back to an old slug makes it current again), removes
 * duplicates and keeps the latest `cap` entries.
 */
export function appendPreviousSlug(
  previous: unknown,
  oldSlug: string,
  newSlug: string,
  cap = 20,
): string[] {
  const list = Array.isArray(previous)
    ? previous.filter((slug): slug is string => typeof slug === 'string' && slug !== '')
    : []
  const next = list.filter((slug) => slug !== newSlug && slug !== oldSlug)
  if (oldSlug && oldSlug !== newSlug) next.push(oldSlug)
  return next.slice(-cap)
}
