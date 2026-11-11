import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { JournalEntryFooter } from '@/components/site/JournalEntryFooter'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { LivePreviewListener } from '@/components/story/LivePreviewListener'
import { StoryBlocks } from '@/components/story/StoryBlocks'
import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import { formatDate } from '@/lib/date'
import { draftEditor } from '@/lib/draftEditor'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { findPost, getPublishedPostSlugs, relatedWork } from '@/lib/journal'
import { JOURNAL_PATH, postPath } from '@/lib/publishing'
import { pageMetadata } from '@/lib/seo'

/** Every published post is prerendered; other URLs render on demand (a 308 or a 404). */
export async function generateStaticParams() {
  return (await getPublishedPostSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/journal/[slug]'>): Promise<Metadata> {
  const match = await findPost((await params).slug)
  if (!match || match.redirect) return {}
  const { post } = match
  return pageMetadata({
    meta: post.meta,
    title: post.title,
    description: post.excerpt,
    canonical: postPath(post.slug),
    images: [post.cover],
  })
}

/** Journal entry (screen 10): opener, 21:9 cover, story, back link and related work, finale. */
export default async function JournalEntryPage({ params }: PageProps<'/journal/[slug]'>) {
  const { slug } = await params
  const editor = await draftEditor()
  const match = await findPost(slug, editor)
  if (!match) notFound()
  // An old slug: one hop to the current URL (ADR-0004).
  if (match.redirect) permanentRedirect(postPath(match.post.slug))

  const { post } = match
  const settings = await getSiteSettings()
  const category = typeof post.category === 'object' ? post.category?.name?.trim() : ''
  const contextLine = [category, formatDate(post.publishedAt)].filter(Boolean).join(` ${copy.separator} `)

  return (
    <>
      {editor ? <LivePreviewListener /> : null}
      <ChapterOpener
        breadcrumb={[{ label: copy.nav.journal, href: JOURNAL_PATH }]}
        contextLine={contextLine}
        header={<SiteHeader current="journal" settings={settings} tone="dark" />}
        lead={post.excerpt}
        title={post.title}
      />
      <main>
        <MediaImage aspect="21:9" media={post.cover} priority sizes="100vw" />
        <article>
          <StoryBlocks blocks={post.story} />
        </article>
        <JournalEntryFooter related={relatedWork(post)} />
      </main>
      <BookingFinale
        body={copy.journal.finaleBody}
        bookingLabel={settings.bookingLabel?.trim() ?? ''}
        headline={settings.finaleHeadline ?? ''}
      />
      <SiteFooter settings={settings} />
    </>
  )
}
