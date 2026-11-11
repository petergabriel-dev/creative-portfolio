import type { Metadata } from 'next'

import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { getJournalPage } from '@/lib/journal'
import { JOURNAL_PATH } from '@/lib/publishing'

import { JournalIndex } from './JournalIndex'

export const metadata: Metadata = {
  title: copy.journal.contextLine,
  description: copy.journal.lead,
  alternates: { canonical: JOURNAL_PATH },
}

/** Journal, page 1 (screen 09). Static; refreshed when a post's public state changes. */
export default async function JournalPage() {
  const [settings, { posts, totalPages }] = await Promise.all([getSiteSettings(), getJournalPage(1)])
  return <JournalIndex current={1} posts={posts} settings={settings} totalPages={totalPages} />
}
