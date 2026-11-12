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
          // Cards as capture 24 (P6): unnamed groups are layout only and store nothing.
          fields: [
            {
              type: 'group',
              label: 'Opener',
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'intro', type: 'textarea', required: true, label: 'Intro · about 25 words' },
              ],
            },
            {
              type: 'group',
              label: 'Chapter 01 · Highlights',
              admin: { description: 'Edge-to-edge strip, 4px gaps, in this order.' },
              fields: [
                { name: 'highlights', type: 'upload', relationTo: 'media', hasMany: true, label: false },
                {
                  name: 'highlightAspect',
                  type: 'select',
                  required: true,
                  label: 'Highlight shape',
                  defaultValue: '4:5',
                  options: [
                    { label: '4:5 portrait', value: '4:5' },
                    { label: '16:9 landscape', value: '16:9' },
                    { label: '1:1 square', value: '1:1' },
                  ],
                },
              ],
            },
            {
              type: 'group',
              label: 'Finale',
              fields: [
                { name: 'finaleHeadline', type: 'text', required: true, label: 'Headline' },
                { name: 'finaleBody', type: 'textarea', required: true, label: 'One sentence under it' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Layout',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'layout',
          type: 'select',
          required: true,
          label: false,
          defaultValue: 'projects',
          options: [
            { label: 'Projects: highlights strip + project cards', value: 'projects' },
            { label: 'List: text-led rows, for writing', value: 'list' },
          ],
        },
        {
          name: 'cardAspect',
          type: 'select',
          required: true,
          label: 'Project card shape',
          defaultValue: '3:2',
          options: ['3:2', '16:9', '4:3'].map((value) => ({ label: value, value })),
        },
      ],
    },
    {
      type: 'group',
      label: 'Opener tint',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'openerTint',
          type: 'select',
          required: true,
          label: false,
          defaultValue: 'default',
          options: OPENER_TINTS.map(({ label, value }) => ({ label, value })),
        },
      ],
    },
    {
      type: 'group',
      label: 'Order & address',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'order',
          type: 'number',
          required: true,
          min: 1,
          label: 'Order · Portfolio, menu, Book Me list',
          admin: { description: '1 comes first.' },
        },
        ...slugFields('name', { label: '/portfolio/' }),
      ],
    },
  ],
}
