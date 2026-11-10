'use client'

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

import styles from './RevealMore.module.css'

type RevealMoreProps = {
  /** One element per card; every card is already in the static page. */
  children: ReactNode
  initial?: number
  label: string
  listClassName: string
  listId: string
}

/**
 * Shows the first `initial` cards and a button that reveals the rest in place (owner decision
 * 2026-11-10: no fetch). Hidden cards' lazy images are not loaded until revealed; on reveal, focus
 * moves to the first revealed card. docs/design/components/RevealMore.md.
 *
 * ponytail: without JavaScript only the first `initial` cards show; upgrade path is rendering all
 * cards until hydration.
 */
export function RevealMore({ children, initial = 8, label, listClassName, listId }: RevealMoreProps) {
  const items = Children.toArray(children)
  const [revealed, setRevealed] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const moveFocus = useRef(false)

  useEffect(() => {
    if (!revealed || !moveFocus.current) return
    moveFocus.current = false
    listRef.current?.children[initial]?.querySelector<HTMLElement>('a, button')?.focus()
  }, [revealed, initial])

  return (
    <>
      <ul className={listClassName} id={listId} ref={listRef} role="list">
        {items.map((item, index) => (
          <li hidden={!revealed && index >= initial} key={isValidElement(item) ? item.key : index}>
            {item}
          </li>
        ))}
      </ul>
      {items.length > initial && !revealed ? (
        <div className={styles.more}>
          <Button
            aria-controls={listId}
            onClick={() => {
              moveFocus.current = true
              setRevealed(true)
            }}
            size="primary"
            variant="outline-ink"
          >
            {label}
          </Button>
        </div>
      ) : null}
    </>
  )
}
