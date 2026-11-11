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
  fields: [
    {
      name: 'contextLine',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "About · the person behind the work".' },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'lead', type: 'textarea', required: true },
    {
      name: 'portrait',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Shown at 4:5; set the focal point in the media library.' },
    },
    {
      name: 'sections',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 4,
      admin: { description: 'One to four sections, shown as Chapter 01, 02 and so on.' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        // Same rich text as the story Text block: safe links only (invariant 13).
        { name: 'body', type: 'richText', required: true, editor: safeRichTextEditor },
      ],
    },
  ],
}
