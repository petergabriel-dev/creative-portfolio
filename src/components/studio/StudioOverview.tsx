import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { formatDate, isoDate } from '@/lib/date'
import { type RecentRow, type StudioDocRow, type StudioOverviewData, studioOverview } from '@/lib/studio'

import styles from './StudioOverview.module.css'

const t = copy.studio.overview

function Panel({ id, title, sub, pill, wide, footer, children }: {
  id: string
  title: string
  /** A line under the heading, above the head's rule ("Hero slides, in order", capture 21). */
  sub?: ReactNode
  pill?: ReactNode
  wide?: boolean
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className={[styles.panel, wide && styles.wide].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.heading} id={id}>
            {title}
          </h2>
          {sub}
        </div>
        {pill}
      </div>
      {children}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  )
}

const Empty = ({ children }: { children: ReactNode }) => <p className={styles.empty}>{children}</p>

function Thumb({ url }: { url: string | null }) {
  // ponytail: a plain <img> of the Blob `thumb` size; the Studio has no next/image loader of its own.
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img alt="" className={styles.thumb} src={url} /> : <span aria-hidden="true" className={styles.thumb} />
}

function DocTitle({ row }: { row: Pick<StudioDocRow, 'editUrl' | 'title'> }) {
  return (
    <Link className={styles.titleLink} href={row.editUrl}>
      {row.title}
    </Link>
  )
}

const When = ({ iso }: { iso: string }) => (
  <time className={styles.date} dateTime={isoDate(iso)}>
    {formatDate(iso)}
  </time>
)

const chip: Record<RecentRow['status'], { label: string; className: string }> = {
  published: { label: t.published, className: styles.chipPublished },
  draft: { label: t.draft, className: styles.chipDraft },
  changes: { label: t.changes, className: styles.chipChanges },
}

/** The Overview's content; a pure view, so every state renders in tests. */
export function StudioOverviewView({ data }: { data: StudioOverviewData }) {
  const { needsReply, drafts, home, recent } = data
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>{t.label}</p>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.greeting}>{t.greeting}</p>
        </div>
        <div className={styles.actions}>
          <Button href="/" variant="outline-ink">
            {t.viewSite}
          </Button>
          <Button href="/admin/collections/projects/create" variant="ink">
            {t.newProject}
          </Button>
        </div>
      </header>

      <div className={styles.grid}>
        <Panel
          footer={
            <Button href="/admin/collections/inquiries" trailingArrow variant="text">
              {t.openInquiries}
            </Button>
          }
          id="overview-needs-reply"
          pill={needsReply.total > 0 ? <span className={`${styles.pill} ${styles.pillInk}`}>{t.newCount(needsReply.total)}</span> : null}
          title={t.needsReply}
        >
          {needsReply.rows.length === 0 ? (
            <Empty>{t.nothingWaiting}</Empty>
          ) : (
            <ul className={styles.rows}>
              {needsReply.rows.map((row) => (
                <li className={`${styles.row} ${styles.inquiryRow}`} key={row.id}>
                  <div className={styles.text}>
                    <Link className={styles.titleLink} href={row.editUrl}>
                      {row.name}
                    </Link>
                    <p className={styles.meta}>{row.projectType}</p>
                  </div>
                  <When iso={row.receivedAt} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          footer={
            <>
              <Button href="/admin/collections/projects" trailingArrow variant="text">
                {t.allProjects}
              </Button>
              <Button href="/admin/collections/posts" trailingArrow variant="text">
                {t.allPosts}
              </Button>
            </>
          }
          id="overview-drafts"
          pill={drafts.total > 0 ? <span className={`${styles.pill} ${styles.chipDraft}`}>{t.unpublishedCount(drafts.total)}</span> : null}
          title={t.drafts}
        >
          {drafts.rows.length === 0 ? (
            <Empty>{t.noDrafts}</Empty>
          ) : (
            <ul className={styles.rows}>
              {drafts.rows.map((row) => (
                <li className={`${styles.row} ${styles.docRow}`} key={`${row.collection}-${row.id}`}>
                  <Thumb url={row.thumbUrl} />
                  <div className={styles.text}>
                    <DocTitle row={row} />
                    {row.meta ? <p className={styles.meta}>{row.meta}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          footer={
            <Button href="/admin/globals/home" trailingArrow variant="text">
              {t.editHomePage}
            </Button>
          }
          id="overview-home"
          sub={<p className={styles.subLabel}>{t.heroSlides}</p>}
          title={t.onTheHomePage}
        >
          {home.slideTitles.length === 0 ? (
            <Empty>{t.noSlides}</Empty>
          ) : (
            <ol className={styles.rows}>
              {home.slideTitles.map((title, index) => (
                <li className={`${styles.row} ${styles.slideRow}`} key={index}>
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                  <span>{title}</span>
                </li>
              ))}
            </ol>
          )}
          <p className={styles.selectedWork}>{copy.studio.selectedWorkLine(home.selectedWorkCount)}</p>
        </Panel>

        <Panel id="overview-recent" title={t.recentlyEdited} wide>
          {recent.length === 0 ? (
            <Empty>{t.nothingEdited}</Empty>
          ) : (
            <ul className={`${styles.rows} ${styles.recentRows}`}>
              {recent.map((row) => (
                <li className={`${styles.row} ${styles.recentRow}`} key={`${row.collection}-${row.id}`}>
                  <Thumb url={row.thumbUrl} />
                  <div className={styles.text}>
                    <DocTitle row={row} />
                    {row.meta ? <p className={styles.meta}>{row.meta}</p> : null}
                  </div>
                  {/* A wrapped line on narrow panels; `display: contents` (grid cells) on wide ones. */}
                  <div className={styles.details}>
                    <span className={styles.collection}>{row.collectionName ?? <span aria-hidden="true">—</span>}</span>
                    <span className={`${styles.pill} ${chip[row.status].className}`}>{chip[row.status].label}</span>
                    <When iso={row.updatedAt} />
                    <span aria-hidden="true" className={styles.edit}>
                      {t.edit}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </main>
  )
}

/** `admin.components.views.dashboard`: the Studio Overview at /admin, read as the logged-in editor. */
export async function StudioOverview({ initPageResult }: AdminViewServerProps) {
  const { payload, user } = initPageResult.req
  if (!user) return null
  return <StudioOverviewView data={await studioOverview({ payload, user })} />
}
