import { describe, expect, it } from 'vitest'

import { adminBaseUrl, buildInquiryAlert, projectTypeOptions, validateInquiry } from '@/lib/inquiry'

const OPTIONS = projectTypeOptions(['Photography', 'Film & Video', 'Design & Illustration', 'Writing & More'])

const valid = {
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

const check = (overrides: Record<string, string> = {}) => validateInquiry(form({ ...valid, ...overrides }), OPTIONS)
const errorsOf = (overrides: Record<string, string>) => {
  const result = check(overrides)
  return result.kind === 'invalid' ? result.errors : {}
}

describe('projectTypeOptions', () => {
  it('lists discipline names in order, then "Something else", skipping empty names', () => {
    expect(projectTypeOptions([' Photography ', '', null, 'Film & Video'])).toEqual([
      'Photography',
      'Film & Video',
      'Something else',
    ])
  })
})

describe('validateInquiry', () => {
  it('accepts a valid inquiry and trims every value', () => {
    expect(check({ name: '  Ana Reyes  ', message: `  ${valid.message}  ` })).toEqual({ kind: 'valid', data: valid })
  })

  it('returns only the five form fields, never other keys', () => {
    const result = validateInquiry(form({ ...valid, ip: '1.2.3.4', status: 'archived', notes: 'x' }), OPTIONS)
    expect(result.kind === 'valid' && Object.keys(result.data).sort()).toEqual(
      ['email', 'message', 'name', 'projectType', 'timing'],
    )
  })

  it('checks name length 1–120', () => {
    expect(errorsOf({ name: '' }).name).toBe('Please add your name.')
    expect(errorsOf({ name: '   ' }).name).toBe('Please add your name.')
    expect(check({ name: 'A' }).kind).toBe('valid')
    expect(check({ name: 'a'.repeat(120) }).kind).toBe('valid')
    expect(errorsOf({ name: 'a'.repeat(121) }).name).toBe('Please add your name.')
  })

  it('checks the email format', () => {
    for (const email of ['ana@example.com', 'ana.reyes+site@mail.example.co.uk', 'a@ex--ample.com']) {
      expect(check({ email }).kind, email).toBe('valid')
    }
    for (const email of ['', 'ana', 'ana@', '@example.com', 'a..b@x.com', 'ana @example.com', 'ana@example', 'ana@-x.com', '"ana"@x.com']) {
      expect(errorsOf({ email }).email, email).toBe('Please check your email address.')
    }
    expect(errorsOf({ email: `${'a'.repeat(250)}@x.com` }).email).toBe('Please check your email address.')
  })

  it('accepts only a listed project type', () => {
    expect(check({ projectType: 'Something else' }).kind).toBe('valid')
    expect(check({ projectType: 'Writing & More' }).kind).toBe('valid')
    for (const projectType of ['', 'Weddings', 'film & video']) {
      expect(errorsOf({ projectType }).projectType, projectType).toBe('Please choose the kind of project.')
    }
  })

  it('keeps timing optional and caps it at 120 characters', () => {
    expect(check({ timing: '' }).kind).toBe('valid')
    const at120 = check({ timing: 't'.repeat(120) })
    expect(at120.kind === 'valid' && at120.data.timing).toBe('t'.repeat(120))
    const at121 = check({ timing: 't'.repeat(121) })
    expect(at121.kind === 'valid' && at121.data.timing).toBe('t'.repeat(120))
    const cutEmoji = check({ timing: `${'t'.repeat(119)}😀` })
    expect(cutEmoji.kind === 'valid' && cutEmoji.data.timing).toBe('t'.repeat(119))
  })

  it('checks message length 20–5,000', () => {
    const message = 'Tell me a little more — at least a sentence or two.'
    expect(errorsOf({ message: 'm'.repeat(19) }).message).toBe(message)
    expect(check({ message: 'm'.repeat(20) }).kind).toBe('valid')
    expect(check({ message: 'm'.repeat(5000) }).kind).toBe('valid')
    expect(errorsOf({ message: 'm'.repeat(5001) }).message).toBe(message)
  })

  it('reports every invalid field at once and returns the typed values', () => {
    const result = validateInquiry(form({ timing: 'Soon' }), OPTIONS)
    expect(result).toEqual({
      kind: 'invalid',
      errors: {
        name: 'Please add your name.',
        email: 'Please check your email address.',
        projectType: 'Please choose the kind of project.',
        message: 'Tell me a little more — at least a sentence or two.',
      },
      values: { name: '', email: '', projectType: '', timing: 'Soon', message: '' },
    })
  })

  it('treats a filled honeypot as spam, even when everything else is valid or invalid', () => {
    expect(check({ website: 'https://spam.example' })).toEqual({ kind: 'spam' })
    expect(validateInquiry(form({ website: 'x' }), OPTIONS)).toEqual({ kind: 'spam' })
    expect(check({ website: '   ' }).kind).toBe('valid')
  })

  it('treats a form sent under 3 seconds as spam, and skips the rule without a usable value', () => {
    expect(check({ elapsedMs: '2999' })).toEqual({ kind: 'spam' })
    expect(check({ elapsedMs: '0' })).toEqual({ kind: 'spam' })
    expect(check({ elapsedMs: '3000' }).kind).toBe('valid')
    expect(check({ elapsedMs: '120000' }).kind).toBe('valid')
    for (const elapsedMs of ['', 'abc', '-5', '2.5', '1e3']) {
      expect(check({ elapsedMs }).kind, elapsedMs).toBe('valid')
    }
    expect(check().kind).toBe('valid')
  })

  it('shows field errors for a fast but invalid form instead of a false thank-you', () => {
    const result = validateInquiry(form({ elapsedMs: '400' }), OPTIONS)
    expect(result.kind).toBe('invalid')
  })
})

const inquiry = {
  id: 42,
  name: 'Ana Reyes',
  email: 'ana@example.com',
  projectType: 'Film & Video',
  timing: 'June 2027',
  message: 'A short film for our studio opening.\r\nAbout three minutes long.',
}

describe('buildInquiryAlert', () => {
  it('sends to the contact email with reply-to set to the visitor', () => {
    const alert = buildInquiryAlert(inquiry, 'owner@example.com', 'https://site.test')
    expect(alert.to).toBe('owner@example.com')
    expect(alert.replyTo).toBe('ana@example.com')
  })

  it('uses the Build Spec subject', () => {
    expect(buildInquiryAlert(inquiry, 'owner@example.com', 'https://site.test').subject).toBe(
      'New inquiry · Film & Video · Ana Reyes',
    )
  })

  it('strips line breaks and control characters from the subject', () => {
    const alert = buildInquiryAlert(
      { ...inquiry, name: 'Ana\r\nBcc: evil@example.com', projectType: 'Photo\ngraphy\t' },
      'owner@example.com',
      'https://site.test',
    )
    expect(alert.subject).toBe('New inquiry · Photo graphy · Ana Bcc: evil@example.com')
    expect(alert.subject).not.toMatch(/[\r\n\t]/)
  })

  it('lists every field, the message as a block, and the Studio link', () => {
    const { text } = buildInquiryAlert(inquiry, 'owner@example.com', 'https://site.test')
    expect(text).toBe(
      [
        'New inquiry from Ana Reyes',
        '',
        'Name: Ana Reyes',
        'Email: ana@example.com',
        'Project type: Film & Video',
        'Timing: June 2027',
        '',
        'Message:',
        'A short film for our studio opening.\nAbout three minutes long.',
        '',
        'Open in the Studio: https://site.test/admin/collections/inquiries/42',
      ].join('\n'),
    )
  })

  it('keeps single-line fields on one line', () => {
    const { text } = buildInquiryAlert(
      { ...inquiry, name: 'Ana\nReyes', timing: 'June\n2027' },
      'owner@example.com',
      'https://site.test',
    )
    expect(text).toContain('Name: Ana Reyes\n')
    expect(text).toContain('Timing: June 2027\n')
  })

  it('shows a dash when timing is empty', () => {
    for (const timing of ['', '   ', null, undefined]) {
      const { text } = buildInquiryAlert({ ...inquiry, timing }, 'owner@example.com', 'https://site.test')
      expect(text).toContain('Timing: —\n')
    }
  })
})

describe('adminBaseUrl', () => {
  it('prefers NEXT_PUBLIC_SERVER_URL without a trailing slash', () => {
    expect(adminBaseUrl({ NEXT_PUBLIC_SERVER_URL: 'https://example.com/', VERCEL_URL: 'x.vercel.app' })).toBe(
      'https://example.com',
    )
  })

  it('falls back to the Vercel branch URL, then the deployment URL', () => {
    expect(adminBaseUrl({ VERCEL_BRANCH_URL: 'site-git-feat.vercel.app', VERCEL_URL: 'site-abc.vercel.app' })).toBe(
      'https://site-git-feat.vercel.app',
    )
    expect(adminBaseUrl({ VERCEL_URL: 'site-abc.vercel.app' })).toBe('https://site-abc.vercel.app')
  })

  it('falls back to local dev', () => {
    expect(adminBaseUrl({})).toBe('http://localhost:3000')
    expect(adminBaseUrl({ NEXT_PUBLIC_SERVER_URL: '  ' })).toBe('http://localhost:3000')
  })
})
