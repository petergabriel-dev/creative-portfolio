import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

/**
 * Book Me inquiries (Build Spec › Content model › inquiries, P3 owner decisions 2026-11-11).
 *
 * - Private: only the logged-in editor can read, update or delete.
 * - Nobody can create through REST or the Studio, the editor included. The `submitInquiry` server
 *   action and the guarded seed are the only writers, with `overrideAccess: true` (invariant 2).
 * - What the visitor sent is read-only in the Studio; the editor changes only status and notes.
 * - `projectType` stores the label the visitor picked (a discipline name or "Something else") as
 *   text, so old inquiries keep it when disciplines change. The server action validates it.
 * - Only the form fields are stored: no IP address, user agent or tracking data.
 */
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'projectType', 'status', 'createdAt'],
  },
  defaultSort: '-createdAt',
  disableDuplicate: true,
  access: {
    read: authenticated,
    create: () => false,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 120, admin: { readOnly: true } },
    { name: 'email', type: 'email', required: true, admin: { readOnly: true } },
    { name: 'projectType', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'timing', type: 'text', maxLength: 120, admin: { readOnly: true } },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      minLength: 20,
      maxLength: 5000,
      admin: { readOnly: true },
    },
    {
      // Any status can change to any other (owner decision 8), so spam can go straight to archived.
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Replied', value: 'replied' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { position: 'sidebar', description: 'Private. Never shown on the site.' },
    },
    {
      // Replaces Payload's built-in timestamp field only to label it "Received" and show it in the
      // sidebar; the database adapter still fills it on create.
      name: 'createdAt',
      type: 'date',
      label: 'Received',
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        disableBulkEdit: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
