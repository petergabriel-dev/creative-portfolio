import type { SelectFieldClientProps } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const setValue = vi.fn()
let fieldState: { value: unknown; disabled: boolean } = { value: 'sage', disabled: false }
let formBookingLabel: unknown = 'Work with me'

vi.mock('@payloadcms/ui', () => ({
  useField: () => ({ ...fieldState, setValue }),
  useFormFields: (selector: (state: [Record<string, { value: unknown }>]) => unknown) =>
    selector([{ bookingLabel: { value: formBookingLabel } }]),
  FieldError: ({ path }: { path: string }) => <span data-error-for={path} />,
}))

import { AccentSwatchesView, StudioAccentSwatches } from '@/components/studio/StudioAccentSwatches'

const view = (props: Partial<Parameters<typeof AccentSwatchesView>[0]> = {}) =>
  renderToStaticMarkup(
    <AccentSwatchesView
      bookingLabel="Book Me"
      description="Book Me buttons and progress only"
      disabled={false}
      label="Accent colour"
      name="accent"
      onChange={() => {}}
      value="gold"
      {...props}
    />,
  )

const radios = (html: string) =>
  [...html.matchAll(/<input([^>]*)type="radio"([^>]*)\/>/g)].map((m) => {
    const attrs = m[1] + m[2]
    return { value: /value="([a-z]+)"/.exec(attrs)?.[1], checked: attrs.includes('checked'), style: /style="([^"]*)"/.exec(attrs)?.[1] }
  })

describe('AccentSwatchesView', () => {
  it('is a fieldset whose legend carries the label and description, as capture 29', () => {
    const html = view()
    expect(html).toMatch(/^<fieldset class="[^"]*"><legend class="[^"]*">Accent colour<span> · Book Me buttons and progress only<\/span><\/legend>/)
  })

  it('offers the four accents as one native radio group, each with a visible name', () => {
    const html = view({ value: 'terracotta' })
    expect(radios(html)).toEqual([
      { value: 'gold', checked: false, style: '--swatch:var(--accent-gold)' },
      { value: 'terracotta', checked: true, style: '--swatch:var(--accent-terracotta)' },
      { value: 'sage', checked: false, style: '--swatch:var(--accent-sage)' },
      { value: 'offwhite', checked: false, style: '--swatch:var(--accent-offwhite)' },
    ])
    expect(html.match(/name="accent"/g)).toHaveLength(4)
    for (const name of ['Gold', 'Terracotta', 'Sage', 'Off-white']) expect(html).toContain(`>${name}</span></label>`)
  })

  it('previews the selected accent on the site Button, hidden from assistive tech and inert', () => {
    const html = view({ value: 'sage', bookingLabel: 'Work with me' })
    expect(html).toMatch(/<div aria-hidden="true" class="[^"]*" inert="" style="--color-booking:var\(--accent-sage\)">/)
    expect(html).toMatch(/<button class="[^"]*_gold_[^"]*" type="button">Work with me<\/button>/)
  })

  it('falls back to gold for an unknown value and to "Book Me" for a blank label', () => {
    const html = view({ value: 'neon', bookingLabel: '  ' })
    expect(radios(html).find((r) => r.checked)?.value).toBe('gold')
    expect(html).toContain('>Book Me</button>')
  })

  it('disables the whole group when the field is read-only', () => {
    expect(view({ disabled: true })).toMatch(/^<fieldset class="[^"]*" disabled="">/)
  })

  it('contains no colour values, only token references', () => {
    expect(view()).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(/i)
  })
})

describe('StudioAccentSwatches (field component)', () => {
  const props = {
    path: 'accent',
    field: { name: 'accent', label: 'Accent colour', admin: { description: 'Book Me buttons and progress only' } },
  } as unknown as SelectFieldClientProps

  it('reads the field value and the form’s booking label', () => {
    fieldState = { value: 'sage', disabled: false }
    formBookingLabel = 'Work with me'
    const html = renderToStaticMarkup(<StudioAccentSwatches {...props} />)
    expect(radios(html).find((r) => r.checked)?.value).toBe('sage')
    expect(html).toContain('>Work with me</button>')
    expect(html).toContain('data-error-for="accent"')
  })

  it('is disabled while the form is or the field is read-only', () => {
    fieldState = { value: 'gold', disabled: true }
    expect(renderToStaticMarkup(<StudioAccentSwatches {...props} />)).toContain('disabled=""')
    fieldState = { value: 'gold', disabled: false }
    expect(renderToStaticMarkup(<StudioAccentSwatches {...props} readOnly />)).toContain('disabled=""')
  })
})
