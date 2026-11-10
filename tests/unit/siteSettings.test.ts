import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { revalidatePath } from 'next/cache'

import { revalidateLayout } from '@/hooks/revalidateLayout'
import { ACCENT_OPTIONS, accentToken } from '@/lib/accent'
import { isHttpUrl, validateHttpUrl } from '@/lib/validateHttpUrl'

type HookArgs = Parameters<typeof revalidateLayout>[0]

const hookArgs = (context: Record<string, unknown>) =>
  ({
    context,
    doc: { name: 'Your Name' },
    req: { payload: { logger: { info: vi.fn() } } },
  }) as unknown as HookArgs

describe('revalidateLayout', () => {
  beforeEach(() => vi.mocked(revalidatePath).mockClear())

  it('refreshes every page when site-settings changes', () => {
    expect(revalidateLayout(hookArgs({}))).toEqual({ name: 'Your Name' })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
  })

  it('skips revalidation when the seed sets disableRevalidate', () => {
    revalidateLayout(hookArgs({ disableRevalidate: true }))
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('accentToken', () => {
  it('maps every accent option to its primitive token', () => {
    expect(ACCENT_OPTIONS.map((option) => accentToken(option.value))).toEqual([
      '--accent-gold',
      '--accent-terracotta',
      '--accent-sage',
      '--accent-offwhite',
    ])
  })

  it('falls back to gold for missing or unknown values', () => {
    expect(accentToken(undefined)).toBe('--accent-gold')
    expect(accentToken('purple')).toBe('--accent-gold')
  })
})

describe('validateHttpUrl', () => {
  it('accepts absolute http(s) links', () => {
    expect(validateHttpUrl('https://instagram.com/yourname')).toBe(true)
    expect(validateHttpUrl('http://example.com')).toBe(true)
  })

  it('rejects script and other non-http links', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('JavaScript:alert(1)')).toBe(false)
    expect(isHttpUrl('data:text/html,hi')).toBe(false)
    expect(isHttpUrl('mailto:me@example.com')).toBe(false)
    expect(validateHttpUrl('javascript:alert(1)')).toMatch(/https:\/\//)
  })

  it('rejects relative or empty values', () => {
    expect(isHttpUrl('instagram.com/yourname')).toBe(false)
    expect(validateHttpUrl('')).toBe('This field is required.')
    expect(validateHttpUrl(undefined)).toBe('This field is required.')
  })
})
