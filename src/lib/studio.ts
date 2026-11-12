import type { BaseFilter, Payload, TypedUser, Where } from 'payload'

import { copy } from '@/copy'
import { heroSlides } from '@/lib/heroSlides'
import {
  excerpt,
  INBOX_PAGE_SIZE,
  inboxHref,
  INQUIRY_STATUSES,
  type InboxQuery,
  type InquiryStatus,
  isInquiryStatus,
  nextSelection,
} from '@/lib/studioInbox'
import type { Category, Discipline, Inquiry, Media, Post, Project } from '@/payload-types'

/**
 * Studio reads (P5, P6): the inquiry badge, the Overview panels
 * (docs/design/components/StudioOverview.md), the inbox (StudioInbox.md) and the Projects filter
 * pills (StudioFilterPills.md). Every call runs as the logged-in editor through access control
 * (`overrideAccess: false`, `user`), never with `overrideAccess: true`.
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

export type InboxRow = { id: number; name: string; projectType: string; receivedAt: string; excerpt: string; href: string }
export type InboxSelected = {
  id: number
  name: string
  email: string
  projectType: string
  timing: string
  message: string
  status: InquiryStatus
  receivedAt: string
}
export type StudioInboxData = {
  /** The page actually shown (clamped) and the selected inquiry's id. */
  query: InboxQuery
  counts: Record<InquiryStatus, number>
  rows: InboxRow[]
  selected: InboxSelected | null
  /** The inquiry to select once the selected one leaves this tab. */
  nextId: number | null
  newerHref: string | null
  olderHref: string | null
}

const toSelected = (doc: Inquiry): InboxSelected => ({
  id: doc.id,
  name: text(doc.name),
  email: text(doc.email),
  projectType: text(doc.projectType),
  timing: text(doc.timing),
  message: typeof doc.message === 'string' ? doc.message.trim() : '',
  status: isInquiryStatus(doc.status) ? doc.status : 'new',
  receivedAt: doc.createdAt,
})

/**
 * The inbox for one tab (owner decisions 3–7): the three status counts, one page of 20 newest
 * first, and the selected inquiry: `query.id` when it exists **and** has the tab's status, else the
 * page's first card. At most five Local API calls: three counts and a `findByID` in parallel, then
 * the page (its number clamped to the last page, so an emptied last page shows the one before).
 */
export async function studioInbox({ payload, user }: Reader, query: InboxQuery): Promise<StudioInboxData> {
  const { status } = query
  const [counted, byId] = await Promise.all([
    Promise.all(
      INQUIRY_STATUSES.map((s) =>
        payload.count({ collection: 'inquiries', where: { status: { equals: s } }, ...asEditor(user) }),
      ),
    ),
    query.id === null
      ? null
      : payload.findByID({ collection: 'inquiries', id: query.id, depth: 0, disableErrors: true, ...asEditor(user) }),
  ])
  const counts = Object.fromEntries(INQUIRY_STATUSES.map((s, i) => [s, counted[i].totalDocs])) as Record<
    InquiryStatus,
    number
  >

  const lastPage = Math.max(1, Math.ceil(counts[status] / INBOX_PAGE_SIZE))
  const page = Math.min(query.page, lastPage)
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { status: { equals: status } },
    sort: '-createdAt',
    limit: INBOX_PAGE_SIZE,
    page,
    depth: 0,
    ...asEditor(user),
  })

  const selectedDoc = byId && byId.status === status ? byId : (docs[0] ?? null)
  const selected = selectedDoc ? toSelected(selectedDoc) : null
  const ids = docs.map((d) => d.id)

  return {
    query: { status, page, id: selected?.id ?? null },
    counts,
    rows: docs.map((d) => ({
      id: d.id,
      name: text(d.name),
      projectType: text(d.projectType),
      receivedAt: d.createdAt,
      excerpt: excerpt(typeof d.message === 'string' ? d.message : ''),
      href: inboxHref({ status, page, id: d.id }),
    })),
    selected,
    nextId: selected ? nextSelection(ids, selected.id) : null,
    newerHref: page > 1 ? inboxHref({ status, page: page - 1 }) : null,
    olderHref: page < lastPage ? inboxHref({ status, page: page + 1 }) : null,
  }
}

