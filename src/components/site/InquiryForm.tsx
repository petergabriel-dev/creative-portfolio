'use client'

import { type FormEvent, type MouseEvent, type ReactNode, useActionState, useEffect, useRef, useState } from 'react'

import { submitInquiry } from '@/app/(frontend)/book/actions'
import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import {
  type InquiryErrorField,
  type InquiryFormState,
  MESSAGE_MAX,
  NAME_MAX,
  TIMING_MAX,
} from '@/lib/inquiry'
import { safeHref } from '@/lib/safeHref'

import styles from './InquiryForm.module.css'
import { BOOK_HREF } from './navItems'

const IDLE: InquiryFormState = { status: 'idle' }
/** DOM order of the fields that can carry an error; focus goes to the first invalid one. */
const ERROR_ORDER: InquiryErrorField[] = ['name', 'email', 'projectType', 'message']
const fieldId = (name: string) => `inquiry-${name}`
const errorId = (name: string) => `inquiry-${name}-error`
const FORM_ERROR_ID = 'inquiry-form-error'
const SENT_HEADING_ID = 'inquiry-sent-heading'

type InquiryFormProps = {
  /** Discipline names in Portfolio order, then "Something else" (projectTypeOptions). */
  options: string[]
  contactEmail: string
  replyTime: string
}

