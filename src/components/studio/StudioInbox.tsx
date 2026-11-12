import Link from 'next/link'
import type { ListViewServerProps } from 'payload'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { formatDate, isoDate } from '@/lib/date'
import { studioEditUrl, studioInbox, type StudioInboxData } from '@/lib/studio'
import { inboxHref, INQUIRY_STATUSES, type InquiryStatus, parseInboxQuery, replyHref } from '@/lib/studioInbox'

import styles from './StudioInbox.module.css'
import { StudioInboxActions } from './StudioInboxActions'
import { DETAIL_HEADING_ID, EMPTY_ID, StudioInboxFocus } from './StudioInboxFocus'

const t = copy.studio.inbox

const chip: Record<InquiryStatus, string> = {
  new: styles.chipNew,
  replied: styles.chipReplied,
  archived: styles.chipArchived,
}

const When = ({ iso }: { iso: string }) => <time dateTime={isoDate(iso)}>{formatDate(iso)}</time>

/** The inbox's content; a pure view, so every state renders in tests (StudioInbox.md). */
export function StudioInboxView({ data }: { data: StudioInboxData }) {
  const { query, counts, rows, selected, nextId, newerHref, olderHref } = data
  const reply = selected ? replyHref(selected.email) : null

  return (
    <StudioInboxFocus selectionKey={`${query.status}:${query.page}:${selected?.id ?? 'none'}`}>
      <main className={styles.page}>
        <header>
          <p className={styles.label}>{t.label}</p>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.description}>{t.description}</p>
        </header>

        <nav aria-label={t.statusNav} className={styles.statusNav}>
          <ul className={styles.pills}>
            {INQUIRY_STATUSES.map((status) => {
              const current = status === query.status
              return (
                <li key={status}>
                  <Link
                    aria-current={current ? 'true' : undefined}
                    className={[styles.pill, current && styles.pillCurrent].filter(Boolean).join(' ')}
                    href={inboxHref({ status })}
                  >
                    {t.statuses[status]} <span className={styles.count}>{counts[status]}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {selected ? (
          <div className={styles.panels}>
            <div className={styles.listColumn}>
              <ul aria-label={t.list} className={styles.cards}>
                {rows.map((row) => {
                  const isSelected = row.id === selected.id
                  return (
                    <li className={[styles.card, isSelected && styles.cardSelected].filter(Boolean).join(' ')} key={row.id}>
                      <div className={styles.cardHead}>
                        <h2 className={styles.cardName}>
                          <Link
                            aria-current={isSelected ? 'true' : undefined}
                            className={styles.cardLink}
                            data-inbox-select=""
                            href={row.href}
                            scroll={false}
                          >
                            {row.name}
                          </Link>
                        </h2>
                        <span className={styles.cardDate}>
                          <When iso={row.receivedAt} />
                        </span>
                      </div>
                      {row.projectType ? <p className={styles.cardType}>{row.projectType}</p> : null}
                      {row.excerpt ? <p className={styles.cardExcerpt}>{row.excerpt}</p> : null}
                    </li>
                  )
                })}
              </ul>
              {newerHref || olderHref ? (
                <nav aria-label={t.pages} className={styles.pager}>
                  {newerHref ? (
                    <Button href={newerHref} variant="text">
                      <span aria-hidden="true">{copy.finale.backArrow}</span> {t.newer}
                    </Button>
                  ) : null}
                  {olderHref ? (
                    <Button href={olderHref} trailingArrow variant="text">
                      {t.older}
                    </Button>
                  ) : null}
                </nav>
              ) : null}
            </div>

            <section aria-labelledby={DETAIL_HEADING_ID} className={styles.detail}>
              <div className={styles.detailHead}>
                <h2 className={styles.detailHeading} id={DETAIL_HEADING_ID} tabIndex={-1}>
                  {selected.name}
                </h2>
                <span className={`${styles.chip} ${chip[selected.status]}`}>{t.statuses[selected.status]}</span>
              </div>
              <dl className={styles.facts}>
                <div>
                  <dt>{t.facts.project}</dt>
                  <dd>{selected.projectType}</dd>
                </div>
                <div>
                  <dt>{t.facts.timing}</dt>
                  <dd>{selected.timing || <span className={styles.muted}>{t.notGiven}</span>}</dd>
                </div>
                <div>
                  <dt>{t.facts.email}</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt>{t.facts.received}</dt>
                  <dd>
                    <When iso={selected.receivedAt} />
                  </dd>
                </div>
              </dl>
              <p className={styles.message}>{selected.message}</p>
              <div className={styles.actions}>
                {reply ? (
                  <Button href={reply} variant="ink">
                    {t.reply}
                  </Button>
                ) : null}
                <StudioInboxActions
                  id={selected.id}
                  key={selected.id}
                  nextId={nextId}
                  page={query.page}
                  status={selected.status}
                  tab={query.status}
                />
              </div>
              <p className={styles.record}>
                <Button href={studioEditUrl('inquiries', selected.id)} trailingArrow variant="text">
                  {t.openRecord}
                </Button>
              </p>
            </section>
          </div>
        ) : (
          <div className={styles.emptyCard}>
            <p className={styles.empty} id={EMPTY_ID} tabIndex={-1}>
              {t.nothingWaiting}
            </p>
          </div>
        )}
      </main>
    </StudioInboxFocus>
  )
}

/**
 * `admin.components.views.list.Component` for inquiries: the two-panel inbox, read as the
 * logged-in editor (P6 owner decisions 3–7).
 * ponytail: Payload has already run its own list query before rendering this view and we don't use
 * it (one small extra read per load); a custom view at its own path would avoid it but lose the
 * collection's list URL.
 */
export async function StudioInbox({ payload, user, searchParams }: ListViewServerProps) {
  if (!user) return null
  return <StudioInboxView data={await studioInbox({ payload, user }, parseInboxQuery(searchParams))} />
}
