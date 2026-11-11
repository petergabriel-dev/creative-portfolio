import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, fill: _fill, priority, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} data-priority={priority ? 'true' : undefined} src={src as string} {...rest} />
  ),
}))

// Draft mode and the editor session are switched per test.
const session = { draftMode: false, user: null as null | { id: number } }
const headers = vi.fn(async () => new Headers())
vi.mock('next/headers', () => ({
  draftMode: async () => ({ isEnabled: session.draftMode }),
  headers: () => headers(),
}))

vi.mock('@/components/story/LivePreviewListener', () => ({
  LivePreviewListener: () => <div data-live-preview="" />,
}))

const settings = {
  name: 'Your Name',
  headline: 'Every moment has a story',
  roleLine: 'Multidisciplinary creative',
  bookingLabel: 'Book Me',
  finaleHeadline: "Let's capture your story",
  socials: [],
}

const photography = { id: 1, name: 'Photography', slug: 'photography', intro: 'People and places.', highlights: [] }
const film = { id: 2, name: 'Film & Video', slug: 'film-video', intro: 'Short films.', highlights: [] }
const image = { id: 9, url: 'https://x/frame.webp', alt: 'Frame', width: 1600, height: 1200 }

const fullHome = {
  heroSlides: [
    {
      id: 'a',
      title: '',
      placeLine: 'Featured · [Project]',
      body: 'Body.',
      link: { relationTo: 'disciplines', value: photography },
      linkLabel: 'View photography',
      image,
      cardKicker: 'Featured',
      tint: 'default',
    },
    {
      id: 'b',
      title: 'Film & Video',
      placeLine: 'Featured',
      body: 'Body.',
      link: { relationTo: 'projects', value: 33 }, // unpublished: unpopulated
      linkLabel: 'View film',
      image,
      cardKicker: 'Collection 02',
      tint: 'plum',
    },
  ],
  selectedWorkIntro: 'A few pieces I keep coming back to.',
  meet: { heading: "Hi, I'm Your Name", body: 'I tell stories.', portrait: image },
  journalCount: 2,
}

const project = (n: number) => ({
  id: n,
  title: `Project ${n}`,
  slug: `project-${n}`,
  cover: image,
  collection: n % 2 ? photography : film,
})
const post = (n: number) => ({
  id: n,
  title: `Post ${n}`,
  slug: `post-${n}`,
  excerpt: `Excerpt ${n}`,
  cover: null,
  category: { id: 1, name: 'Process' },
  publishedAt: '2026-11-06T02:00:00.000Z',
})

const data = {
  home: fullHome as Record<string, unknown>,
  projects: Array.from({ length: 9 }, (_, i) => project(i + 1)),
  disciplines: [photography, film],
  posts: Array.from({ length: 10 }, (_, i) => post(i + 1)),
}

const find = vi.fn(async ({ collection }: { collection: string }) => {
  if (collection === 'projects') return { docs: data.projects }
  if (collection === 'disciplines') return { docs: data.disciplines }
  return { docs: data.posts, totalPages: 1 }
})
const findGlobal = vi.fn(async ({ slug }: { slug: string }) => (slug === 'home' ? data.home : settings))
const auth = vi.fn(async () => ({ user: session.user }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find, findGlobal, auth }) }))

import HomePage, { metadata } from '@/app/(frontend)/page'

const render = async () => renderToStaticMarkup(await HomePage()).replace(/^(<link [^>]*\/>)+/, '')
const chapters = (out: string) =>
  [...out.matchAll(/>(Chapter \d\d)(?:<span aria-hidden="true"> · <\/span>[^<]*)?<\/p><h2[^>]*id="([^"]+)"/g)].map(
    ([, label, id]) => `${label} ${id}`,
  )

beforeEach(() => {
  session.draftMode = false
  session.user = null
  data.home = fullHome
  data.projects = Array.from({ length: 9 }, (_, i) => project(i + 1))
  data.disciplines = [photography, film]
  data.posts = Array.from({ length: 10 }, (_, i) => post(i + 1))
  find.mockClear()
  findGlobal.mockClear()
  auth.mockClear()
  headers.mockClear()
})

