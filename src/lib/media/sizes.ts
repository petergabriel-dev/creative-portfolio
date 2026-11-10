/**
 * Image sizes generated at upload (Build Spec › Media handling), smallest first.
 * Shared by the media collection, the next/image loader and next.config.
 */
export const MEDIA_SIZES = [
  { name: 'thumb', width: 480 },
  { name: 'card', width: 960 },
  { name: 'feature', width: 1600 },
  { name: 'hero', width: 2560 },
] as const

export type MediaSizeName = (typeof MEDIA_SIZES)[number]['name']

export const MEDIA_SIZE_WIDTHS: number[] = MEDIA_SIZES.map((size) => size.width)

/** Every size is stored as `<original name without extension>-<size>.webp`. */
export const mediaSizeFilename = (stem: string, size: MediaSizeName, extension = 'webp') =>
  `${stem}-${size}.${extension}`
