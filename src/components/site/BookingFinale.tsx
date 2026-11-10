import { useId } from 'react'

import { BOOK_HREF } from '@/components/site/navItems'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'

import styles from './BookingFinale.module.css'

type BookingFinaleProps = {
  headline: string
  body?: string | null
  bookingLabel: string
  secondary?: { label: string; href: string }
}

/** Dark closing section before the footer (docs/design/components/BookingFinale.md). */
export function BookingFinale({ headline, body, bookingLabel, secondary }: BookingFinaleProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className={styles.finale}>
      <div className={styles.inner}>
        <p className={styles.label}>{copy.finale.label}</p>
        <h2 className={styles.headline} id={headingId}>
          {headline}
        </h2>
        {body?.trim() ? <p className={styles.body}>{body}</p> : null}
        <div className={styles.actions}>
          {secondary ? (
            <Button href={secondary.href} size="primary" variant="outline-light">
              <span aria-hidden="true">{copy.finale.backArrow}</span>
              {secondary.label}
            </Button>
          ) : null}
          <Button href={BOOK_HREF} size="primary" variant="gold">
            {bookingLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
