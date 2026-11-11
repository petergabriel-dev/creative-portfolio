import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

let settings: Record<string, unknown>
const disciplines = [{ name: 'Photography' }, { name: 'Film & Video' }]
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: async () => ({ find: async () => ({ docs: disciplines }), findGlobal: async () => settings }),
}))
vi.mock('@/app/(frontend)/book/actions', () => ({ submitInquiry: vi.fn() }))

import BookPage, { generateMetadata } from '@/app/(frontend)/book/page'
import { InquiryFormView } from '@/components/site/InquiryForm'
import type { InquiryFormState } from '@/lib/inquiry'

const html = (node: ReactNode) => renderToStaticMarkup(<>{node}</>)

beforeEach(() => {
  settings = {
    name: 'Your Name',
    bookingLabel: 'Book Me',
    contactEmail: 'hello@example.com',
    location: '[City, Country]',
    replyTime: '[response time]',
    finaleHeadline: "Let's capture your story",
    socials: [],
  }
})

describe('/book page', () => {
  it('renders the opener, Good to know and the form, with no booking finale', async () => {
    const out = html(await BookPage())
    expect(out.match(/<h1/g)).toHaveLength(1)
    expect(out).toContain('Let&#x27;s talk about your project')
    expect(out).toContain('Book me · photography, film, design &amp; writing')
    expect(out).toContain('I read every message myself and reply within [response time].')
    expect(out).toMatch(/<h2[^>]*id="good-to-know"[^>]*>Good to know<\/h2>/)
    expect(out).toContain('aria-labelledby="good-to-know"')
    expect(out).toMatch(/<a class="[^"]*" href="mailto:hello@example.com">hello@example.com<\/a>/)
    expect(out).toContain('[City, Country]')
    expect(out).toContain('Photography, film, design &amp; writing')
    expect(out).toContain('nothing is booked until we&#x27;ve talked it through.')
    expect(out).toContain('aria-label="Booking inquiry"')
    expect(out).not.toContain("Let's capture your story")
    expect(out).not.toContain('Let&#x27;s capture your story')
  })

  it('marks the header Book Me pill as the current page', async () => {
    const out = html(await BookPage())
    expect(out.match(/aria-current="page"/g)).toHaveLength(1)
    expect(out).toMatch(/<a[^>]*aria-current="page"[^>]*href="\/book"|<a href="\/book"[^>]*aria-current="page"/)
  })

  it('offers the discipline names, then "Something else"', async () => {
    const out = html(await BookPage())
    const options = [...out.matchAll(/<option[^>]*value="([^"]*)"/g)].map((match) => match[1])
    expect(options).toEqual(['', 'Photography', 'Film &amp; Video', 'Something else'])
  })

  it('leaves out empty CMS values without crashing', async () => {
    settings = { ...settings, contactEmail: '', location: '  ', replyTime: '' }
    const out = html(await BookPage())
    expect(out).not.toContain('Prefer email?')
    expect(out).not.toContain('Based in')
    expect(out).toContain('Working on')
    expect(out).toContain('I read every message myself.')
    expect(out).not.toContain('mailto:')
  })

  it('titles the page with the booking label and sets the canonical URL', async () => {
    expect(await generateMetadata()).toMatchObject({ title: 'Book Me', alternates: { canonical: '/book' } })
    settings = { ...settings, bookingLabel: '' }
    expect(await generateMetadata()).toMatchObject({ title: 'Book Me' })
    settings = { ...settings, bookingLabel: 'Work with me' }
    expect(await generateMetadata()).toMatchObject({ title: 'Work with me' })
  })
})

const view = (state: InquiryFormState, overrides: { pending?: boolean; contactEmail?: string; replyTime?: string } = {}) =>
  html(
    <InquiryFormView
      contactEmail={overrides.contactEmail ?? 'hello@example.com'}
      options={['Photography', 'Film & Video', 'Something else']}
      pending={overrides.pending ?? false}
      replyTime={overrides.replyTime ?? '2 days'}
      state={state}
    />,
  )

const values = { name: 'Ana', email: 'ana@', projectType: 'Film & Video', timing: 'June', message: 'Too short' }

