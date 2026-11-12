import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { publishedOnly } from '@/access/publishedOnly'
import { safeRichTextEditor } from '@/blocks/story'
import { globalPublishHooks } from '@/hooks/publishHooks'
import { LIVE_PREVIEW_BREAKPOINTS, previewUrl } from '@/lib/preview'
import { ABOUT_PATH } from '@/lib/publishing'

const hooks = globalPublishHooks({ slug: 'about', path: ABOUT_PATH })

/**
 * The About page (Build Spec › Globals › about). Drafts with live preview; visitors read the
 * published version only.
 */
export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  admin: {
    group: 'Settings',
    description: 'The opener, portrait and the short sections about you.',
    livePreview: {
      url: () => previewUrl(ABOUT_PATH),
      breakpoints: LIVE_PREVIEW_BREAKPOINTS,
    },
    preview: () => previewUrl(ABOUT_PATH),
  },
  versions: { drafts: true },
  access: {
    read: publishedOnly,
    update: authenticated,
  },
  // Refresh `/about` only when the published version changes (never on draft saves).
  hooks: {
    beforeChange: [hooks.beforeChange],
    afterChange: [hooks.afterChange],
  },
  // Cards as capture 31 (P6): unnamed groups and rows are layout only and store nothing.
  fields: [
    {
      type: 'group',
      label: 'Opener',
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
              admin: { width: '33.33%', description: 'Set the focal point in the media library.' },
            },
            {
              type: 'group',
              label: false,
              admin: { width: '66.67%' },
              fields: [
                {
                  name: 'contextLine',
                  type: 'text',
                  required: true,
                  label: 'Context line',
                  admin: { description: 'e.g. "About · the person behind the work".' },
                },
                { name: 'title', type: 'text', required: true },
                { name: 'lead', type: 'textarea', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Sections · 1 to 4',
      admin: { description: 'Shown beside the portrait, in this order, as Chapter 01, 02 and so on.' },
      fields: [
        {
          name: 'sections',
          type: 'array',
          required: true,
          minRows: 1,
          maxRows: 4,
          label: false,
          fields: [
            { name: 'heading', type: 'text', required: true },
            // Same rich text as the story Text block: safe links only (invariant 13).
            { name: 'body', type: 'richText', required: true, editor: safeRichTextEditor },
          ],
        },
      ],
    },
  ],
}
