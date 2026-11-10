import { MEDIA_SIZES, mediaSizeFilename, type MediaSizeName } from './sizes'

const BLOB_URL = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//

/** The smallest generated size at least `width` wide, else the largest. */
export function mediaSizeFor(width: number): MediaSizeName {
  return (MEDIA_SIZES.find((size) => size.width >= width) ?? MEDIA_SIZES[MEDIA_SIZES.length - 1])
    .name
}

/** Maps an original's Blob URL to the URL of the generated size that fits `width`. */
export function mediaSizeUrl(src: string, width: number): string {
  const url = new URL(src)
  const slash = url.pathname.lastIndexOf('/')
  const file = url.pathname.slice(slash + 1)
  const dot = file.lastIndexOf('.')
  const stem = dot > 0 ? file.slice(0, dot) : file
  url.pathname = url.pathname.slice(0, slash + 1) + mediaSizeFilename(stem, mediaSizeFor(width))
  url.search = ''
  return url.toString()
}

/**
 * next/image custom loader (images.loaderFile). Vercel image optimisation is
 * never called: Blob media resolves to a pre-generated WebP size.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  // ponytail: non-Blob sources pass through unchanged; add handling if the site ever ships static raster images.
  return BLOB_URL.test(src) ? mediaSizeUrl(src, width) : src
}
