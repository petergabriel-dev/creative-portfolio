import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const logError = vi.fn()

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
// redirect() ends a server action by throwing; the tests read the target from the error.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT:${to}`)
  }),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@payloadcms/next/auth', () => ({ login: vi.fn() }))
vi.mock('payload', () => ({
  AuthenticationError: class AuthenticationError extends Error {
    name = 'AuthenticationError'
  },
  LockedAuth: class LockedAuth extends Error {
    name = 'LockedAuth'
  },
  getPayload: vi.fn(async () => ({ logger: { error: logError } })),
}))
vi.mock('@/lib/getSiteSettings', () => ({
  getSiteSettings: vi.fn(async () => ({ name: 'Your Name', headline: 'Every moment has a story' })),
}))

import { login } from '@payloadcms/next/auth'
import { AuthenticationError, LockedAuth } from 'payload'

import { loginAction } from '@/components/studio/loginAction'
import { StudioLogin } from '@/components/studio/StudioLogin'
import { StudioLoginFormView } from '@/components/studio/StudioLoginForm'
import { INITIAL_LOGIN_STATE, type LoginState, safeStudioRedirect } from '@/lib/studioLogin'

const form = (fields: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}
const run = (fields: Record<string, string>) => loginAction(INITIAL_LOGIN_STATE, form(fields))

beforeEach(() => {
  vi.mocked(login).mockReset()
  logError.mockReset()
})

describe('loginAction', () => {
  it('never calls Payload with a blank field and marks the blank ones', async () => {
    await expect(run({ email: '  ', password: 'secret' })).resolves.toEqual({ error: 'empty', email: '', invalid: ['email'] })
    await expect(run({ email: 'me@example.com', password: '' })).resolves.toEqual({
      error: 'empty',
      email: 'me@example.com',
      invalid: ['password'],
    })
    await expect(run({})).resolves.toMatchObject({ error: 'empty', invalid: ['email', 'password'] })
    expect(login).not.toHaveBeenCalled()
  })

  it("logs in through Payload's login() with the trimmed email", async () => {
    vi.mocked(login).mockResolvedValue({} as never)
    await expect(run({ email: ' me@example.com ', password: 'secret' })).rejects.toThrow('REDIRECT:/admin')
    expect(login).toHaveBeenCalledWith({ collection: 'users', config: {}, email: 'me@example.com', password: 'secret' })
  })

  it('maps a locked account and wrong details to their messages, keeping the email', async () => {
    vi.mocked(login).mockRejectedValueOnce(new LockedAuth())
    await expect(run({ email: 'me@example.com', password: 'secret' })).resolves.toEqual({
      error: 'locked',
      email: 'me@example.com',
      invalid: [],
    })
    vi.mocked(login).mockRejectedValueOnce(new AuthenticationError())
    await expect(run({ email: 'me@example.com', password: 'wrong' })).resolves.toEqual({
      error: 'invalid',
      email: 'me@example.com',
      invalid: ['email', 'password'],
    })
    expect(logError).not.toHaveBeenCalled()
  })

  it('logs only the name of an unexpected error, never the email, password or message', async () => {
    const error = new TypeError('connect failed for me@example.com with hunter2')
    vi.mocked(login).mockRejectedValueOnce(error)
    await expect(run({ email: 'me@example.com', password: 'hunter2' })).resolves.toMatchObject({ error: 'failed' })
    expect(logError).toHaveBeenCalledTimes(1)
    const line = String(logError.mock.calls[0][0])
    expect(line).toContain('TypeError')
    expect(line).not.toMatch(/me@example\.com|hunter2|connect failed/)
  })

  it('redirects only to a safe Studio path after logging in', async () => {
    vi.mocked(login).mockResolvedValue({} as never)
    const cases: [string, string][] = [
      ['/admin/collections/posts', '/admin/collections/posts'],
      ['//evil.example', '/admin'],
      ['https://evil.example', '/admin'],
      ['/journal', '/admin'],
    ]
    for (const [given, expected] of cases) {
      await expect(run({ email: 'me@example.com', password: 'secret', redirect: given })).rejects.toThrow(
        `REDIRECT:${expected}`,
      )
    }
  })
})

describe('safeStudioRedirect', () => {
  it('keeps Studio paths and refuses everything else', () => {
    expect(safeStudioRedirect('/admin')).toBe('/admin')
    expect(safeStudioRedirect('/admin/globals/home')).toBe('/admin/globals/home')
    expect(safeStudioRedirect('/admin?tab=1')).toBe('/admin?tab=1')
    // Dot-segments resolve before the check: escaping /admin falls back, staying inside is normalised.
    expect(safeStudioRedirect('/admin/../api/users/me')).toBe('/admin')
    expect(safeStudioRedirect('/admin/%2e%2e/journal')).toBe('/admin')
    expect(safeStudioRedirect('/admin/collections/../globals/home')).toBe('/admin/globals/home')
    for (const unsafe of ['//evil.example', '/\\evil.example', '/%2F%2Fevil.example', 'https://evil.example', '/javascript:alert(1)', '/administrator', '/', '', undefined, ['/admin']]) {
      expect(safeStudioRedirect(unsafe)).toBe('/admin')
    }
  })
})

