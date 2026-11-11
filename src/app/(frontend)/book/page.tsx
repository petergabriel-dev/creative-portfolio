import type { Metadata } from 'next'

import { ChapterOpener } from '@/components/site/ChapterOpener'
import { GoodToKnow } from '@/components/site/GoodToKnow'
import { InquiryForm } from '@/components/site/InquiryForm'
import { BOOK_HREF } from '@/components/site/navItems'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { projectTypeOptions } from '@/lib/inquiry'
import { getDisciplines } from '@/lib/portfolio'
import { pageMetadata } from '@/lib/seo'

import styles from './book.module.css'

const HEADING_ID = 'good-to-know'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return pageMetadata({
    title: settings.bookingLabel?.trim() || copy.book.metaTitle,
    description: copy.book.metaDescription,
    canonical: BOOK_HREF,
    images: [],
  })
}

/**
 * Book Me (screen 11). Static: refreshed with every page when site-settings or a discipline changes.
 * The only page without a booking finale. The form posts to the submitInquiry server action.
 */
export default async function BookPage() {
  const [settings, disciplines] = await Promise.all([getSiteSettings(), getDisciplines()])
  const replyTime = settings.replyTime?.trim() ?? ''

  return (
    <>
      <ChapterOpener
        contextLine={copy.book.contextLine}
        header={<SiteHeader current="book" settings={settings} tone="dark" />}
        lead={copy.book.lead(replyTime)}
        title={copy.book.title}
      />
      <main className={styles.section}>
        <section aria-labelledby={HEADING_ID} className={styles.inner}>
          <GoodToKnow contactEmail={settings.contactEmail} headingId={HEADING_ID} location={settings.location} />
          <InquiryForm
            contactEmail={settings.contactEmail?.trim() ?? ''}
            options={projectTypeOptions(disciplines.map((discipline) => discipline.name))}
            replyTime={replyTime}
          />
        </section>
      </main>
      <SiteFooter settings={settings} />
    </>
  )
}
