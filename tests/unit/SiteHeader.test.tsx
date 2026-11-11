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

import { SiteHeader } from '@/components/site/SiteHeader'

const settings = { name: 'Your Name', bookingLabel: 'Book Me' }

describe('SiteHeader', () => {
  it('marks exactly one link as the current page', () => {
    const html = renderToStaticMarkup(<SiteHeader current="about" settings={settings} tone="light" />)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a href="\/about"[^>]*aria-current="page"/)
  })

  it('marks only the Book Me pill as current on /book', () => {
    const html = renderToStaticMarkup(<SiteHeader current="book" settings={settings} tone="dark" />)
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a href="\/book"[^>]*aria-current="page"/)
  })

  it('marks no link as current when none is passed', () => {
    const html = renderToStaticMarkup(<SiteHeader settings={settings} tone="dark" />)
    expect(html).not.toContain('aria-current')
  })

  it('renders a labelled nav and a booking link to /book', () => {
    const html = renderToStaticMarkup(<SiteHeader settings={settings} tone="light" />)
    expect(html).toContain('<nav aria-label="Main"')
    expect(html).toMatch(/<a [^>]*href="\/book"[^>]*>Book Me<\/a>/)
  })

  it('keeps an accessible home link name and no pill when settings are empty', () => {
    const html = renderToStaticMarkup(
      <SiteHeader settings={{ name: '  ', bookingLabel: null }} tone="light" />,
    )
    expect(html).toMatch(/<a [^>]*href="\/"[^>]*>.*Home<\/span><\/a>/)
    expect(html).not.toContain('href="/book"')
  })
})
