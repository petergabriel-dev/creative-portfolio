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
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      admin: { description: 'One to six slides. The order here is the slider order.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          // Optional (P4 owner decision 3): a blank title shows the site headline.
          admin: { description: 'Leave blank to use the site headline from Site settings.' },
        },
        {
          name: 'placeLine',
          type: 'text',
          required: true,
          admin: { description: 'The line above the title, e.g. "Featured · Project title".' },
        },
        { name: 'body', type: 'textarea', required: true, admin: { description: 'About 20 words.' } },
        {
          name: 'link',
          type: 'relationship',
          relationTo: ['disciplines', 'projects'],
          required: true,
          admin: { description: 'The collection or project the second button opens.' },
        },
        {
          name: 'linkLabel',
          type: 'text',
          required: true,
          admin: { description: 'The second button\'s words, e.g. "View photography".' },
        },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'cardKicker',
          type: 'text',
          required: true,
          admin: { description: 'The small line on the story card, e.g. "Collection 01".' },
        },
        {
          name: 'tint',
          type: 'select',
          required: true,
          defaultValue: 'default',
          options: OPENER_TINTS.map(({ label, value }) => ({ label, value })),
          admin: { description: 'Shows while the photo loads.' },
        },
      ],
    },
    {
      name: 'selectedWorkIntro',
      type: 'text',
      required: true,
      admin: { description: 'One line under "Selected work".' },
    },
    {
      name: 'meet',
      type: 'group',
      label: 'Behind the camera',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'portrait', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'journalCount',
      type: 'number',
      required: true,
      min: 1,
      max: 6,
      defaultValue: 2,
      admin: { step: 1, description: 'How many of the latest journal posts "From the journal" shows.' },
    },
  ],
}
