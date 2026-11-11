import type { AccessArgs } from 'payload'
import { describe, expect, it } from 'vitest'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { Categories } from '@/collections/Categories'
import { Posts } from '@/collections/Posts'

const args = (user: unknown) => ({ req: { user } }) as unknown as AccessArgs

describe('access helpers', () => {
  it('authenticated denies anonymous requests', () => {
    expect(authenticated(args(null))).toBe(false)
    expect(authenticated(args(undefined))).toBe(false)
  })

  it('authenticated allows a logged-in user', () => {
    expect(authenticated(args({ id: 1, email: 'editor@example.com', collection: 'users' }))).toBe(
      true,
    )
  })

  it('anyone allows anonymous requests', () => {
    expect(anyone(args(null))).toBe(true)
  })
})

describe('publishedOnly', () => {
  it('limits anonymous readers to published documents', () => {
    expect(publishedOnly(args(null))).toEqual({ _status: { equals: 'published' } })
    expect(publishedOnly(args(undefined))).toEqual({ _status: { equals: 'published' } })
  })

  it('lets a logged-in editor read drafts too', () => {
    expect(publishedOnly(args({ id: 1, email: 'editor@example.com', collection: 'users' }))).toBe(
      true,
    )
  })
})

describe('journal collection access (P2)', () => {
  it('posts are published-only for anonymous readers; writes need an editor', () => {
    expect(Posts.access).toEqual({
      read: publishedOnly,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
    })
    expect(Posts.versions).toEqual({ drafts: { autosave: true } })
  })

  it('categories are public to read; writes need an editor', () => {
    expect(Categories.access).toEqual({
      read: anyone,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
    })
  })
})
