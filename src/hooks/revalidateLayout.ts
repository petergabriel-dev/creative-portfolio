import { revalidatePath } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

/**
 * site-settings appears on every page (header, footer, metadata), so a change
 * refreshes the whole site. Seeds and scripts set `context.disableRevalidate`,
 * because revalidatePath only works inside a Next.js request.
 */
export const revalidateLayout: GlobalAfterChangeHook = ({ context, doc, req }) => {
  if (!context.disableRevalidate) {
    req.payload.logger.info('site-settings changed: revalidating every page')
    revalidatePath('/', 'layout')
  }
  return doc
}
