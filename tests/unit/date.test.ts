import { describe, expect, it } from 'vitest'

import { formatDate, isoDate } from '@/lib/date'

describe('formatDate (Singapore time, "6 Nov 2026")', () => {
  it('formats a date as day, short month and year', () => {
    expect(formatDate('2026-11-06T02:00:00.000Z')).toBe('6 Nov 2026')
    expect(formatDate('2026-01-31T04:00:00.000Z')).toBe('31 Jan 2026')
  })

  it('writes September as "Sep", not en-GB\'s "Sept"', () => {
    expect(formatDate('2026-09-05T02:00:00.000Z')).toBe('5 Sep 2026')
  })

  it('uses the Singapore calendar day, not UTC', () => {
    // 16:30 UTC on 5 Nov is 00:30 on 6 Nov in Singapore.
    expect(formatDate('2026-11-05T16:30:00.000Z')).toBe('6 Nov 2026')
    expect(isoDate('2026-11-05T16:30:00.000Z')).toBe('2026-11-06')
    // 15:59 UTC is still 23:59 the same day there.
    expect(formatDate('2026-11-05T15:59:00.000Z')).toBe('5 Nov 2026')
    // New Year rolls over in Singapore first.
    expect(formatDate('2026-12-31T16:00:00.000Z')).toBe('1 Jan 2027')
  })

  it('returns an empty string for missing or invalid dates', () => {
    for (const value of [undefined, null, '', 'not a date', 42]) {
      expect(formatDate(value)).toBe('')
      expect(isoDate(value)).toBe('')
    }
  })

  it('gives a zero-padded machine-readable date', () => {
    expect(isoDate('2026-03-04T02:00:00.000Z')).toBe('2026-03-04')
  })
})
