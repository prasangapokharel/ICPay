/**
 * Upload size constants — keep in sync with backend/src/config/Config.mo.
 *
 * IC protocol (fixed): 2 MiB max per ingress update message.
 * Live mainnet (legacy candid): uploadFileChunk(uploadId, data) — 700 KB chunks.
 * After backend deploy: uploadFileChunkIndexed(uploadId, index, data) — 1.85 MiB parallel.
 */

/** ICPay product limit — max assembled file on canister. */
export const BUCKET_MAX_FILE_BYTES = 10_000_000

/** IC protocol limit — 2 MiB per update call; cannot be raised. */
export const IC_INGRESS_MAX_BYTES = 2_097_152

/** Smallest chunk size legacy clients send — keep in sync with Config.mo BUCKET_UPLOAD_MIN_CHUNK_BYTES. */
export const LEGACY_UPLOAD_MIN_CHUNK_BYTES = 700_000

/** Legacy canister chunk size (matches pre-v2 frontend on mainnet). */
export const LEGACY_UPLOAD_CHUNK_BYTES = LEGACY_UPLOAD_MIN_CHUNK_BYTES

/** V2 canister chunk size (~1.85 MiB Candid headroom under 2 MiB ingress). */
export const V2_UPLOAD_CHUNK_BYTES = 1_850_000

/** @deprecated use limits from uploadLimits() */
export const UPLOAD_CHUNK_BYTES = LEGACY_UPLOAD_CHUNK_BYTES

/** @deprecated use limits from uploadLimits() */
export const UPLOAD_SINGLE_MAX_BYTES = LEGACY_UPLOAD_CHUNK_BYTES

export const UPLOAD_CHUNK_CONCURRENCY = 4

export type UploadLimits = {
  v2: boolean
  chunkBytes: number
  singleMaxBytes: number
  concurrency: number
}

/** Set NEXT_PUBLIC_BUCKET_UPLOAD_V2=true after `npm run ci backend:deploy`. */
export function uploadLimits(): UploadLimits {
  const v2 = process.env.NEXT_PUBLIC_BUCKET_UPLOAD_V2 === "true"
  return {
    v2,
    chunkBytes: v2 ? V2_UPLOAD_CHUNK_BYTES : LEGACY_UPLOAD_CHUNK_BYTES,
    singleMaxBytes: v2 ? V2_UPLOAD_CHUNK_BYTES : LEGACY_UPLOAD_CHUNK_BYTES,
    concurrency: v2 ? UPLOAD_CHUNK_CONCURRENCY : 1,
  }
}

export function uploadChunkCount(fileSize: number, chunkBytes: number): number {
  return Math.max(1, Math.ceil(fileSize / chunkBytes))
}

export async function readFileChunk(
  file: File,
  index: number,
  chunkBytes: number
): Promise<Uint8Array> {
  const start = index * chunkBytes
  const end = Math.min(start + chunkBytes, file.size)
  return new Uint8Array(await file.slice(start, end).arrayBuffer())
}

export function isIngressTooLargeError(message: string): boolean {
  return (
    message.includes("too large") ||
    message.includes("413") ||
    message.includes("2097152") ||
    message.includes("max allowed") ||
    message.includes("IDL error")
  )
}
