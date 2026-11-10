import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ChapterOpener } from '@/components/site/ChapterOpener'

describe('ChapterOpener', () => {
  it('renders one h1, a decorative rule and the header before the content', () => {
    const html = renderToStaticMarkup(
      <ChapterOpener contextLine="404 · Page not found" header={<header>H</header>} title="Nothing here" />,
    )
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toMatch(/<span aria-hidden="true"[^>]*><\/span>/)
    expect(html.indexOf('<header>')).toBeLessThan(html.indexOf('<h1'))
  })

  it('omits lead, actions and an empty context line', () => {
    const html = renderToStaticMarkup(<ChapterOpener contextLine="" header={null} title="Title" />)
    expect(html.match(/<p/g)).toBeNull()
  })

  it('uses <main> for the content block when asked, keeping the header outside it', () => {
    const html = renderToStaticMarkup(
      <ChapterOpener as="main" contextLine="x" header={<header>H</header>} title="T" />,
    )
    expect(html).toMatch(/<\/header><main /)
    expect(html).not.toMatch(/<main[^>]*>.*<header>/)
  })
})
