import type { ReactNode } from 'react'

import styles from './ChapterOpener.module.css'

type Tint = 'chapter' | 'photo' | 'film' | 'design' | 'writing'

type ChapterOpenerProps = {
  tint?: Tint
  contextLine: string
  title: string
  lead?: string | null
  actions?: ReactNode
  /** A SiteHeader with tone="dark"; it stays outside <main> so it remains the banner landmark. */
  header: ReactNode
  /** Element for the content block: 'main' on pages that are only an opener (404). */
  as?: 'main' | 'div'
}

/** Dark page opener with the page's h1 (docs/design/components/ChapterOpener.md). */
export function ChapterOpener({
  tint = 'chapter',
  contextLine,
  title,
  lead,
  actions,
  header,
  as: Content = 'div',
}: ChapterOpenerProps) {
  const tintClass = tint === 'chapter' ? '' : styles[tint]

  return (
    <div className={[styles.opener, tintClass].filter(Boolean).join(' ')}>
      {header}
      <Content className={styles.content}>
        <div className={styles.inner}>
          <span aria-hidden="true" className={styles.rule} />
          {contextLine && <p className={styles.contextLine}>{contextLine}</p>}
          <h1 className={styles.title}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </Content>
    </div>
  )
}