describe('Home page (P4)', () => {
  it('renders the hero, four numbered chapters and the finale, in order', async () => {
    const out = await render()
    expect(chapters(out)).toEqual([
      'Chapter 01 selected-work',
      'Chapter 02 behind-the-camera',
      'Chapter 03 explore',
      'Chapter 04 from-the-journal',
    ])
    expect(out).toContain('Behind the camera</p>')
    expect(out).toContain('A few pieces I keep coming back to.')
    expect(out).toMatch(/href="\/about"[^>]*>Get to know me<\/a>/)
    expect(out).toMatch(/href="\/portfolio"[^>]*>All collections/)
    expect(out).toMatch(/href="\/journal"[^>]*>Read the journal<\/a>/)
    expect(out).toContain('a brand or a story') // Home's own finale body
  })

  it('keeps one h1 (the hidden headline) and the header outside <main>', async () => {
    const out = await render()
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toContain('<h1 class="visually-hidden">Every moment has a story</h1>')
    const main = out.slice(out.indexOf('<main>'), out.indexOf('</main>'))
    expect(main).not.toContain('<header')
    expect(out.indexOf('<header')).toBeLessThan(out.indexOf('<main>'))
  })

  it('resolves hero slides: blank title → headline, unpublished project → no second button', async () => {
    const out = await render()
    expect(out).toMatch(/<h2 class="_title_\w+">Every moment has a story<\/h2>/)
    expect(out).toContain('href="/portfolio/photography"')
    expect(out).not.toContain('View film')
  })

  it('shows at most nine Selected work tiles linking to their projects', async () => {
    const out = await render()
    expect(out.match(/class="visually-hidden">, Project \d/g)).toHaveLength(9)
    expect(out).toContain('href="/portfolio/photography/project-1"')
    expect(out).toContain('href="/portfolio/film-video/project-2"')
  })

  it('shows journalCount posts as h3 cards', async () => {
    let out = await render()
    expect(out.match(/<h3 class="_title_\w+"><a href="\/journal\/post-\d+"/g)).toHaveLength(2)
    data.home = { ...fullHome, journalCount: 1 }
    out = await render()
    expect(out.match(/href="\/journal\/post-\d+"/g)).toHaveLength(1)
    data.home = { ...fullHome, journalCount: 6 }
    out = await render()
    expect(out.match(/href="\/journal\/post-\d+"/g)).toHaveLength(6)
  })

  it('leaves out empty chapters and renumbers the rest', async () => {
    data.projects = []
    data.posts = []
    const out = await render()
    expect(chapters(out)).toEqual(['Chapter 01 behind-the-camera', 'Chapter 02 explore'])
    expect(out).not.toContain('Selected work')
    expect(out).not.toContain('From the journal')
  })

  it('falls back to the plain opener with a visible h1 when home is unpublished ({})', async () => {
    data.home = {}
    const out = await render()
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toMatch(/<h1 class="_title_\w+">Every moment has a story<\/h1>/)
    expect(out).not.toContain('aria-live')
    expect(out).not.toContain('behind-the-camera') // no meet heading
    // Selected work, Explore and the journal still render, with the default two posts.
    expect(chapters(out)).toEqual(['Chapter 01 selected-work', 'Chapter 02 explore', 'Chapter 03 from-the-journal'])
    expect(out.match(/href="\/journal\/post-\d+"/g)).toHaveLength(2)
  })

  it('reads published data for visitors and never touches headers', async () => {
    await render()
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'home', draft: false, overrideAccess: false }))
    expect(headers).not.toHaveBeenCalled()
    expect(auth).not.toHaveBeenCalled()
    expect(await render()).not.toContain('data-live-preview')
  })

  it('shows an editor the draft with live preview in draft mode', async () => {
    session.draftMode = true
    session.user = { id: 1 }
    const out = await render()
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'home', draft: true, user: session.user }))
    expect(out).toContain('data-live-preview')
  })

  it('is canonical at /', () => {
    expect(metadata.alternates?.canonical).toBe('/')
  })
})
