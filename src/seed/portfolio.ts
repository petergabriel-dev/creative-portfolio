/**
 * Portfolio seed data (P1): the four disciplines and placeholder projects in the style of the
 * handoff captures (03–07, 22). Safe to run twice: every doc is found by its slug or filename
 * and only created when missing; existing docs are never changed.
 */
import type { Payload } from 'payload'
import sharp from 'sharp'

import { toSlug } from '@/lib/slug'
import type { Discipline, Project } from '@/payload-types'

/** Seeds and scripts run outside a Next.js request, where revalidatePath cannot work. */
const context = { disableRevalidate: true }

type Log = (message: string) => void

// Placeholder frames, alternating the two loading tints (--frame, --frame-alt).
const FRAME_COLOURS = ['#DCD6CC', '#D3CCC0'] as const
const FRAME_COUNT = 6

async function placeholderFrames(payload: Payload, log: Log): Promise<number[]> {
  const ids: number[] = []
  for (let index = 1; index <= FRAME_COUNT; index++) {
    const filename = `seed-frame-${index}.webp`
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      log(`placeholder image ${filename} already exists, left unchanged`)
      ids.push(existing.docs[0].id)
      continue
    }
    const data = await sharp({
      create: { width: 1600, height: 1200, channels: 3, background: FRAME_COLOURS[index % 2] },
    })
      .webp()
      .toBuffer()
    const media = await payload.create({
      collection: 'media',
      data: { alt: '[Placeholder image]' },
      file: { data, mimetype: 'image/webp', name: filename, size: data.length },
      context,
      overrideAccess: true,
    })
    log(`created placeholder image ${filename}`)
    ids.push(media.id)
  }
  return ids
}

type DisciplineSeed = Omit<Discipline, 'id' | 'slug' | 'highlights' | 'updatedAt' | 'createdAt'> & {
  highlightCount: number
}

const DISCIPLINES: DisciplineSeed[] = [
  {
    name: 'Photography',
    order: 1,
    intro:
      'People, places and occasions — weddings and events, portraits and the outdoors — framed honestly and edited for the story.',
    openerTint: 'warm',
    layout: 'projects',
    highlightAspect: '4:5',
    cardAspect: '3:2',
    highlightCount: 5,
    finaleHeadline: 'Have a shoot in mind?',
    finaleBody: "A wedding, an event, a portrait session — tell me about it and we'll start from there.",
  },
  {
    name: 'Film & Video',
    order: 2,
    intro: 'Short films, music videos and moving portraits — from the first idea to the final cut.',
    openerTint: 'plum',
    layout: 'projects',
    highlightAspect: '16:9',
    cardAspect: '16:9',
    highlightCount: 4,
    finaleHeadline: 'Have a film in mind?',
    finaleBody:
      "A music video, a short, a story for your brand — tell me about it and we'll start from there.",
  },
  {
    name: 'Design & Illustration',
    order: 3,
    intro: 'Identities, posters, illustration and layout — with a story behind every mark.',
    openerTint: 'forest',
    layout: 'projects',
    highlightAspect: '1:1',
    cardAspect: '4:3',
    highlightCount: 5,
    finaleHeadline: 'Need something designed?',
    finaleBody:
      "An identity, a poster, a set of drawings — tell me about it and we'll start from there.",
  },
  {
    name: 'Writing & More',
    order: 4,
    intro:
      "Essays, scripts and words for other people's work — plus the projects that don't fit neatly anywhere else.",
    openerTint: 'clay',
    layout: 'list',
    highlightAspect: '4:5',
    cardAspect: '3:2',
    highlightCount: 0,
    finaleHeadline: 'Need words for your work?',
    finaleBody: "A script, a story, the copy for a launch — tell me about it and we'll start from there.",
  },
]

type ProjectSeed = {
  discipline: string
  title: string
  projectType: string
  year: number
  summary: string
  client?: string
  role?: string
  showOnHome?: boolean
  homeOrder?: number
  draft?: boolean
  fullStory?: boolean
}

const SUMMARY = '[One or two sentences that introduce the project — what it was, who it was for, and why it mattered.]'

