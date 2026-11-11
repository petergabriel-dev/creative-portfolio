import Link from 'next/link'

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
  /** 'home' (P4): 4:5, no "Collection 0N" label, an h3 and "View gallery". */
  variant?: 'portfolio' | 'home'
}

/**
 * One tile per discipline on the Portfolio page and in Home's "Explore the portfolio"
 * (docs/design/components/CollectionTile.md). The name is the link; a stretched pseudo-element
 * makes the whole tile clickable.
 */
export function CollectionTile({
  name,
  href,
  intro,
  image,
  index,
  priority = false,
  variant = 'portfolio',
}: CollectionTileProps) {
  const home = variant === 'home'
  // On Home the tiles sit under the chapter's h2.
  const Heading = home ? 'h3' : 'h2'
  return (
    <div className={styles.card}>
      <MediaImage
        aspect={home ? '4:5' : '3:4'}
        media={image}
        priority={priority}
        sizes="(min-width: 1312px) 310px, (min-width: 768px) 50vw, 100vw"
      />
      <div className={styles.text}>
        {home ? null : <span className={styles.meta}>{copy.portfolio.tileLabel(index)}</span>}
        <Heading className={styles.title}>
          <Link className={styles.link} href={href}>
            {name}
          </Link>
        </Heading>
        {intro ? <span className={styles.body}>{intro}</span> : null}
        {/* A visual cue only: the name link covers the tile. */}
        <span aria-hidden="true" className={styles.cta}>
          {home ? copy.home.viewGallery : copy.portfolio.viewCollection}
          {` ${copy.arrow}`}
        </span>
      </div>
    </div>
  )
}
