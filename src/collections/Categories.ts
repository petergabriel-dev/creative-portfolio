import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { slugFields } from '@/fields/slug'

/**
 * Journal categories (Build Spec › Content model › categories): Process, Outdoors, Design, Film.
 * Public read; no drafts. They have no pages of their own, so old slugs are not kept.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    group: 'Journal',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  defaultSort: 'name',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'name', type: 'text', required: true }, ...slugFields('name', { previousSlugs: false })],
}