describe('InquiryForm view', () => {
  it('renders labelled fields, noValidate, required controls and the submit button', () => {
    const out = view({ status: 'idle' })
    expect(out).toMatch(/novalidate=""/i)
    for (const [id, label] of [
      ['inquiry-name', 'Your name'],
      ['inquiry-email', 'Email'],
      ['inquiry-projectType', 'What kind of project?'],
      ['inquiry-timing', 'Timing (if you know it)'],
      ['inquiry-message', 'Tell me about it'],
    ]) {
      expect(out).toContain(`for="${id}">${label}</label>`)
    }
    expect(out.match(/required=""/g)).toHaveLength(4)
    expect(out).toMatch(/<input[^>]*autoComplete="email"|<input[^>]*autocomplete="email"/i)
    expect(out).toContain('Send inquiry')
    expect(out).not.toContain('autofocus')
    expect(out).not.toContain('aria-invalid')
  })

  it('hides the honeypot from screen readers and the Tab order', () => {
    const out = view({ status: 'idle' })
    expect(out).toMatch(/<div aria-hidden="true"[^>]*><label for="inquiry-website">Website<\/label><input[^>]*tabindex="-1"[^>]*>/i)
    expect(out).toMatch(/name="website"/)
    expect(out).toMatch(/<input[^>]*name="elapsedMs"[^>]*type="hidden"|<input[^>]*type="hidden"[^>]*name="elapsedMs"/)
  })

  it('shows each error under its field, linked, with autofocus on the first invalid field only', () => {
    const out = view({
      status: 'invalid',
      errors: { email: 'Please check your email address.', message: 'Tell me a little more — at least a sentence or two.' },
      values,
    })
    expect(out).toMatch(/id="inquiry-email"[^>]*aria-invalid="true"|aria-invalid="true"[^>]*id="inquiry-email"/)
    expect(out).toContain('aria-describedby="inquiry-email-error"')
    expect(out).toMatch(/<p class="[^"]*" id="inquiry-email-error">Please check your email address.<\/p>/)
    expect(out).toContain('aria-describedby="inquiry-message-error"')
    expect(out.match(/autofocus=""/g)).toHaveLength(1)
    expect(out).toMatch(/<input[^>]*autofocus=""[^>]*id="inquiry-email"|<input[^>]*id="inquiry-email"[^>]*autofocus=""/)
    expect(out.match(/aria-invalid="true"/g)).toHaveLength(2)
    expect(out).not.toContain('aria-describedby="inquiry-name-error"')
  })

  it('keeps the typed values after an invalid submit', () => {
    const out = view({ status: 'invalid', errors: { email: 'Please check your email address.' }, values })
    expect(out).toContain('value="Ana"')
    expect(out).toContain('value="ana@"')
    expect(out).toContain('value="June"')
    expect(out).toContain('>Too short</textarea>')
    expect(out).toMatch(/<option selected="" value="Film &amp; Video">|<option value="Film &amp; Video" selected="">/)
  })

  it('shows the failed-save message with the contact email, focused, keeping the values', () => {
    const out = view({ status: 'failed', values })
    expect(out).toMatch(/<p[^>]*id="inquiry-form-error"[^>]*>/)
    expect(out).toMatch(/<p autofocus="" class="[^"]*" id="inquiry-form-error" tabindex="-1">/)
    expect(out).toContain('Sorry — your message didn&#x27;t send. Please try again, or email me at ')
    expect(out).toContain('href="mailto:hello@example.com">hello@example.com</a>.')
    expect(out).toContain('value="Ana"')
    expect(out).not.toContain('Thank you')
  })

  it('ends the failed-save message after "try again" without a contact email', () => {
    const out = view({ status: 'failed', values }, { contactEmail: '' })
    expect(out).toContain('Please try again.</p>')
    expect(out).not.toContain('mailto:')
  })

  it('disables the button and announces "Sending…" while pending', () => {
    const out = view({ status: 'idle' }, { pending: true })
    expect(out).toMatch(/<button[^>]*disabled=""[^>]*type="submit"[^>]*>Sending…<\/button>/)
    expect(out).toMatch(/role="status">Sending…<\/p>/)
    expect(view({ status: 'idle' })).toMatch(/role="status"><\/p>/)
  })

  it('replaces the form with the thank-you panel, heading focused', () => {
    const out = view({ status: 'sent' })
    expect(out).not.toContain('<form')
    expect(out).toContain('Inquiry sent')
    expect(out).toMatch(/<h2 autofocus="" class="[^"]*" id="inquiry-sent-heading" tabindex="-1">Thank you — I&#x27;ll be in touch soon<\/h2>/)
    expect(out).toContain('I&#x27;ll read your note and reply within 2 days so we can talk through your plans.')
    expect(out).toMatch(/href="\/portfolio"[^>]*>Browse the portfolio</)
    expect(out).toMatch(/href="\/"[^>]*>Back to home</)
    expect(out).toMatch(/href="\/book"[^>]*>Send another inquiry</)
  })

  it('says "reply soon" without a reply time', () => {
    expect(view({ status: 'sent' }, { replyTime: '' })).toContain('reply soon so we can talk through your plans.')
  })
})
