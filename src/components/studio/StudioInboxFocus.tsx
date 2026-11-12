'use client'

import { useRouter } from 'next/navigation'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'

import styles from './StudioInbox.module.css'

export const DETAIL_HEADING_ID = 'inbox-detail-heading'
export const EMPTY_ID = 'inbox-empty'

type InboxFocusApi = {
  /** Writes a notice into the live region (cleared first, so the same words are announced again). */
  announce: (text: string) => void
  /** Moves focus to the detail heading (or the empty line) once the next selection renders. */
  focusNext: () => void
}

const InboxFocusContext = createContext<InboxFocusApi>({ announce: () => {}, focusNext: () => {} })
export const useInboxFocus = () => useContext(InboxFocusContext)

/**
 * The inbox's live region and focus (docs/design/components/StudioInbox.md). Every inbox page renders
 * it at the same place in the tree, so it survives the navigation after a selection or a status
 * change, even when the detail panel goes away because the tab is now empty. Focus moves only after
 * the editor picks a card or changes a status, never on the first load or a tab change.
 */
export function StudioInboxFocus({ selectionKey, children }: { selectionKey: string; children: ReactNode }) {
  const [notice, setNotice] = useState('')
  const pendingFocus = useRef(false)
  const shownKey = useRef(selectionKey)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (selectionKey === shownKey.current) return
    shownKey.current = selectionKey
    if (!pendingFocus.current) return
    pendingFocus.current = false
    ;(document.getElementById(DETAIL_HEADING_ID) ?? document.getElementById(EMPTY_ID))?.focus()
  }, [selectionKey])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Payload's list wrapper (ListQueryProvider) rewrites the loaded list URL with
  // `history.replaceState(null, …)`, wiping the state Next's router keeps on that entry, and Next
  // ignores Back/Forward to an entry without it: the URL changes, the page doesn't. Re-run that
  // navigation so Back and Forward show the tab, page and inquiry in the URL (owner decision 4).
  const router = useRouter()
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (event.state === null) router.replace(`${window.location.pathname}${window.location.search}`, { scroll: false })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [router])

  const api = useMemo<InboxFocusApi>(
    () => ({
      announce: (text) => {
        setNotice('')
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setNotice(text), 100)
      },
      focusNext: () => {
        pendingFocus.current = true
      },
    }),
    [],
  )

  return (
    <InboxFocusContext value={api}>
      {/* A card link click (or Enter on it) asks for focus on the detail it opens. */}
      <div
        className={styles.focusRoot}
        onClickCapture={(event) => {
          if ((event.target as Element).closest('a[data-inbox-select]:not([aria-current])')) {
            pendingFocus.current = true
            setNotice('')
          }
        }}
      >
        {children}
      </div>
      <p className={styles.visuallyHidden} role="status">
        {notice}
      </p>
    </InboxFocusContext>
  )
}
