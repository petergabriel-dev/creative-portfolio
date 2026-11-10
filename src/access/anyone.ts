import type { Access } from 'payload'

/** Allows everyone, including anonymous visitors. Use only for public reads. */
export const anyone: Access = () => true
