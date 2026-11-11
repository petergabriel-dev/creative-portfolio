import type { ReactNode } from 'react'

import { copy } from '@/copy'

import styles from './ChapterHeading.module.css'

type ChapterHeadingProps = {
  /** 1-based; rendered as "Chapter 01". */
  number: number
  title: string
  /** For the parent section's aria-labelledby. */
  id?: string
  aside?: ReactNode
}

/** "Chapter 0N" label and Bebas heading opening a light chapter (docs/design/components/ChapterHeading.md). */
export function ChapterHeading({ number, title, id, aside }: ChapterHeadingProps) {
  return (
    <div className={styles.heading}>
      <div className={styles.titles}>
        <p className={styles.label}>{copy.chapter.label(number)}</p>
        <h2 className={styles.title} id={id}>
          {title}
        </h2>
      </div>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </div>
  )
}
