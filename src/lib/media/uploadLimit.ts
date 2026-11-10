import { stat } from 'node:fs/promises'

import { APIError, type CollectionBeforeOperationHook } from 'payload'

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

type UploadedFile = { data?: Buffer; size?: number; tempFilePath?: string }

/**
 * Real size of an uploaded file. Client (browser → Blob) uploads arrive with a
 * browser-declared `size`, so measure the bytes Payload actually fetched too.
 */
export async function uploadSizeInBytes(file: UploadedFile): Promise<number> {
  const measured = file.tempFilePath
    ? (await stat(file.tempFilePath)).size
    : (file.data?.length ?? 0)
  return Math.max(measured, file.size ?? 0)
}

/**
 * Rejects uploads over MAX_UPLOAD_BYTES on create and update, for both direct
 * and client uploads, before any resizing work happens.
 */
export const rejectOversizedUpload: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if ((operation === 'create' || operation === 'update') && req.file) {
    if ((await uploadSizeInBytes(req.file)) > MAX_UPLOAD_BYTES) {
      // ponytail: a rejected client upload stays in Blob as an orphan; clean up manually with the other preview uploads.
      throw new APIError('Files must be 25 MB or smaller.', 413, null, true)
    }
  }
  return args
}
