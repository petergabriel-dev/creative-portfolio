import Link from 'next/link'

import { MediaImage } from '@/components/ui/MediaImage'
import { selectedWorkColumns } from '@/lib/heroSlides'
import type { Media } from '@/payload-types'

import styles from './SelectedWork.module.css'

export type SelectedWorkItem = {
  /** 1-based position in Selected work. */
  number: number
  collectionName: string
  /** The project title: visually hidden in the link, so it says which project opens. */
  title: string
  /** projectPath(collection slug, project slug). */
  href: string
  cover: Media | number | null | undefined
}

/**
 * Home's Selected work grid (docs/design/components/SelectedWork.md): three column groups in
 * order, numbered down each column as in capture 01. Each tile's caption is its only link; a
 * stretched pseudo-element makes the whole tile clickable.
 */
export function SelectedWork({ items }: { items: SelectedWorkItem[] }) {
  const columns = selectedWorkColumns(items)
  if (columns.length === 0) return null

  return (
    <div className={styles.columns}>
      {columns.map((column, index) => (
        <ul className={styles.column} key={index} role="list">
          {column.map((item) => (
            <li className={styles.tile} key={item.href}>
              <MediaImage
                aspect="original"
                // Decorative inside the tile (alt=""): the caption link names it.
                media={typeof item.cover === 'object' && item.cover ? { ...item.cover, alt: '' } : item.cover}
                sizes="(min-width: 1024px) 33vw, (min-width: 600px) 50vw, 100vw"
              />
              <Link className={styles.caption} href={item.href}>
                <span>{String(item.number).padStart(2, '0')}</span>{' '}
                <span>{item.collectionName}</span>
                <span className="visually-hidden">{`, ${item.title}`}</span>
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
