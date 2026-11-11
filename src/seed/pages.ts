/**
 * Home and About seed data (P4), in the style of captures 01 and 08: bracketed placeholder copy
 * and tinted frames. Safe to run twice: each global is filled only while it has no version at
 * all (published or draft), so real edits are never overwritten. Runs after the portfolio seed,
 * whose disciplines, projects and frames the hero slides link to.
 */
import type { Payload } from 'payload'

import { toSlug } from '@/lib/slug'
import type { About, Home } from '@/payload-types'

import { findBySlug, paragraph, placeholderFrames, richText } from './portfolio'

/** Seeds and scripts run outside a Next.js request, where revalidatePath cannot work. */
const context = { disableRevalidate: true }

/** True when the global already has content, as a published version or as a draft. */
async function hasContent(payload: Payload, slug: 'home' | 'about', field: 'heroSlides' | 'sections') {
  const latest: Partial<Pick<Home, 'heroSlides'> & Pick<About, 'sections'>> = await payload.findGlobal({
    slug,
    draft: true,
    depth: 0,
    overrideAccess: true,
  })
  const value = latest[field]
  return Array.isArray(value) && value.length > 0
}

export async function seedPages(payload: Payload) {
  const log = (message: string) => payload.logger.info(`Seed: ${message}`)
  const frames = await placeholderFrames(payload, log)
  const frame = (index: number) => frames[index % frames.length]

  if (await hasContent(payload, 'home', 'heroSlides')) {
    log('home already filled in, left unchanged')
  } else {
    const featured = await findBySlug(payload, 'projects', toSlug('[Couple names] wedding'))
    if (!featured) throw new Error('Seed: the featured project is missing; run the portfolio seed first')
    const { docs: disciplines } = await payload.find({
      collection: 'disciplines',
      sort: 'order',
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    const heroSlides: Home['heroSlides'] = [
      {
        // Blank: the slide shows site-settings.headline (P4 owner decision 3).
        title: '',
        placeLine: 'Featured · [Couple names] wedding',
        body: "I tell people's stories — in photographs, films, designs and words.",
        link: { relationTo: 'projects', value: featured.id },
        linkLabel: 'See the work',
        image: frame(0),
        cardKicker: 'Featured',
        tint: 'default',
      },
      ...disciplines.map((discipline, index) => ({
        title: discipline.name,
        placeLine: 'Featured · [Project title]',
        body: discipline.intro,
        link: { relationTo: 'disciplines' as const, value: discipline.id },
        linkLabel: `View ${discipline.name.toLowerCase()}`,
        image: frame(index + 1),
        cardKicker: `Collection ${String(index + 1).padStart(2, '0')}`,
        tint: discipline.openerTint,
      })),
    ]
    await payload.updateGlobal({
      slug: 'home',
      data: {
        heroSlides,
        selectedWorkIntro: 'A few pieces I keep coming back to — photographs, films, designs and words.',
        meet: {
          heading: "Hi, I'm Your Name",
          body: '[A few sentences about how you work: the in-between moments you notice, and how you give them a shape someone can keep.]',
          portrait: frame(2),
        },
        journalCount: 2,
        _status: 'published',
      },
      context,
      overrideAccess: true,
    })
    log(`published home with ${heroSlides.length} hero slides`)
  }

  if (await hasContent(payload, 'about', 'sections')) {
    log('about already filled in, left unchanged')
  } else {
    const sections: About['sections'] = [
      {
        heading: 'Who I am',
        body: richText(
          paragraph("[A few sentences about you — where you're based, how you got started, and what you love doing when the camera's away.]"),
        ) as never,
      },
      {
        heading: 'Why I make things',
        body: richText(
          paragraph('[Why the work matters to you: the moments that rarely announce themselves, and why you want to catch them.]'),
        ) as never,
      },
      {
        heading: 'How I see stories',
        body: richText(
          paragraph('[How you work with people, and what you edit for: fewer pieces that together say what the work needs to say.] ', {
            text: 'See the work',
            url: '/portfolio',
          }),
        ) as never,
      },
    ]
    await payload.updateGlobal({
      slug: 'about',
      data: {
        contextLine: 'About · the person behind the work',
        title: "Hi, I'm Your Name",
        lead: 'I make photographs, films, designs and words — and the stories that run quietly through all of them.',
        portrait: frame(3),
        sections,
        _status: 'published',
      },
      context,
      overrideAccess: true,
    })
    log(`published about with ${sections.length} sections`)
  }
}
