import { ChapterOpener } from '@/components/site/ChapterOpener'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'

// ponytail: temporary Home placeholder so Home links work and the header's current
// state is visible; the real Home (hero slider, chapters) replaces it in P4.
export default async function HomePage() {
  const settings = await getSiteSettings()

  return (
    <>
      <ChapterOpener
        as="main"
        contextLine={settings.roleLine ?? ''}
        header={<SiteHeader current="home" settings={settings} tone="dark" />}
        title={settings.headline || settings.name || copy.site.fallbackName}
      />
      <SiteFooter settings={settings} />
    </>
  )
}
