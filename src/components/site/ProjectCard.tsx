import Link from 'next/link'

import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import type { Media } from '@/payload-types'

import styles from './Card.module.css'

type ProjectCardProps = {
  title: string
  href: string
  projectType: string
  year: number
  cover?: Media | number | null
  aspect: '3:2' | '16:9' | '4:3'
  sizes: string
}

/**
 * One project in a collection's Projects chapter (docs/design/components/ProjectCard.md). The title
 * is the link; a stretched pseudo-element makes the whole card clickable.
 */
export function ProjectCard({ title, href, projectType, year, cover, aspect, sizes }: ProjectCardProps) {
  return (
    <div className={styles.card}>
      <MediaImage aspect={aspect} media={cover} sizes={sizes} />
      <div className={styles.text}>
        <span className={styles.meta}>
          {projectType}
          <span aria-hidden="true">{` ${copy.separator} `}</span>
          {year}
        </span>
        <h3 className={styles.title}>
          <Link className={styles.link} href={href}>
            {title}
          </Link>
        </h3>
        {/* A visual cue only: the title link covers the card. */}
        <span aria-hidden="true" className={styles.cta}>
          {copy.collection.viewProject}
          {` ${copy.arrow}`}
        </span>
      </div>
    </div>
  )
}
