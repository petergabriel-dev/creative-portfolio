import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'
import { safeStudioRedirect } from '@/lib/studioLogin'

import { StudioBrand } from './StudioBrand'
import styles from './StudioLogin.module.css'
import { StudioLoginForm } from './StudioLoginForm'

const t = copy.studio.login

/**
 * `admin.components.views.login`: the Studio log-in (captures 20 and 20--error). Payload's RootPage
 * still sends an empty users table to create-first-user before this view renders.
 */
export async function StudioLogin({ initPageResult, searchParams }: AdminViewServerProps) {
  const target = searchParams?.redirect
  // Already logged in: go where the redirect points, if it is a safe Studio path (as Payload's view does).
  if (initPageResult.req.user) redirect(safeStudioRedirect(target))

  const settings = await getSiteSettings()
  const headline = settings.headline?.trim()

  return (
    <div className={styles.screen}>
      <div className={styles.brandPanel}>
        <StudioBrand name={settings.name} tone="dark" variant="full" />
        <div className={styles.headlineBlock}>
          <span aria-hidden="true" className={styles.rule} />
          {headline ? <p className={styles.headline}>{headline}</p> : null}
          <div className={styles.back}>
            <Button href="/" variant="text">
              {t.backToSite}
            </Button>
          </div>
        </div>
      </div>
      <div className={styles.formPanel}>
        <div className={styles.column}>
          <p className={styles.eyebrow}>{t.label}</p>
          <h1 className={styles.title}>{t.title}</h1>
          <StudioLoginForm redirect={typeof target === 'string' ? target : ''} />
        </div>
      </div>
    </div>
  )
}
