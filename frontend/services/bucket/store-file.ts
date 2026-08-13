/**
 * Store a file in an ICPay bucket.
 *
 * Small files use one `uploadFile` update (~1 round). Larger files use indexed
 * parallel chunks (IC ingress capped at 2 MiB per message).
 *
 * @see https://docs.internetcomputer.org/references/resource-limits/
 */

import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { WalletActor } from "@/services/wallet"
import { guessFileMime } from "@/lib/bucket/bucket"
import {
  readFileChunk,
  uploadChunkCount,
  UPLOAD_CHUNK_CONCURRENCY,
  UPLOAD_SINGLE_MAX_BYTES,
} from "@/lib/bucket/upload-chunk"

export type StoreFileOptions = {
  bucketId: string
  path: string
  contentType?: string
  apiKey?: string
  onProgress?: (pct: number) => void
}

async function sendChunksParallel(
  actor: WalletActor,
  uploadId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<Outcome<null>> {
  const total = uploadChunkCount(file.size)
  let nextIndex = 0
  let completed = 0
  let failure: string | null = null

  async function worker() {
    while (true) {
      if (failure) return
      const index = nextIndex
      nextIndex += 1
      if (index >= total) return

      const bytes = await readFileChunk(file, index)
      const res = (await actor.uploadFileChunk(
        uploadId,
        BigInt(index),
        bytes
      )) as Outcome<bigint>
      if ("err" in res) {
        failure = res.err
        return
      }
      completed += 1
      onProgress?.(10 + Math.round((completed / total) * 80))
    }
  }

  const workers = Math.min(UPLOAD_CHUNK_CONCURRENCY, total)
  await Promise.all(Array.from({ length: workers }, () => worker()))

  if (failure) return { err: failure }
  return { ok: null }
}

async function uploadSingleCall(
  actor: WalletActor,
  file: File,
  options: StoreFileOptions,
  contentType: string
): Promise<Outcome<string>> {
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

  return call(identity, "Upload failed", async (actor) => {
    if (file.size <= UPLOAD_SINGLE_MAX_BYTES) {
      return uploadSingleCall(actor, file, options, contentType)
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

    const chunks = await sendChunksParallel(actor, begin.ok, file, options.onProgress)
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
