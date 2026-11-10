import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import type { CSSProperties, ReactNode } from 'react'

import { copy } from '@/copy'
import { accentToken } from '@/lib/accent'
import { getSiteSettings } from '@/lib/getSiteSettings'
import type { Media } from '@/payload-types'

import '@/styles/tokens.css'
import '@/styles/globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas-neue',
})

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

/** Default metadata from site-settings.defaultMeta; pages override title and description. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings.name || copy.site.fallbackName
  const image: Media | null =
    typeof settings.defaultMeta?.image === 'object' ? settings.defaultMeta.image : null
  const imageUrl = image?.sizes?.feature?.url || image?.url

  return {
    title: {
      default: name,
      template: settings.defaultMeta?.titleTemplate || '%s',
    },
    description: settings.defaultMeta?.description || undefined,
    openGraph: imageUrl ? { images: [{ url: imageUrl, alt: image?.alt }] } : undefined,
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings()
  // The accent chosen in site-settings drives --gold through its named token.
  const accentStyle = { '--gold': `var(${accentToken(settings.accent)})` } as CSSProperties

  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`} style={accentStyle}>
      <body>{children}</body>
    </html>
  )
}
