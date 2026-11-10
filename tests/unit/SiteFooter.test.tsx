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

import { copyrightLine, SiteFooter } from '@/components/site/SiteFooter'

const base = {
  name: 'Your Name',
  roleLine: 'Multidisciplinary creative',
  location: '[City, Country]',
  contactEmail: 'hello@example.com',
  footerNote: 'All work by Your Name',
  bookingLabel: 'Book Me',
}

describe('SiteFooter', () => {
  it('renders contact, socials and the footer nav', () => {
    const html = renderToStaticMarkup(
      <SiteFooter
        settings={{
          ...base,
          socials: [
            { platform: 'instagram', url: 'https://instagram.com/yourname' },
            { platform: 'other', url: 'https://www.example.org/me' },
          ],
        }}
      />,
    )
    expect(html).toContain('<nav aria-label="Footer"')
    expect(html).toContain('href="mailto:hello@example.com"')
    expect(html).toContain('Multidisciplinary creative · [City, Country]')
    expect(html).toContain('rel="me noopener">Instagram</a>')
    expect(html).toContain('rel="me noopener">example.org</a>')
    expect(html).toMatch(/href="\/book"[^>]*>Book Me<\/a>/)
  })

  it('omits the socials row when there are none, and the contact group when both are empty', () => {
    expect(renderToStaticMarkup(<SiteFooter settings={{ ...base, socials: [] }} />)).not.toContain(
      'rel="me noopener"',
    )
    const html = renderToStaticMarkup(<SiteFooter settings={{ ...base, contactEmail: '' }} />)
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('rel="me')
  })

  it('never renders non-http social links', () => {
    const html = renderToStaticMarkup(
      <SiteFooter settings={{ ...base, socials: [{ platform: 'instagram', url: 'javascript:alert(1)' }] }} />,
    )
    expect(html).not.toContain('javascript:')
  })
})

describe('copyrightLine', () => {
  it('matches the capture and adds a closing full stop', () => {
    expect(copyrightLine(2026, 'Your Name', 'All work by Your Name')).toBe(
      '© 2026 Your Name. All work by Your Name.',
    )
    expect(copyrightLine(2026, 'Your Name', 'All rights reserved!')).toBe(
      '© 2026 Your Name. All rights reserved!',
    )
  })

  it('degrades cleanly when values are missing', () => {
    expect(copyrightLine(2026, '', null)).toBe('© 2026')
  })
})
