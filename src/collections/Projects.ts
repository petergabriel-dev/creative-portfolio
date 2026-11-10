import type { CollectionConfig, PayloadRequest } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { storyField } from '@/blocks/story'
import { slugFields } from '@/fields/slug'
import { recordProjectSlug, revalidateDeletedProject, revalidateProject } from '@/hooks/revalidateProject'
import { previewUrl } from '@/lib/preview'
import { projectPath } from '@/lib/publishing'

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
    // Live preview pane (Build Spec › Publishing) and the "Preview" button ("View draft").
    livePreview: {
      url: ({ data, req }) => projectPreviewUrl(data, req),
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
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
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              admin: { description: 'One or two sentences; the opener paragraph.' },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: '21:9 crop on the project page; card crop elsewhere.' },
            },
            storyField,
            {
              name: 'credits',
              type: 'array',
              admin: { description: 'Client, collaborators, made with.' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'disciplines',
      required: true,
      admin: { position: 'sidebar', description: 'Drives the URL.' },
    },
    {
      name: 'projectType',
      type: 'text',
      required: true,
      admin: { position: 'sidebar', description: 'e.g. Wedding, Music video, Brand identity.' },
    },
    { name: 'year', type: 'number', required: true, admin: { position: 'sidebar' } },
    { name: 'client', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'role',
      type: 'text',
      admin: { position: 'sidebar', description: 'e.g. Photographer, editor.' },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      label: 'Show in Selected work',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'homeOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Lower comes first.',
        condition: (_, siblingData) => Boolean(siblingData?.showOnHome),
      },
    },
    ...slugFields('title'),
  ],
}
