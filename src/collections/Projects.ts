import type { BlocksField, CollectionConfig, PayloadRequest } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { storyField } from '@/blocks/story'
import { slugFields } from '@/fields/slug'
import { recordProjectSlug, revalidateDeletedProject, revalidateProject } from '@/hooks/revalidateProject'
import { LIVE_PREVIEW_BREAKPOINTS, previewUrl } from '@/lib/preview'
import { projectPath } from '@/lib/publishing'
import { collectionFilter } from '@/lib/studio'

/**
 * Draft-mode URL for a project as it is being edited (its current slug and collection). Relative,
 * so live preview works on every preview deployment without setting Payload's serverURL.
 */
async function projectPreviewUrl(data: Record<string, unknown> | undefined, req: PayloadRequest) {
  const collection = data?.collection as number | { id: number } | null | undefined
  const disciplineId = typeof collection === 'object' ? collection?.id : collection
  if (disciplineId == null || typeof data?.slug !== 'string' || !data.slug) return null
  const discipline = await req.payload.findByID({
    collection: 'disciplines',
    id: disciplineId,
    depth: 0,
    select: { slug: true },
    disableErrors: true,
    overrideAccess: true,
    req,
  })
  return discipline?.slug ? previewUrl(projectPath(discipline.slug, data.slug)) : null
}

/** The core of the portfolio (Build Spec › Content model › projects). */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Portfolio',
    useAsTitle: 'title',
    defaultColumns: ['title', 'collection', 'projectType', 'year', '_status', 'showOnHome'],
    listSearchableFields: ['title'],
    // Capture 22's line; Payload also shows it above each project's edit form (P6 owner decision 2).
    description: 'Everything in your portfolio. Mark a project “On home” to show it in Selected work.',
    // Collection filter pills (P6, docs/design/components/StudioFilterPills.md): ?collection=<slug>
    // narrows the list, ANDed with search and the filter builder.
    baseFilter: collectionFilter,
    components: {
      beforeListTable: ['/components/studio/StudioFilterPills#StudioFilterPills'],
    },
    // Live preview pane (Build Spec › Publishing) and the "Preview" button ("View draft").
    livePreview: {
      url: ({ data, req }) => projectPreviewUrl(data, req),
      breakpoints: LIVE_PREVIEW_BREAKPOINTS,
    },
    preview: (doc, { req }) => projectPreviewUrl(doc, req),
  },
  versions: {
    drafts: { autosave: true },
  },
  // Anonymous readers (and front-end queries with overrideAccess: false) see published docs only.
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  // Refresh pages and record old slugs only when the published state changes (never on drafts).
  hooks: {
    beforeChange: [recordProjectSlug],
    afterChange: [revalidateProject],
    afterDelete: [revalidateDeletedProject],
  },
  fields: [
    // First field is a tabs field so the SEO plugin adds its tab here and sidebar fields stay top-level.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          // Cards as capture 23 (P6): unnamed groups are layout only and store nothing.
          fields: [
            {
              type: 'group',
              label: 'Basics',
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  name: 'summary',
                  type: 'textarea',
                  required: true,
                  label: 'Summary · shown at the top of the project page',
                  admin: { description: 'One or two sentences.' },
                },
              ],
            },
            {
              type: 'group',
              label: 'Cover image',
              admin: { description: '21:9 crop on the project page; card crop elsewhere.' },
              fields: [{ name: 'cover', type: 'upload', relationTo: 'media', required: true, label: false }],
            },
            {
              type: 'group',
              label: 'Story',
              admin: { description: 'Blocks appear on the project page in this order.' },
              fields: [{ ...(storyField as BlocksField), label: false }],
            },
            {
              type: 'group',
              label: 'Credits',
              admin: { description: 'Listed under the story on the project page.' },
              fields: [
                {
                  name: 'credits',
                  type: 'array',
                  label: false,
                  admin: { description: 'e.g. Client, Collaborators, Made with.' },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, admin: { width: '33%' } },
                        { name: 'value', type: 'text', required: true, admin: { width: '67%' } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Organise',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'collection',
          type: 'relationship',
          relationTo: 'disciplines',
          required: true,
          admin: { description: 'Drives the URL.' },
        },
        {
          name: 'projectType',
          type: 'text',
          required: true,
          label: 'Project type',
          admin: { description: 'e.g. Wedding, Music video, Brand identity.' },
        },
        {
          type: 'row',
          fields: [
            { name: 'year', type: 'number', required: true, admin: { width: '33%' } },
            { name: 'client', type: 'text', admin: { width: '67%' } },
          ],
        },
        { name: 'role', type: 'text', label: 'My role', admin: { description: 'e.g. Photographer, editor.' } },
      ],
    },
    {
      type: 'group',
      label: 'Home page',
      admin: { position: 'sidebar', description: 'Hero slides are chosen on the Home page settings.' },
      fields: [
        { name: 'showOnHome', type: 'checkbox', label: 'Show in Selected work', defaultValue: false },
        {
          name: 'homeOrder',
          type: 'number',
          label: 'Order on Home · lower comes first',
          admin: { condition: (_, siblingData) => Boolean(siblingData?.showOnHome) },
        },
      ],
    },
    {
      type: 'group',
      label: 'Web address',
      admin: { position: 'sidebar' },
      fields: slugFields('title', { label: '/portfolio/[collection]/' }),
    },
  ],
}
