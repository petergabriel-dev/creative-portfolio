import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Disciplines } from './collections/Disciplines'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { isLocalDatabaseUrl } from './lib/isLocalDatabaseUrl'
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
  // Sidebar order follows this list (Portfolio: Projects, Collections; Journal: Posts, Categories).
  collections: [Projects, Disciplines, Posts, Categories, Media, Users],
  globals: [SiteSettings],
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
    // Push mode only ever on the local docker database; Neon gets migrations only.
    push: isLocalDatabaseUrl(process.env.POSTGRES_URL),
  }),
  sharp,
  // Direct (multipart) uploads: reject anything over the limit with HTTP 413.
  upload: {
    limits: {
      fileSize: MAX_UPLOAD_BYTES,
    },
  },
  plugins: [
    // Meta title, description and image in an SEO tab (Build Spec › Decisions & stack).
    seoPlugin({
      collections: ['disciplines', 'projects', 'posts'],
      uploadsCollection: 'media',
      tabbedUI: true,
    }),
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
