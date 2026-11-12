import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { OPENER_TINTS } from '@/collections/Disciplines'
import { globalPublishHooks } from '@/hooks/publishHooks'
import { LIVE_PREVIEW_BREAKPOINTS, previewUrl } from '@/lib/preview'
import { HOME_PATH } from '@/lib/publishing'

const hooks = globalPublishHooks({ slug: 'home', path: HOME_PATH })

/**
 * The Home page (Build Spec › Globals › home): hero slides, the Selected work line, "Behind the
 * camera" and how many journal posts to show. Selected work itself comes from projects with
 * "Show in Selected work" ticked. Drafts with live preview; visitors read the published version only.
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  admin: {
    group: 'Settings',
    description: 'The hero slider and the sections under it. Changes stay in draft until you publish.',
    livePreview: {
      url: () => previewUrl(HOME_PATH),
      breakpoints: LIVE_PREVIEW_BREAKPOINTS,
    },
    preview: () => previewUrl(HOME_PATH),
  },
  versions: { drafts: true },
  access: {
    read: publishedOnly,
    update: authenticated,
  },
  // Refresh `/` only when the published version changes (never on draft saves).
  hooks: {
    beforeChange: [hooks.beforeChange],
    afterChange: [hooks.afterChange],
  },
  // Cards as capture 30 (P6): unnamed groups and rows are layout only; `meet` stays a named group.
  fields: [
    {
      type: 'group',
      label: 'Hero slides · 1 to 6',
      admin: { description: 'Slide one opens the site; this order is the slider order.' },
      fields: [
        {
          name: 'heroSlides',
          type: 'array',
          required: true,
          minRows: 1,
          maxRows: 6,
          label: false,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Image · full-bleed',
                  // Payload's upload card needs about 370 px; 30% keeps it beside the fields at 1440.
                  admin: { width: '30%' },
                },
                {
                  type: 'group',
                  label: false,
                  admin: { width: '70%' },
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      // Optional (P4 owner decision 3): a blank title shows the site headline.
                      admin: { description: 'Leave blank to use the site headline from Site settings.' },
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'placeLine',
                          type: 'text',
                          required: true,
                          label: 'Place line',
                          admin: { width: '50%', description: 'e.g. "Featured · Project title".' },
                        },
                        {
                          name: 'cardKicker',
                          type: 'text',
                          required: true,
                          label: 'Card kicker',
                          admin: { width: '50%', description: 'e.g. "Collection 01".' },
                        },
                      ],
                    },
                    { name: 'body', type: 'textarea', required: true, label: 'Body · about 20 words' },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'link',
                          type: 'relationship',
                          relationTo: ['disciplines', 'projects'],
                          required: true,
                          label: 'Button links to',
                          admin: { width: '50%' },
                        },
                        {
                          name: 'linkLabel',
                          type: 'text',
                          required: true,
                          label: 'Button label',
                          admin: { width: '50%', description: 'e.g. "View photography".' },
                        },
                      ],
                    },
                    {
                      name: 'tint',
                      type: 'select',
                      required: true,
                      label: 'Loading tint',
                      defaultValue: 'default',
                      options: OPENER_TINTS.map(({ label, value }) => ({ label, value })),
                      admin: { description: 'Shows while the photo loads.' },
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
      label: 'Chapter 01 · Selected work',
      admin: { description: 'Shows up to 9 projects ticked “Show in Selected work”, chosen in Projects.' },
      fields: [{ name: 'selectedWorkIntro', type: 'text', required: true, label: 'Intro line' }],
    },
    {
      name: 'meet',
      type: 'group',
      label: 'Chapter 02 · Behind the camera',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'portrait',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Portrait · 4:5',
              admin: { width: '30%' },
            },
            {
              type: 'group',
              label: false,
              admin: { width: '70%' },
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Chapter 04 · From the journal',
      admin: { description: 'The newest published posts show automatically.' },
      fields: [
        {
          name: 'journalCount',
          type: 'number',
          required: true,
          min: 1,
          max: 6,
          defaultValue: 2,
          label: 'Posts to show',
          admin: { step: 1, width: '25%' },
        },
      ],
    },
  ],
}
