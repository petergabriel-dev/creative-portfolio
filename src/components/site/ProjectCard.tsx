import Link from 'next/link'
import { useId } from 'react'

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

/** One project in a collection's Projects chapter (docs/design/components/ProjectCard.md). */
export function ProjectCard({ title, href, projectType, year, cover, aspect, sizes }: ProjectCardProps) {
  const titleId = useId()

  return (
    <Link aria-labelledby={titleId} className={styles.card} href={href}>
      <MediaImage aspect={aspect} media={cover} sizes={sizes} />
      <div className={styles.text}>
        <span className={styles.meta}>
          {projectType}
          <span aria-hidden="true">{` ${copy.separator} `}</span>
          {year}
        </span>
        <h3 className={styles.title} id={titleId}>
          {title}
        </h3>
        <span className={styles.cta}>
          {copy.collection.viewProject}
          <span aria-hidden="true">{` ${copy.arrow}`}</span>
        </span>
      </div>
    </Link>
  )
}
