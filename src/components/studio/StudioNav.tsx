import { NavHamburger, NavWrapper } from '@payloadcms/next/client'
import Link from 'next/link'
import type { Payload, TypedUser } from 'payload'

import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { newInquiryCount } from '@/lib/studio'

import { StudioBrand } from './StudioBrand'
import styles from './StudioNav.module.css'

const t = copy.studio.nav
const OVERVIEW_HREF = '/admin'

type NavLink = { label: string; href: string; badge?: boolean }
type NavGroup = { id: string; label: string; links: NavLink[] }

/** Group order from the Build Spec (capture 42 leaves out Admin; the Build Spec wins). */
export const STUDIO_NAV_GROUPS: NavGroup[] = [
  {
    id: 'portfolio',
    label: t.portfolio,
    links: [
      { label: t.projects, href: '/admin/collections/projects' },
      { label: t.collections, href: '/admin/collections/disciplines' },
    ],
  },
  {
    id: 'journal',
    label: t.journal,
    links: [
      { label: t.posts, href: '/admin/collections/posts' },
      { label: t.categories, href: '/admin/collections/categories' },
    ],
  },
  { id: 'inbox', label: t.inbox, links: [{ label: t.inquiries, href: '/admin/collections/inquiries', badge: true }] },
  { id: 'library', label: t.library, links: [{ label: t.media, href: '/admin/collections/media' }] },
  {
    id: 'settings',
    label: t.settings,
    links: [
      { label: t.siteSettings, href: '/admin/globals/site-settings' },
      { label: t.homePage, href: '/admin/globals/home' },
      { label: t.aboutPage, href: '/admin/globals/about' },
    ],
  },
  { id: 'admin', label: t.admin, links: [{ label: t.users, href: '/admin/collections/users' }] },
]

/**
 * The href of the current sidebar link for an admin route, or null. Overview is current only on
 * `/admin`; a collection or global is current on its list, create view and documents.
 */
export function currentStudioHref(segments: readonly string[] | undefined): string | null {
  if (!segments || segments.length === 0) return OVERVIEW_HREF
  const path = `${OVERVIEW_HREF}/${segments.join('/')}`
  for (const group of STUDIO_NAV_GROUPS) {
    for (const link of group.links) {
      if (path === link.href || path.startsWith(`${link.href}/`)) return link.href
    }
  }
  return null
}

type StudioNavViewProps = {
  siteName: string | null | undefined
  userName: string
  newInquiries: number
  current: string | null
}

function NavItem({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      aria-current={current ? 'page' : undefined}
      className={[styles.link, current && styles.current].filter(Boolean).join(' ')}
      href={href}
    >
      {children}
    </Link>
  )
}

/** The sidebar's content; a pure view so every state renders in tests. */
export function StudioNavView({ siteName, userName, newInquiries, current }: StudioNavViewProps) {
  return (
    <nav aria-label={t.ariaLabel} className={`nav__wrap ${styles.nav}`}>
      <div className={styles.brand}>
        <StudioBrand name={siteName} tone="dark" variant="full" />
      </div>
      <NavItem current={current === OVERVIEW_HREF} href={OVERVIEW_HREF}>
        <svg aria-hidden="true" className={styles.icon} fill="none" focusable="false" stroke="currentColor" viewBox="0 0 20 20">
          <rect height="7" width="7" x="2.5" y="2.5" />
          <rect height="7" width="7" x="10.5" y="2.5" />
          <rect height="7" width="7" x="2.5" y="10.5" />
          <rect height="7" width="7" x="10.5" y="10.5" />
        </svg>
        {t.overview}
      </NavItem>
      {STUDIO_NAV_GROUPS.map((group) => (
        <div className={styles.group} key={group.id}>
          <p className={styles.groupLabel} id={`studio-nav-${group.id}`}>
            {group.label}
          </p>
          <ul aria-labelledby={`studio-nav-${group.id}`} className={styles.list}>
            {group.links.map((link) => (
              <li key={link.href}>
                <NavItem current={current === link.href} href={link.href}>
                  {link.label}
                  {link.badge && newInquiries > 0 ? (
                    <span className={styles.badge}>
                      <span className={styles.visuallyHidden}>, </span>
                      {t.newCount(newInquiries)}
                    </span>
                  ) : null}
                </NavItem>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className={styles.footer}>
        <a className={styles.footerLink} href="/" rel="noopener" target="_blank">
          {t.viewSite} <span aria-hidden="true">{t.viewSiteArrow}</span>
          <span className={styles.visuallyHidden}> {t.newTab}</span>
        </a>
        <p className={styles.signedIn}>{t.signedInAs(userName)}</p>
        <Link className={styles.footerLink} href="/admin/logout">
          {t.logOut}
        </Link>
      </div>
    </nav>
  )
}

type StudioNavProps = {
  payload: Payload
  user: TypedUser | null
  params?: { segments?: string[] }
}

/** `admin.components.Nav`: Payload's drawer shell (NavWrapper, NavHamburger) around our sidebar. */
export async function StudioNav({ payload, user, params }: StudioNavProps) {
  const [settings, newInquiries] = await Promise.all([
    getSiteSettings(),
    user ? newInquiryCount({ payload, user }) : Promise.resolve(0),
  ])
  const userName = (typeof user?.name === 'string' && user.name.trim()) || user?.email || ''
  return (
    <NavWrapper baseClass="nav">
      <StudioNavView
        current={currentStudioHref(params?.segments)}
        newInquiries={newInquiries}
        siteName={settings.name}
        userName={userName}
      />
      <div className="nav__header">
        <div className="nav__header-content">
          <NavHamburger baseClass="nav" />
        </div>
      </div>
    </NavWrapper>
  )
}
