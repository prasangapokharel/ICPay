import { BUCKET_MAX_FILE_BYTES } from "./upload-chunk"
import { isBlockedExtension, normalizeUploadFile, pathExtension } from "./allowed-files"

export type UploadValidationError = "size" | "video"

/** UX pre-check before prepare/upload — not a security boundary. */
export function uploadValidationError(file: File): UploadValidationError | null {
  const normalized = normalizeUploadFile(file)

  if (normalized.size <= 0 || normalized.size > BUCKET_MAX_FILE_BYTES) {
    return "size"
  }

  const ext = pathExtension(normalized.name)
  if (ext && isBlockedExtension(ext)) {
    return "video"
  }

  return null
}
