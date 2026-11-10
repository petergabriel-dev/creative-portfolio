/** Lowercase ASCII words joined by single hyphens (Build Spec › Site map & routes). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Turns a title into a slug: "Film & Video" → "film-video", "Ça va — déjà vu!" → "ca-va-deja-vu".
 * Payload's default slugify keeps double hyphens and drops accented letters.
 */
export function toSlug(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Payload validator for slug fields: required, and already in slug form. */
export const validateSlug = (value: unknown): true | string => {
  if (typeof value !== 'string' || value === '') return 'This field is required.'
  return (
    SLUG_PATTERN.test(value) ||
    'Use lowercase letters, numbers and single hyphens only, e.g. "film-video".'
  )
}
