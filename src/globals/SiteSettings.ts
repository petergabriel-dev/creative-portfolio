import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { revalidateLayout } from '@/hooks/revalidateLayout'
import { ACCENT_OPTIONS, DEFAULT_ACCENT } from '@/lib/accent'
import { SOCIAL_PLATFORMS } from '@/lib/socialPlatforms'
import { validateHttpUrl } from '@/lib/validateHttpUrl'

/** Identity, labels, accent and default SEO (Build Spec › Globals › site-settings). */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
  },
  // Versions without drafts: there is no unpublished state, so public read is safe.
  access: {
    read: anyone,
    update: authenticated,
  },
  versions: true,
  hooks: {
    afterChange: [revalidateLayout],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'roleLine', type: 'text', required: true },
    { name: 'location', type: 'text', required: true },
    {
      name: 'contactEmail',
      type: 'email',
      required: true,
      admin: { description: 'Receives inquiry alerts and is shown on Book Me.' },
    },
    { name: 'replyTime', type: 'text', required: true },
    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: SOCIAL_PLATFORMS.map(({ label, value }) => ({ label, value })),
        },
        { name: 'url', type: 'text', required: true, validate: validateHttpUrl },
      ],
    },
    {
      name: 'accent',
      type: 'select',
      required: true,
      defaultValue: DEFAULT_ACCENT,
      options: ACCENT_OPTIONS.map(({ label, value }) => ({ label, value })),
      admin: { description: 'Used for Book Me buttons and progress lines only.' },
    },
    { name: 'bookingLabel', type: 'text', required: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'finaleHeadline', type: 'text', required: true },
    { name: 'footerNote', type: 'text', required: true },
    {
      name: 'defaultMeta',
      type: 'group',
      admin: { description: 'Fallback SEO for pages without their own.' },
      fields: [
        {
          name: 'titleTemplate',
          type: 'text',
          required: true,
          admin: { description: 'Use %s for the page title, e.g. "%s · Your Name".' },
        },
        { name: 'description', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
  ],
}
