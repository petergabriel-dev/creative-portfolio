import type { Metadata } from 'next'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterHeading } from '@/components/site/ChapterHeading'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { CollectionTile } from '@/components/site/CollectionTile'
import { HeroSlider } from '@/components/site/HeroSlider'
import { JournalRow } from '@/components/site/JournalRow'
import { SelectedWork, type SelectedWorkItem } from '@/components/site/SelectedWork'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { LivePreviewListener } from '@/components/story/LivePreviewListener'
import { Button } from '@/components/ui/Button'
import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import { draftEditor } from '@/lib/draftEditor'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { heroSlides } from '@/lib/heroSlides'
import { getJournalPage } from '@/lib/journal'
import { getHome } from '@/lib/pages'
import { getDisciplines, getHomeProjects, type HomeProject } from '@/lib/portfolio'
import { ABOUT_PATH, collectionPath, HOME_PATH, JOURNAL_PATH, postPath, projectPath } from '@/lib/publishing'

import styles from './home.module.css'

// Title, description and Open Graph image come from site-settings.defaultMeta (root layout).
export const metadata: Metadata = { alternates: { canonical: HOME_PATH } }

/** "From the journal" shows 1–6 posts; 2 while the home global is unpublished (Build Spec default). */
const journalCount = (value: number | null | undefined) =>
  Math.min(6, Math.max(1, Math.trunc(value ?? 2) || 2))

/** Selected work tiles: projects whose collection is known (its name and slug make the caption and URL). */
function selectedWorkItems(projects: HomeProject[]): SelectedWorkItem[] {
  return projects
    .flatMap((project) => {
      const collection = typeof project.collection === 'object' ? project.collection : null
      return collection?.slug && project.slug ? [{ project, collection }] : []
    })
    .map(({ project, collection }, index) => ({
      number: index + 1,
      collectionName: collection.name,
      title: project.title,
      href: projectPath(collection.slug, project.slug),
      cover: project.cover,
    }))
}

/**
 * Home (screen 01): the hero slider (or the plain opener while there are no slides), then up to
 * four chapters, each left out when empty with the later ones renumbered (P4 owner decision 6),
 * then the default finale.
 */
export default async function HomePage() {
  const editor = await draftEditor()
  const [settings, home, projects, disciplines, journal] = await Promise.all([
    getSiteSettings(),
    getHome(editor),
    getHomeProjects(),
    getDisciplines(),
    getJournalPage(1),
  ])

  const headline = settings.headline?.trim() || settings.name?.trim() || copy.site.fallbackName
  const bookingLabel = settings.bookingLabel?.trim() ?? ''
  const header = <SiteHeader current="home" settings={settings} tone="dark" />
  const slides = heroSlides(home, headline)

  const selected = selectedWorkItems(projects)
  const meet = home.meet
  const meetHeading = meet?.heading?.trim()
  const posts = journal.posts.slice(0, journalCount(home.journalCount))

  // Chapter numbers are counted from the chapters that render.
  const chapters = [
    selected.length > 0 && 'selected',
    meetHeading && 'meet',
    disciplines.length > 0 && 'explore',
    posts.length > 0 && 'journal',
  ].filter(Boolean)
  const chapter = (key: string) => chapters.indexOf(key) + 1

  return (
    <>
      {editor ? <LivePreviewListener /> : null}
      {slides.length > 0 ? (
        <HeroSlider bookingLabel={bookingLabel} header={header} headline={headline} slides={slides} />
      ) : (
        <ChapterOpener contextLine={settings.roleLine ?? ''} header={header} title={headline} />
      )}
      <main>
        {selected.length > 0 ? (
          <section aria-labelledby="selected-work" className={styles.section}>
            <div className={styles.inner}>
              <ChapterHeading
                aside={home.selectedWorkIntro?.trim() || undefined}
                id="selected-work"
                number={chapter('selected')}
                title={copy.home.selectedWork}
              />
              <SelectedWork items={selected} />
            </div>
          </section>
        ) : null}

        {meetHeading ? (
          <section aria-labelledby="behind-the-camera" className={`${styles.section} ${styles.band}`}>
            <div className={styles.meet}>
              <MediaImage aspect="4:5" media={meet?.portrait} sizes="(min-width: 768px) 50vw, 100vw" />
              <div className={styles.meetText}>
                <ChapterHeading
                  id="behind-the-camera"
                  labelDetail={copy.home.behindTheCamera}
                  number={chapter('meet')}
                  title={meetHeading}
                />
                {meet?.body?.trim() ? <p className={styles.meetBody}>{meet.body}</p> : null}
                <Button href={ABOUT_PATH} size="primary" variant="outline-ink">
                  {copy.home.getToKnowMe}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {disciplines.length > 0 ? (
          <section aria-labelledby="explore" className={styles.section}>
            <div className={styles.inner}>
              <ChapterHeading
                aside={
                  <Button href="/portfolio" trailingArrow variant="text">
                    {copy.home.allCollections}
                  </Button>
                }
                id="explore"
                number={chapter('explore')}
                title={copy.home.explore}
              />
              <ul className={styles.tiles} role="list">
                {disciplines.map((discipline, index) => (
                  <li key={discipline.id}>
                    <CollectionTile
                      href={collectionPath(discipline.slug)}
                      image={discipline.highlights?.[0]}
                      index={index + 1}
                      intro={discipline.intro}
                      name={discipline.name}
                      variant="home"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {posts.length > 0 ? (
          <section aria-labelledby="from-the-journal" className={`${styles.section} ${styles.ruled}`}>
            <div className={styles.inner}>
              <ChapterHeading
                aside={
                  <Button href={JOURNAL_PATH} size="primary" variant="outline-ink">
                    {copy.home.readTheJournal}
                  </Button>
                }
                id="from-the-journal"
                number={chapter('journal')}
                title={copy.home.journal}
              />
              <ul className={styles.cards} role="list">
                {posts.map((post) => (
                  <li key={post.id}>
                    <JournalRow
                      categoryName={typeof post.category === 'object' ? post.category?.name : null}
                      cover={post.cover}
                      excerpt={post.excerpt}
                      headingLevel="h3"
                      href={postPath(post.slug)}
                      publishedAt={post.publishedAt}
                      title={post.title}
                      variant="card"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
      <BookingFinale body={copy.home.finaleBody} bookingLabel={bookingLabel} headline={settings.finaleHeadline ?? ''} />
      <SiteFooter settings={settings} />
    </>
  )
}
