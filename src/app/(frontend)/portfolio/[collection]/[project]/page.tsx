import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { DetailsStrip } from '@/components/site/DetailsStrip'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { StoryBlocks } from '@/components/story/StoryBlocks'
import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { findProject, getPublishedProjectParams } from '@/lib/portfolio'
import { collectionPath } from '@/lib/publishing'
import { pageMetadata } from '@/lib/seo'

import styles from './project.module.css'

/** Every published project is prerendered; other URLs render on demand (redirect or 404). */
export async function generateStaticParams() {
  return getPublishedProjectParams()
}

export async function generateMetadata({ params }: PageProps<'/portfolio/[collection]/[project]'>): Promise<Metadata> {
  const { collection, project: slug } = await params
  const match = await findProject(collection, slug)
  if (!match || match.redirect) return {}
  const { project, canonical } = match
  return pageMetadata({
    meta: project.meta,
    title: project.title,
    description: project.summary,
    canonical,
    images: [project.cover],
  })
}

/** Project page (screen 07): opener, 21:9 cover, story, credits, the discipline's finale. */
export default async function ProjectPage({ params }: PageProps<'/portfolio/[collection]/[project]'>) {
  const { collection, project: slug } = await params
  const match = await findProject(collection, slug)
  if (!match) notFound()
  // Old project slug, old collection slug or a moved project: one hop to the canonical URL.
  if (match.redirect) permanentRedirect(match.canonical)

  const { project, discipline } = match
  const settings = await getSiteSettings()
  const credits = (project.credits ?? []).map(({ label, value }) => ({ label, value }))

  return (
    <>
      <ChapterOpener
        breadcrumb={[
          { label: copy.nav.portfolio, href: '/portfolio' },
          { label: discipline.name, href: collectionPath(discipline.slug) },
        ]}
        contextLine={project.projectType}
        details={
          <DetailsStrip
            items={[
              { label: copy.details.collection, value: discipline.name },
              { label: copy.details.type, value: project.projectType },
              { label: copy.details.year, value: project.year },
              { label: copy.details.client, value: project.client },
              { label: copy.details.role, value: project.role },
            ]}
            tone="dark"
          />
        }
        header={<SiteHeader current="portfolio" settings={settings} tone="dark" />}
        lead={project.summary}
        title={project.title}
      />
      <main>
        <MediaImage aspect="21:9" media={project.cover} priority sizes="100vw" />
        <StoryBlocks blocks={project.story} />
        {credits.length > 0 ? (
          <section aria-label={copy.details.credits} className={styles.credits}>
            <div className={styles.creditsInner}>
              <DetailsStrip items={credits} tone="light" />
            </div>
          </section>
        ) : null}
      </main>
      <BookingFinale
        body={discipline.finaleBody}
        bookingLabel={settings.bookingLabel?.trim() ?? ''}
        headline={discipline.finaleHeadline}
        secondary={{ label: copy.finale.backToPortfolio, href: '/portfolio' }}
      />
      <SiteFooter settings={settings} />
    </>
  )
}
