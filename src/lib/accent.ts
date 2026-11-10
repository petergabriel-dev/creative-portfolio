/** Accent options for site-settings.accent (Build Spec › Globals › site-settings). */
export const ACCENT_OPTIONS = [
  { label: 'Gold', value: 'gold' },
  { label: 'Terracotta', value: 'terracotta' },
  { label: 'Sage', value: 'sage' },
  { label: 'Off-white', value: 'offwhite' },
] as const

export type Accent = (typeof ACCENT_OPTIONS)[number]['value']

export const DEFAULT_ACCENT: Accent = 'gold'

/**
 * Primitive token that `--gold` should point at for this accent. Colours live
 * in tokens.css only; unknown values fall back to gold.
 */
export function accentToken(accent: unknown): `--accent-${Accent}` {
  const match = ACCENT_OPTIONS.find((option) => option.value === accent)
  return `--accent-${match ? match.value : DEFAULT_ACCENT}`
}
