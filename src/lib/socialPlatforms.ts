import { isHttpUrl } from './validateHttpUrl'

/** Platforms offered for site-settings.socials (Build Spec › Globals › site-settings). */
export const SOCIAL_PLATFORMS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Vimeo', value: 'vimeo' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Behance', value: 'behance' },
  { label: 'Dribbble', value: 'dribbble' },
  { label: 'Other', value: 'other' },
] as const

export type SocialLink = { platform: string; url: string }

/**
 * Visible link text for a social link. "Other" would not tell anyone where the
 * link goes, so it shows the site's host name instead.
 */
export function socialLinkLabel({ platform, url }: SocialLink): string {
  if (platform === 'other') return new URL(url).hostname.replace(/^www\./, '')
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? new URL(url).hostname
}

/** Only absolute http(s) links reach the page, even if bad data slips into the DB. */
export const safeSocialLinks = (socials: SocialLink[] | null | undefined): SocialLink[] =>
  (socials ?? []).filter((social) => isHttpUrl(social.url))
