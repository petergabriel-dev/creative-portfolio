'use server'

import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { copy } from '@/copy'
import { inboxHref, type InquiryStatus, isInquiryStatus, parsePositiveInt } from '@/lib/studioInbox'

export type InboxActionState =
  | { ok: true; notice: string; href: string; at: number }
  | { ok: false; error: keyof typeof copy.studio.inbox.errors; at: number }
  | null

const value = (formData: FormData, key: string) => {
  const entry = formData.get(key)
  return typeof entry === 'string' ? entry : null
}

/**
 * The inbox's status buttons (P6 owner decisions 3 and 4). A server action is a public endpoint, so
 * everything is checked here: every value is parsed against an allowlist before any database call,
 * the editor comes from the session cookie (`payload.auth`), and the write runs as that editor
 * through the inquiries access rules (`overrideAccess: false`, invariants 2, 24, 28). Only `status`
 * is written. It returns the inbox URL to show next (always built by `inboxHref`, so never another
 * site) instead of redirecting, so the client keeps the notice and moves focus. Logs carry the
 * inquiry id and the error's name only (invariant 26).
 */
export async function setInquiryStatus(_previous: InboxActionState, formData: FormData): Promise<InboxActionState> {
  const at = Date.now()
  const id = parsePositiveInt(value(formData, 'id'))
  const status = value(formData, 'status')
  const tab = value(formData, 'tab')
  const page = parsePositiveInt(value(formData, 'page') ?? '1')
  const nextRaw = value(formData, 'next') ?? ''
  const next = nextRaw === '' ? null : parsePositiveInt(nextRaw)
  if (id === null || !isInquiryStatus(status) || !isInquiryStatus(tab) || page === null || (nextRaw !== '' && next === null)) {
    return { ok: false, error: 'failed', at }
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return { ok: false, error: 'signedOut', at }

  try {
    await payload.update({
      collection: 'inquiries',
      id,
      data: { status: status satisfies InquiryStatus },
      depth: 0,
      overrideAccess: false,
      user,
    })
  } catch (error) {
    payload.logger.error(`Inquiry ${id} status change failed (${error instanceof Error ? error.name : 'Error'})`)
    return { ok: false, error: 'failed', at }
  }

  return { ok: true, notice: copy.studio.inbox.notices[status], href: inboxHref({ status: tab, page, id: next }), at }
}
