const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

/**
 * True only for a database on this machine (docker compose). Push mode and the
 * seed rely on this, so they can never touch Neon by accident.
 */
export function isLocalDatabaseUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}
