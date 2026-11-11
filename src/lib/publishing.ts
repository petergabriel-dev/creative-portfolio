import type { FieldHook } from 'payload'

/** A page to refresh: a literal path, or a route pattern with its type (patterns need the type). */
export type Revalidation = string | { path: string; type: 'page' | 'layout' }

/**
 * Route patterns refresh every page of a dynamic route at once. They name the route *file*, route
 * group included: Next tags each page by its file path ('/(frontend)/journal/[slug]/page') and
 * revalidatePath does not strip groups, so '/journal/[slug]' would match nothing.
 */
export const JOURNAL_ENTRIES = { path: '/(frontend)/journal/[slug]', type: 'page' } as const
export const JOURNAL_PAGES = { path: '/(frontend)/journal/page/[n]', type: 'page' } as const

/** The journal list; page 1 lives at /journal and page N ≥ 2 at /journal/page/N (P2 owner decision 1). */
export const JOURNAL_PATH = '/journal'
export const journalPagePath = (page: number) => (page <= 1 ? JOURNAL_PATH : `${JOURNAL_PATH}/page/${page}`)

/** URL of a journal entry. */
export const postPath = (slug: string) => `${JOURNAL_PATH}/${slug}`

/**
 * Pages that show this post state (Build Spec › Publishing): its entry, every list page (posts
 * shift between pages) and `/`. An unpublished state shows nowhere.
 */
export function postPublicPaths(
  state: { published: boolean; slug?: string | null } | null | undefined,
): Revalidation[] {
  if (!state?.published) return []
  return [...(state.slug ? [postPath(state.slug)] : []), JOURNAL_PATH, JOURNAL_PAGES, '/']
}

/** URL of a collection (discipline) page. */
export const collectionPath = (disciplineSlug: string) => `/portfolio/${disciplineSlug}`

/** URL of a project page: projects nest under their collection's slug. */
export const projectPath = (disciplineSlug: string, projectSlug: string) =>
  `/portfolio/${disciplineSlug}/${projectSlug}`

/** Home and About, refreshed by their globals (Build Spec › Publishing). */
export const HOME_PATH = '/'
export const ABOUT_PATH = '/about'

/** What the public sees of one project: the last published state (the main row). */
export type PublicProjectState = {
  published: boolean
  slug?: string | null
  disciplineSlug?: string | null
}

/**
 * Pages that show this project state (Build Spec › Publishing): its page, its collection page
 * and Home. Home is refreshed for every project, not only those in Selected work, because a hero
 * slide can link any project (P4 owner decision 4, like P2 decision 6 for journal entries). An
 * unpublished state shows nowhere. A missing discipline skips the portfolio paths.
 */
export function projectPublicPaths(state: PublicProjectState | null | undefined): string[] {
  if (!state?.published) return []
  const paths: string[] = []
  if (state.disciplineSlug) {
    if (state.slug) paths.push(projectPath(state.disciplineSlug, state.slug))
    paths.push(collectionPath(state.disciplineSlug))
  }
  paths.push(HOME_PATH)
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
