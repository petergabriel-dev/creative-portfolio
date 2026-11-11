import type { Payload, TypedUser, Where } from 'payload'

import { copy } from '@/copy'
import { heroSlides } from '@/lib/heroSlides'
import type { Category, Discipline, Media, Post, Project } from '@/payload-types'

/**
 * Studio reads (P5): the inquiry badge and the Overview panels
 * (docs/design/components/StudioOverview.md). Every call runs as the logged-in editor through
 * access control (`overrideAccess: false`, `user`), never with `overrideAccess: true`.
 *
 * Autosave writes a live doc's edits to its versions only (draft saves skip the main row), so rows
 * show each doc's **latest version**; the main row only says whether the doc is live.
 */

type Reader = { payload: Payload; user: TypedUser }
type DocCollection = 'projects' | 'posts'

const asEditor = (user: TypedUser) => ({ overrideAccess: false as const, user })

export const studioEditUrl = (collection: DocCollection | 'inquiries', id: string | number) =>
  `/admin/collections/${collection}/${id}`

export type StudioDocRow = {
  id: string | number
  collection: DocCollection
  title: string
  meta: string
  thumbUrl: string | null
  editUrl: string
  updatedAt: string
}

export type NeedsReply = {
  total: number
  rows: { id: string | number; name: string; projectType: string; receivedAt: string; editUrl: string }[]
}
export type Drafts = { total: number; rows: StudioDocRow[] }
export type HomeLineup = { slideTitles: string[]; selectedWorkCount: number }
export type RecentRow = StudioDocRow & {
  collectionName: string | null
  status: 'published' | 'draft' | 'changes'
}
export type StudioOverviewData = {
  needsReply: NeedsReply
  drafts: Drafts
  home: HomeLineup
  recent: RecentRow[]
}

/** Count of `new` inquiries for the sidebar badge: one `count` per render. */
export async function newInquiryCount({ payload, user }: Reader): Promise<number> {
  const { totalDocs } = await payload.count({
    collection: 'inquiries',
    where: { status: { equals: 'new' } },
    ...asEditor(user),
  })
  return totalDocs
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const joinMeta = (...parts: string[]) => parts.filter(Boolean).join(` ${copy.separator} `)
const nameOf = (value: unknown) =>
  typeof value === 'object' && value !== null && 'name' in value ? text((value as Discipline | Category).name) : ''

function thumbOf(cover: unknown): string | null {
  if (typeof cover !== 'object' || cover === null) return null
  const media = cover as Media
  return media.sizes?.thumb?.url || media.url || null
}

type VersionDoc = { parent: unknown; updatedAt: string; version: Partial<Project> & Partial<Post> }

const parentId = (parent: unknown): string | number | null =>
  typeof parent === 'object' && parent !== null && 'id' in parent
    ? (parent as { id: string | number }).id
    : typeof parent === 'string' || typeof parent === 'number'
      ? parent
      : null

/** A row from a doc's latest version. `panel` picks the meta line (capture 21 words them differently). */
function toRow(collection: DocCollection, v: VersionDoc, panel: 'drafts' | 'recent'): StudioDocRow | null {
  const id = parentId(v.parent)
  if (id === null) return null
  const { version } = v
  const meta =
    collection === 'posts'
      ? joinMeta(copy.studio.journal, nameOf(version.category))
      : panel === 'drafts'
        ? joinMeta(nameOf(version.collection), text(version.projectType))
        : joinMeta(copy.studio.project, text(version.projectType))
  return {
    id,
    collection,
    title: text(version.title) || copy.studio.untitled,
    meta,
    thumbUrl: thumbOf(version.cover),
    editUrl: studioEditUrl(collection, id),
    updatedAt: v.updatedAt,
  }
}

const newestFirst = <T extends { updatedAt: string }>(a: T, b: T) => b.updatedAt.localeCompare(a.updatedAt)

/**
 * Main rows (id, `_status`, and for projects `showOnHome`) of every project and post: one query per
 * collection feeds the draft counts, the Selected work count and Recently edited's live status.
 * ponytail: reads every main row (three small columns); fine for one editor's portfolio. If the
 * collections grow to thousands, switch to `count` queries plus an `id in` lookup.
 */
async function mainRows({ payload, user }: Reader) {
  const [projects, posts] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 0,
      draft: false,
      pagination: false,
      select: { _status: true, showOnHome: true },
      ...asEditor(user),
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      draft: false,
      pagination: false,
      select: { _status: true },
      ...asEditor(user),
    }),
  ])
  return { projects: projects.docs, posts: posts.docs }
}

