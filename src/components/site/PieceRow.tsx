import Link from 'next/link'
import { Fragment, useId } from 'react'

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

/** One project as a text row on a `list` collection page (docs/design/components/PieceRow.md). */
export function PieceRow({ title, href, projectType, client, year, summary }: PieceRowProps) {
  const titleId = useId()
  const meta = [projectType, client?.trim(), String(year)].filter(Boolean)

  return (
    <Link aria-labelledby={titleId} className={styles.row} href={href}>
      <span className={styles.meta}>
        {meta.map((part, index) => (
          <Fragment key={index}>
            {index > 0 && <span aria-hidden="true">{` ${copy.separator} `}</span>}
            {part}
          </Fragment>
        ))}
      </span>
      <div className={styles.text}>
        <h3 className={styles.title} id={titleId}>
          {title}
        </h3>
        <span className={styles.summary}>{summary}</span>
      </div>
      <span className={styles.cta}>
        {copy.collection.read}
        <span aria-hidden="true">{` ${copy.arrow}`}</span>
      </span>
    </Link>
  )
}
