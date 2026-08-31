/**
 * Upload limits — keep in sync with backend/src/config/Config.mo.
 * IC ingress: 2 MiB max per update; chunk payload ~1.85 MiB leaves Candid headroom.
 */

export const BUCKET_MAX_FILE_BYTES = 10_000_000
export const IC_INGRESS_MAX_BYTES = 2_097_152
export const BUCKET_UPLOAD_CHUNK_BYTES = 1_850_000
export const BUCKET_UPLOAD_MIN_CHUNK_BYTES = 700_000
export const BUCKET_UPLOAD_SINGLE_MAX = 1_850_000
export const UPLOAD_CHUNK_CONCURRENCY = 4

/** Must match backend Upload.uploadChunkCount (uses MIN_CHUNK_BYTES, not CHUNK_BYTES). */
export function uploadChunkCount(fileSize: number): number {
  if (fileSize <= 0) return 1
  return Math.ceil(fileSize / BUCKET_UPLOAD_MIN_CHUNK_BYTES)
}

/** Split file into `totalChunks` indexed parts — same count backend expects at beginFileUpload. */
export function chunkByteRange(
  fileSize: number,
  index: number,
  totalChunks: number
): { start: number; end: number } {
  if (totalChunks < 1 || index < 0 || index >= totalChunks) {
    throw new Error("Invalid chunk index")
  }
  const start = Math.floor((index * fileSize) / totalChunks)
  const end = Math.floor(((index + 1) * fileSize) / totalChunks)
  return { start, end }
}

export async function readFileChunk(
  file: File,
  index: number,
  totalChunks: number
): Promise<Uint8Array> {
  const { start, end } = chunkByteRange(file.size, index, totalChunks)
  const size = end - start
  if (size <= 0) {
    throw new Error("Empty upload chunk")
  }
  if (size > BUCKET_UPLOAD_CHUNK_BYTES) {
    throw new Error(`Chunk too large (${size} bytes)`)
  }
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
