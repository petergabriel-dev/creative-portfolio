import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { JOURNAL_PATH } from '@/lib/publishing'

import styles from './JournalEntryFooter.module.css'

type JournalEntryFooterProps = {
  /** Published related projects, already filtered (relatedWork). */
  related: { title: string; href: string }[]
}

/**
 * Closes a journal entry: "Back to journal" and the related work (JournalEntryFooter.md). One
 * project keeps capture 10's "See the work →"; several are listed by title, so no two links share
 * a name but go to different places (P2 owner decision 7).
 */
export function JournalEntryFooter({ related }: JournalEntryFooterProps) {
  return (
    <div className={styles.footer}>
      <div className={styles.inner}>
        <Button href={JOURNAL_PATH} size="primary" variant="outline-ink">
          <span aria-hidden="true">{copy.finale.backArrow}</span>
          {copy.journal.backToJournal}
        </Button>
        {related.length === 1 ? (
          <Button href={related[0].href} trailingArrow variant="text">
            {copy.journal.seeTheWork}
          </Button>
        ) : related.length > 1 ? (
          <div className={styles.related}>
            <p className={styles.label}>{copy.journal.seeTheWork}</p>
            <ul className={styles.list} role="list">
              {related.map((project) => (
                <li key={project.href}>
                  <Button href={project.href} trailingArrow variant="text">
                    {project.title}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  )
}
