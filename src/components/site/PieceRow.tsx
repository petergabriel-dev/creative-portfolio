import Link from 'next/link'
import { Fragment } from 'react'

import { copy } from '@/copy'

import styles from './PieceRow.module.css'

type PieceRowProps = {
  title: string
  href: string
  projectType: string
  client?: string | null
  year: number
  summary: string
}

/**
 * One project as a text row on a `list` collection page (docs/design/components/PieceRow.md). The
 * title is the link; a stretched pseudo-element makes the whole row clickable.
 */
export function PieceRow({ title, href, projectType, client, year, summary }: PieceRowProps) {
  const meta = [projectType, client?.trim(), String(year)].filter(Boolean)

  return (
    <div className={styles.row}>
      <span className={styles.meta}>
        {meta.map((part, index) => (
          <Fragment key={index}>
            {index > 0 && <span aria-hidden="true">{` ${copy.separator} `}</span>}
            {part}
          </Fragment>
        ))}
      </span>
      <div className={styles.text}>
        <h3 className={styles.title}>
          <Link className={styles.link} href={href}>
            {title}
          </Link>
        </h3>
        <span className={styles.summary}>{summary}</span>
      </div>
      {/* A visual cue only: the title link covers the row. */}
      <span aria-hidden="true" className={styles.cta}>
        {copy.collection.read}
        {` ${copy.arrow}`}
      </span>
    </div>
  )
}
