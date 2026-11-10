import Link from 'next/link'
import { Fragment } from 'react'

import { copy } from '@/copy'
import { safeSocialLinks, socialLinkLabel, type SocialLink } from '@/lib/socialPlatforms'

import { BOOK_HREF, NAV_ITEMS } from './navItems'
import styles from './SiteFooter.module.css'
import { Wordmark } from './Wordmark'

type SiteFooterProps = {
  settings: {
    name?: string | null
    roleLine?: string | null
    location?: string | null
    contactEmail?: string | null
    socials?: SocialLink[] | null
    footerNote?: string | null
    bookingLabel?: string | null
  }
}

/** "© 2026 Your Name. All work by Your Name." with a closing full stop when missing. */
export function copyrightLine(year: number, name?: string | null, note?: string | null): string {
  const owner = name?.trim() ? ` ${name.trim()}.` : ''
  const trimmedNote = note?.trim()
  const closing = trimmedNote ? ` ${trimmedNote}${/[.!?]$/.test(trimmedNote) ? '' : '.'}` : ''
  return `${copy.footer.copyrightSymbol} ${year}${owner}${closing}`
}

/** Site footer (docs/design/components/SiteFooter.md). Server component, no JS. */
export function SiteFooter({ settings }: SiteFooterProps) {
  const roleAndPlace = [settings.roleLine, settings.location]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(` ${copy.footer.separator} `)
  const email = settings.contactEmail?.trim()
  const socials = safeSocialLinks(settings.socials)
  const bookingLabel = settings.bookingLabel?.trim()
  // ponytail: the year is fixed at render; static pages pick up a new year on the next revalidation.
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Wordmark className={styles.wordmark} name={settings.name} />
            {roleAndPlace && <p>{roleAndPlace}</p>}
          </div>
          <nav aria-label={copy.footer.navLabel}>
            <ul className={styles.links}>
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link className={styles.link} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              {bookingLabel && (
                <li>
                  <Link className={styles.link} href={BOOK_HREF}>
                    {bookingLabel}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          {(email || socials.length > 0) && (
            <div className={styles.contact}>
              {email && (
                <a className={`${styles.link} ${styles.email}`} href={`mailto:${email}`}>
                  {email}
                </a>
              )}
              {socials.length > 0 && (
                <p className={styles.socials}>
                  {socials.map((social, index) => (
                    <Fragment key={`${social.platform}-${social.url}`}>
                      {index > 0 && <span aria-hidden="true">{copy.footer.separator}</span>}
                      <a href={social.url} rel="me noopener">
                        {socialLinkLabel(social)}
                      </a>
                    </Fragment>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>
        <p className={styles.copyright}>
          {copyrightLine(year, settings.name, settings.footerNote)}
        </p>
      </div>
    </footer>
  )
}