type InquiryFormViewProps = InquiryFormProps & {
  state: InquiryFormState
  pending: boolean
  action?: (formData: FormData) => void
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  onAnother?: (event: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * The Book Me form (docs/design/components/InquiryForm.md), the site's fourth client island: it
 * needs the pending state, focus management and the elapsed-time spam check. It posts to the
 * submitInquiry server action through useActionState, so it also works without JavaScript.
 * "Send another inquiry" remounts a fresh round instead of reloading the page.
 */
export function InquiryForm(props: InquiryFormProps) {
  const [round, setRound] = useState(0)
  return <InquiryRound key={round} {...props} focusName={round > 0} onAnother={() => setRound((n) => n + 1)} />
}

function InquiryRound({
  focusName,
  onAnother,
  ...props
}: InquiryFormProps & { focusName: boolean; onAnother: () => void }) {
  const [state, action, pending] = useActionState(submitInquiry, IDLE)
  const mountedAt = useRef(0)

  useEffect(() => {
    mountedAt.current = performance.now()
    if (focusName) document.getElementById(fieldId('name'))?.focus()
  }, [focusName])

  // Server-rendered HTML carries `autofocus` for visitors without JavaScript; with JavaScript the
  // elements already exist, so focus moves here after each result.
  useEffect(() => {
    if (state.status === 'invalid') {
      const first = ERROR_ORDER.find((field) => state.errors[field])
      if (first) document.getElementById(fieldId(first))?.focus()
    } else if (state.status === 'failed') {
      document.getElementById(FORM_ERROR_ID)?.focus()
    } else if (state.status === 'sent') {
      document.getElementById(SENT_HEADING_ID)?.focus()
    }
  }, [state])

  return (
    <InquiryFormView
      {...props}
      action={action}
      onAnother={(event) => {
        event.preventDefault()
        onAnother()
      }}
      onSubmit={(event) => {
        const elapsed = event.currentTarget.elements.namedItem('elapsedMs')
        if (elapsed instanceof HTMLInputElement) {
          elapsed.value = String(Math.round(performance.now() - mountedAt.current))
        }
      }}
      pending={pending}
      state={state}
    />
  )
}

/** The form or the thank-you panel for one state. Pure, so every state renders in tests. */
export function InquiryFormView({
  state,
  pending,
  options,
  contactEmail,
  replyTime,
  action,
  onSubmit,
  onAnother,
}: InquiryFormViewProps) {
  if (state.status === 'sent') return <SentPanel onAnother={onAnother} replyTime={replyTime} />

  const text = copy.book.form
  const values = state.status === 'invalid' || state.status === 'failed' ? state.values : undefined
  const errors = state.status === 'invalid' ? state.errors : {}
  const firstError = ERROR_ORDER.find((field) => errors[field])
  const email = contactEmail.trim()
  const mailto = email ? safeHref(`mailto:${email}`) : null

  const controlProps = (name: InquiryErrorField) => ({
    id: fieldId(name),
    name,
    required: true,
    className: styles.control,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? errorId(name) : undefined,
    autoFocus: firstError === name || undefined,
  })

  return (
    <form action={action} aria-label={text.label} className={styles.form} noValidate onSubmit={onSubmit}>
      <div className={styles.grid}>
        <Field error={errors.name} label={text.name} name="name">
          <input {...controlProps('name')} autoComplete="name" defaultValue={values?.name} maxLength={NAME_MAX} type="text" />
        </Field>
        <Field error={errors.email} label={text.email} name="email">
          <input
            {...controlProps('email')}
            autoComplete="email"
            defaultValue={values?.email}
            spellCheck={false}
            type="email"
          />
        </Field>
        <Field error={errors.projectType} label={text.projectType} name="projectType">
          {/* React resets the form after each action; a select falls back to the option it was first
              rendered with, so it remounts whenever the returned choice changes. */}
          <select {...controlProps('projectType')} defaultValue={values?.projectType ?? ''} key={values?.projectType ?? ''}>
            <option value="">{text.choose}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.timing} name="timing">
          <input
            className={styles.control}
            defaultValue={values?.timing}
            id={fieldId('timing')}
            maxLength={TIMING_MAX}
            name="timing"
            placeholder={text.timingPlaceholder}
            type="text"
          />
        </Field>
        <Field error={errors.message} label={text.message} name="message" wide>
          <textarea
            {...controlProps('message')}
            defaultValue={values?.message}
            maxLength={MESSAGE_MAX}
            placeholder={text.messagePlaceholder}
            rows={6}
          />
        </Field>
      </div>

      {/* Honeypot: hidden from people and screen readers, skipped by Tab. Filled = spam. */}
      <div aria-hidden="true" className={styles.visuallyHidden}>
        <label htmlFor={fieldId('website')}>{text.website}</label>
        <input autoComplete="off" id={fieldId('website')} name="website" tabIndex={-1} type="text" />
      </div>
      {/* Milliseconds since the form appeared, filled on submit with JavaScript. */}
      <input defaultValue="" name="elapsedMs" type="hidden" />

      {state.status === 'failed' && (
        <p autoFocus className={styles.formError} id={FORM_ERROR_ID} tabIndex={-1}>
          {text.failed}
          {mailto && (
            <>
              {text.failedEmail}
              <a className={styles.formErrorLink} href={mailto}>
                {email}
              </a>
            </>
          )}
          .
        </p>
      )}

      <div className={styles.actions}>
        <Button disabled={pending} size="primary" type="submit" variant="ink">
          {pending ? text.sending : text.submit}
        </Button>
      </div>
      <p className={styles.visuallyHidden} role="status">
        {pending ? text.sending : ''}
      </p>
    </form>
  )
}

function Field({
  name,
  label,
  error,
  wide = false,
  children,
}: {
  name: string
  label: string
  error?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? `${styles.field} ${styles.wide}` : styles.field}>
      <label className={styles.label} htmlFor={fieldId(name)}>
        {label}
      </label>
      {children}
      {error && (
        <p className={styles.error} id={errorId(name)}>
          {error}
        </p>
      )}
    </div>
  )
}

function SentPanel({
  replyTime,
  onAnother,
}: {
  replyTime: string
  onAnother?: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  const text = copy.book.sent
  return (
    <div className={styles.sent}>
      <p className={styles.sentLabel}>{text.label}</p>
      <h2 autoFocus className={styles.sentTitle} id={SENT_HEADING_ID} tabIndex={-1}>
        {text.title}
      </h2>
      <p className={styles.sentBody}>{text.body(replyTime.trim())}</p>
      <div className={styles.sentActions}>
        <Button href="/portfolio" size="primary" variant="gold">
          {text.portfolio}
        </Button>
        <Button href="/" size="primary" variant="outline-light">
          {text.home}
        </Button>
      </div>
      <p className={styles.another}>
        <Button href={BOOK_HREF} onClick={onAnother} variant="text">
          {text.another}
        </Button>
      </p>
    </div>
  )
}
