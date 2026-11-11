import Image from 'next/image'
import type { CSSProperties } from 'react'

import type { Media } from '@/payload-types'

import styles from './MediaImage.module.css'

export type MediaAspect = '3:4' | '4:5' | '3:2' | '4:3' | '1:1' | '16:9' | '21:9' | 'original'

const RATIO_CLASS: Record<Exclude<MediaAspect, 'original'>, string | undefined> = {
  '3:4': styles.r3x4,
  '4:5': styles.r4x5,
  '3:2': styles.r3x2,
  '4:3': styles.r4x3,
  '1:1': styles.r1x1,
  '16:9': styles.r16x9,
  '21:9': styles.r21x9,
}

type MediaImageProps = {
  media: Media | number | null | undefined
  aspect: MediaAspect
  /** next/image `sizes`, so the loader picks the right generated size. */
  sizes: string
  /** Only for the first image above the fold on a page. */
  priority?: boolean
}

/**
 * One media doc in a fixed-ratio frame (docs/design/components/MediaImage.md). The frame shows
 * the loading tint until the image arrives; without a populated image only the frame renders.
 */
export function MediaImage({ media, aspect, sizes, priority = false }: MediaImageProps) {
  const doc = typeof media === 'object' && media !== null ? media : null
  const ratio =
    aspect === 'original'
      ? ({
          aspectRatio: doc?.width && doc?.height ? `${doc.width} / ${doc.height}` : '3 / 2',
        } satisfies CSSProperties)
      : undefined
  const className = [styles.frame, aspect === 'original' ? undefined : RATIO_CLASS[aspect]]
    .filter(Boolean)
    .join(' ')

  if (!doc?.url) return <div aria-hidden="true" className={className} style={ratio} />

  return (
    <div className={className} style={ratio}>
      <Image
        alt={doc.alt ?? ''}
        className={styles.image}
        fill
        priority={priority}
        sizes={sizes}
        src={doc.url}
        // The focal point set in the Studio drives every crop.
        style={{ objectPosition: `${doc.focalX ?? 50}% ${doc.focalY ?? 50}%` }}
      />
    </div>
  )
}
