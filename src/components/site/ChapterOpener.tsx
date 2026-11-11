import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'

import { copy } from '@/copy'
import type { OpenerTint } from '@/lib/openerTint'

import styles from './ChapterOpener.module.css'

type ChapterOpenerProps = {
  tint?: OpenerTint
  /** 'split' puts the lead and actions in one row from 768 px (Portfolio, collection pages). */
  layout?: 'stacked' | 'split'
  /** Links shown before the context line, e.g. Portfolio · Collection 01. */
  breadcrumb?: { label: string; href: string }[]
  contextLine: string
  title: string
  lead?: string | null
  actions?: ReactNode
  /** Full-width slot after the lead and actions, e.g. the project's DetailsStrip. */
  details?: ReactNode
  /** A SiteHeader with tone="dark"; it stays outside <main> so it remains the banner landmark. */
  header: ReactNode
  /** Element for the content block: 'main' on pages that are only an opener (404). */
  as?: 'main' | 'div'
}

/** Dark page opener with the page's h1 (docs/design/components/ChapterOpener.md). */
export function ChapterOpener({
  tint = 'chapter',
  layout = 'stacked',
  breadcrumb,
  contextLine,
  title,
  lead,
  actions,
  details,
  header,
  as: Content = 'div',
}: ChapterOpenerProps) {
  const tintClass = tint === 'chapter' ? '' : styles[tint]
  const crumbs = breadcrumb ?? []
  const contextParts: ReactNode[] = [
    ...crumbs.map((crumb) => (
      <Link className={styles.crumb} href={crumb.href} key={crumb.href}>
        {crumb.label}
      </Link>
    )),
    ...(contextLine ? [contextLine] : []),
  ]
  const leadAndActions = (
    <>
      {lead && <p className={styles.lead}>{lead}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </>
  )

  return (
    <div className={[styles.opener, tintClass].filter(Boolean).join(' ')}>
      {header}
      <Content className={styles.content}>
        <div className={styles.inner}>
          <span aria-hidden="true" className={styles.rule} />
          {contextParts.length > 0 && (
            <p className={styles.contextLine}>
              {contextParts.map((part, index) => (
                <Fragment key={index}>
                  {index > 0 && <span aria-hidden="true">{` ${copy.separator} `}</span>}
                  {part}
                </Fragment>
              ))}
            </p>
          )}
          <h1 className={styles.title}>{title}</h1>
          {layout === 'split' && (lead || actions) ? (
            <div className={styles.split}>{leadAndActions}</div>
          ) : (
            leadAndActions
          )}
          {details && <div className={styles.details}>{details}</div>}
        </div>
      </Content>
    </div>
  )
}
