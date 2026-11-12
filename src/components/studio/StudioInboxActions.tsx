'use client'

import { useRouter } from 'next/navigation'
import { useActionState } from 'react'

import { Button } from '@/components/ui/Button'
import { copy } from '@/copy'
import type { InquiryStatus } from '@/lib/studioInbox'

import { type InboxActionState, setInquiryStatus } from './inboxActions'
import styles from './StudioInbox.module.css'
import { useInboxFocus } from './StudioInboxFocus'

const t = copy.studio.inbox

/** Owner decision 3: the buttons for each status, in order; the current status is never offered. */
export const STATUS_ACTIONS: Record<InquiryStatus, readonly InquiryStatus[]> = {
  new: ['replied', 'archived'],
  replied: ['archived', 'new'],
  archived: ['new'],
}

type Props = { id: number; status: InquiryStatus; tab: InquiryStatus; page: number; nextId: number | null }

/**
 * The selected inquiry's status buttons: one form posting to `setInquiryStatus`, each button sending
 * its target status. On success the inbox moves to the same tab with the next inquiry selected, the
 * notice is announced and focus follows (StudioInboxFocus). Rendered with `key={id}`, so an error
 * never carries over to another inquiry.
 */
export function StudioInboxActions({ id, status, tab, page, nextId }: Props) {
  const router = useRouter()
  const { announce, focusNext } = useInboxFocus()
  const [state, formAction, pending] = useActionState(async (previous: InboxActionState, formData: FormData) => {
    const result = await setInquiryStatus(previous, formData)
    if (result?.ok) {
      announce(result.notice)
      focusNext()
      router.replace(result.href, { scroll: false })
    }
    return result
  }, null)

  return (
    <>
      <form action={formAction} aria-busy={pending || undefined} className={styles.statusForm}>
        <input name="id" type="hidden" value={id} />
        <input name="tab" type="hidden" value={tab} />
        <input name="page" type="hidden" value={page} />
        <input name="next" type="hidden" value={nextId ?? ''} />
        {STATUS_ACTIONS[status].map((target) => (
          <Button disabled={pending} key={target} name="status" type="submit" value={target} variant="outline-ink">
            {t.actions[target]}
          </Button>
        ))}
      </form>
      {state && !state.ok ? (
        <p className={styles.error} role="alert">
          {t.errors[state.error]}
        </p>
      ) : null}
    </>
  )
}
