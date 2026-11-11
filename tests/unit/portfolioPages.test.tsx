import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, fill: _fill, priority: _priority, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt as string} src={src as string} {...rest} />
  ),
}))

const disciplines = [
  { id: 1, slug: 'photography', previousSlugs: ['photo'], updatedAt: '2026-11-01T00:00:00.000Z' },
  { id: 2, slug: 'film-video', previousSlugs: ['film', 'photo-old'], updatedAt: '2026-11-03T00:00:00.000Z' },
  { id: 3, slug: 'design', previousSlugs: ['photo-old'], updatedAt: '2026-11-05T00:00:00.000Z' },
  { id: 4, slug: 'film', previousSlugs: [], updatedAt: '2026-11-02T00:00:00.000Z' },
]
const find = vi.fn(async () => ({ docs: disciplines }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

import { CollectionTile } from '@/components/site/CollectionTile'
import { PieceRow } from '@/components/site/PieceRow'
import { ProjectCard } from '@/components/site/ProjectCard'
import { RevealMore } from '@/components/site/RevealMore'
import { findDiscipline } from '@/lib/portfolio'

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)

describe('findDiscipline', () => {
  it('matches a current slug first, even when another doc used it before', async () => {
    expect(await findDiscipline('film')).toMatchObject({ discipline: { id: 4 }, position: 4, redirect: false })
  })

  it('redirects an old slug to the doc that had it, preferring the most recently updated', async () => {
    expect(await findDiscipline('photo')).toMatchObject({ discipline: { id: 1 }, position: 1, redirect: true })
    expect(await findDiscipline('photo-old')).toMatchObject({ discipline: { id: 3 }, redirect: true })
  })

  it('returns null for an unknown slug', async () => {
    expect(await findDiscipline('nope')).toBeNull()
  })

  it('reads with access applied (overrideAccess: false)', () => {
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'disciplines', overrideAccess: false }))
  })
})

describe('CollectionTile', () => {
  it('links only the discipline name (name = visible label), with its label, intro and a hidden cue', () => {
    const out = html(<CollectionTile href="/portfolio/photography" index={1} intro="People and places." name="Photography" />)
    expect(out).toMatch(/<h2[^>]*><a href="\/portfolio\/photography"[^>]*>Photography<\/a><\/h2>/)
    expect(out.match(/<a /g)).toHaveLength(1)
    expect(out).not.toContain('aria-labelledby')
    expect(out).toContain('Collection 01')
    expect(out).toContain('People and places.')
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*">View collection →<\/span>/)
  })

  it('shows a tint frame and no intro when they are missing', () => {
    const out = html(<CollectionTile href="/portfolio/x" index={4} name="Writing &amp; More" />)
    expect(out).toContain('aria-hidden="true" class=')
    expect(out).toContain('Collection 04')
  })
})

describe('ProjectCard and PieceRow', () => {
  it('labels a card by its title, with "Type · Year"', () => {
    const out = html(
      <ProjectCard aspect="3:2" href="/portfolio/photography/p" projectType="Wedding" sizes="50vw" title="[Couple] wedding" year={2026} />,
    )
    expect(out).toMatch(/<h3[^>]*><a href="\/portfolio\/photography\/p"[^>]*>\[Couple\] wedding<\/a><\/h3>/)
    expect(out.match(/<a /g)).toHaveLength(1)
    expect(out).toMatch(/Wedding<span aria-hidden="true"> · <\/span>2026/)
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*">View project →<\/span>/)
  })

  it('links only the title of a piece row', () => {
    const out = html(<PieceRow href="/p" projectType="Essay" summary="S" title="T" year={2026} />)
    expect(out).toMatch(/<h3[^>]*><a href="\/p"[^>]*>T<\/a><\/h3>/)
    expect(out.match(/<a /g)).toHaveLength(1)
    expect(out).toMatch(/<span aria-hidden="true" class="[^"]*">Read →<\/span>/)
  })

  it('drops an empty client from a row', () => {
    const withClient = html(
      <PieceRow client="[Publication]" href="/p" projectType="Essay" summary="S" title="T" year={2026} />,
    )
    const without = html(<PieceRow client=" " href="/p" projectType="Essay" summary="S" title="T" year={2026} />)
    expect(withClient).toMatch(/Essay<span aria-hidden="true"> · <\/span>\[Publication\]<span aria-hidden="true"> · <\/span>2026/)
    expect(without).toMatch(/Essay<span aria-hidden="true"> · <\/span>2026/)
  })
})

describe('RevealMore', () => {
  const cards = (n: number) => Array.from({ length: n }, (_, i) => <a href={`/p${i}`} key={i}>{`Card ${i}`}</a>)

  it('shows the first eight cards, hides the rest and offers the button', () => {
    const out = html(
      <RevealMore label="More projects" listClassName="grid" listId="cards">
        {cards(10)}
      </RevealMore>,
    )
    expect(out.match(/<li>/g)).toHaveLength(8)
    expect(out.match(/<li hidden="">/g)).toHaveLength(2)
    expect(out).toMatch(/<button aria-controls="cards"[^>]*>More projects<\/button>/)
  })

  it('shows every card and no button when there are eight or fewer', () => {
    const out = html(
      <RevealMore label="More projects" listClassName="grid" listId="cards">
        {cards(8)}
      </RevealMore>,
    )
    expect(out).not.toContain('hidden')
    expect(out).not.toContain('<button')
  })
})
