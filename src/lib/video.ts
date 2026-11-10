export type ParsedVideo = {
  provider: 'youtube' | 'vimeo'
  id: string
  /** Privacy-friendly embed URL rebuilt from the id; the editor's raw URL is never embedded. */
  embedUrl: string
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'])
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d+$/
const VIMEO_HASH = /^[0-9a-f]{6,}$/i

function youtubeId(url: URL, parts: string[]): string | null {
  if (url.hostname === 'youtu.be') return parts[0] ?? null
  if (parts[0] === 'watch') return url.searchParams.get('v')
  if (['embed', 'shorts', 'live', 'v'].includes(parts[0] ?? '')) return parts[1] ?? null
  return null
}

/**
 * Parses a YouTube or Vimeo link into its id and embed URL, or returns null for any other link.
 * Embeds use youtube-nocookie.com and Vimeo's dnt=1 (Build Spec › Story blocks).
 */
export function parseVideoUrl(value: unknown): ParsedVideo | null {
  if (typeof value !== 'string') return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase()
  const parts = url.pathname.split('/').filter(Boolean)

  if (YOUTUBE_HOSTS.has(host)) {
    const id = youtubeId(url, parts)
    if (!id || !YOUTUBE_ID.test(id)) return null
    return { provider: 'youtube', id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
  }

  if (VIMEO_HOSTS.has(host)) {
    // vimeo.com/123, vimeo.com/123/<hash> (unlisted), vimeo.com/channels/x/123, player.vimeo.com/video/123?h=<hash>
    const index = parts.findIndex((part) => VIMEO_ID.test(part))
    if (index < 0) return null
    const id = parts[index]!
    const hash = url.searchParams.get('h') ?? parts[index + 1]
    const hashParam = hash && VIMEO_HASH.test(hash) ? `&h=${hash}` : ''
    return {
      provider: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}?dnt=1${hashParam}`,
    }
  }

  return null
}

/** Payload validator for the video block URL: the message names the two allowed hosts. */
export const validateVideoUrl = (value: unknown): true | string => {
  if (typeof value !== 'string' || value.trim() === '') return 'This field is required.'
  return parseVideoUrl(value) !== null || 'Use a Vimeo or YouTube link, e.g. https://vimeo.com/123456789'
}
