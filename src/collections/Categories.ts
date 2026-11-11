import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { slugFields } from '@/fields/slug'
import { blockCategoryDeleteInUse, revalidateCategory, revalidateDeletedCategory } from '@/hooks/categoryHooks'

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
  hooks: {
    beforeDelete: [blockCategoryDeleteInUse],
    afterChange: [revalidateCategory],
    afterDelete: [revalidateDeletedCategory],
  },
  fields: [{ name: 'name', type: 'text', required: true }, ...slugFields('name', { previousSlugs: false })],
}
