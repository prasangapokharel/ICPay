/**
 * Store a file in an ICPay bucket.
 *
 * Uses legacy uploadFileChunk(uploadId, data) on live mainnet by default.
 * Set NEXT_PUBLIC_BUCKET_UPLOAD_V2=true after backend deploy for indexed parallel chunks.
 */

import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { WalletActor } from "@/services/wallet"
import { guessFileMime } from "@/lib/bucket/bucket"
import {
  readFileChunk,
  uploadChunkCount,
  uploadLimits,
} from "@/lib/bucket/uploadChunk"

export type StoreFileOptions = {
  bucketId: string
  path: string
  contentType?: string
  apiKey?: string
  onProgress?: (pct: number) => void
}

async function sendChunkLegacy(
  actor: WalletActor,
  uploadId: string,
  bytes: Uint8Array
): Promise<Outcome<bigint>> {
  return (await actor.uploadFileChunk(uploadId, bytes)) as Outcome<bigint>
}

async function sendChunkIndexed(
  actor: WalletActor,
  uploadId: string,
  index: number,
  bytes: Uint8Array
): Promise<Outcome<bigint>> {
  return (await actor.uploadFileChunkIndexed(
    uploadId,
    BigInt(index),
    bytes
  )) as Outcome<bigint>
}

async function sendChunks(
  actor: WalletActor,
  uploadId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<Outcome<null>> {
  const limits = uploadLimits()
  const total = uploadChunkCount(file.size, limits.chunkBytes)

  if (!limits.v2) {
    for (let i = 0; i < total; i++) {
      const bytes = await readFileChunk(file, i, limits.chunkBytes)
      const res = await sendChunkLegacy(actor, uploadId, bytes)
      if ("err" in res) return { err: res.err }
      onProgress?.(10 + Math.round(((i + 1) / total) * 80))
    }
    return { ok: null }
  }

  let nextIndex = 0
  let completed = 0
  let failure: string | null = null

  async function worker() {
    while (true) {
      if (failure) return
      const index = nextIndex
      nextIndex += 1
      if (index >= total) return

      const bytes = await readFileChunk(file, index, limits.chunkBytes)
      const res = await sendChunkIndexed(actor, uploadId, index, bytes)
      if ("err" in res) {
        failure = res.err
        return
      }
      completed += 1
      onProgress?.(10 + Math.round((completed / total) * 80))
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limits.concurrency, total) }, () => worker())
  )

  if (failure) return { err: failure }
  return { ok: null }
}

async function uploadSingleCall(
  actor: WalletActor,
  file: File,
  options: StoreFileOptions,
  contentType: string,
  singleMaxBytes: number
): Promise<Outcome<string>> {
  if (file.size > singleMaxBytes) {
    return { err: "File too large for single upload — use chunked upload" }
  }
  options.onProgress?.(20)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const res = (await actor.uploadFile(
    options.bucketId,
    options.path,
    bytes,
    contentType,
    options.apiKey ? [options.apiKey] : []
  )) as Outcome<string>
  options.onProgress?.(100)
  return res
}

/** Upload a file — chunked automatically, up to 10 MB assembled on canister. */
export async function storeFile(
  identity: Identity | undefined,
  file: File,
  options: StoreFileOptions
): Promise<Outcome<string>> {
  const contentType = options.contentType ?? guessFileMime(file)
  const limits = uploadLimits()

  return call(identity, "Upload failed", async (actor) => {
    if (file.size <= limits.singleMaxBytes) {
      return uploadSingleCall(actor, file, options, contentType, limits.singleMaxBytes)
    }

    options.onProgress?.(5)

    const begin = (await actor.beginFileUpload(
      options.bucketId,
      options.path,
      contentType,
      BigInt(file.size),
      options.apiKey ? [options.apiKey] : []
    )) as Outcome<string>
    if ("err" in begin) return begin

    const chunks = await sendChunks(actor, begin.ok, file, options.onProgress)
    if ("err" in chunks) return chunks

    options.onProgress?.(95)
    const done = (await actor.completeFileUpload(
      begin.ok,
      options.apiKey ? [options.apiKey] : []
    )) as Outcome<string>
    options.onProgress?.(100)
    return done
  })
}
