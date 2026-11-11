import type { Payload, TypedUser } from 'payload'
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
// Payload's client nav shell: plain wrappers, so the markup is ours alone.
vi.mock('@payloadcms/next/client', () => ({
  NavWrapper: ({ children }: { children: ReactNode }) => <aside className="nav">{children}</aside>,
  NavHamburger: () => <button type="button">Close</button>,
}))
vi.mock('@/lib/getSiteSettings', () => ({ getSiteSettings: vi.fn(async () => ({ name: 'Your Name' })) }))
vi.mock('@/lib/studio', () => ({ newInquiryCount: vi.fn(async () => 3) }))

import { StudioBrand } from '@/components/studio/StudioBrand'
import { STUDIO_NAV_GROUPS, StudioNav, StudioNavView, currentStudioHref } from '@/components/studio/StudioNav'
import { newInquiryCount } from '@/lib/studio'

const view = (props: Partial<Parameters<typeof StudioNavView>[0]> = {}) =>
  renderToStaticMarkup(
    <StudioNavView current={null} newInquiries={0} siteName="Your Name" userName="Your Name" {...props} />,
  )

describe('StudioNavView', () => {
  it('lists Overview then the Build Spec groups in order, with their links', () => {
    const html = view()
    const hrefs = [...html.matchAll(/<a[^>]*href="(\/admin[^"]*)"/g)].map((m) => m[1])
    expect(hrefs).toEqual([
      '/admin',
      '/admin/collections/projects',
      '/admin/collections/disciplines',
      '/admin/collections/posts',
      '/admin/collections/categories',
      '/admin/collections/inquiries',
      '/admin/collections/media',
      '/admin/globals/site-settings',
      '/admin/globals/home',
      '/admin/globals/about',
      '/admin/collections/users',
      '/admin/logout',
    ])
    expect(STUDIO_NAV_GROUPS.map((g) => g.label)).toEqual([
      'Portfolio',
      'Journal',
      'Inbox',
      'Library',
      'Settings',
      'Admin',
    ])
    expect(html).toContain('<nav aria-label="Studio"')
  })

  it('names each group list by its visible label', () => {
    const html = view()
    expect(html).toMatch(/<p[^>]*id="studio-nav-inbox"[^>]*>Inbox<\/p><ul aria-labelledby="studio-nav-inbox"/)
  })

  it('hides the badge at 0 and names the link "Inquiries, 3 new" at 3', () => {
    expect(view({ newInquiries: 0 })).not.toContain('new</span>')
    const html = view({ newInquiries: 3 })
    const link = html.match(/<a[^>]*href="\/admin\/collections\/inquiries"[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? ''
    expect(link.replace(/<[^>]+>/g, '')).toBe('Inquiries, 3 new')
  })

  it('marks exactly the current link', () => {
    const html = view({ current: '/admin/globals/home' })
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
    expect(html).toMatch(/<a href="\/admin\/globals\/home" aria-current="page"/)
  })

  it('has the footer: new-tab site link, signed-in name and log out', () => {
    const html = view({ userName: 'Kai' })
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*rel="noopener"[^>]*target="_blank"/)
    expect(html).toContain('(opens in a new tab)')
    expect(html).toContain('Signed in as Kai')
    expect(html).toMatch(/<a[^>]*href="\/admin\/logout"[^>]*>Log out<\/a>/)
  })
})

describe('currentStudioHref', () => {
  it('is Overview only on /admin itself', () => {
    expect(currentStudioHref([])).toBe('/admin')
    expect(currentStudioHref(undefined)).toBe('/admin')
    expect(currentStudioHref(['account'])).toBeNull()
  })

  it('matches a collection or global on its list, create view and documents', () => {
    expect(currentStudioHref(['collections', 'projects'])).toBe('/admin/collections/projects')
    expect(currentStudioHref(['collections', 'projects', 'create'])).toBe('/admin/collections/projects')
    expect(currentStudioHref(['collections', 'inquiries', '12'])).toBe('/admin/collections/inquiries')
    expect(currentStudioHref(['globals', 'site-settings'])).toBe('/admin/globals/site-settings')
    // A prefix that is not a path segment does not match.
    expect(currentStudioHref(['collections', 'postsx'])).toBeNull()
  })
})

describe('StudioBrand', () => {
  it('shows the name and the Studio label; a blank name falls back', () => {
    expect(renderToStaticMarkup(<StudioBrand name="Your Name" variant="full" />)).toMatch(/Your Name[\s\S]*Studio · CMS/)
    expect(renderToStaticMarkup(<StudioBrand name="  " variant="full" />)).toContain('>Portfolio<')
  })

  it('gives the icon a hidden name for the link that wraps it', () => {
    const html = renderToStaticMarkup(<StudioBrand variant="icon" />)
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('>Studio<')
  })
})

describe('StudioNav', () => {
  it('counts new inquiries as the user and marks the current route', async () => {
    const user = { id: 7, email: 'editor@example.com', name: 'Your Name' } as unknown as TypedUser
    const payload = {} as Payload
    const html = renderToStaticMarkup(
      await StudioNav({ payload, user, params: { segments: ['collections', 'inquiries'] } }),
    )
    expect(newInquiryCount).toHaveBeenCalledWith({ payload, user })
    expect(html).toMatch(/<a href="\/admin\/collections\/inquiries" aria-current="page"/)
    expect(html).toContain('Signed in as Your Name')
  })
})
