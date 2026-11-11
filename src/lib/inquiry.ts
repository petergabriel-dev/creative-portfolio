import { copy } from '@/copy'
import type { Inquiry } from '@/payload-types'

/** What `payload.sendEmail` needs for the owner's inquiry alert (P3 owner decisions 9 and 10). */
export type InquiryAlert = { to: string; replyTo: string; subject: string; text: string }

type AlertInquiry = Pick<Inquiry, 'id' | 'name' | 'email' | 'projectType' | 'timing' | 'message'>

/** Collapses control characters (CR, LF, tabs…) and runs of spaces, so visitor text stays on one line. */
const oneLine = (value: string) =>
  value
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * The plain-text alert sent to `site-settings.contactEmail`. Replying goes to the visitor. The
 * subject and single-line fields never carry line breaks from visitor input.
 */
export function buildInquiryAlert(inquiry: AlertInquiry, contactEmail: string, baseUrl: string): InquiryAlert {
  const text = copy.book.alert
  const name = oneLine(inquiry.name)
  const projectType = oneLine(inquiry.projectType)
  const timing = oneLine(inquiry.timing ?? '') || text.noTiming
  const body = [
    text.intro(name),
    '',
    `${text.name}: ${name}`,
    `${text.email}: ${oneLine(inquiry.email)}`,
    `${text.projectType}: ${projectType}`,
    `${text.timing}: ${timing}`,
    '',
    `${text.message}:`,
    inquiry.message.replace(/\r\n?/g, '\n'),
    '',
    `${text.open}: ${baseUrl}/admin/collections/inquiries/${inquiry.id}`,
  ].join('\n')
  return { to: contactEmail, replyTo: inquiry.email, subject: text.subject(projectType, name), text: body }
}

/**
 * Absolute base URL for links in emails: `NEXT_PUBLIC_SERVER_URL` when set (P7, the domain), else
 * the Vercel branch or deployment URL on previews, else local dev.
 */
export function adminBaseUrl(env: Partial<Record<string, string>> = process.env): string {
  const explicit = env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')
  const vercelHost = env.VERCEL_BRANCH_URL?.trim() || env.VERCEL_URL?.trim()
  if (vercelHost) return `https://${vercelHost}`
  return 'http://localhost:3000'
}
