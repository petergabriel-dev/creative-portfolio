/**
 * Journal seed data (P2): the four categories and 12 placeholder posts in the style of the handoff
 * captures (09, 10): 11 published, so page 2 of the journal can be tested, and one draft. Safe to
 * run twice: every doc is found by its slug and only created when missing; existing docs are
 * never changed.
 */
import type { Payload } from 'payload'

import { toSlug } from '@/lib/slug'
import type { Post } from '@/payload-types'

import { type Log, paragraph, placeholderFrames, richText } from './portfolio'

/** Seeds and scripts run outside a Next.js request, where revalidatePath cannot work. */
const context = { disableRevalidate: true }

const CATEGORIES = ['Process', 'Outdoors', 'Design', 'Film'] as const

type PostSeed = {
  title: string
  category: (typeof CATEGORIES)[number]
  excerpt: string
  /** Slugs of seeded projects for "See the work" (one post links one, another links two). */
  related?: string[]
  /** Capture 10's story (text, quote, two-image gallery, text) instead of the short one. */
  captureStory?: boolean
  draft?: boolean
}

const EXCERPT = '[One or two sentences about the story, shown on the journal list.]'

// Newest first. The first three are capture 09's rows; the rest are bracketed placeholders.
const POSTS: PostSeed[] = [
  {
    title: 'The quiet minutes before anything starts',
    category: 'Process',
    excerpt: "Before a shoot, a first edit or a blank page, there's a pause worth paying attention to.",
    related: ['couple-names-wedding'],
    captureStory: true,
  },
  {
    title: 'Notes from a morning on the trail',
    category: 'Outdoors',
    excerpt: 'No clients, no schedule — just fog lifting off the valley and a reminder of why I started.',
  },
  {
    title: 'Designing a poster with only two colours',
    category: 'Design',
    excerpt: 'Limits are a gift — a commission that got better every time I took something away.',
    related: ['festival-posters', 'client-identity'],
  },
  { title: '[What I learned cutting a music video]', category: 'Film', excerpt: EXCERPT },
  { title: '[A week of contact sheets]', category: 'Process', excerpt: EXCERPT },
  { title: '[Chasing light on the coast]', category: 'Outdoors', excerpt: EXCERPT },
  { title: '[Notes on a festival poster series]', category: 'Design', excerpt: EXCERPT },
  { title: '[Shooting a short film on one lens]', category: 'Film', excerpt: EXCERPT },
  { title: '[How I prepare for a wedding day]', category: 'Process', excerpt: EXCERPT },
  { title: '[A winter walk with one camera]', category: 'Outdoors', excerpt: EXCERPT },
  { title: '[Sketchbook pages from the last month]', category: 'Design', excerpt: EXCERPT },
  { title: '[A story still in draft]', category: 'Film', excerpt: EXCERPT, draft: true },
]

/** Published posts a week apart, newest first, from 6 Nov 2026 (10:00 in Singapore). */
const publishedAt = (index: number) =>
  new Date(Date.UTC(2026, 10, 6, 2) - index * 7 * 24 * 60 * 60 * 1000).toISOString()

/** Capture 10's story: two paragraphs, a quote, a two-image gallery, two more paragraphs. */
function captureStory(frames: number[]): Post['story'] {
  return [
    {
      blockType: 'text',
      body: richText(
        paragraph(
          "There's a stretch of time at the start of most projects that nobody plans for. The gear is packed, the brief is read, the file is open — and for a moment, nothing is happening yet.",
        ),
        paragraph(
          "I've learned to pay attention to those minutes. On a shoot, it's when people stop performing because they think the important part hasn't started. At a desk, it's when the first honest idea turns up, before I start trying too hard.",
        ),
      ) as never,
    },
    { blockType: 'quote', quote: "The important part had already started. We just hadn't noticed yet." },
    { blockType: 'gallery', images: [frames[0], frames[1]], aspect: '4:5', layout: 'strip' },
    {
      blockType: 'text',
      body: richText(
        paragraph(
          "Some of my favourite photographs, cuts and sketches came from those minutes. They're rarely the most dramatic pieces, but they're often the ones people linger on — because they feel true.",
        ),
        paragraph(
          "So now I build the quiet in. Whatever the project, I leave room at the start where nothing is scheduled. It's almost always where the story begins.",
        ),
      ) as never,
    },
  ]
}

/** The short placeholder story: one paragraph and a quote. */
const shortStory = (): Post['story'] => [
  {
    blockType: 'text',
    body: richText(paragraph('[A few paragraphs about the shoot, edit or idea behind this story.]')) as never,
  },
  { blockType: 'quote', quote: '[A line worth pulling out of the story.]' },
]

async function findBySlug(payload: Payload, collection: 'categories' | 'posts' | 'projects', slug: string) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

export async function seedJournal(payload: Payload) {
  const log: Log = (message) => payload.logger.info(`Seed: ${message}`)
  const frames = await placeholderFrames(payload, log)
  const categoryIds = new Map<string, number>()

  for (const name of CATEGORIES) {
    const slug = toSlug(name)
    const existing = await findBySlug(payload, 'categories', slug)
    if (existing) {
      log(`category ${slug} already exists, left unchanged`)
      categoryIds.set(name, existing.id)
      continue
    }
    const created = await payload.create({
      collection: 'categories',
      data: { name, slug },
      context,
      overrideAccess: true,
    })
    log(`created category ${slug}`)
    categoryIds.set(name, created.id)
  }

  for (const [index, seed] of POSTS.entries()) {
    const slug = toSlug(seed.title)
    if (await findBySlug(payload, 'posts', slug)) {
      log(`post ${slug} already exists, left unchanged`)
      continue
    }
    const category = categoryIds.get(seed.category)
    if (category === undefined) throw new Error(`Seed: unknown category ${seed.category}`)
    const relatedProjects: number[] = []
    for (const projectSlug of seed.related ?? []) {
      const project = await findBySlug(payload, 'projects', projectSlug)
      if (!project) throw new Error(`Seed: related project ${projectSlug} not found (run the portfolio seed first)`)
      relatedProjects.push(project.id)
    }
    const data = {
      title: seed.title,
      slug,
      excerpt: seed.excerpt,
      cover: frames[index % frames.length],
      category,
      story: seed.captureStory ? captureStory(frames) : shortStory(),
      relatedProjects,
    }
    if (seed.draft) {
      // The draft has no date yet: publishing it fills one (owner decision 4).
      await payload.create({
        collection: 'posts',
        data: { ...data, _status: 'draft' },
        draft: true,
        context,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'posts',
        data: { ...data, publishedAt: publishedAt(index), _status: 'published' },
        context,
        overrideAccess: true,
      })
    }
    log(`created ${seed.draft ? 'draft' : 'published'} post ${slug}`)
  }
}
