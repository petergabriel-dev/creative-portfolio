import { copy } from '@/copy'
import { safeHref } from '@/lib/safeHref'

import { ChapterHeading } from './ChapterHeading'
import styles from './GoodToKnow.module.css'

type GoodToKnowProps = {
  contactEmail?: string | null
  location?: string | null
  /** id of the Chapter 01 heading, for the page section's aria-labelledby. */
  headingId: string
}

/** Book Me's Chapter 01 details (docs/design/components/GoodToKnow.md). Server component. */
export function GoodToKnow({ contactEmail, location, headingId }: GoodToKnowProps) {
  const text = copy.book.goodToKnow
  const email = contactEmail?.trim()
  const mailto = email ? safeHref(`mailto:${email}`) : null
  const place = location?.trim()

  return (
    <div className={styles.goodToKnow}>
      <ChapterHeading id={headingId} number={1} title={text.title} />
      <dl className={styles.details}>
        {email && mailto && (
          <div className={styles.row}>
            <dt className={styles.term}>{text.email}</dt>
            <dd className={styles.value}>
              <a className={styles.link} href={mailto}>
                {email}
              </a>
            </dd>
          </div>
        )}
        {place && (
          <div className={styles.row}>
            <dt className={styles.term}>{text.location}</dt>
            <dd className={styles.value}>{place}</dd>
          </div>
        )}
        <div className={styles.row}>
          <dt className={styles.term}>{text.workingOn}</dt>
          <dd className={styles.value}>{text.workingOnValue}</dd>
        </div>
      </dl>
      <p className={styles.note}>{text.note}</p>
    </div>
  )
}
