/**
 * Store a file in an ICPay bucket.
 *
 * Like `AssetManager.store()` — pass a File and options; chunking is automatic
 * because IC ingress is capped at 2 MiB per update message.
 *
 * @see https://docs.internetcomputer.org/references/resource-limits/
 */

import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"
import type { WalletActor } from "@/services/wallet"
import { guessFileMime } from "@/lib/bucket/bucket"
import { readFileChunk, uploadChunkCount } from "@/lib/bucket/upload-chunk"

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

  for (let i = 0; i < total; i++) {
    const bytes = await readFileChunk(file, i)
    const res = (await actor.uploadFileChunk(uploadId, bytes)) as Outcome<bigint>
    if ("err" in res) return { err: res.err }
    onProgress?.(10 + Math.round(((i + 1) / total) * 80))
  }

  return { ok: null }
}

/** Upload a file — chunked automatically, up to 10 MB assembled on canister. */
export async function storeFile(
  identity: Identity | undefined,
  file: File,
  options: StoreFileOptions
): Promise<Outcome<string>> {
  const contentType = options.contentType ?? guessFileMime(file)

  return call(identity, "Upload failed", async (actor) => {
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
