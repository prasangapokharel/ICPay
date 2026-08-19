import {
  guessFileMime,
  normalizeUploadFile,
} from "@/lib/bucket/allowed-files"
import {
  compressRasterToWebp,
} from "@/lib/bucket/compress-image"
import { buildUploadPath } from "@/lib/bucket/upload-path"
import { shouldConvertRasterToWebp } from "@/lib/bucket/raster-formats"
import { uploadValidationError } from "@/lib/bucket/upload-validate"

export { uploadValidationError } from "@/lib/bucket/upload-validate"
export { formatCompressionSummary } from "@/lib/bucket/compress-image"

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
