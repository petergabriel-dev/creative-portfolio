import type { Metadata } from 'next'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterHeading } from '@/components/site/ChapterHeading'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { BOOK_HREF } from '@/components/site/navItems'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { LivePreviewListener } from '@/components/story/LivePreviewListener'
import { SafeRichText } from '@/components/story/StoryBlocks'
import { Button } from '@/components/ui/Button'
import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import { draftEditor } from '@/lib/draftEditor'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { getAbout } from '@/lib/pages'
import { ABOUT_PATH } from '@/lib/publishing'
import { pageMetadata } from '@/lib/seo'

import styles from './about.module.css'

/** Title and lead from the published global; the default Open Graph image (no openGraph key). */
export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return pageMetadata({
    title: about.title?.trim() || copy.about.title,
    description: about.lead,
    canonical: ABOUT_PATH,
    images: [],
  })
}

/**
 * About (screen 08): opener, 4:5 portrait and the sections as numbered chapters, then the finale.
 * While the about global is unpublished it shows the opener with fallback copy and the finale
 * (P4 owner decision 6).
 */
export default async function AboutPage() {
  const editor = await draftEditor()
  const [settings, about] = await Promise.all([getSiteSettings(), getAbout(editor)])
  const bookingLabel = settings.bookingLabel?.trim() ?? ''
  const sections = (about.sections ?? []).filter((section) => section.heading?.trim())
  const hasPortrait = typeof about.portrait === 'object' && about.portrait !== null

  return (
    <>
      {editor ? <LivePreviewListener /> : null}
      <ChapterOpener
        actions={
          <>
            {bookingLabel ? (
              <Button href={BOOK_HREF} size="primary" variant="gold">
                {bookingLabel}
              </Button>
            ) : null}
            <Button href="/portfolio" size="primary" variant="outline-light">
              {copy.about.viewMyWork}
            </Button>
          </>
        }
        contextLine={about.contextLine?.trim() || copy.about.contextLine}
        header={<SiteHeader current="about" settings={settings} tone="dark" />}
        layout="split"
        lead={about.lead}
        title={about.title?.trim() || copy.about.title}
      />
      <main>
        {hasPortrait || sections.length > 0 ? (
          <div className={styles.section}>
            <div className={styles.inner}>
              {hasPortrait ? (
                <MediaImage aspect="4:5" media={about.portrait} sizes="(min-width: 1024px) 45vw, 100vw" />
              ) : null}
              <div className={styles.sections}>
                {sections.map((section, index) => {
                  const id = `about-${index + 1}`
                  return (
                    <section aria-labelledby={id} className={styles.chapter} key={section.id ?? id}>
                      <ChapterHeading id={id} number={index + 1} title={section.heading} />
                      {section.body ? <SafeRichText data={section.body} /> : null}
                    </section>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <BookingFinale body={copy.about.finaleBody} bookingLabel={bookingLabel} headline={settings.finaleHeadline ?? ''} />
      <SiteFooter settings={settings} />
    </>
  )
}
