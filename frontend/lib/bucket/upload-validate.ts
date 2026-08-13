import { BUCKET_MAX_FILE_BYTES } from "./upload-chunk"
import {
  EXECUTABLE_BLOCKED_EXTENSIONS,
  normalizeUploadFile,
  pathExtension,
  VIDEO_BLOCKED_EXTENSIONS,
} from "./allowed-files"

export type UploadValidationError = "size" | "video" | "blocked"

/** UX pre-check before prepare/upload — not a security boundary. */
export function uploadValidationError(file: File): UploadValidationError | null {
  const normalized = normalizeUploadFile(file)

  if (normalized.size <= 0 || normalized.size > BUCKET_MAX_FILE_BYTES) {
    return "size"
  }

  const ext = pathExtension(normalized.name)
  if (ext && VIDEO_BLOCKED_EXTENSIONS.has(ext)) {
    return "video"
  }
  if (ext && EXECUTABLE_BLOCKED_EXTENSIONS.has(ext)) {
    return "blocked"
  }

  return null
}
