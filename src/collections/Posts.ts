import type { BlocksField, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { storyField } from '@/blocks/story'
import { slugFields } from '@/fields/slug'
import { fillPublishedAt } from '@/lib/publishing'

/** Journal posts (Build Spec › Content model › posts). Same Story blocks as projects. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    group: 'Journal',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    listSearchableFields: ['title'],
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
              name: 'excerpt',
              type: 'textarea',
              required: true,
              admin: { description: 'Shown on Home and the Journal list.' },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: { description: '3:2 on cards, 21:9 on the entry.' },
            },
            // The shared Story blocks, unchanged; a post needs at least one block to publish.
            { ...(storyField as BlocksField), required: true },
          ],
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      hooks: { beforeValidate: [fillPublishedAt] },
      admin: {
        position: 'sidebar',
        description: 'Filled on first publish if left empty. Sorts the journal, newest first.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Optional "See the work" links.' },
    },
    ...slugFields('title'),
  ],
}
