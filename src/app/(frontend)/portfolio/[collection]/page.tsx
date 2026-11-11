import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterHeading } from '@/components/site/ChapterHeading'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { Filmstrip } from '@/components/site/Filmstrip'
import { BOOK_HREF } from '@/components/site/navItems'
import { PieceRow } from '@/components/site/PieceRow'
import { ProjectCard } from '@/components/site/ProjectCard'
import { RevealMore } from '@/components/site/RevealMore'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { openerTint } from '@/lib/openerTint'
import { findDiscipline, getDisciplines, getPublishedProjects } from '@/lib/portfolio'
import { collectionPath, projectPath } from '@/lib/publishing'
import { pageMetadata } from '@/lib/seo'

import styles from '../portfolio.module.css'

/** Every collection is prerendered; old slugs and unknown ones render on demand (redirect or 404). */
export async function generateStaticParams() {
  return (await getDisciplines()).map((discipline) => ({ collection: discipline.slug }))
}

export async function generateMetadata({ params }: PageProps<'/portfolio/[collection]'>): Promise<Metadata> {
  const match = await findDiscipline((await params).collection)
  if (!match || match.redirect) return {}
  const { discipline } = match
  return pageMetadata({
    meta: discipline.meta,
    title: discipline.name,
    description: discipline.intro,
    canonical: collectionPath(discipline.slug),
    images: discipline.highlights ?? [],
  })
}

/** A collection page: `projects` layout (screens 03–05) or `list` layout (screen 06). */
export default async function CollectionPage({ params }: PageProps<'/portfolio/[collection]'>) {
  const slug = (await params).collection
  const match = await findDiscipline(slug)
  if (!match) notFound()
  // A renamed collection: 308 to its current URL in one hop (owner decision 1).
  if (match.redirect) permanentRedirect(collectionPath(match.discipline.slug))

  const { discipline, position } = match
  const [settings, projects] = await Promise.all([getSiteSettings(), getPublishedProjects(discipline.id)])
  const bookingLabel = settings.bookingLabel?.trim() ?? ''
  const isList = discipline.layout === 'list'
  const hasProjects = projects.length > 0
  const highlights = !isList && hasProjects ? (discipline.highlights ?? []) : []
  const showHighlights = highlights.some((image) => typeof image === 'object')
  const projectsChapter = showHighlights ? 2 : 1

  return (
    <>
      <ChapterOpener
        actions={
          <>
            {bookingLabel ? (
              <Button href={BOOK_HREF} size="primary" variant="gold">
                {bookingLabel}
              </Button>
            ) : null}
            {!isList && hasProjects ? (
              <Button href="#projects" size="primary" variant="outline-light">
                {copy.collection.seeProjects}
              </Button>
            ) : null}
          </>
        }
        breadcrumb={[{ label: copy.nav.portfolio, href: '/portfolio' }]}
        contextLine={copy.collection.contextLine(position)}
        header={<SiteHeader current="portfolio" settings={settings} tone="dark" />}
        layout="split"
        lead={discipline.intro}
        tint={openerTint(discipline.openerTint)}
        title={discipline.name}
      />
      <main>
        {showHighlights ? (
          <section aria-labelledby="highlights" className={styles.highlights}>
            <div className={styles.highlightsHeading}>
              <ChapterHeading
                aside={copy.collection.highlightsAside}
                id="highlights"
                number={1}
                title={copy.collection.highlights}
              />
            </div>
            <Filmstrip
              aspect={discipline.highlightAspect}
              bleed
              images={highlights}
              layout="strip"
              priority
              sizes="(min-width: 768px) 20vw, 100vw"
            />
          </section>
        ) : null}
        <section aria-labelledby="projects-title" className={`${styles.section} ${styles.anchor}`} id="projects">
          <div className={styles.inner}>
            <ChapterHeading
              id="projects-title"
              number={projectsChapter}
              title={isList ? copy.collection.selectedPieces : copy.collection.projects}
            />
            {!hasProjects ? (
              // Empty state: one line, never an empty grid (Build Spec › Front-end pages).
              <p className={styles.empty}>{copy.collection.empty}</p>
            ) : isList ? (
              <ul className={styles.rows} role="list">
                {projects.map((project) => (
                  <li key={project.id}>
                    <PieceRow
                      client={project.client}
                      href={projectPath(discipline.slug, project.slug)}
                      projectType={project.projectType}
                      summary={project.summary}
                      title={project.title}
                      year={project.year}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <RevealMore label={copy.collection.moreProjects} listClassName={styles.cards} listId="project-cards">
                {projects.map((project) => (
                  <ProjectCard
                    aspect={discipline.cardAspect}
                    cover={project.cover}
                    href={projectPath(discipline.slug, project.slug)}
                    key={project.id}
                    projectType={project.projectType}
                    sizes="(min-width: 1312px) 644px, (min-width: 900px) 50vw, 100vw"
                    title={project.title}
                    year={project.year}
                  />
                ))}
              </RevealMore>
            )}
          </div>
        </section>
      </main>
      <BookingFinale body={discipline.finaleBody} bookingLabel={bookingLabel} headline={discipline.finaleHeadline} />
      <SiteFooter settings={settings} />
    </>
  )
}
