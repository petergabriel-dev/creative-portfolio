import { describe, expect, it } from 'vitest'

import { isLocalDatabaseUrl } from '@/lib/isLocalDatabaseUrl'
import { assertSeedAllowed } from '@/seed/guard'

const LOCAL = 'postgres://postgres:postgres@127.0.0.1:5432/portfolio'
const NEON = 'postgres://user:pass@ep-quiet-sun-123456-pooler.ap-southeast-1.aws.neon.tech/neondb'

describe('isLocalDatabaseUrl', () => {
  it('accepts databases on this machine only', () => {
    expect(isLocalDatabaseUrl(LOCAL)).toBe(true)
    expect(isLocalDatabaseUrl('postgres://u:p@localhost/db')).toBe(true)
    expect(isLocalDatabaseUrl('postgres://u:p@[::1]:5432/db')).toBe(true)
    expect(isLocalDatabaseUrl(NEON)).toBe(false)
    expect(isLocalDatabaseUrl('postgres://u:p@localhost.attacker.example/db')).toBe(false)
    expect(isLocalDatabaseUrl(undefined)).toBe(false)
    expect(isLocalDatabaseUrl('not a url')).toBe(false)
  })
})

describe('assertSeedAllowed', () => {
  it('refuses production, even with the remote flag', () => {
    expect(() => assertSeedAllowed({ VERCEL_ENV: 'production' }, LOCAL)).toThrow(/production/)
    expect(() =>
      assertSeedAllowed({ VERCEL_ENV: 'production', SEED_ALLOW_REMOTE: 'true' }, NEON),
    ).toThrow(/production/)
  })

  it('refuses remote databases unless SEED_ALLOW_REMOTE=true', () => {
    expect(() => assertSeedAllowed({}, NEON)).toThrow(/non-local/)
    expect(() => assertSeedAllowed({ SEED_ALLOW_REMOTE: '1' }, NEON)).toThrow(/non-local/)
    expect(() => assertSeedAllowed({ VERCEL_ENV: 'preview', SEED_ALLOW_REMOTE: 'true' }, NEON)).not.toThrow()
  })

  it('allows the local database and refuses a missing URL', () => {
    expect(() => assertSeedAllowed({}, LOCAL)).not.toThrow()
    expect(() => assertSeedAllowed({}, undefined)).toThrow(/POSTGRES_URL/)
  })
})
