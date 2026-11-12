import { beforeEach, describe, expect, it, vi } from 'vitest'

const editor = { id: 7, email: 'editor@example.com', collection: 'users' }
const auth = vi.fn()
const update = vi.fn()
const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn() }

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/headers', () => ({ headers: async () => new Headers({ cookie: 'payload-token=abc' }) }))
vi.mock('payload', () => ({ getPayload: async () => ({ auth, update, logger }) }))

const { setInquiryStatus } = await import('@/components/studio/inboxActions')

const form = (fields: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}
const VALID = { id: '7', status: 'replied', tab: 'new', page: '2', next: '8' }
const act = (fields: Record<string, string> = VALID) => setInquiryStatus(null, form(fields))

beforeEach(() => {
  auth.mockReset().mockResolvedValue({ user: editor })
  update.mockReset().mockResolvedValue({ id: 7 })
  logger.error.mockReset()
})

describe('setInquiryStatus', () => {
  it('writes only the status, as the logged-in editor through access control', async () => {
    const result = await act()
    expect(update).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith({
      collection: 'inquiries',
      id: 7,
      data: { status: 'replied' },
      depth: 0,
      overrideAccess: false,
      user: editor,
    })
    expect(auth).toHaveBeenCalledWith({ headers: expect.any(Headers) })
    expect(result).toMatchObject({
      ok: true,
      notice: 'Marked as replied.',
      href: '/admin/collections/inquiries?status=new&page=2&id=8',
    })
  })

  it('announces each status and stays on the tab, selecting nothing when no card is left', async () => {
    await expect(act({ id: '7', status: 'archived', tab: 'replied', next: '' })).resolves.toMatchObject({
      ok: true,
      notice: 'Archived.',
      href: '/admin/collections/inquiries?status=replied&id=',
    })
    await expect(act({ id: '7', status: 'new', tab: 'archived' })).resolves.toMatchObject({
      ok: true,
      notice: 'Marked as new.',
      href: '/admin/collections/inquiries?status=archived&id=',
    })
  })

  it.each([
    { id: '0' },
    { id: '-1' },
    { id: '1.5' },
    { id: 'abc' },
    { id: '1;drop' },
    { id: '' },
    { status: 'deleted' },
    { status: 'NEW' },
    { tab: 'all' },
    { page: '0' },
    { page: 'x' },
    { next: 'x' },
    { next: '-3' },
  ])('rejects %j before touching the session or the database', async (override) => {
    const result = await act({ ...VALID, ...override })
    expect(result).toMatchObject({ ok: false, error: 'failed' })
    expect(auth).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('rejects a missing id or status', async () => {
    await expect(act({ status: 'replied', tab: 'new' })).resolves.toMatchObject({ ok: false, error: 'failed' })
    await expect(act({ id: '7', tab: 'new' })).resolves.toMatchObject({ ok: false, error: 'failed' })
    expect(update).not.toHaveBeenCalled()
  })

  it('writes nothing without a logged-in editor', async () => {
    auth.mockResolvedValue({ user: null })
    await expect(act()).resolves.toMatchObject({ ok: false, error: 'signedOut' })
    expect(update).not.toHaveBeenCalled()
  })

  it('reports a failed write and logs only the inquiry id and the error name', async () => {
    const failure = Object.assign(new Error('Forbidden for ana@example.com: [Couple names]'), { name: 'Forbidden' })
    update.mockRejectedValue(failure)
    await expect(act()).resolves.toMatchObject({ ok: false, error: 'failed' })
    expect(logger.error).toHaveBeenCalledTimes(1)
    const line = String(logger.error.mock.calls[0][0])
    expect(line).toBe('Inquiry 7 status change failed (Forbidden)')
    expect(line).not.toContain('example.com')
  })

  it('stamps every result so a repeated notice or error is announced again', async () => {
    const first = await act()
    const second = await act()
    expect(first?.at).toEqual(expect.any(Number))
    expect(second?.at).toEqual(expect.any(Number))
  })
})
