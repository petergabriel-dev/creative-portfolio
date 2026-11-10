import { revalidatePath } from 'next/cache'
import type { GlobalAfterChangeHook, PayloadRequest, RequestContext } from 'payload'

/**
 * Refreshes every page. Seeds and scripts set `context.disableRevalidate`, because
 * revalidatePath only works inside a Next.js request; a failure is logged, never thrown, so it
 * can't undo a save that already happened.
 */
export function revalidateSite(context: RequestContext, req: PayloadRequest, reason: string) {
  if (context.disableRevalidate) return
  req.payload.logger.info(`${reason}: revalidating every page`)
  try {
    revalidatePath('/', 'layout')
  } catch (error) {
    req.payload.logger.error({ err: error, msg: `${reason}: revalidation failed` })
  }
}

/** site-settings appears on every page (header, footer, metadata), so a change refreshes the whole site. */
export const revalidateLayout: GlobalAfterChangeHook = ({ context, doc, req }) => {
  revalidateSite(context, req, 'site-settings changed')
  return doc
}
