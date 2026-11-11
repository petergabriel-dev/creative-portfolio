import type { Access, AccessArgs } from 'payload'
import { describe, expect, it } from 'vitest'

import { Inquiries } from '@/collections/Inquiries'

const args = (user: unknown) => ({ req: { user } }) as unknown as AccessArgs
const editor = { id: 1, email: 'editor@example.com', collection: 'users' }
const run = (access: Access | undefined, user: unknown) => (access ? access(args(user)) : undefined)

/** The props these tests read; Payload's Field union doesn't expose them on every member. */
type FieldShape = {
  name: string
  type: string
  admin?: { readOnly?: boolean; position?: string }
  options?: { value: string }[]
  validate?: unknown
}

const field = (name: string) =>
  Inquiries.fields.find((f) => 'name' in f && f.name === name) as FieldShape | undefined

describe('inquiries access', () => {
  it('denies create to everyone, the editor included', () => {
    expect(run(Inquiries.access?.create, null)).toBe(false)
    expect(run(Inquiries.access?.create, editor)).toBe(false)
  })

  it('denies anonymous read, update and delete', () => {
    for (const op of ['read', 'update', 'delete'] as const) {
      expect(run(Inquiries.access?.[op], null)).toBe(false)
    }
  })

  it('allows the editor to read, update and delete', () => {
    for (const op of ['read', 'update', 'delete'] as const) {
      expect(run(Inquiries.access?.[op], editor)).toBe(true)
    }
  })
})

describe('inquiries config', () => {
  it('sits in the Inbox group, newest first, with the Build Spec list columns', () => {
    expect(Inquiries.admin?.group).toBe('Inbox')
    expect(Inquiries.admin?.useAsTitle).toBe('name')
    expect(Inquiries.admin?.defaultColumns).toEqual(['name', 'projectType', 'status', 'createdAt'])
    expect(Inquiries.defaultSort).toBe('-createdAt')
    expect(Inquiries.disableDuplicate).toBe(true)
  })

  it('has no drafts or versions', () => {
    expect(Inquiries.versions).toBeUndefined()
  })

  it('stores only the form fields, status, notes and the received time', () => {
    const names = Inquiries.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toEqual(['name', 'email', 'projectType', 'timing', 'message', 'status', 'notes', 'createdAt'])
  })

  it('keeps what the visitor sent read-only in the Studio', () => {
    for (const name of ['name', 'email', 'projectType', 'timing', 'message']) {
      expect(field(name)?.admin?.readOnly, name).toBe(true)
    }
    expect(field('status')?.admin?.readOnly).toBeUndefined()
    expect(field('notes')?.admin?.readOnly).toBeUndefined()
  })

  it('stores projectType as text, not a fixed select', () => {
    expect(field('projectType')?.type).toBe('text')
  })

  it('sets the Build Spec length limits', () => {
    expect(field('name')).toMatchObject({ required: true, maxLength: 120 })
    expect(field('timing')).toMatchObject({ maxLength: 120 })
    expect(field('message')).toMatchObject({ required: true, minLength: 20, maxLength: 5000 })
    expect(field('email')).toMatchObject({ type: 'email', required: true })
  })

  it('offers new, replied and archived, defaulting to new, with no transition rule', () => {
    const status = field('status')
    expect(status).toMatchObject({ type: 'select', required: true, defaultValue: 'new' })
    expect(status?.options?.map((o) => o.value)).toEqual(['new', 'replied', 'archived'])
    expect(status?.validate).toBeUndefined()
  })

  it('labels createdAt "Received" in the sidebar, read-only', () => {
    expect(field('createdAt')).toMatchObject({
      type: 'date',
      label: 'Received',
      admin: { position: 'sidebar', readOnly: true },
    })
  })
})
