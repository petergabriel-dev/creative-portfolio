/** True only for absolute http(s) URLs, so links like `javascript:` never reach the page. */
export function isHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const { protocol } = new URL(value.trim())
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

/** Payload field validator for required link fields. */
export const validateHttpUrl = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.trim() === '') return 'This field is required.'
  return isHttpUrl(value) || 'Enter a full link starting with https:// or http://'
}
