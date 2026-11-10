import type { Metadata } from 'next'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { CollectionTile } from '@/components/site/CollectionTile'
import { BOOK_HREF } from '@/components/site/navItems'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { getDisciplines } from '@/lib/portfolio'
import { collectionPath } from '@/lib/publishing'
import { getSiteSettings } from '@/lib/getSiteSettings'

import styles from './portfolio.module.css'

export const metadata: Metadata = {
  title: copy.portfolio.title,
  description: copy.portfolio.lead,
  alternates: { canonical: '/portfolio' },
}

/** Portfolio: opener, one tile per discipline in `order`, the default finale (screen 02). */
export default async function PortfolioPage() {
  const [settings, disciplines] = await Promise.all([getSiteSettings(), getDisciplines()])
  const bookingLabel = settings.bookingLabel?.trim() ?? ''

  return (
    <>
      <ChapterOpener
        actions={
          bookingLabel ? (
            <Button href={BOOK_HREF} size="primary" variant="gold">
              {bookingLabel}
            </Button>
          ) : null
        }
        contextLine={copy.portfolio.contextLine}
        header={<SiteHeader current="portfolio" settings={settings} tone="dark" />}
        layout="split"
        lead={copy.portfolio.lead}
        title={copy.portfolio.title}
      />
      <main className={styles.section}>
        <div className={styles.inner}>
          <ul className={styles.tiles} role="list">
            {disciplines.map((discipline, index) => (
              <li key={discipline.id}>
                <CollectionTile
                  href={collectionPath(discipline.slug)}
                  image={discipline.highlights?.[0]}
                  index={index + 1}
                  intro={discipline.intro}
                  name={discipline.name}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
        </div>
      </main>
      <BookingFinale
        body={copy.finale.defaultBody}
        bookingLabel={bookingLabel}
        headline={settings.finaleHeadline ?? ''}
      />
      <SiteFooter settings={settings} />
    </>
  )
}
