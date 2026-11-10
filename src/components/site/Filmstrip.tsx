import { MediaImage } from '@/components/ui/MediaImage'
import type { Media } from '@/payload-types'

import styles from './Filmstrip.module.css'

type FilmstripProps = {
  images: (Media | number)[] | null | undefined
  aspect: '4:5' | '3:2' | '1:1' | '16:9'
  layout: 'strip' | 'pair'
  /** Edge to edge (Highlights); otherwise capped at --max-width-story (gallery block). */
  bleed?: boolean
  sizes: string
  /** Give the first image priority when it is the first image on the page. */
  priority?: boolean
}

/** Square-cornered photos with --gap-photos gaps that wrap on phones (docs/design/components/Filmstrip.md). */
export function Filmstrip({ images, aspect, layout, bleed = false, sizes, priority = false }: FilmstripProps) {
  const resolved = (images ?? []).filter((image): image is Media => typeof image === 'object')
  if (resolved.length === 0) return null

  const className = [styles.strip, layout === 'pair' ? styles.pair : styles.auto, bleed ? undefined : styles.contained]
    .filter(Boolean)
    .join(' ')

  return (
    // role="list" keeps list semantics in Safari after list-style: none.
    <ul className={className} role="list">
      {resolved.map((image, index) => (
        <li key={`${image.id}-${index}`}>
          <MediaImage aspect={aspect} media={image} priority={priority && index === 0} sizes={sizes} />
        </li>
      ))}
    </ul>
  )
}
