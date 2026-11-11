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

import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders a link when it has an href', () => {
    const html = renderToStaticMarkup(
      <Button href="/book" variant="ink">
        Book Me
      </Button>,
    )
    expect(html).toMatch(/^<a [^>]*href="\/book"/)
    expect(html).not.toContain('<button')
    expect(html).not.toContain('disabled')
  })

  it('passes aria-current to a link only when given', () => {
    const current = renderToStaticMarkup(
      <Button aria-current="page" href="/book" variant="outline-light">
        Book Me
      </Button>,
    )
    expect(current).toMatch(/^<a [^>]*aria-current="page"/)
    const plain = renderToStaticMarkup(
      <Button href="/book" variant="ink">
        Book Me
      </Button>,
    )
    expect(plain).not.toContain('aria-current')
  })

  it('renders a type="button" button without an href', () => {
    const html = renderToStaticMarkup(<Button variant="gold">Send</Button>)
    expect(html).toMatch(/^<button [^>]*type="button"/)
  })

  it('only disables real buttons', () => {
    const html = renderToStaticMarkup(
      <Button disabled type="submit" variant="outline-ink">
        Send
      </Button>,
    )
    expect(html).toMatch(/^<button [^>]*disabled=""/)
    expect(html).toContain('type="submit"')
  })

  it('hides the trailing arrow from screen readers', () => {
    const html = renderToStaticMarkup(
      <Button href="/portfolio" trailingArrow variant="text">
        Browse the portfolio
      </Button>,
    )
    expect(html).toContain('Browse the portfolio<span aria-hidden="true"> →</span>')
  })
})
