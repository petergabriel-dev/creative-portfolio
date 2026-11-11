import type { AccessArgs } from 'payload'
import { describe, expect, it } from 'vitest'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { Categories } from '@/collections/Categories'
import { Disciplines } from '@/collections/Disciplines'
import { Inquiries } from '@/collections/Inquiries'
import { Media } from '@/collections/Media'
import { Posts } from '@/collections/Posts'
import { Projects } from '@/collections/Projects'
import { Users } from '@/collections/Users'
import { About } from '@/globals/About'
import { Home } from '@/globals/Home'
import { SiteSettings } from '@/globals/SiteSettings'

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

/**
 * The Build Spec access table ("Access control & auth"), row by row, for a visitor and for the
 * logged-in editor (P4 closes box 2.2). `published` is the Where a visitor gets for drafts-enabled
 * content; site-settings has no drafts, so it is plainly public.
 */
describe('Build Spec access table (P4)', () => {
  const editor = { id: 1, email: 'editor@example.com', collection: 'users' }
  const published = { _status: { equals: 'published' } }
  type Ops = Record<string, unknown>

  const collections: [string, { access?: Record<string, unknown> }, Ops, Ops][] = [
    // name, config, visitor, editor
    ['users', Users, { read: false, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    ['media', Media, { read: true, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    ['disciplines', Disciplines, { read: true, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    ['categories', Categories, { read: true, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    ['projects', Projects, { read: published, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    ['posts', Posts, { read: published, create: false, update: false, delete: false }, { read: true, create: true, update: true, delete: true }],
    // Only the submitInquiry server action creates inquiries (invariant 24), not even the editor.
    ['inquiries', Inquiries, { read: false, create: false, update: false, delete: false }, { read: true, create: false, update: true, delete: true }],
  ]

  const globals: [string, { access?: Record<string, unknown> }, Ops, Ops][] = [
    ['site-settings', SiteSettings, { read: true, update: false }, { read: true, update: true }],
    ['home', Home, { read: published, update: false }, { read: true, update: true }],
    ['about', About, { read: published, update: false }, { read: true, update: true }],
  ]

  const evaluate = (config: { access?: Record<string, unknown> }, user: unknown) =>
    Object.fromEntries(
      Object.entries(config.access ?? {}).map(([op, fn]) => [op, (fn as (a: AccessArgs) => unknown)(args(user))]),
    )

  it.each(collections)('%s matches the table for a visitor and for the editor', (_name, config, visitor, editorOps) => {
    expect(evaluate(config, null)).toEqual(visitor)
    expect(evaluate(config, editor)).toEqual(editorOps)
  })

  it.each(globals)('%s matches the table: read and update only, never create or delete', (_name, config, visitor, editorOps) => {
    expect(Object.keys(config.access ?? {}).sort()).toEqual(['read', 'update'])
    expect(evaluate(config, null)).toEqual(visitor)
    expect(evaluate(config, editor)).toEqual(editorOps)
  })

  it('home and about keep drafts and versions without autosave', () => {
    expect(Home.versions).toEqual({ drafts: true })
    expect(About.versions).toEqual({ drafts: true })
  })
})