const PROJECTS: ProjectSeed[] = [
  // Photography: ten published (so "More projects" has cards to reveal) and one draft.
  { discipline: 'Photography', title: '[Couple names] wedding', projectType: 'Wedding', year: 2026, summary: SUMMARY, client: '[Couple names]', role: 'Photographer', showOnHome: true, homeOrder: 1, fullStory: true },
  { discipline: 'Photography', title: '[Client] portraits', projectType: 'Portrait series', year: 2026, summary: SUMMARY, client: '[Client]', role: 'Photographer' },
  { discipline: 'Photography', title: '[Event name]', projectType: 'Event', year: 2025, summary: SUMMARY, role: 'Photographer' },
  { discipline: 'Photography', title: '[Place] at first light', projectType: 'Outdoors', year: 2025, summary: SUMMARY, role: 'Photographer', showOnHome: true, homeOrder: 3 },
  { discipline: 'Photography', title: '[Second couple] wedding', projectType: 'Wedding', year: 2025, summary: SUMMARY, role: 'Photographer' },
  { discipline: 'Photography', title: '[Band] on tour', projectType: 'Event', year: 2024, summary: SUMMARY, client: '[Band]', role: 'Photographer' },
  { discipline: 'Photography', title: '[Family name] family session', projectType: 'Portrait series', year: 2024, summary: SUMMARY, role: 'Photographer' },
  { discipline: 'Photography', title: '[Festival] weekend', projectType: 'Event', year: 2024, summary: SUMMARY, client: '[Festival]', role: 'Photographer' },
  { discipline: 'Photography', title: '[Coastline] in winter', projectType: 'Outdoors', year: 2023, summary: SUMMARY, role: 'Photographer' },
  { discipline: 'Photography', title: '[Studio] headshots', projectType: 'Portrait series', year: 2023, summary: SUMMARY, client: '[Studio]', role: 'Photographer' },
  { discipline: 'Photography', title: '[Venue] open day', projectType: 'Event', year: 2026, summary: SUMMARY, draft: true },
  // Film & Video
  { discipline: 'Film & Video', title: '[Band] — [Song]', projectType: 'Music video', year: 2026, summary: SUMMARY, client: '[Band]', role: 'Director, editor', showOnHome: true, homeOrder: 2 },
  { discipline: 'Film & Video', title: '[Film title]', projectType: 'Short film', year: 2025, summary: SUMMARY, role: 'Director' },
  { discipline: 'Film & Video', title: '[Event name] highlight film', projectType: 'Event film', year: 2025, summary: SUMMARY, role: 'Filmmaker', draft: true },
  { discipline: 'Film & Video', title: '[Client] story', projectType: 'Brand film', year: 2024, summary: SUMMARY, client: '[Client]', role: 'Director, editor' },
  // Design & Illustration
  { discipline: 'Design & Illustration', title: '[Client] identity', projectType: 'Brand identity', year: 2026, summary: SUMMARY, client: '[Client]', role: 'Designer', showOnHome: true, homeOrder: 4 },
  { discipline: 'Design & Illustration', title: '[Festival] posters', projectType: 'Poster series', year: 2025, summary: SUMMARY, client: '[Festival]', role: 'Designer' },
  { discipline: 'Design & Illustration', title: '[Illustration title]', projectType: 'Illustration', year: 2025, summary: SUMMARY, role: 'Illustrator' },
  { discipline: 'Design & Illustration', title: '[Publication] issue [No.]', projectType: 'Editorial layout', year: 2024, summary: SUMMARY, client: '[Publication]', role: 'Designer' },
  // Writing & More (list layout)
  { discipline: 'Writing & More', title: '[Essay title]', projectType: 'Essay', year: 2026, client: '[Publication]', summary: '[The opening line of the essay — the one that makes people keep reading.]' },
  { discipline: 'Writing & More', title: '[Film title] — the script', projectType: 'Script', year: 2025, summary: 'The words behind one of the short films in Film & Video, from first draft to shooting script.' },
  { discipline: 'Writing & More', title: '[Client] website', projectType: 'Copywriting', year: 2024, client: '[Client]', summary: 'A voice and a set of words for a small business, written alongside its new identity.' },
  { discipline: 'Writing & More', title: '[Zine title]', projectType: 'Zine', year: 2024, summary: 'A self-published zine pairing photographs with short pieces of writing.' },
]

