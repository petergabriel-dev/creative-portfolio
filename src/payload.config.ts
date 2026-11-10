import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MAX_UPLOAD_BYTES } from './lib/media/uploadLimit'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Blob paths: previews share one store under preview/, local dev uses local/.
// Production (P7) gets its own store, so no prefix.
const blobPrefix =
  process.env.VERCEL_ENV === 'production' ? undefined : process.env.VERCEL ? 'preview' : 'local'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  // GraphQL is off; the admin uses REST at /api and the site uses the Local API.
  graphQL: {
    disable: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  sharp,
  // Direct (multipart) uploads: reject anything over the limit with HTTP 413.
  upload: {
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  },
  plugins: [
    vercelBlobStorage({
      // Same schema with or without a token, so migrations match everywhere.
      alwaysInsertFields: true,
      // Browser uploads straight to Blob, avoiding Vercel's 4.5 MB request limit.
      clientUploads: true,
      collections: {
        media: {
          prefix: blobPrefix,
          // Public pages load images straight from Blob, never through /api.
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
