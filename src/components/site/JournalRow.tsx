import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import { formatDate, isoDate } from '@/lib/date'
import type { Media } from '@/payload-types'

import styles from './JournalRow.module.css'

type JournalRowProps = {
  title: string
  /** Canonical entry URL, /journal/<slug>. */
  href: string
  excerpt: string
  cover?: Media | number | null
  categoryName?: string | null
  /** ISO timestamp; shown as "6 Nov 2026" in Singapore time. */
  publishedAt?: string | null
  headingLevel?: 'h2' | 'h3'
}

/**
 * One post as a row on the journal list (docs/design/components/JournalRow.md). The link wraps
 * the title only, so its name is its visible label (WCAG 2.5.3); a pseudo-element stretches its
 * click area over the whole row.
 */
export function JournalRow({
  title,
  href,
  excerpt,
  cover,
  categoryName,
  publishedAt,
  headingLevel: Heading = 'h2',
}: JournalRowProps) {
  const category = categoryName?.trim()
  const date = formatDate(publishedAt)
  const meta: ReactNode[] = [
    ...(category ? [category] : []),
    ...(date
      ? [
          <time dateTime={isoDate(publishedAt)} key="date">
            {date}
          </time>,
        ]
      : []),
  ]

  return (
    <div className={styles.row}>
      {/* Every list cover lazy-loads behind its tint: never priority. */}
      <MediaImage aspect="3:2" media={cover} sizes="(min-width: 768px) 45vw, 100vw" />
      <div className={styles.text}>
        {meta.length > 0 ? (
          <span className={styles.meta}>
            {meta.map((part, index) => (
              <Fragment key={index}>
                {index > 0 && <span aria-hidden="true">{` ${copy.separator} `}</span>}
                {part}
              </Fragment>
            ))}
          </span>
        ) : null}
        <Heading className={styles.title}>
          <Link className={styles.link} href={href}>
            {title}
          </Link>
        </Heading>
        {excerpt.trim() ? <p className={styles.excerpt}>{excerpt}</p> : null}
        {/* A visual cue only: the title link is the one way in, for every input. */}
        <span aria-hidden="true" className={styles.cta}>
          {copy.journal.readStory}
          {` ${copy.arrow}`}
        </span>
      </div>
    </div>
  )
}
