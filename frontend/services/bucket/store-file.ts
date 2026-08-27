import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { WalletActor } from "@/services/wallet"
import { guessFileMime } from "@/lib/bucket/bucket"
import {
  BUCKET_UPLOAD_SINGLE_MAX,
  readFileChunk,
  uploadChunkCount,
  UPLOAD_CHUNK_CONCURRENCY,
} from "@/lib/bucket/uploadChunk"

export type StoreFileOptions = {
  bucketId: string
  path: string
  contentType?: string
  apiKey?: string
  onProgress?: (pct: number) => void
}

async function sendChunks(
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
      const res = (await actor.uploadFileChunkIndexed(
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

  await Promise.all(
    Array.from({ length: Math.min(UPLOAD_CHUNK_CONCURRENCY, total) }, () => worker())
  )

  if (failure) return { err: failure }
  return { ok: null }
}

async function uploadSmall(
  actor: WalletActor,
  file: File,
  options: StoreFileOptions,
  contentType: string
): Promise<Outcome<string>> {
  if (file.size > BUCKET_UPLOAD_SINGLE_MAX) {
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

/** Upload up to 10 MB — single call under 1.85 MiB, else indexed parallel chunks. */
export async function storeFile(
  identity: Identity | undefined,
  file: File,
  options: StoreFileOptions
): Promise<Outcome<string>> {
  const contentType = options.contentType ?? guessFileMime(file)

  return call(identity, "Upload failed", async (actor) => {
    if (file.size <= BUCKET_UPLOAD_SINGLE_MAX) {
      return uploadSmall(actor, file, options, contentType)
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
