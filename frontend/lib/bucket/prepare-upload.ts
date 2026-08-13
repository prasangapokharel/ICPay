import {
  guessFileMime,
  mimeFromExtension,
  normalizeUploadFile,
  pathExtension,
} from "@/lib/bucket/allowed-files"
import { compressRasterToWebp } from "@/lib/bucket/compress-image"
import { buildUploadPath } from "@/lib/bucket/upload-path"
import { shouldConvertRasterToWebp } from "@/lib/bucket/raster-formats"
import { uploadValidationError } from "@/lib/bucket/upload-validate"

export { uploadValidationError } from "@/lib/bucket/upload-validate"

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
 * Normalize → compress rasters to WebP → return file, path, and MIME for storeFile.
 * Non-raster allowed types (PDF, ZIP, GIF, SVG, …) pass through unchanged.
 */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  const err = uploadValidationError(file)
  if (err) throw new Error("Invalid file format")

  const normalized = normalizeUploadFile(file)

  if (shouldConvertRasterToWebp(normalized)) {
    const compressed = await compressRasterToWebp(normalized)
    if (compressed) {
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
  }

  const ext = pathExtension(normalized.name)
  return {
    file: normalized,
    path: buildUploadPath(normalized, false),
    contentType: mimeFromExtension(ext) ?? guessFileMime(normalized),
  }
}

export { buildFileAcceptList } from "@/lib/bucket/allowed-files"
