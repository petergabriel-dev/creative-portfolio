import { notFound } from 'next/navigation'

/**
 * Sends every unmatched public URL to (frontend)/not-found.tsx with HTTP 404.
 * The app has two root layouts (site and Payload), so there is no single root
 * not-found; global-not-found is still experimental in Next 16.4.
 * Static segments (/admin, /api, real pages) always take precedence over this.
 * Kept dynamic on purpose: a static catch-all would cache every random URL.
 */
export default function UnknownRoute(): never {
  notFound()
}
