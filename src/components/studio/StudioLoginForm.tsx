'use client'

import { useActionState, useEffect } from 'react'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import { INITIAL_LOGIN_STATE, type LoginField, type LoginState } from '@/lib/studioLogin'

import { loginAction } from './loginAction'
import styles from './StudioLogin.module.css'

const t = copy.studio.login
const ERROR_ID = 'studio-login-error'
const fieldId = (name: LoginField) => `studio-login-${name}`

type ViewProps = { state: LoginState; pending: boolean; redirect: string }

/** The form's markup for a given state; a pure view, so every state renders in tests. */
export function StudioLoginFormView({ state, pending, redirect }: ViewProps) {
  const field = (name: LoginField, label: string, type: string, autoComplete: string) => {
    const invalid = state.invalid.includes(name)
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={fieldId(name)}>
          {label}
        </label>
        <input
          aria-describedby={invalid ? ERROR_ID : undefined}
          aria-invalid={invalid || undefined}
          autoComplete={autoComplete}
          className={[styles.input, invalid && styles.inputInvalid].filter(Boolean).join(' ')}
          defaultValue={name === 'email' ? state.email : undefined}
          id={fieldId(name)}
          name={name}
          required
          type={type}
        />
      </div>
    )
  }

  return (
    <>
      {state.error ? (
        // Focus moves to the alert when it appears (autoFocus) and on every new result (the effect).
        <div autoFocus className={styles.alert} id={ERROR_ID} role="alert" tabIndex={-1}>
          {t.errors[state.error]}
        </div>
      ) : null}
      <input defaultValue={redirect} name="redirect" type="hidden" />
      <div className={styles.fields}>
        {field('email', t.email, 'email', 'email')}
        {field('password', t.password, 'password', 'current-password')}
      </div>
      <div className={styles.actions}>
        <Button disabled={pending} type="submit" variant="ink">
          {pending ? t.pending : t.submit}
        </Button>
        <Button href="/admin/forgot" variant="text">
          {t.forgot}
        </Button>
      </div>
      {pending ? (
        <p className={styles.visuallyHidden} role="status">
          {t.pending}
        </p>
      ) : null}
      <p className={styles.lockNote}>{t.lockNote}</p>
    </>
  )
}

/**
 * The log-in form: posts to the server action through useActionState (no client fetch code).
 * Payload's admin renders views on the client, so the Studio needs JavaScript anyway.
 */
export function StudioLoginForm({ redirect }: { redirect: string }) {
  const [state, action, pending] = useActionState(loginAction, INITIAL_LOGIN_STATE)

  useEffect(() => {
    if (state.error) document.getElementById(ERROR_ID)?.focus()
  }, [state])

  return (
    <form action={action} className={styles.form} noValidate>
      <StudioLoginFormView pending={pending} redirect={redirect} state={state} />
    </form>
  )
}
