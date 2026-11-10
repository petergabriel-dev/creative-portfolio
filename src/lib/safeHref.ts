const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * Returns the href when it is safe to render from CMS rich text, else null (invariant 13).
 * Allowed: absolute http(s), mailto:, and site-relative paths ("/portfolio").
 * Rejected: javascript:, data:, protocol-relative "//host", backslashes and anything unparsable.
 */
export function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const href = value.trim()
  if (href === '' || href.includes('\\')) return null
  if (href.startsWith('/')) return href.startsWith('//') ? null : href
  try {
    return SAFE_PROTOCOLS.has(new URL(href).protocol) ? href : null
  } catch {
    return null
  }
}

/** Payload validator for the rich-text link URL field. */
export const validateSafeHref = (value: unknown): true | string =>
  safeHref(value) !== null || 'Use a link starting with https://, http://, mailto: or /'
