import { BookingFinale } from '@/components/site/BookingFinale'
import { ChapterOpener } from '@/components/site/ChapterOpener'
import { JournalRow } from '@/components/site/JournalRow'
import { Pagination } from '@/components/site/Pagination'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { copy } from '@/copy'
import { JOURNAL_PAGE_SIZE, type PostSummary } from '@/lib/journal'
import { journalPagePath, postPath } from '@/lib/publishing'
import type { SiteSetting } from '@/payload-types'

import styles from './journal.module.css'

type JournalIndexProps = {
  current: number
  totalPages: number
  posts: PostSummary[]
  settings: SiteSetting
}

/** The journal list (screen 09), shared by /journal and /journal/page/N: opener, rows, pages, finale. */
export function JournalIndex({ current, totalPages, posts, settings }: JournalIndexProps) {
  return (
    <>
      <ChapterOpener
        contextLine={copy.journal.contextLine}
        header={<SiteHeader current="journal" settings={settings} tone="dark" />}
        lead={copy.journal.lead}
        title={copy.journal.title}
      />
      <main className={styles.section}>
        <div className={styles.inner}>
          {posts.length === 0 ? (
            // Empty state: one line, never an empty list (Build Spec › Front-end pages).
            <p className={styles.empty}>{copy.journal.empty}</p>
          ) : (
            <ul className={styles.rows} role="list">
              {posts.map((post) => (
                <li key={post.id}>
                  <JournalRow
                    categoryName={typeof post.category === 'object' ? post.category?.name : null}
                    cover={post.cover}
                    excerpt={post.excerpt}
                    href={postPath(post.slug)}
                    publishedAt={post.publishedAt}
                    title={post.title}
                  />
                </li>
              ))}
            </ul>
          )}
          <Pagination current={current} pageHref={journalPagePath} perPage={JOURNAL_PAGE_SIZE} total={totalPages} />
        </div>
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
