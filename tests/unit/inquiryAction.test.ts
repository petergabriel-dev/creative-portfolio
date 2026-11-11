import { beforeEach, describe, expect, it, vi } from 'vitest'

const create = vi.fn()
const sendEmail = vi.fn()
const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
let contactEmail: string | null = 'owner@example.com'

class FakeValidationError extends Error {
  data: { errors: { path: string; message: string }[] }
  constructor(paths: string[]) {
    super('The following field is invalid')
    this.name = 'ValidationError'
    this.data = { errors: paths.map((path) => ({ path, message: `${path} invalid` })) }
  }
}

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: async () => ({ create, sendEmail, logger }),
  ValidationError: FakeValidationError,
}))
vi.mock('@/lib/portfolio', () => ({
  getDisciplines: async () => [{ name: 'Photography' }, { name: 'Film & Video' }],
}))
vi.mock('@/lib/getSiteSettings', () => ({
  getSiteSettings: async () => ({ contactEmail }),
}))

const { submitInquiry } = await import('@/app/(frontend)/book/actions')

const VISITOR = {
  name: 'Ana Reyes',
  email: 'ana@example.com',
  projectType: 'Film & Video',
  timing: 'June 2027',
  message: 'A short film for our studio opening.',
}

const form = (fields: Record<string, string>) => {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}
const submit = (fields: Record<string, string> = VISITOR) => submitInquiry({ status: 'idle' }, form(fields))

/** Every string the action logged, for the no-PII checks. */
const logged = () =>
  [...logger.error.mock.calls, ...logger.warn.mock.calls, ...logger.info.mock.calls].flat().map(String).join('\n')

const expectNoVisitorDataLogged = () => {
  const text = logged()
  for (const value of Object.values(VISITOR)) expect(text).not.toContain(value)
}

beforeEach(() => {
  vi.useRealTimers()
  create.mockReset().mockResolvedValue({ id: 7 })
  sendEmail.mockReset().mockResolvedValue({ id: 'email-1' })
  logger.error.mockReset()
  logger.warn.mockReset()
  logger.info.mockReset()
  contactEmail = 'owner@example.com'
})

describe('submitInquiry', () => {
  it('saves a valid inquiry with only the form fields and status new, then alerts the owner', async () => {
    expect(await submit({ ...VISITOR, elapsedMs: '8000', ip: '1.2.3.4', status: 'archived', notes: 'x' })).toEqual({
      status: 'sent',
    })
    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith({
      collection: 'inquiries',
      data: { ...VISITOR, status: 'new' },
      overrideAccess: true,
    })
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail.mock.calls[0][0]).toMatchObject({
      to: 'owner@example.com',
      replyTo: 'ana@example.com',
      subject: 'New inquiry · Film & Video · Ana Reyes',
    })
    expect(sendEmail.mock.calls[0][0].text).toContain('/admin/collections/inquiries/7')
  })

  it('creates before it sends', async () => {
    await submit()
    expect(create.mock.invocationCallOrder[0]).toBeLessThan(sendEmail.mock.invocationCallOrder[0])
  })

  it('returns field errors and the typed values for invalid input, saving nothing', async () => {
    const result = await submit({ ...VISITOR, email: 'ana@', projectType: 'Weddings' })
    expect(result).toEqual({
      status: 'invalid',
      errors: { email: 'Please check your email address.', projectType: 'Please choose the kind of project.' },
      values: { ...VISITOR, email: 'ana@', projectType: 'Weddings' },
    })
    expect(create).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('answers sent for a filled honeypot without saving or sending', async () => {
    expect(await submit({ ...VISITOR, website: 'https://spam.example' })).toEqual({ status: 'sent' })
    expect(create).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('answers sent for a form sent under 3 seconds without saving or sending', async () => {
    expect(await submit({ ...VISITOR, elapsedMs: '2999' })).toEqual({ status: 'sent' })
    expect(create).not.toHaveBeenCalled()
  })

  it('saves when elapsedMs is missing (no JavaScript)', async () => {
    expect(await submit(VISITOR)).toEqual({ status: 'sent' })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('maps a Payload validation error to the Build Spec messages', async () => {
    create.mockRejectedValueOnce(new FakeValidationError(['email']))
    expect(await submit()).toEqual({
      status: 'invalid',
      errors: { email: 'Please check your email address.' },
      values: VISITOR,
    })
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('never answers sent when the save fails, keeps the values and logs no visitor data', async () => {
    create.mockRejectedValueOnce(Object.assign(new Error(`insert failed for ${VISITOR.email}`), { name: 'DatabaseError' }))
    expect(await submit()).toEqual({ status: 'failed', values: VISITOR })
    expect(sendEmail).not.toHaveBeenCalled()
    expect(logged()).toContain('Inquiry not saved (DatabaseError)')
    expectNoVisitorDataLogged()
  })

  it('treats a validation error on a field without a message as a failed save', async () => {
    create.mockRejectedValueOnce(new FakeValidationError(['timing']))
    expect(await submit()).toEqual({ status: 'failed', values: VISITOR })
  })

  it('still answers sent when the alert fails, logging only the ID and error name/status', async () => {
    sendEmail.mockRejectedValueOnce(
      Object.assign(new Error(`Error sending email: 403 to ${VISITOR.email} from ${VISITOR.name}`), {
        name: 'APIError',
        status: 403,
      }),
    )
    expect(await submit()).toEqual({ status: 'sent' })
    expect(create).toHaveBeenCalledTimes(1)
    expect(logged()).toContain('Inquiry 7: alert email failed (APIError/403)')
    expectNoVisitorDataLogged()
  })

  it('stops waiting for the alert after 5 seconds and still answers sent', async () => {
    vi.useFakeTimers()
    sendEmail.mockReturnValueOnce(new Promise(() => {}))
    const pending = submit()
    await vi.advanceTimersByTimeAsync(5000)
    expect(await pending).toEqual({ status: 'sent' })
    expect(logged()).toContain('Inquiry 7: alert email failed (TimeoutError)')
  })

  it('saves but skips the alert when site settings have no contact email', async () => {
    contactEmail = '  '
    expect(await submit()).toEqual({ status: 'sent' })
    expect(create).toHaveBeenCalledTimes(1)
    expect(sendEmail).not.toHaveBeenCalled()
    expect(logged()).toContain('Inquiry 7: no contact email')
    expectNoVisitorDataLogged()
  })

  it('never retries a failed alert', async () => {
    sendEmail.mockRejectedValue(new Error('down'))
    await submit()
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })
})
