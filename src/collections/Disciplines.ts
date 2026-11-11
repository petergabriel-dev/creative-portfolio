import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { slugFields } from '@/fields/slug'
import {
  recordDisciplineSlug,
  revalidateDeletedDiscipline,
  revalidateDiscipline,
} from '@/hooks/revalidateDiscipline'

/** Opener tint options: names stored, hex shown (Build Spec › disciplines › openerTint). */
export const OPENER_TINTS = [
  { label: 'Warm · #2F2A28', value: 'warm' },
  { label: 'Plum · #2C2A2E', value: 'plum' },
  { label: 'Forest · #28302B', value: 'forest' },
  { label: 'Clay · #302A26', value: 'clay' },
  { label: 'Default · #2B2925', value: 'default' },
] as const

/**
 * One doc per collection of work (Build Spec › Content model › disciplines). The slug
 * `disciplines` avoids Payload's own word "collection"; the Studio calls them Collections.
 * No drafts: every save is live.
 */
export const Disciplines: CollectionConfig = {
  slug: 'disciplines',
  labels: { singular: 'Collection', plural: 'Collections' },
  admin: {
    group: 'Portfolio',
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'layout', 'updatedAt'],
  },
  defaultSort: 'order',
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [recordDisciplineSlug],
    afterChange: [revalidateDiscipline],
    afterDelete: [revalidateDeletedDiscipline],
  },
  fields: [
    // First field is a tabs field so the SEO plugin adds its tab here and sidebar fields stay top-level.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'name', type: 'text', required: true },
            {
              name: 'order',
              type: 'number',
              required: true,
              min: 1,
              admin: { description: 'Position on the Portfolio page, 1 first.' },
            },
            {
              name: 'intro',
              type: 'textarea',
              required: true,
              admin: { description: 'Opener paragraph, about 25 words.' },
            },
            {
              name: 'openerTint',
              type: 'select',
              required: true,
              defaultValue: 'default',
              options: OPENER_TINTS.map(({ label, value }) => ({ label, value })),
            },
            {
              name: 'layout',
              type: 'select',
              required: true,
              defaultValue: 'projects',
              options: [
                { label: 'Projects (highlights strip + project cards)', value: 'projects' },
                { label: 'List (text-led, e.g. Writing & More)', value: 'list' },
              ],
            },
            {
              name: 'highlights',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'Ordered images for the Chapter 01 strip.' },
            },
            {
              name: 'highlightAspect',
              type: 'select',
              required: true,
              defaultValue: '4:5',
              options: ['4:5', '16:9', '1:1'].map((value) => ({ label: value, value })),
            },
            {
              name: 'cardAspect',
              type: 'select',
              required: true,
              defaultValue: '3:2',
              options: ['3:2', '16:9', '4:3'].map((value) => ({ label: value, value })),
            },
            { name: 'finaleHeadline', type: 'text', required: true },
            {
              name: 'finaleBody',
              type: 'textarea',
              required: true,
              admin: { description: 'One sentence under the finale headline.' },
            },
          ],
        },
      ],
    },
    ...slugFields('name'),
  ],
}
