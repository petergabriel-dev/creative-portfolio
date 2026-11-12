import Link from 'next/link'
import type { ListViewServerProps } from 'payload'

import { copy } from '@/copy'
import { COLLECTION_PARAM, projectCountsByCollection, type ProjectCounts } from '@/lib/studio'

import styles from './StudioFilterPills.module.css'

const t = copy.studio.pills
const PROJECTS_PATH = '/admin/collections/projects'

type SearchParams = Record<string, string | string[] | undefined>

/**
 * A pill's link: the list's current parameters (search, filter-builder `where`, sort, limit,
 * columns…) kept, `page` dropped, and `collection` set to the slug or removed for "All".
 */
export function filterPillHref(searchParams: SearchParams | undefined, slug: string | null): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === 'page' || key === COLLECTION_PARAM || value === undefined) continue
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, item)
  }
  if (slug) params.set(COLLECTION_PARAM, slug)
  const query = params.toString()
  return query ? `${PROJECTS_PATH}?${query}` : PROJECTS_PATH
}

type ViewProps = { counts: ProjectCounts; current: string | null; hrefFor: (slug: string | null) => string }

function Pill({ href, current, name, count }: { href: string; current: boolean; name: string; count: number }) {
  return (
    <li>
      <Link
        aria-current={current ? 'true' : undefined}
        className={[styles.pill, current && styles.pillCurrent].filter(Boolean).join(' ')}
        href={href}
      >
        {name} <span className={styles.count}>{count}</span>
        <span className={styles.visuallyHidden}>{t.countSuffix(count)}</span>
      </Link>
    </li>
  )
}

/** The pills; a pure view (docs/design/components/StudioFilterPills.md). */
export function StudioFilterPillsView({ counts, current, hrefFor }: ViewProps) {
  return (
    <nav aria-label={t.label} className={styles.nav}>
      <ul className={styles.pills}>
        <Pill count={counts.all} current={current === null} href={hrefFor(null)} name={t.all} />
        {counts.items.map((item) => (
          <Pill count={item.count} current={current === item.slug} href={hrefFor(item.slug)} key={item.id} name={item.name} />
        ))}
      </ul>
    </nav>
  )
}

/**
 * `beforeListTable` on projects (P6 owner decision 8): one pill per discipline, read as the
 * logged-in editor. The filter itself is the collection's `admin.baseFilter` (`collectionFilter`),
 * so a slug that matches no discipline filters nothing and "All" shows as current.
 */
export async function StudioFilterPills({ payload, user, searchParams }: ListViewServerProps) {
  if (!user) return null
  const counts = await projectCountsByCollection({ payload, user })
  const raw = searchParams?.[COLLECTION_PARAM]
  const current = typeof raw === 'string' && counts.items.some((item) => item.slug === raw) ? raw : null
  return (
    <StudioFilterPillsView counts={counts} current={current} hrefFor={(slug) => filterPillHref(searchParams, slug)} />
  )
}
