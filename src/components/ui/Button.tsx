import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'

import { copy } from '@/copy'

import styles from './Button.module.css'

export type ButtonVariant = 'gold' | 'ink' | 'outline-ink' | 'outline-light' | 'text'

const variantClass: Record<ButtonVariant, string> = {
  gold: styles.gold,
  ink: styles.ink,
  'outline-ink': styles.outlineInk,
  'outline-light': styles.outlineLight,
  text: styles.text,
}

type CommonProps = {
  variant: ButtonVariant
  size?: 'default' | 'primary'
  /** Adds the copy.ts arrow after the label (text variant), hidden from screen readers. */
  trailingArrow?: boolean
  children: ReactNode
}

type LinkButtonProps = CommonProps & {
  href: string
  /** The header Book Me pill on /book (P3). */
  'aria-current'?: 'page'
  /** Client components only: "Send another inquiry" resets the form in place (P3). */
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

type ActionButtonProps = CommonProps & {
  href?: undefined
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  /** A submit button's own form value (the Studio inbox's status buttons, P6). */
  name?: string
  value?: string
  /** Client components only (e.g. RevealMore). */
  onClick?: MouseEventHandler<HTMLButtonElement>
  'aria-controls'?: string
}

/** Pill buttons and text links (docs/design/components/Button.md). */
export function Button(props: LinkButtonProps | ActionButtonProps) {
  const { variant, size = 'default', trailingArrow = false, children } = props
  const className = [styles.button, size === 'primary' && styles.primary, variantClass[variant]]
    .filter(Boolean)
    .join(' ')
  const content = (
    <>
      {children}
      {/* Non-breaking space keeps one continuous underline under label and arrow. */}
      {trailingArrow && <span aria-hidden="true">{` ${copy.arrow}`}</span>}
    </>
  )

  if (props.href !== undefined) {
    return (
      <Link aria-current={props['aria-current']} className={className} href={props.href} onClick={props.onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button
      aria-controls={props['aria-controls']}
      className={className}
      disabled={props.disabled}
      name={props.name}
      onClick={props.onClick}
      type={props.type ?? 'button'}
      value={props.value}
    >
      {content}
    </button>
  )
}
