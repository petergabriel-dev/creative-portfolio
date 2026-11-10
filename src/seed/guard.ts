import { isLocalDatabaseUrl } from '../lib/isLocalDatabaseUrl'

type Env = Record<string, string | undefined>

/**
 * Throws unless seeding is safe: never production, and only the local database
 * unless SEED_ALLOW_REMOTE=true is set on purpose (e.g. a Neon preview branch).
 */
export function assertSeedAllowed(env: Env, dbUrl: string | undefined): void {
  if (env.VERCEL_ENV === 'production') {
    throw new Error('Refusing to seed: VERCEL_ENV is production.')
  }
  if (!dbUrl) {
    throw new Error('Refusing to seed: POSTGRES_URL is not set.')
  }
  if (!isLocalDatabaseUrl(dbUrl) && env.SEED_ALLOW_REMOTE !== 'true') {
    throw new Error(
      'Refusing to seed a non-local database. Set SEED_ALLOW_REMOTE=true to seed a preview branch on purpose.',
    )
  }
}
