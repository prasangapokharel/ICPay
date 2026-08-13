/**
 * Upload size constants — keep in sync with backend/src/config/Config.mo.
 *
 * IC protocol (fixed): 2 MiB max per ingress update message.
 * ICPay product cap: 10 MB max assembled file (chunked across many calls).
 *
 * @see https://docs.internetcomputer.org/references/resource-limits/
 */

/** ICPay product limit — max assembled file on canister. */
export const BUCKET_MAX_FILE_BYTES = 10_000_000

/** IC protocol limit — 2 MiB per update call; cannot be raised. */
export const IC_INGRESS_MAX_BYTES = 2_097_152

/** Per-chunk payload — conservative vs ingress + Candid overhead. */
export const UPLOAD_CHUNK_BYTES = 700_000

/** Direct uploadFile() ceiling for API scripts (UI always chunks). */
export const UPLOAD_SINGLE_MAX_BYTES = 700_000

export function uploadChunkCount(fileSize: number): number {
  return Math.max(1, Math.ceil(fileSize / UPLOAD_CHUNK_BYTES))
}

export async function readFileChunk(file: File, index: number): Promise<Uint8Array> {
  const start = index * UPLOAD_CHUNK_BYTES
  const end = Math.min(start + UPLOAD_CHUNK_BYTES, file.size)
  return new Uint8Array(await file.slice(start, end).arrayBuffer())
}

export function isIngressTooLargeError(message: string): boolean {
  return (
    message.includes("too large") ||
    message.includes("413") ||
    message.includes("2097152") ||
    message.includes("max allowed")
  )
}
