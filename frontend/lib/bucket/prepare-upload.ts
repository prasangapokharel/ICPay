import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/upload-chunk"
import {
  buildFileAcceptList,
  guessFileMime,
  isAllowedUpload as isAllowedByExtension,
  mimeFromExtension,
  normalizeUploadFile,
  pathExtension,
} from "@/lib/bucket/allowed-files"
import { compressRasterToWebp } from "@/lib/bucket/compress-image"
import { replacePathExtension, uploadPathForFile } from "@/lib/bucket/bucket"

export type PreparedUpload = {
  file: File
  path: string
  contentType: string
  /** Set when a raster was converted/compressed to WebP before upload. */
  compression?: {
    originalBytes: number
    compressedBytes: number
    originalExt: string
  }
}

/** Compress rasters to WebP when possible; other allowed types pass through unchanged. */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  const normalized = normalizeUploadFile(file)
  const compressed = await compressRasterToWebp(normalized)
  if (compressed) {
    const path = replacePathExtension(uploadPathForFile(normalized), ".webp")
    if (!isAllowedByExtension(compressed.file, BUCKET_MAX_FILE_BYTES)) {
      throw new Error("Invalid file format")
    }
    return {
      file: compressed.file,
      path,
      contentType: "image/webp",
      compression: {
        originalBytes: compressed.originalBytes,
        compressedBytes: compressed.compressedBytes,
        originalExt: compressed.originalExt,
      },
    }
  }

  const ext = pathExtension(normalized.name)
  const contentType = mimeFromExtension(ext) ?? guessFileMime(normalized)
  const path = uploadPathForFile(normalized)

  if (!isAllowedByExtension(normalized, BUCKET_MAX_FILE_BYTES)) {
    throw new Error("Invalid file format")
  }

  if (ext === "heic" || ext === "heif") {
    throw new Error("Could not process this photo")
  }

  return { file: normalized, path, contentType }
}

export { buildFileAcceptList }
