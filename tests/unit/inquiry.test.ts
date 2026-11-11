import { describe, expect, it } from 'vitest'

import { adminBaseUrl, buildInquiryAlert } from '@/lib/inquiry'

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
