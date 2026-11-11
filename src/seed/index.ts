/**
 * Seed: `pnpm seed` (payload run src/seed/index.ts).
 *
 * Fills a fresh database with placeholder content. Safe to run twice: the
 * placeholder images, disciplines, projects, categories and posts are created
 * once (found by filename or slug), and site-settings is only filled while it is still empty,
 * so it never overwrites real edits. Never creates users.
 */
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config'
import { assertSeedAllowed } from './guard'
import { seedJournal } from './journal'
import { seedPortfolio } from './portfolio'

const PLACEHOLDER_FILENAME = 'seed-placeholder.webp'
// Seeds run outside a Next.js request, where revalidatePath cannot work.
const context = { disableRevalidate: true }

async function seed() {
  assertSeedAllowed(process.env, process.env.POSTGRES_URL)
  const payload = await getPayload({ config })

  // The seed has no logged-in user, so it writes with overrideAccess (Local API
  // default, stated explicitly). The guard above is what keeps it safe.
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: PLACEHOLDER_FILENAME } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  let imageId = existing.docs[0]?.id
  if (imageId) {
    payload.logger.info(`Seed: placeholder image already exists (media ${imageId})`)
  } else {
    // A plain "frame" tile, the same colour the site shows while images load.
    const data = await sharp({
      create: { width: 1600, height: 900, channels: 3, background: '#DCD6CC' },
    })
      .webp()
      .toBuffer()
    const image = await payload.create({
      collection: 'media',
      data: { alt: '[Placeholder image]' },
      file: { data, mimetype: 'image/webp', name: PLACEHOLDER_FILENAME, size: data.length },
      context,
      overrideAccess: true,
    })
    imageId = image.id
    payload.logger.info(`Seed: created placeholder image (media ${imageId})`)
  }

  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  if (settings.name) {
    payload.logger.info('Seed: site-settings already filled in, left unchanged')
  } else {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        name: 'Your Name',
        roleLine: 'Multidisciplinary creative',
        location: '[City, Country]',
        contactEmail: 'hello@example.com',
        replyTime: '[response time]',
        socials: [
          { platform: 'instagram', url: 'https://example.com/your-instagram' },
          { platform: 'other', url: 'https://example.org' },
        ],
        accent: 'gold',
        bookingLabel: 'Book Me',
        headline: 'Every moment has a story',
        finaleHeadline: "Let's capture your story",
        footerNote: 'All work by Your Name',
        defaultMeta: {
          titleTemplate: '%s · Your Name',
          description: '[One or two sentences about your work, for search results and link previews.]',
          image: imageId,
        },
      },
      context,
      overrideAccess: true,
    })
    payload.logger.info('Seed: filled site-settings with placeholder content')
  }

  await seedPortfolio(payload)
  // After the portfolio: posts link to seeded projects.
  await seedJournal(payload)
}

try {
  await seed()
  process.exit(0)
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
