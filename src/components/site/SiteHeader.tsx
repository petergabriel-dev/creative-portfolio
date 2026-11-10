import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'

import { BOOK_HREF, NAV_ITEMS, type NavKey } from './navItems'
import styles from './SiteHeader.module.css'
import { Wordmark } from './Wordmark'

type SiteHeaderProps = {
  tone: 'dark' | 'light'
  current?: NavKey
  settings: { name?: string | null; bookingLabel?: string | null }
}

/** Site header (docs/design/components/SiteHeader.md). Server component, no JS. */
export function SiteHeader({ tone, current, settings }: SiteHeaderProps) {
  const bookingLabel = settings.bookingLabel?.trim()

  return (
    <header className={`${styles.header} ${tone === 'dark' ? styles.dark : styles.light}`}>
      <div className={styles.inner}>
        <Wordmark className={styles.wordmark} name={settings.name} />
        <nav aria-label={copy.nav.label} className={styles.nav}>
          <ul className={styles.links}>
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link
                  aria-current={item.key === current ? 'page' : undefined}
                  className={styles.link}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {bookingLabel && (
          <div className={styles.booking}>
            <Button href={BOOK_HREF} variant={tone === 'dark' ? 'outline-light' : 'ink'}>
              {bookingLabel}
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
