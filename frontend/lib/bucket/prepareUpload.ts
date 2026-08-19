import {
  guessFileMime,
  normalizeUploadFile,
} from "@/lib/bucket/allowedFiles"
import {
  compressRasterToWebp,
} from "@/lib/bucket/compressImage"
import { buildUploadPath } from "@/lib/bucket/uploadPath"
import { shouldConvertRasterToWebp } from "@/lib/bucket/rasterFormats"
import { uploadValidationError } from "@/lib/bucket/uploadValidate"

export { uploadValidationError } from "@/lib/bucket/uploadValidate"
export { formatCompressionSummary } from "@/lib/bucket/compressImage"

export type PreparedUpload = {
  file: File
  path: string
  contentType: string
  compression?: {
    originalBytes: number
    compressedBytes: number
    originalExt: string
  }
}

/**
 * Validate → normalize → convert rasters to WebP → verify size → return upload payload.
 * Non-image types (PDF, ZIP, GIF, …) pass through unchanged.
 */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  const err = uploadValidationError(file)
  if (err) throw new Error("Invalid file format")

  const normalized = normalizeUploadFile(file)

  if (shouldConvertRasterToWebp(normalized)) {
    const compressed = await compressRasterToWebp(normalized)
    return {
      file: compressed.file,
      path: buildUploadPath(normalized, true),
      contentType: "image/webp",
      compression: {
        originalBytes: compressed.originalBytes,
        compressedBytes: compressed.compressedBytes,
        originalExt: compressed.originalExt,
      },
    }
  }

  return {
    file: normalized,
    path: buildUploadPath(normalized, false),
    contentType: guessFileMime(normalized),
  }
}