// Lexical rich text for the Text block: paragraphs, with an optional trailing link.
const textNode = (text: string) => ({ type: 'text', version: 1, text, format: 0, mode: 'normal', style: '', detail: 0 })
const paragraph = (text: string, link?: { text: string; url: string }) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  textFormat: 0,
  children: [
    textNode(text),
    ...(link
      ? [
          {
            type: 'link',
            version: 3,
            format: '',
            indent: 0,
            direction: 'ltr',
            fields: { linkType: 'custom', url: link.url, newTab: false },
            children: [textNode(link.text)],
          },
        ]
      : []),
  ],
})
const richText = (...children: ReturnType<typeof paragraph>[]) => ({
  root: { type: 'root', version: 1, format: '', indent: 0, direction: 'ltr', children },
})

/** One project uses all six block types (capture 07's chapters: brief, work, result). */
function fullStory(frames: number[]): NonNullable<Project['story']> {
  return [
    { blockType: 'chapter', heading: 'The brief' },
    {
      blockType: 'text',
      body: richText(
        paragraph('[What the project was, who it was for, and what it needed to say. A few sentences are enough.]'),
      ) as never,
    },
    { blockType: 'image', image: frames[0], width: 'contained', aspect: '4:5', caption: '[Caption]' },
    { blockType: 'chapter', heading: 'The work' },
    // Big Buck Bunny, the Blender Foundation's openly licensed short film (CC BY 3.0).
    { blockType: 'video', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', caption: '[Film caption]' },
    { blockType: 'gallery', images: [frames[1], frames[2]], aspect: '4:5', layout: 'strip' },
    { blockType: 'image', image: frames[3], width: 'full-bleed', aspect: '21:9' },
    { blockType: 'chapter', heading: 'The result' },
    {
      blockType: 'text',
      body: richText(
        paragraph(
          '[Where the work ended up and what it did — shown, screened, printed, launched — in a sentence or two.] ',
          { text: 'See it here', url: 'https://example.com' },
        ),
      ) as never,
    },
    { blockType: 'quote', quote: '[A line from the client or collaborator about the work.]', attribution: '[Name, role]' },
  ]
}

async function findBySlug(payload: Payload, collection: 'disciplines' | 'projects', slug: string) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

export async function seedPortfolio(payload: Payload) {
  const log: Log = (message) => payload.logger.info(`Seed: ${message}`)
  const frames = await placeholderFrames(payload, log)
  const disciplineIds = new Map<string, number>()

  for (const [index, { highlightCount, ...seed }] of DISCIPLINES.entries()) {
    const slug = toSlug(seed.name)
    const existing = await findBySlug(payload, 'disciplines', slug)
    if (existing) {
      log(`discipline ${slug} already exists, left unchanged`)
      disciplineIds.set(seed.name, existing.id)
      continue
    }
    const highlights = Array.from({ length: highlightCount }, (_, i) => frames[(index + i) % frames.length])
    const created = await payload.create({
      collection: 'disciplines',
      data: { ...seed, slug, highlights },
      context,
      overrideAccess: true,
    })
    log(`created discipline ${slug}`)
    disciplineIds.set(seed.name, created.id)
  }

  for (const [index, seed] of PROJECTS.entries()) {
    const slug = toSlug(seed.title)
    if (await findBySlug(payload, 'projects', slug)) {
      log(`project ${slug} already exists, left unchanged`)
      continue
    }
    const collection = disciplineIds.get(seed.discipline)
    if (collection === undefined) throw new Error(`Seed: unknown discipline ${seed.discipline}`)
    const { discipline: _discipline, draft, fullStory: withStory, ...fields } = seed
    await payload.create({
      collection: 'projects',
      data: {
        ...fields,
        slug,
        collection,
        cover: frames[index % frames.length],
        story: withStory ? fullStory(frames) : [],
        credits: withStory
          ? [
              { label: 'Client', value: '[Client]' },
              { label: 'Collaborators', value: '[Names and roles]' },
              { label: 'Made with', value: '[Camera, software, materials]' },
            ]
          : [],
        _status: draft ? 'draft' : 'published',
      },
      draft: Boolean(draft),
      context,
      overrideAccess: true,
    })
    log(`created ${draft ? 'draft' : 'published'} project ${slug}`)
  }
}
