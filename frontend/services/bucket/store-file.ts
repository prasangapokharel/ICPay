import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { WalletActor } from "@/services/wallet"
import { guessFileMime } from "@/lib/bucket/bucket"
import { runPool } from "@/lib/bucket/runPool"
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

async function cancelUpload(actor: WalletActor, uploadId: string) {
  try {
    await actor.cancelUpload(uploadId)
  } catch {
    /* best-effort */
  }
}

async function sendChunks(
  actor: WalletActor,
  uploadId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<Outcome<null>> {
  const total = uploadChunkCount(file.size)
  const indexes = Array.from({ length: total }, (_, i) => i)
  let completed = 0
  let failure: string | null = null

  await runPool(indexes, UPLOAD_CHUNK_CONCURRENCY, async (index) => {
    if (failure) return
    const bytes = await readFileChunk(file, index, total)
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
    onProgress?.(5 + Math.round((completed / total) * 85))
  })

  if (failure) {
    await cancelUpload(actor, uploadId)
    return { err: failure }
  }
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
  options.onProgress?.(50)
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

/** IC upload: single call ≤1.85 MiB, else begin → indexed chunks → complete. */
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

    options.onProgress?.(2)

    const begin = (await actor.beginFileUpload(
      options.bucketId,
      options.path,
      contentType,
      BigInt(file.size),
      options.apiKey ? [options.apiKey] : []
    )) as Outcome<string>
    if ("err" in begin) return begin

    options.onProgress?.(5)

    const chunks = await sendChunks(actor, begin.ok, file, options.onProgress)
    if ("err" in chunks) return chunks

    options.onProgress?.(92)
    const done = (await actor.completeFileUpload(
      begin.ok,
      options.apiKey ? [options.apiKey] : []
    )) as Outcome<string>
    if ("err" in done) {
      await cancelUpload(actor, begin.ok)
      return done
    }
    options.onProgress?.(100)
    return done
  })
}
