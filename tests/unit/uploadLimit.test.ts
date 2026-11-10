import { mkdtemp, rm, truncate, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { MAX_UPLOAD_BYTES, rejectOversizedUpload, uploadSizeInBytes } from '@/lib/media/uploadLimit'

let dir: string
let bigFile: string

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'upload-limit-'))
  bigFile = path.join(dir, 'big.jpg')
  await writeFile(bigFile, '')
  await truncate(bigFile, MAX_UPLOAD_BYTES + 1) // sparse file, no real disk use
})

afterAll(async () => {
  await rm(dir, { recursive: true, force: true })
})

const run = (file: unknown, operation = 'create') =>
  rejectOversizedUpload({
    args: { marker: true },
    operation,
    req: { file },
  } as unknown as Parameters<typeof rejectOversizedUpload>[0])

describe('uploadSizeInBytes', () => {
  it('measures the temp file instead of trusting a smaller declared size', async () => {
    expect(await uploadSizeInBytes({ tempFilePath: bigFile, size: 10 })).toBe(MAX_UPLOAD_BYTES + 1)
  })

  it('uses the in-memory buffer length', async () => {
    expect(await uploadSizeInBytes({ data: Buffer.alloc(1234) })).toBe(1234)
  })
})

describe('rejectOversizedUpload', () => {
  it('rejects files over 25 MB with HTTP 413', async () => {
    await expect(run({ tempFilePath: bigFile, size: 1 })).rejects.toMatchObject({ status: 413 })
    await expect(run({ tempFilePath: bigFile }, 'update')).rejects.toMatchObject({ status: 413 })
  })

  it('accepts files at the limit and requests without a file', async () => {
    await expect(run({ data: Buffer.alloc(16), size: MAX_UPLOAD_BYTES })).resolves.toEqual({
      marker: true,
    })
    await expect(run(undefined)).resolves.toEqual({ marker: true })
  })
})