export type ProjectCounts = { all: number; items: { id: number; name: string; slug: string; count: number }[] }

/**
 * Filter pill counts (owner decision 8): every discipline in `order`, even with no projects, and
 * each one's projects counted from their latest version (`draft: true`, as Payload's list view
 * reads them), drafts included, each project once. Two Local API calls.
 * ponytail: reads one small column of every project; fine for one editor's portfolio.
 */
export async function projectCountsByCollection({ payload, user }: Reader): Promise<ProjectCounts> {
  const [disciplines, projects] = await Promise.all([
    payload.find({
      collection: 'disciplines',
      sort: 'order',
      pagination: false,
      depth: 0,
      select: { name: true, slug: true },
      ...asEditor(user),
    }),
    payload.find({
      collection: 'projects',
      draft: true,
      pagination: false,
      depth: 0,
      select: { collection: true },
      ...asEditor(user),
    }),
  ])
  const perDiscipline = new Map<number, number>()
  for (const project of projects.docs) {
    const id = typeof project.collection === 'object' && project.collection ? project.collection.id : project.collection
    if (typeof id === 'number') perDiscipline.set(id, (perDiscipline.get(id) ?? 0) + 1)
  }
  return {
    all: projects.docs.length,
    items: disciplines.docs.map((d) => ({
      id: d.id,
      name: text(d.name),
      slug: text(d.slug),
      count: perDiscipline.get(d.id) ?? 0,
    })),
  }
}

/** The pill parameter: `?collection=<slug>`. Slugs are `toSlug` output, so anything else is ignored. */
export const COLLECTION_PARAM = 'collection'
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * `admin.baseFilter` for projects (owner decision 8): narrows Payload's list to the discipline in
 * `?collection=<slug>`, ANDed with the list's own search and filter-builder conditions. No param, a
 * malformed or unknown slug, or no logged-in editor → no filter. Payload also runs this for
 * relationship drawers (Lexical internal links), where the parameter is absent.
 */
export const collectionFilter: BaseFilter = async ({ req }) => {
  const raw = req.query?.[COLLECTION_PARAM]
  const slug = typeof raw === 'string' ? raw : null
  if (!slug || slug.length > 100 || !SLUG_PATTERN.test(slug) || !req.user) return null
  const { docs } = await req.payload.find({
    collection: 'disciplines',
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
    depth: 0,
    select: { slug: true },
    ...asEditor(req.user),
  })
  return docs[0] ? { collection: { equals: docs[0].id } } : null
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
  // Recently edited needs nothing from the main rows, so it starts in the first round.
  const [inquiries, rows, home, settings, recentProjects, recentPosts] = await Promise.all([
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
    latestVersions(reader, 'projects', 4),
    latestVersions(reader, 'posts', 4),
  ])

  const draftIds = {
    projects: rows.projects.filter((d) => d._status === 'draft').map((d) => d.id),
    posts: rows.posts.filter((d) => d._status === 'draft').map((d) => d.id),
  }
  const live = new Set([
    ...rows.projects.filter((d) => d._status === 'published').map((d) => `projects:${d.id}`),
    ...rows.posts.filter((d) => d._status === 'published').map((d) => `posts:${d.id}`),
  ])

  const [draftProjects, draftPosts] = await Promise.all([
    latestVersions(reader, 'projects', 3, draftIds.projects),
    latestVersions(reader, 'posts', 3, draftIds.posts),
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
        // P6 owner decision 7: open the inbox with this inquiry selected.
        editUrl: inboxHref({ status: 'new', id: d.id }),
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
