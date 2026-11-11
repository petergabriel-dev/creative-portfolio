import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { getJournalPage, parsePageParam } from '@/lib/journal'
import { JOURNAL_PATH, journalPagePath } from '@/lib/publishing'

import { JournalIndex } from '../../JournalIndex'

/**
 * Pages 2 and on are prerendered (P2 owner decision 1). A page that appears later renders on
 * demand and is cached; publishing refreshes every page.
 */
export async function generateStaticParams() {
  const { totalPages } = await getJournalPage(1)
  return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({ n: String(index + 2) }))
}

/** The page number when this URL is a real later page, else null. */
async function laterPage(raw: string): Promise<number | null> {
  const page = parsePageParam(raw)
  if (page === null || page < 2) return null
  const { totalPages } = await getJournalPage(page)
  return page <= totalPages ? page : null
}

export async function generateMetadata({ params }: PageProps<'/journal/page/[n]'>): Promise<Metadata> {
  const page = await laterPage((await params).n)
  if (page === null) return {}
  return {
    title: copy.journal.pageTitle(page),
    description: copy.journal.lead,
    alternates: { canonical: journalPagePath(page) },
  }
}

/** Journal, page N ≥ 2 (screen 09). /journal/page/1 → 308 /journal; anything else unknown → 404. */
export default async function JournalLaterPage({ params }: PageProps<'/journal/page/[n]'>) {
  const raw = (await params).n
  if (parsePageParam(raw) === 1) permanentRedirect(JOURNAL_PATH)
  const page = await laterPage(raw)
  if (page === null) notFound()

  const [settings, { posts, totalPages }] = await Promise.all([getSiteSettings(), getJournalPage(page)])
  return <JournalIndex current={page} posts={posts} settings={settings} totalPages={totalPages} />
}
