import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

import { MEDIA_SIZE_WIDTHS } from './src/lib/media/sizes'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Custom loader picks the nearest Payload size on Blob; Vercel image
    // optimisation (/_next/image) is never used.
    loader: 'custom',
    loaderFile: './src/lib/media/imageLoader.ts',
    deviceSizes: MEDIA_SIZE_WIDTHS,
    imageSizes: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  // Next's dev server prints every Server Function call with its arguments; the log-in's and the
  // inquiry form's previous state carry the typed email, so that logging stays off (invariant 26).
  logging: {
    serverFunctions: false,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
