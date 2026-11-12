import { copy } from '@/copy'
import { isEmail } from '@/lib/inquiry'

/**
 * Pure helpers for the Studio inbox (docs/design/components/StudioInbox.md, P6 owner decisions 3–7):
 * URL parsing and building, excerpts and the reply link. No Payload or Next imports, so the view,
 * the status action and tests share them.
 */

export const INQUIRY_STATUSES = ['new', 'replied', 'archived'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const INBOX_PATH = '/admin/collections/inquiries'
/** Owner decision 6: 20 per page, Newer / Older. */
export const INBOX_PAGE_SIZE = 20
export const EXCERPT_MAX = 140

export type InboxQuery = { status: InquiryStatus; page: number; id: number | null }

type SearchParams = Record<string, string | string[] | undefined>

export const isInquiryStatus = (value: unknown): value is InquiryStatus =>
  typeof value === 'string' && (INQUIRY_STATUSES as readonly string[]).includes(value)

/** Digits only, no sign, no leading zero, at most nine digits (Postgres ids and page numbers). */
export function parsePositiveInt(value: unknown): number | null {
  return typeof value === 'string' && /^[1-9]\d{0,8}$/.test(value) ? Number(value) : null
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/** The tab, page and selected inquiry from the URL; anything invalid falls back to the default. */
export function parseInboxQuery(searchParams: SearchParams | undefined): InboxQuery {
  const status = first(searchParams?.status)
  return {
    status: isInquiryStatus(status) ? status : 'new',
    page: parsePositiveInt(first(searchParams?.page)) ?? 1,
    id: parsePositiveInt(first(searchParams?.id)),
  }
}

/** Every inbox link is built here, so a link or a redirect can only ever point at the inbox. */
export function inboxHref({ status, page = 1, id = null }: { status: InquiryStatus; page?: number; id?: number | null }) {
  const params = new URLSearchParams({ status })
  if (page > 1) params.set('page', String(page))
  if (id !== null) params.set('id', String(id))
  return `${INBOX_PATH}?${params.toString()}`
}

/** One line of the message for a list card: whitespace collapsed, at most `max` characters. */
export function excerpt(text: string, max = EXCERPT_MAX): string {
  // Counted in code points, so an emoji is never cut in half.
  const chars = Array.from(text.replace(/\s+/g, ' ').trim())
  if (chars.length <= max) return chars.join('')
  const { ellipsis } = copy.studio.inbox
  return `${chars.slice(0, max - Array.from(ellipsis).length).join('').trimEnd()}${ellipsis}`
}

/** The inquiry to select after `id` leaves the tab: the next card, else the previous one, else none. */
export function nextSelection(ids: number[], id: number): number | null {
  const index = ids.indexOf(id)
  if (index === -1) return ids[0] ?? null
  return ids[index + 1] ?? ids[index - 1] ?? null
}

/**
 * "Reply by email": a mailto link only for an address Payload's email field accepts. The local part
 * may legally hold `?`, `&` or `=`, which a mail client would read as headers (`a?bcc=x@…`), so it is
 * percent-encoded (RFC 6068); the domain is letters, digits, dots and hyphens only.
 */
export function replyHref(email: string): string | null {
  const address = email.trim()
  if (!isEmail(address)) return null
  const at = address.lastIndexOf('@')
  return `mailto:${encodeURIComponent(address.slice(0, at))}@${address.slice(at + 1)}`
}
