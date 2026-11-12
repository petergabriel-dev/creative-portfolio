'use client'

import { FieldError, useField, useFormFields } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import type { CSSProperties } from 'react'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { type Accent, ACCENT_OPTIONS, accentToken, DEFAULT_ACCENT } from '@/lib/accent'

import styles from './StudioAccentSwatches.module.css'

const t = copy.studio.swatches

type ViewProps = {
  name: string
  value: unknown
  label: string
  description: string
  bookingLabel: string
  disabled: boolean
  onChange: (value: Accent) => void
}

/** A custom property pointing at the accent's token; colours stay in tokens.css. */
const accentVar = (name: string, accent: Accent) => ({ [name]: `var(${accentToken(accent)})` }) as CSSProperties

/** The swatches and preview; a pure view, so every state renders in tests. */
export function AccentSwatchesView({ name, value, label, description, bookingLabel, disabled, onChange }: ViewProps) {
  const current = ACCENT_OPTIONS.find((option) => option.value === value)?.value ?? DEFAULT_ACCENT
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>
        {label}
        {description ? <span>{` ${copy.separator} ${description}`}</span> : null}
      </legend>
      <div className={styles.body}>
        <div className={styles.swatches}>
          {ACCENT_OPTIONS.map((option) => (
            <label className={styles.option} key={option.value}>
              <input
                checked={current === option.value}
                className={styles.swatch}
                name={name}
                onChange={() => onChange(option.value)}
                style={accentVar('--swatch', option.value)}
                type="radio"
                value={option.value}
              />
              <span className={styles.name}>{option.label}</span>
            </label>
          ))}
        </div>
        {/* A picture of the site's Book Me button, not a control. */}
        <div aria-hidden="true" className={styles.preview} inert style={accentVar('--color-booking', current)}>
          <span className={styles.previewLabel}>{t.preview}</span>
          <Button type="button" variant="gold">
            {bookingLabel.trim() || t.fallbackLabel}
          </Button>
        </div>
      </div>
    </fieldset>
  )
}

/**
 * `admin.components.Field` for `site-settings.accent` (P6 owner decision 9): four round swatches as a
 * native radio group with visible names, and a live Book Me preview. It writes the same select values.
 */
export function StudioAccentSwatches({ field, path, readOnly }: SelectFieldClientProps) {
  const { value, setValue, disabled } = useField<string>({ path })
  const bookingLabel = useFormFields(([fields]) => fields.bookingLabel?.value)
  const label = typeof field.label === 'string' ? field.label : field.name
  const description = typeof field.admin?.description === 'string' ? field.admin.description : ''
  return (
    <div className={styles.field}>
      <AccentSwatchesView
        bookingLabel={typeof bookingLabel === 'string' ? bookingLabel : ''}
        description={description}
        disabled={Boolean(disabled || readOnly)}
        label={label}
        name={path}
        onChange={setValue}
        value={value}
      />
      <FieldError path={path} />
    </div>
  )
}
