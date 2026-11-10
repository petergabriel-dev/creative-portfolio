import Link from 'next/link'
import { useId } from 'react'

import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import type { Media } from '@/payload-types'

import styles from './Card.module.css'

type CollectionTileProps = {
  name: string
  href: string
  intro?: string | null
  image?: Media | number | null
  /** 1-based position in Portfolio order. */
  index: number
  priority?: boolean
}

/** One tile per discipline on the Portfolio page (docs/design/components/CollectionTile.md). */
export function CollectionTile({ name, href, intro, image, index, priority = false }: CollectionTileProps) {
  const nameId = useId()

  return (
    <Link aria-labelledby={nameId} className={styles.card} href={href}>
      <MediaImage
        aspect="3:4"
        media={image}
        priority={priority}
        sizes="(min-width: 1312px) 310px, (min-width: 768px) 50vw, 100vw"
      />
      <div className={styles.text}>
        <span className={styles.meta}>{copy.portfolio.tileLabel(index)}</span>
        <h2 className={styles.title} id={nameId}>
          {name}
        </h2>
        {intro ? <span className={styles.body}>{intro}</span> : null}
        <span className={styles.cta}>
          {copy.portfolio.viewCollection}
          <span aria-hidden="true">{` ${copy.arrow}`}</span>
        </span>
      </div>
    </Link>
  )
}
