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
    description:
      'Your details, links and labels — used on every page. Collections live under Portfolio; the hero lives under Home page.',
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
  // Cards as capture 29 (P6): unnamed groups and rows are layout only; `defaultMeta` stays a named group.
  fields: [
    {
      type: 'group',
      label: 'Identity',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Name · header, footer and page titles',
              admin: { width: '33.33%' },
            },
            { name: 'roleLine', type: 'text', required: true, label: 'Role line', admin: { width: '33.33%' } },
            { name: 'location', type: 'text', required: true, label: 'Based in', admin: { width: '33.33%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              required: true,
              label: 'Contact email · receives inquiry alerts',
              admin: { width: '33.33%', description: 'Also shown on Book Me.' },
            },
            {
              name: 'replyTime',
              type: 'text',
              required: true,
              label: 'Reply time · Book Me and thank-you',
              admin: { width: '33.33%' },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Social links',
      admin: { description: 'Shown in the footer, in this order.' },
      fields: [
        {
          name: 'socials',
          type: 'array',
          label: false,
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: SOCIAL_PLATFORMS.map(({ label, value }) => ({ label, value })),
                  admin: { width: '25%' },
                },
                { name: 'url', type: 'text', required: true, validate: validateHttpUrl, admin: { width: '75%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: 'Look & labels',
      fields: [
        {
          name: 'accent',
          type: 'select',
          required: true,
          defaultValue: DEFAULT_ACCENT,
          options: ACCENT_OPTIONS.map(({ label, value }) => ({ label, value })),
          // Drawn as four swatches with a Book Me preview (P6, docs/design/components/StudioAccentSwatches.md).
          label: 'Accent colour',
          admin: {
            description: 'Book Me buttons and progress only',
            components: { Field: '/components/studio/StudioAccentSwatches#StudioAccentSwatches' },
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'bookingLabel',
              type: 'text',
              required: true,
              label: 'Booking button label',
              admin: { width: '33.33%' },
            },
            {
              name: 'headline',
              type: 'text',
              required: true,
              label: 'Site headline · hero slide 1',
              admin: { width: '33.33%' },
            },
            {
              name: 'finaleHeadline',
              type: 'text',
              required: true,
              label: 'Default finale headline',
              admin: { width: '33.33%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [{ name: 'footerNote', type: 'text', required: true, label: 'Footer note', admin: { width: '33.33%' } }],
        },
      ],
    },
    {
      name: 'defaultMeta',
      type: 'group',
      label: 'Default search & sharing',
      admin: { description: 'Used when a page has no SEO of its own.' },
      fields: [
        {
          name: 'titleTemplate',
          type: 'text',
          required: true,
          label: 'Title template',
          admin: { description: 'Use %s for the page title, e.g. "%s · Your Name".' },
        },
        { name: 'description', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Share image · 1200 × 630' },
      ],
    },
  ],
}
