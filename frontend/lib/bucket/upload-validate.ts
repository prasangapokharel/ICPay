import { BUCKET_MAX_FILE_BYTES } from "./upload-chunk"
import { isUploadCandidate, normalizeUploadFile } from "./allowed-files"

export type UploadValidationError = "size" | "format"

/** Validate before showing the preparing UI. */
export function uploadValidationError(file: File): UploadValidationError | null {
  const normalized = normalizeUploadFile(file)
  if (normalized.size > BUCKET_MAX_FILE_BYTES) return "size"
  if (!isUploadCandidate(normalized, BUCKET_MAX_FILE_BYTES)) return "format"
  return null
}
