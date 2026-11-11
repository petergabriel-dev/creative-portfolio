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

const session = { draftMode: false, user: null as null | { id: number } }
const headers = vi.fn(async () => new Headers())
vi.mock('next/headers', () => ({
  draftMode: async () => ({ isEnabled: session.draftMode }),
  headers: () => headers(),
}))

vi.mock('@/components/story/LivePreviewListener', () => ({
  LivePreviewListener: () => <div data-live-preview="" />,
}))

const settings = { name: 'Your Name', bookingLabel: 'Book Me', finaleHeadline: "Let's capture your story", socials: [] }

const text = (value: string) => ({ type: 'text', version: 1, text: value, format: 0, mode: 'normal', style: '', detail: 0 })
const body = (...children: object[]) => ({
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: 'ltr',
    children: [{ type: 'paragraph', version: 1, format: '', indent: 0, direction: 'ltr', textFormat: 0, children }],
  },
})
const link = (url: string, label: string) => ({
  type: 'link',
  version: 3,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: { linkType: 'custom', url, newTab: false },
  children: [text(label)],
})

const fullAbout = {
  contextLine: 'About · the person behind the work',
  title: "Hi, I'm Your Name",
  lead: 'I make photographs, films, designs and words.',
  portrait: { id: 3, url: 'https://x/portrait.webp', alt: 'Portrait', width: 1200, height: 1500 },
  sections: [
    { id: 's1', heading: 'Who I am', body: body(text('About me. '), link('/portfolio', 'See the work')) },
    { id: 's2', heading: 'Why I make things', body: body(text('Because. '), link('javascript:alert(1)', 'Bad link')) },
    { id: 's3', heading: 'How I see stories', body: body(text('Quietly.')) },
  ],
}

const data = { about: fullAbout as Record<string, unknown> }
const findGlobal = vi.fn(async ({ slug }: { slug: string }) => (slug === 'about' ? data.about : settings))
const auth = vi.fn(async () => ({ user: session.user }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal, auth }) }))

import AboutPage, { generateMetadata } from '@/app/(frontend)/about/page'

const render = async () => renderToStaticMarkup(await AboutPage()).replace(/^(<link [^>]*\/>)+/, '')

beforeEach(() => {
  session.draftMode = false
  session.user = null
  data.about = fullAbout
  findGlobal.mockClear()
  auth.mockClear()
  headers.mockClear()
})

describe('About page (P4)', () => {
  it('renders the opener with one h1, Book Me and View my work', async () => {
    const out = await render()
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toMatch(/<h1 class="_title_\w+">Hi, I&#x27;m Your Name<\/h1>/)
    expect(out).toContain('About · the person behind the work')
    expect(out).toMatch(/href="\/book"[^>]*>Book Me<\/a>/)
    expect(out).toMatch(/href="\/portfolio"[^>]*>View my work<\/a>/)
    expect(out).toContain('aria-current="page"') // About in the header
  })

  it('shows the portrait and each section as a numbered chapter with its body', async () => {
    const out = await render()
    expect(out).toContain('alt="Portrait"')
    const chapters = [...out.matchAll(/>(Chapter \d\d)<\/p><h2[^>]*>([^<]+)<\/h2>/g)].map(([, n, h]) => `${n} ${h}`)
    expect(chapters).toEqual(['Chapter 01 Who I am', 'Chapter 02 Why I make things', 'Chapter 03 How I see stories'])
    expect(out).toMatch(/<section aria-labelledby="about-1"/)
    expect(out).toContain('<a href="/portfolio">See the work</a>')
  })

  it('renders an unsafe rich-text link as plain text (invariant 13)', async () => {
    const out = await render()
    expect(out).not.toContain('javascript:')
    expect(out).toContain('Bad link')
  })

  it('keeps the header outside <main> and ends with the finale', async () => {
    const out = await render()
    expect(out.indexOf('<header')).toBeLessThan(out.indexOf('<main>'))
    expect(out.slice(out.indexOf('<main>'), out.indexOf('</main>'))).not.toContain('<header')
    expect(out).toContain('we&#x27;ll start from there.')
  })

  it('shows the opener with fallback copy and the finale while about is unpublished ({})', async () => {
    data.about = {}
    const out = await render()
    expect(out.match(/<h1\b/g)).toHaveLength(1)
    expect(out).toMatch(/<h1 class="_title_\w+">About<\/h1>/)
    expect(out).not.toContain('Chapter 01')
    expect(out).not.toContain('<img')
    expect(out).toContain('<main></main>')
    expect(out).toContain('View my work')
  })

  it('reads the published version for visitors and never touches headers', async () => {
    const out = await render()
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'about', draft: false, overrideAccess: false }))
    expect(headers).not.toHaveBeenCalled()
    expect(out).not.toContain('data-live-preview')
  })

  it('shows an editor the draft with live preview in draft mode', async () => {
    session.draftMode = true
    session.user = { id: 1 }
    const out = await render()
    expect(findGlobal).toHaveBeenCalledWith(expect.objectContaining({ slug: 'about', draft: true, user: session.user }))
    expect(out).toContain('data-live-preview')
  })

  it('has a canonical URL, the title and lead, and no openGraph key (default image)', async () => {
    const meta = await generateMetadata()
    expect(meta.alternates?.canonical).toBe('/about')
    expect(meta.title).toBe("Hi, I'm Your Name")
    expect(meta.description).toBe('I make photographs, films, designs and words.')
    expect(meta).not.toHaveProperty('openGraph')
    data.about = {}
    expect((await generateMetadata()).title).toBe('About')
  })
})
