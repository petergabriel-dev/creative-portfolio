import { timingSafeEqual } from 'node:crypto'

/** Route that turns on Next.js draft mode for editors (Build Spec › Publishing). */
export const PREVIEW_ROUTE = '/next/preview'

/** Live preview sizes for every drafts-enabled collection (Build Spec › Publishing). */
export const LIVE_PREVIEW_BREAKPOINTS = [
  { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
  { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
  { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
]

/**
 * Only site-relative paths may be previewed: one leading slash, no "//host" or backslash tricks,
 * no scheme. Anything else would turn the preview route into an open redirect.
 */
export function isSafePreviewPath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('\\') &&
    !/[\u0000-\u001f\u007f]/.test(path)
  )
}

/** Constant-time check of the preview secret; an unset or empty secret never matches. */
export function previewSecretMatches(given: unknown, expected = process.env.PREVIEW_SECRET): boolean {
  if (typeof given !== 'string' || !expected) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** The draft-mode URL for a site path (relative, so it works on every preview deployment). */
export function previewUrl(path: string, secret = process.env.PREVIEW_SECRET): string | null {
  if (!secret || !isSafePreviewPath(path)) return null
  const query = new URLSearchParams({ previewSecret: secret, path })
  return `${PREVIEW_ROUTE}?${query.toString()}`
}
