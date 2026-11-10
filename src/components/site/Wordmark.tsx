import Link from 'next/link'

import { copy } from '@/copy'

import { LensMark } from './LensMark'
import styles from './Wordmark.module.css'

/** Lens mark + site name linking home; shared by SiteHeader and SiteFooter. */
export function Wordmark({ name, className }: { name?: string | null; className?: string }) {
  const trimmed = name?.trim()
  return (
    <Link className={[styles.wordmark, className].filter(Boolean).join(' ')} href="/">
      <LensMark className={styles.mark} />
      {trimmed ? (
        <span className={styles.name}>{trimmed}</span>
      ) : (
        <span className={styles.visuallyHidden}>{copy.nav.home}</span>
      )}
    </Link>
  )
}
