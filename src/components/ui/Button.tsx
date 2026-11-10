import Link from 'next/link'
import type { ReactNode } from 'react'

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

type LinkButtonProps = CommonProps & { href: string }

type ActionButtonProps = CommonProps & {
  href?: undefined
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
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
      <Link className={className} href={props.href}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} disabled={props.disabled} type={props.type ?? 'button'}>
      {content}
    </button>
  )
}
