/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
// Ours, not Payload's template (P5 Studio theme): the next/font imports, the tokens.css import and
// `htmlProps` below. Keep them if Payload's template is ever regenerated.
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { Bebas_Neue, Inter } from 'next/font/google'
import React from 'react'

import { importMap } from './admin/importMap.js'
import '@/styles/tokens.css'
import './custom.scss'

// ponytail: same settings as src/app/(frontend)/layout.tsx; keep the two in sync (or move both
// into one shared module if a third layout ever needs them).
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

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// The font variables sit on <html>, so Payload's portals (drawers, modals, toasts) get them too.
const Layout = ({ children }: Args) => (
  <RootLayout
    config={config}
    htmlProps={{ className: `${bebasNeue.variable} ${inter.variable}` }}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    {children}
  </RootLayout>
)

export default Layout
