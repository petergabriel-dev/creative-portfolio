'use client'

import { useEffect, useRef, useState } from 'react'

import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import type { Media } from '@/payload-types'

import styles from './VideoEmbed.module.css'

type VideoEmbedProps = {
  /** From parseVideoUrl (src/lib/video.ts): youtube-nocookie or Vimeo dnt=1, never the raw editor URL. */
  embedUrl: string
  poster?: Media | number | null
  caption?: string | null
}

/**
 * A YouTube or Vimeo video that loads only when the visitor presses play
 * (docs/design/components/VideoEmbed.md). Until then nothing is requested from the provider:
 * the frame shows the poster or a plain tint (owner decision 2026-11-10).
 */
export function VideoEmbed({ embedUrl, poster, caption }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const label = caption ? `${copy.video.play}: ${caption}` : copy.video.play
  const src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`

  // The button disappears on play, so focus moves into the player.
  useEffect(() => {
    if (playing) frameRef.current?.focus()
  }, [playing])

  return (
    <figure className={styles.figure}>
      <div className={styles.frame}>
        {playing ? (
          <iframe
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
            ref={frameRef}
            referrerPolicy="strict-origin-when-cross-origin"
            src={src}
            title={caption || copy.video.title}
          />
        ) : (
          <>
            {poster ? (
              <MediaImage aspect="16:9" media={poster} sizes="(min-width: 1312px) 1200px, 100vw" />
            ) : null}
            <button aria-label={label} className={styles.play} onClick={() => setPlaying(true)} type="button">
              <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
          </>
        )}
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
