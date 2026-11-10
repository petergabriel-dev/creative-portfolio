import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { storyField } from '@/blocks/story'
import { slugFields } from '@/fields/slug'

/** The core of the portfolio (Build Spec › Content model › projects). */
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Portfolio',
    useAsTitle: 'title',
    defaultColumns: ['title', 'collection', 'projectType', 'year', '_status', 'showOnHome'],
    listSearchableFields: ['title'],
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
