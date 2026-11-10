import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Admin',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email'],
  },
  // No public sign-up: every operation needs a logged-in editor. Payload's
  // create-first-user screen is the only way in while the table is empty.
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}
