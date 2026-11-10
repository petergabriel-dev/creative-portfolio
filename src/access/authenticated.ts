import type { Access } from 'payload'

/** Allows any logged-in user (the editor); denies anonymous requests. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
