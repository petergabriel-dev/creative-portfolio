import { copy } from '@/copy'

/** Every date on the site is shown in this time zone (P2 owner decision 5). */
export const SITE_TIME_ZONE = 'Asia/Singapore'

const numericParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: SITE_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

/** Day, month (1–12) and year of an ISO timestamp in the site time zone; null when unusable. */
function siteDateParts(iso: unknown): { day: number; month: number; year: number } | null {
  if (typeof iso !== 'string' || iso === '') return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const parts = Object.fromEntries(numericParts.formatToParts(date).map(({ type, value }) => [type, value]))
  return { day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) }
}

/**
 * "6 Nov 2026" in Singapore time, or '' for a missing or invalid date. Intl supplies the calendar
 * parts; month names come from copy.ts, because en-GB's short September is "Sept".
 */
export function formatDate(iso: unknown): string {
  const parts = siteDateParts(iso)
  return parts ? `${parts.day} ${copy.months[parts.month - 1]} ${parts.year}` : ''
}

/** "2026-11-06" in Singapore time, for `<time dateTime>`; '' when unusable. */
export function isoDate(iso: unknown): string {
  const parts = siteDateParts(iso)
  if (!parts) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}
