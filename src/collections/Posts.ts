import type { BlocksField, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { storyField } from '@/blocks/story'
import { slugFields } from '@/fields/slug'
import { recordPostSlug, revalidateDeletedPost, revalidatePost } from '@/hooks/revalidatePost'
import { LIVE_PREVIEW_BREAKPOINTS, previewUrl } from '@/lib/preview'
import { fillPublishedAt, postPath } from '@/lib/publishing'

/**
 * Draft-mode URL for a post as it is being edited (its current slug). Relative, so live preview
 * works on every preview deployment without setting Payload's serverURL.
 */
const postPreviewUrl = (data: Record<string, unknown> | undefined) =>
  typeof data?.slug === 'string' && data.slug ? previewUrl(postPath(data.slug)) : null

/** Journal posts (Build Spec › Content model › posts). Same Story blocks as projects. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Journal',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    listSearchableFields: ['title'],
    // Capture 25's line; Payload also shows it above each post's edit form (P6 owner decision 2).
    description: 'Stories and notes. Posts use the same block editor as projects.',
    // Live preview pane (Build Spec › Publishing) and the "Preview" button ("View draft").
    livePreview: {
      url: ({ data }) => postPreviewUrl(data),
      breakpoints: LIVE_PREVIEW_BREAKPOINTS,
    },
    preview: (doc) => postPreviewUrl(doc),
  },
  defaultSort: '-publishedAt',
  versions: {
    drafts: { autosave: true },
  },
  // Anonymous readers (and front-end queries with overrideAccess: false) see published posts only.
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  // Refresh pages and record old slugs only when the published state changes (never on drafts).
  hooks: {
    beforeChange: [recordPostSlug],
    afterChange: [revalidatePost],
    afterDelete: [revalidateDeletedPost],
  },
  fields: [
    // First field is a tabs field so the SEO plugin adds its tab here and sidebar fields stay top-level.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          // Cards as capture 26 (P6): unnamed groups are layout only and store nothing.
          fields: [
            {
              type: 'group',
              label: 'Basics',
              fields: [
                { name: 'title', type: 'text', required: true },
                {
                  name: 'excerpt',
                  type: 'textarea',
                  required: true,
                  label: 'Excerpt · shown on Home and the Journal list',
                },
              ],
            },
            {
              type: 'group',
              label: 'Cover image',
              admin: { description: '3:2 on cards, 21:9 on the post.' },
              fields: [{ name: 'cover', type: 'upload', relationTo: 'media', required: true, label: false }],
            },
            {
              type: 'group',
              label: 'Story',
              admin: { description: 'Same blocks as projects, in reading order.' },
              // The shared Story blocks, unchanged; a post needs at least one block to publish.
              fields: [{ ...(storyField as BlocksField), required: true, label: false }],
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
        { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          label: 'Publish date · sorts the Journal',
          hooks: { beforeValidate: [fillPublishedAt] },
          admin: {
            description: 'Filled on first publish if left empty. Newest first.',
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
      ],
    },
    {
      type: 'group',
      label: 'Related work',
      admin: { position: 'sidebar', description: 'Optional “See the work” links under the post.' },
      fields: [{ name: 'relatedProjects', type: 'relationship', relationTo: 'projects', hasMany: true, label: false }],
    },
    {
      type: 'group',
      label: 'Web address',
      admin: { position: 'sidebar' },
      fields: slugFields('title', { label: '/journal/' }),
    },
  ],
}
