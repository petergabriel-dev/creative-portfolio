/**
 * Inbox seed data (P3): four placeholder inquiries, two `new`, one `replied` and one `archived`.
 * Safe to run twice: each is found by its email and only created when missing; existing docs are
 * never changed. Seeding writes straight through the Local API, so it never sends an alert email
 * (alerts come only from the submitInquiry server action).
 */
import type { Payload } from 'payload'

import type { Inquiry } from '@/payload-types'

import type { Log } from './portfolio'

/** Seeds and scripts run outside a Next.js request, where revalidatePath cannot work. */
const context = { disableRevalidate: true }

type InquirySeed = Pick<Inquiry, 'name' | 'email' | 'projectType' | 'timing' | 'message' | 'status' | 'notes'>

const MESSAGE = '[A few sentences about the project: what it is for, who it is for, and how it should feel.]'

const INQUIRIES: InquirySeed[] = [
  {
    name: '[Client name 1]',
    email: 'client-1@example.com',
    projectType: 'Photography',
    timing: '[A date next spring]',
    message: MESSAGE,
    status: 'new',
  },
  {
    name: '[Client name 2]',
    email: 'client-2@example.com',
    projectType: 'Film & Video',
    timing: '',
    message: MESSAGE,
    status: 'new',
  },
  {
    name: '[Client name 3]',
    email: 'client-3@example.com',
    projectType: 'Design & Illustration',
    timing: '[Not sure yet]',
    message: MESSAGE,
    status: 'replied',
    notes: '[Replied with availability and a rough quote.]',
  },
  {
    name: '[Client name 4]',
    email: 'client-4@example.com',
    projectType: 'Something else',
    timing: '',
    message: MESSAGE,
    status: 'archived',
    notes: '[Not a fit; pointed them to a colleague.]',
  },
]

export async function seedInquiries(payload: Payload) {
  const log: Log = (message) => payload.logger.info(`Seed: ${message}`)

  for (const seed of INQUIRIES) {
    const existing = await payload.find({
      collection: 'inquiries',
      where: { email: { equals: seed.email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      log(`inquiry from ${seed.email} already exists, left unchanged`)
      continue
    }
    // Create access is denied to everyone; the guarded seed writes with overrideAccess (invariant 2).
    await payload.create({ collection: 'inquiries', data: seed, context, overrideAccess: true })
    log(`created ${seed.status} inquiry from ${seed.email}`)
  }
}