/** Latest versions of a collection, newest first; `parents` limits them to those docs. */
async function latestVersions(
  { payload, user }: Reader,
  collection: DocCollection,
  limit: number,
  parents?: (string | number)[],
): Promise<VersionDoc[]> {
  if (parents && parents.length === 0) return []
  const where: Where = parents
    ? { and: [{ latest: { equals: true } }, { parent: { in: parents } }] }
    : { latest: { equals: true } }
  const result = await payload.findVersions({
    collection,
    where,
    sort: '-updatedAt',
    limit,
    depth: 1,
    ...asEditor(user),
  })
  return result.docs as unknown as VersionDoc[]
}

/** Everything the Overview shows, in at most nine Local API calls run in parallel. */
export async function studioOverview(reader: Reader): Promise<StudioOverviewData> {
  const { payload, user } = reader
  const [inquiries, rows, home, settings] = await Promise.all([
    payload.find({
      collection: 'inquiries',
      where: { status: { equals: 'new' } },
      sort: '-createdAt',
      limit: 3,
      depth: 0,
      ...asEditor(user),
    }),
    mainRows(reader),
    payload.findGlobal({ slug: 'home', depth: 0, draft: false, ...asEditor(user) }),
    payload.findGlobal({ slug: 'site-settings', depth: 0, draft: false, ...asEditor(user) }),
  ])

  const draftIds = {
    projects: rows.projects.filter((d) => d._status === 'draft').map((d) => d.id),
    posts: rows.posts.filter((d) => d._status === 'draft').map((d) => d.id),
  }
  const live = new Set([
    ...rows.projects.filter((d) => d._status === 'published').map((d) => `projects:${d.id}`),
    ...rows.posts.filter((d) => d._status === 'published').map((d) => `posts:${d.id}`),
  ])

  const [draftProjects, draftPosts, recentProjects, recentPosts] = await Promise.all([
    latestVersions(reader, 'projects', 3, draftIds.projects),
    latestVersions(reader, 'posts', 3, draftIds.posts),
    latestVersions(reader, 'projects', 4),
    latestVersions(reader, 'posts', 4),
  ])

  const draftRows = [
    ...draftProjects.map((v) => toRow('projects', v, 'drafts')),
    ...draftPosts.map((v) => toRow('posts', v, 'drafts')),
  ]
    .filter((row): row is StudioDocRow => row !== null)
    .sort(newestFirst)
    .slice(0, 3)

  const recentOf = (collection: DocCollection, v: VersionDoc): RecentRow | null => {
    const row = toRow(collection, v, 'recent')
    if (!row) return null
    const status: RecentRow['status'] =
      v.version._status === 'published' ? 'published' : live.has(`${collection}:${row.id}`) ? 'changes' : 'draft'
    const collectionName = collection === 'projects' ? nameOf(v.version.collection) || null : null
    return { ...row, collectionName, status }
  }
  const recent = [
    ...recentProjects.map((v) => recentOf('projects', v)),
    ...recentPosts.map((v) => recentOf('posts', v)),
  ]
    .filter((row): row is RecentRow => row !== null)
    .sort(newestFirst)
    .slice(0, 4)

  return {
    needsReply: {
      total: inquiries.totalDocs,
      rows: inquiries.docs.map((d) => ({
        id: d.id,
        name: text(d.name),
        projectType: text(d.projectType),
        receivedAt: d.createdAt,
        editUrl: studioEditUrl('inquiries', d.id),
      })),
    },
    drafts: { total: draftIds.projects.length + draftIds.posts.length, rows: draftRows },
    home: {
      // The editor reads the main row even while `home` is unpublished; only a live Home has slides.
      slideTitles:
        home._status === 'published' ? heroSlides(home, text(settings.headline)).map((slide) => slide.title) : [],
      selectedWorkCount: rows.projects.filter((d) => d._status === 'published' && d.showOnHome).length,
    },
    recent,
  }
}