describe('StudioLogin', () => {
  const props = (user: unknown, redirect?: string) =>
    ({ initPageResult: { req: { user } }, searchParams: redirect ? { redirect } : {} }) as unknown as AdminViewServerProps

  it('sends a logged-in visitor on to the safe target', async () => {
    await expect(StudioLogin(props({ id: 1 }, '/admin/collections/media'))).rejects.toThrow('REDIRECT:/admin/collections/media')
    await expect(StudioLogin(props({ id: 1 }, 'https://evil.example'))).rejects.toThrow('REDIRECT:/admin')
  })

  it('renders the brand panel, one h1 and the form with the raw redirect for the server to check', async () => {
    const html = renderToStaticMarkup((await StudioLogin(props(null, '/admin/collections/posts')))!)
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).toMatch(/<h1[^>]*>Log in<\/h1>/)
    expect(html).toContain('Every moment has a story')
    expect(html).toContain('Studio · CMS')
    expect(html).toMatch(/<a href="\/"[^>]*>Back to the site/)
    expect(html).toMatch(/<input type="hidden" name="redirect" value="\/admin\/collections\/posts"\/>|name="redirect"[^>]*value="\/admin\/collections\/posts"/)
  })
})

describe('StudioLoginFormView', () => {
  const view = (state: Partial<LoginState>, pending = false) =>
    renderToStaticMarkup(
      <form>
        <StudioLoginFormView pending={pending} redirect="" state={{ ...INITIAL_LOGIN_STATE, ...state }} />
      </form>,
    )

  it('has labelled email and password fields and no alert by default', () => {
    const html = view({})
    expect(html).toMatch(/<label[^>]*for="studio-login-email"[^>]*>Email<\/label>/)
    expect(html).toMatch(/<input[^>]*autoComplete="email"|<input[^>]*autocomplete="email"/)
    expect(html).toMatch(/type="email"/)
    expect(html).toMatch(/autocomplete="current-password"/i)
    expect(html).not.toContain('role="alert"')
    expect(html).not.toContain('aria-invalid')
    expect(html).toContain('After 5 wrong tries the account locks for 15 minutes.')
    expect(html).toMatch(/<a href="\/admin\/forgot"/)
  })

  it('marks both fields and announces wrong details', () => {
    const html = view({ error: 'invalid', email: 'me@example.com', invalid: ['email', 'password'] })
    expect(html).toMatch(/role="alert"[^>]*>That email and password don(&#x27;|')t match\.<\/div>/)
    expect(html.match(/aria-invalid="true"/g)).toHaveLength(2)
    expect(html.match(/aria-describedby="studio-login-error"/g)).toHaveLength(2)
    expect(html).toContain('value="me@example.com"')
  })

  it('marks only the blank field when one is empty, and no field when locked', () => {
    const empty = view({ error: 'empty', email: 'me@example.com', invalid: ['password'] })
    expect(empty).toContain('Enter your email and password to log in.')
    expect(empty.match(/aria-invalid="true"/g)).toHaveLength(1)
    const locked = view({ error: 'locked', email: 'me@example.com', invalid: [] })
    expect(locked).toContain('This account is locked after too many wrong tries. Try again in 15 minutes.')
    expect(locked).not.toContain('aria-invalid')
  })

  it('disables the button and says so while logging in', () => {
    const html = view({}, true)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Logging in…<\/button>/)
    expect(html).toMatch(/role="status"[^>]*>Logging in…/)
  })
})

describe('the password-reset email', () => {
  it('links to the Studio reset view with an absolute URL, escaping what it inserts', async () => {
    const { resetPasswordEmailHtml } = await import('@/lib/studioLogin')
    const html = resetPasswordEmailHtml('2e8c436e', 'https://creative-portfolio-git-x.vercel.app')
    expect(html).toContain('<a href="https://creative-portfolio-git-x.vercel.app/admin/reset/2e8c436e">')
    expect(resetPasswordEmailHtml('a"b<c', 'https://example.com')).toContain('/admin/reset/a%22b%3Cc')
    expect(html).not.toMatch(/href="\/admin/)
  })

  it("is the users collection's reset email, built from the trusted base URL rather than the Host header", async () => {
    vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://studio.example.com/')
    const { Users } = await import('@/collections/Users')
    const forgot = Users.auth && typeof Users.auth === 'object' ? Users.auth.forgotPassword : undefined
    const html = await forgot?.generateEmailHTML?.({ token: 'abc123', req: { headers: new Headers({ host: 'evil.example' }) } } as never)
    expect(html).toContain('href="https://studio.example.com/admin/reset/abc123"')
    expect(html).not.toContain('evil.example')
    vi.unstubAllEnvs()
  })
})
