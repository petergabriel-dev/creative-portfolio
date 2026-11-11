import { copy } from '@/copy'
import type { Inquiry } from '@/payload-types'

/** The fields a visitor sends; nothing else from the form is ever stored. */
export type InquiryValues = { name: string; email: string; projectType: string; timing: string; message: string }

/** Fields with a Build Spec error message (timing and the honeypot have none). */
export type InquiryErrorField = keyof typeof copy.book.form.errors
export type InquiryErrors = Partial<Record<InquiryErrorField, string>>

/** The `submitInquiry` result, shared by the server action and InquiryForm. */
export type InquiryFormState =
  | { status: 'idle' }
  | { status: 'invalid'; errors: InquiryErrors; values: InquiryValues }
  | { status: 'failed'; values: InquiryValues }
  | { status: 'sent' }

export type InquiryValidation =
  | { kind: 'spam' }
  | { kind: 'invalid'; errors: InquiryErrors; values: InquiryValues }
  | { kind: 'valid'; data: InquiryValues }

/** A form sent sooner than this after it appeared is treated as spam (P3 owner decision 6). */
export const MIN_ELAPSED_MS = 3000
export const NAME_MAX = 120
export const TIMING_MAX = 120
export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 5000
const EMAIL_MAX = 254

// ponytail: a copy of Payload 3.93's email field pattern (payload/dist/fields/validations.js, `email`),
// so the action rejects exactly what Payload would. If Payload's pattern changes, its ValidationError
// on create is still shown as the email message by submitInquiry; re-copy it on Payload upgrades.
const EMAIL_PATTERN =
  /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i

const field = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/** The project-type options: discipline names in Portfolio order, then "Something else". */
export function projectTypeOptions(disciplineNames: (string | null | undefined)[]): string[] {
  const names = disciplineNames.map((name) => name?.trim() ?? '').filter(Boolean)
  return [...names, copy.book.form.somethingElse]
}

/**
 * Server-side checks for a Book Me submission (Build Spec "Book Me & inquiries flow").
 * A filled honeypot is spam whatever else was sent. Field errors come next, so a person who sends
 * an empty form straight away sees what's missing rather than a false "thank you". Only input that
 * would be saved meets the timing rule: `elapsedMs` under 3 seconds is spam, and a missing or
 * malformed value (no JavaScript) skips the rule.
 */
export function validateInquiry(formData: FormData, options: readonly string[]): InquiryValidation {
  if (field(formData, 'website') !== '') return { kind: 'spam' }

  const values: InquiryValues = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    projectType: field(formData, 'projectType'),
    // ponytail: timing has no error message in the Build Spec and the input caps it at 120, so a
    // longer value (only possible without the browser) is cut to 120 rather than rejected.
    timing: field(formData, 'timing').slice(0, TIMING_MAX).replace(/[\uD800-\uDBFF]$/, ''),
    message: field(formData, 'message'),
  }

  const messages = copy.book.form.errors
  const errors: InquiryErrors = {}
  if (values.name.length < 1 || values.name.length > NAME_MAX) errors.name = messages.name
  if (values.email.length > EMAIL_MAX || !EMAIL_PATTERN.test(values.email)) errors.email = messages.email
  if (!options.includes(values.projectType)) errors.projectType = messages.projectType
  if (values.message.length < MESSAGE_MIN || values.message.length > MESSAGE_MAX) errors.message = messages.message

  if (Object.keys(errors).length > 0) return { kind: 'invalid', errors, values }

  const elapsed = field(formData, 'elapsedMs')
  if (/^\d+$/.test(elapsed) && Number(elapsed) < MIN_ELAPSED_MS) return { kind: 'spam' }
  return { kind: 'valid', data: values }
}

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
