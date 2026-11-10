import { copy } from '@/copy'

/** Primary site sections, in header and footer order. */
export const NAV_ITEMS = [
  { key: 'home', href: '/', label: copy.nav.home },
  { key: 'portfolio', href: '/portfolio', label: copy.nav.portfolio },
  { key: 'about', href: '/about', label: copy.nav.about },
  { key: 'journal', href: '/journal', label: copy.nav.journal },
] as const

export type NavKey = (typeof NAV_ITEMS)[number]['key']

export const BOOK_HREF = '/book'
