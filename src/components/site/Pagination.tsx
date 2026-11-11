import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'

import styles from './Pagination.module.css'

type PaginationProps = {
  /** 1-based. */
  current: number
  total: number
  /** Shown in the status line ("10 stories per page"). */
  perPage: number
  /** 1 → '/journal', n → '/journal/page/n'. */
  pageHref: (page: number) => string
}

/**
 * The journal's page row (docs/design/components/Pagination.md): plain links, no client JS.
 * Hidden on a single page; no "Newer" link (P2 owner decision 8).
 */
export function Pagination({ current, total, perPage, pageHref }: PaginationProps) {
  if (total <= 1) return null
  const pages = Array.from({ length: total }, (_, index) => index + 1)

  return (
    <nav aria-label={copy.journal.navLabel} className={styles.pagination}>
      <p className={styles.status}>
        {copy.journal.pageOf(current, total)}
        <span aria-hidden="true">{` ${copy.separator} `}</span>
        {copy.journal.perPage(perPage)}
      </p>
      <div className={styles.links}>
        <ul className={styles.pages} role="list">
          {pages.map((page) => (
            <li key={page}>
              <Link
                aria-current={page === current ? 'page' : undefined}
                aria-label={copy.journal.pageLabel(page)}
                className={page === current ? `${styles.page} ${styles.current}` : styles.page}
                href={pageHref(page)}
              >
                {page}
              </Link>
            </li>
          ))}
        </ul>
        {current < total ? (
          <Button href={pageHref(current + 1)} trailingArrow variant="text">
            {copy.journal.olderStories}
          </Button>
        ) : null}
      </div>
    </nav>
  )
}
