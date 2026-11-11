import { type OpenerTint, openerTint } from '@/lib/openerTint'
import { collectionPath, projectPath } from '@/lib/publishing'
import type { Home, Media } from '@/payload-types'

/**
 * Pure Home helpers (P4): hero slides resolved into plain, serializable views for the HeroSlider
 * client component, slider navigation, and the Selected work columns. Type-only payload imports,
 * so the client bundle never pulls in server code.
 */

type HeroSlide = Home['heroSlides'][number]

/** One hero slide, ready to render (docs/design/components/HeroSlider.md › Props/API). */
export type HeroSlideView = {
  id: string
  /** The slide title, or the site headline when it is blank (P4 owner decision 3). */
  title: string
  placeLine: string
  body: string
  /** Null when the target is not public: the secondary button is left out (owner decision 5). */
  link: { href: string; label: string } | null
  image: Media | null
  cardKicker: string
  tint: OpenerTint
}

/**
 * The URL a slide's link opens, or null when its target is not public. A discipline is always
 * public. A project must come back populated and published with its collection populated:
 * visitors get unreadable projects unpopulated, and an editor in draft mode gets drafts, which
 * the public can't open either (same rule as the journal's "See the work", `relatedWork`).
 */
export function heroLinkHref(link: HeroSlide['link'] | null | undefined): string | null {
  const value = link?.value
  if (typeof value !== 'object' || value === null) return null
  if (link?.relationTo === 'disciplines') {
    return 'slug' in value && value.slug ? collectionPath(value.slug) : null
  }
  if (!('_status' in value) || value._status !== 'published' || !value.slug) return null
  const discipline = typeof value.collection === 'object' ? value.collection : null
  return discipline?.slug ? projectPath(discipline.slug, value.slug) : null
}

/** Home's slides as views; a missing or empty array gives none (the fallback opener shows). */
export function heroSlides(home: Partial<Pick<Home, 'heroSlides'>>, headline: string): HeroSlideView[] {
  return (home.heroSlides ?? []).map((slide, index) => {
    const href = heroLinkHref(slide.link)
    const label = slide.linkLabel?.trim()
    const image = typeof slide.image === 'object' && slide.image?.url ? slide.image : null
    return {
      id: slide.id ?? String(index),
      title: slide.title?.trim() || headline,
      placeLine: slide.placeLine?.trim() ?? '',
      body: slide.body?.trim() ?? '',
      link: href && label ? { href, label } : null,
      image,
      cardKicker: slide.cardKicker?.trim() ?? '',
      tint: openerTint(slide.tint),
    }
  })
}

/** Slider index after moving by `step`, wrapping at both ends so the arrows are never disabled. */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return ((index % count) + count) % count
}

/**
 * Splits items, in order, into `columns` groups of ⌈n ÷ columns⌉: 1–3, 4–6, 7–9 for nine items
 * (capture 01 numbers down each column), so DOM order matches reading order at every width.
 */
export function selectedWorkColumns<T>(items: readonly T[], columns = 3): T[][] {
  if (items.length === 0) return []
  const size = Math.ceil(items.length / columns)
  const groups: T[][] = []
  for (let start = 0; start < items.length; start += size) groups.push(items.slice(start, start + size))
  return groups
}
