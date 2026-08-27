/**
 * Upload limits — keep in sync with backend/src/config/Config.mo.
 */

export const BUCKET_MAX_FILE_BYTES = 10_000_000
export const IC_INGRESS_MAX_BYTES = 2_097_152
export const BUCKET_UPLOAD_CHUNK_BYTES = 1_850_000
export const BUCKET_UPLOAD_SINGLE_MAX = 1_850_000
export const UPLOAD_CHUNK_CONCURRENCY = 4

export function uploadChunkCount(fileSize: number): number {
  return Math.max(1, Math.ceil(fileSize / BUCKET_UPLOAD_CHUNK_BYTES))
}

export async function readFileChunk(
  file: File,
  index: number,
  chunkBytes: number = BUCKET_UPLOAD_CHUNK_BYTES
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
