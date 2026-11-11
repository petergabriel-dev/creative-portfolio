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
