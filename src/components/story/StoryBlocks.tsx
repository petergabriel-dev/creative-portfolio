import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ReactNode } from 'react'

import { ChapterHeading } from '@/components/site/ChapterHeading'
import { Filmstrip } from '@/components/site/Filmstrip'
import { VideoEmbed } from '@/components/story/VideoEmbed'
import { MediaImage } from '@/components/ui/MediaImage'
import { copy } from '@/copy'
import type { ChapterBlock, Project } from '@/payload-types'
import { safeHref } from '@/lib/safeHref'
import { parseVideoUrl } from '@/lib/video'

import styles from './StoryBlocks.module.css'

type Block = NonNullable<Project['story']>[number]
type StorySection = { chapter: { number: number; heading: string } | null; blocks: Block[] }

/**
 * Splits the story into sections: each chapter block opens a section holding the blocks after it;
 * blocks before the first chapter form a leading section without a heading. Chapter numbers are
 * counted here, never stored (Build Spec › Story blocks).
 */
export function storySections(blocks: Project['story']): StorySection[] {
  const sections: StorySection[] = []
  let current: StorySection = { chapter: null, blocks: [] }
  let chapters = 0
  for (const block of blocks ?? []) {
    if (block.blockType === 'chapter') {
      if (current.chapter || current.blocks.length) sections.push(current)
      current = { chapter: { number: ++chapters, heading: (block as ChapterBlock).heading }, blocks: [] }
    } else {
      current.blocks.push(block)
    }
  }
  if (current.chapter || current.blocks.length) sections.push(current)
  return sections
}

type LinkNode = { fields?: { url?: string | null; newTab?: boolean | null }; children?: unknown[] }

/** Rich-text links render only for safe hrefs; anything else becomes plain text (invariant 13). */
const safeLink = ({ node, nodesToJSX }: { node: LinkNode; nodesToJSX: (args: { nodes: never[] }) => ReactNode[] }) => {
  const children = nodesToJSX({ nodes: (node.children ?? []) as never[] })
  const href = safeHref(node.fields?.url)
  if (!href) return <>{children}</>
  const newTab = Boolean(node.fields?.newTab)
  return (
    <a href={href} rel={newTab ? 'noopener noreferrer' : undefined} target={newTab ? '_blank' : undefined}>
      {children}
    </a>
  )
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: safeLink as never,
  autolink: safeLink as never,
})

/**
 * Rich text (paragraphs, bold, italic, lists, links) with the safe link converters and the story
 * Text styles. Used by the Text block and by About's sections (P4).
 */
export function SafeRichText({ data }: { data: Parameters<typeof RichText>[0]['data'] }) {
  return (
    <div className={styles.text}>
      <RichText converters={converters} data={data} disableContainer />
    </div>
  )
}

const isMedia = (value: unknown): value is { caption?: string | null; credit?: string | null } =>
  typeof value === 'object' && value !== null

/** Renders one non-chapter block; blocks with missing required data render nothing. */
function renderBlock(block: Block): { node: ReactNode; bleed: boolean } | null {
  switch (block.blockType) {
    case 'text':
      return block.body ? { bleed: false, node: <SafeRichText data={block.body} /> } : null
    case 'image': {
      if (!isMedia(block.image)) return null
      const caption = [block.caption?.trim() || block.image.caption?.trim(), block.image.credit?.trim()]
        .filter(Boolean)
        .join(` ${copy.separator} `)
      const bleed = block.width === 'full-bleed'
      return {
        bleed,
        node: (
          <figure className={styles.figure}>
            <MediaImage
              aspect={block.aspect}
              media={block.image}
              sizes={bleed ? '100vw' : '(min-width: 1312px) 1200px, 100vw'}
            />
            {caption ? (
              <figcaption className={`${styles.caption} ${bleed ? styles.bleedCaption : ''}`}>{caption}</figcaption>
            ) : null}
          </figure>
        ),
      }
    }
    case 'gallery':
      return {
        bleed: false,
        node: (
          <Filmstrip
            aspect={block.aspect}
            images={block.images}
            layout={block.layout}
            sizes={block.layout === 'pair' ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
          />
        ),
      }
    case 'video': {
      const video = parseVideoUrl(block.url)
      return video
        ? { bleed: false, node: <VideoEmbed caption={block.caption} embedUrl={video.embedUrl} poster={block.poster} /> }
        : null
    }
    case 'quote':
      return block.quote?.trim()
        ? {
            bleed: false,
            node: (
              <figure className={styles.quote}>
                <blockquote className={styles.quoteText}>
                  <p>{block.quote}</p>
                </blockquote>
                {block.attribution ? <figcaption className={styles.attribution}>{block.attribution}</figcaption> : null}
              </figure>
            ),
          }
        : null
    default:
      return null
  }
}

/**
 * Renders a project's (and in P2 a post's) story top to bottom (docs/design/components/StoryBlocks.md).
 * Consecutive column blocks share a padded column; full-bleed images sit outside it, edge to edge.
 */
export function StoryBlocks({ blocks }: { blocks: Project['story'] }) {
  return storySections(blocks).map((section, sectionIndex) => {
    const headingId = section.chapter ? `chapter-${section.chapter.number}` : undefined
    const groups: { bleed: boolean; nodes: ReactNode[] }[] = []
    if (section.chapter) {
      groups.push({
        bleed: false,
        nodes: [
          <ChapterHeading
            id={headingId}
            key="heading"
            number={section.chapter.number}
            title={section.chapter.heading}
          />,
        ],
      })
    }
    section.blocks.forEach((block, index) => {
      const rendered = renderBlock(block)
      if (!rendered) return
      const node = <div key={block.id ?? index}>{rendered.node}</div>
      const last = groups[groups.length - 1]
      if (!rendered.bleed && last && !last.bleed) last.nodes.push(node)
      else groups.push({ bleed: rendered.bleed, nodes: [node] })
    })
    if (groups.length === 0) return null

    const content = groups.map((group, index) =>
      group.bleed ? (
        <div className={styles.bleed} key={index}>
          {group.nodes}
        </div>
      ) : (
        <div className={styles.column} key={index}>
          {group.nodes}
        </div>
      ),
    )
    return section.chapter ? (
      <section aria-labelledby={headingId} className={styles.section} key={sectionIndex}>
        {content}
      </section>
    ) : (
      <div className={styles.section} key={sectionIndex}>
        {content}
      </div>
    )
  })
}
