import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { MEDIA_SIZES, mediaSizeFilename } from '@/lib/media/sizes'
import { rejectOversizedUpload } from '@/lib/media/uploadLimit'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Library',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeOperation: [rejectOversizedUpload],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describes the image for screen readers.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    focalPoint: true,
    // Point the Studio straight at the Blob thumb. A size name ('thumb') would
    // use /api/media/file/..., which has no Blob handler when Payload access
    // control is disabled and returns 500.
    adminThumbnail: ({ doc }) => {
      const sizes = doc.sizes as { thumb?: { url?: string | null } } | undefined
      return sizes?.thumb?.url || (typeof doc.url === 'string' ? doc.url : null)
    },
    // Width-only WebP sizes. withoutEnlargement: true always writes every size
    // (narrow originals keep their own width), so loader URLs never 404.
    imageSizes: MEDIA_SIZES.map(({ name, width }) => ({
      name,
      width,
      withoutEnlargement: true,
      formatOptions: { format: 'webp' },
      generateImageName: ({ originalName, extension }) =>
        mediaSizeFilename(originalName, name, extension),
    })),
  },
}
