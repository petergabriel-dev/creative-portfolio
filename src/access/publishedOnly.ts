import type { Access } from 'payload'

/**
 * "Published only" (Build Spec › Access control): a logged-in editor reads everything,
 * everyone else only documents whose `_status` is `published`.
 */
export const publishedOnly: Access = ({ req: { user } }) =>
  user ? true : { _status: { equals: 'published' } }
