import { LensMark } from '@/components/site/LensMark'
import { copy } from '@/copy'
import { getSiteSettings } from '@/lib/getSiteSettings'

import styles from './StudioBrand.module.css'

type StudioBrandProps = {
  /** The site name; blank shows copy.site.fallbackName. */
  name?: string | null
  variant: 'full' | 'icon'
  /** `full` only: dark on the ink sidebar and login panel, light on Payload's bone minimal views. */
  tone?: 'dark' | 'light'
}

/** Lens mark + site name + "Studio · CMS" (docs/design/components/StudioNav.md › StudioBrand). */
export function StudioBrand({ name, variant, tone = 'dark' }: StudioBrandProps) {
  if (variant === 'icon') {
    return (
      <span className={styles.icon}>
        <LensMark className={styles.mark} />
        <span className={styles.visuallyHidden}>{copy.studio.iconLabel}</span>
      </span>
    )
  }
  return (
    <div className={[styles.brand, tone === 'light' ? styles.light : styles.dark].join(' ')}>
      <p className={styles.nameRow}>
        <LensMark className={styles.mark} />
        <span className={styles.name}>{name?.trim() || copy.site.fallbackName}</span>
      </p>
      <p className={styles.label}>{copy.studio.brandLabel}</p>
    </div>
  )
}

/** `admin.components.graphics.Logo`: Payload draws it on its own login and verify views (bone page). */
export async function StudioLogo() {
  const settings = await getSiteSettings()
  return <StudioBrand name={settings.name} tone="light" variant="full" />
}

/** `admin.components.graphics.Icon`: the app header's home link. */
export function StudioIcon() {
  return <StudioBrand variant="icon" />
}
