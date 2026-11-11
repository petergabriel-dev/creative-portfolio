'use server'

import config from '@payload-config'
import { getPayload, type Payload, ValidationError } from 'payload'

import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import {
  adminBaseUrl,
  buildInquiryAlert,
  type InquiryErrors,
  type InquiryFormState,
  type InquiryValues,
  projectTypeOptions,
  validateInquiry,
} from '@/lib/inquiry'
import { getDisciplines } from '@/lib/portfolio'

/** The alert never holds up the visitor for longer than this (the adapter's fetch has no timeout). */
const ALERT_TIMEOUT_MS = 5000

/**
 * The Book Me form's server action (Build Spec "Book Me & inquiries flow", P3 owner decisions).
 *
 * - Spam and valid submissions both answer `sent`, so bots learn nothing; spam saves nothing.
 * - Valid input is saved first, with `overrideAccess: true` because create access is denied to
 *   everyone (invariant 2: the only request-time writer that bypasses access). Only the five form
 *   fields and `status: 'new'` are written: no IP address, user agent or other form keys.
 * - The owner alert is sent only after the save has committed, so an email failure can never undo
 *   it. Failures are logged with the inquiry ID only and never retried.
 * - A failed save never answers `sent`: the visitor keeps their text and sees the failed state.
 */
export async function submitInquiry(_previous: InquiryFormState, formData: FormData): Promise<InquiryFormState> {
  const disciplines = await getDisciplines()
  const result = validateInquiry(
    formData,
    projectTypeOptions(disciplines.map((discipline) => discipline.name)),
  )
  if (result.kind === 'spam') return { status: 'sent' }
  if (result.kind === 'invalid') return { status: 'invalid', errors: result.errors, values: result.values }

  const payload = await getPayload({ config })
  let id: number
  try {
    const doc = await payload.create({
      collection: 'inquiries',
      data: { ...result.data, status: 'new' },
      overrideAccess: true,
    })
    id = doc.id
  } catch (error) {
    const errors = fieldErrors(error)
    if (errors) return { status: 'invalid', errors, values: result.data }
    payload.logger.error(`Inquiry not saved (${describeError(error)})`)
    return { status: 'failed', values: result.data }
  }

  await sendAlert(payload, id, result.data)
  return { status: 'sent' }
}

async function sendAlert(payload: Payload, id: number, data: InquiryValues) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const settings = await getSiteSettings()
    const to = settings.contactEmail?.trim()
    if (!to) {
      payload.logger.warn(`Inquiry ${id}: no contact email in site settings, alert not sent`)
      return
    }
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(Object.assign(new Error('Alert timed out'), { name: 'TimeoutError' })),
        ALERT_TIMEOUT_MS,
      )
    })
    await Promise.race([payload.sendEmail(buildInquiryAlert({ id, ...data }, to, adminBaseUrl())), timeout])
  } catch (error) {
    // Never the error message: Resend's can echo the addresses it was given.
    payload.logger.error(`Inquiry ${id}: alert email failed (${describeError(error)})`)
  } finally {
    clearTimeout(timer)
  }
}

/** Payload's own field validation, shown with the Build Spec messages; null if it isn't one. */
function fieldErrors(error: unknown): InquiryErrors | null {
  if (!(error instanceof ValidationError)) return null
  const messages = copy.book.form.errors
  const errors: InquiryErrors = {}
  for (const { path } of error.data.errors) {
    if (path in messages) errors[path as keyof typeof messages] = messages[path as keyof typeof messages]
  }
  return Object.keys(errors).length > 0 ? errors : null
}

/** Error name and HTTP status only: never a message, which may contain visitor data. */
function describeError(error: unknown): string {
  const { name, status } = (error ?? {}) as { name?: unknown; status?: unknown }
  return [typeof name === 'string' ? name : 'Error', typeof status === 'number' ? status : null]
    .filter((part) => part !== null)
    .join('/')
}
