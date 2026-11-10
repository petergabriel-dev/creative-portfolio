import { ChapterOpener } from '@/components/site/ChapterOpener'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'

/**
 * 404 page (docs/design/components/NotFoundPage.md). Unknown routes reach it via
 * [...slug]. Next 16 sends it through its error-recovery path: HTTP 404 with a
 * minimal HTML shell, and the page itself rendered from the RSC payload.
 */
export default async function NotFound() {
  const settings = await getSiteSettings()

  return (
    <>
      <ChapterOpener
        actions={
          <>
            <Button href="/" size="primary" variant="outline-light">
              {copy.notFound.backHome}
            </Button>
            <Button href="/portfolio" size="primary" trailingArrow variant="text">
              {copy.notFound.browsePortfolio}
            </Button>
          </>
        }
        as="main"
        contextLine={copy.notFound.contextLine}
        header={<SiteHeader settings={settings} tone="dark" />}
        lead={copy.notFound.lead}
        title={copy.notFound.title}
      />
      <SiteFooter settings={settings} />
    </>
  )
}
