import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/upload-chunk"
import {
  buildFileAcceptList,
  guessFileMime,
  isAllowedUpload as isAllowedByExtension,
  mimeFromExtension,
  pathExtension,
} from "@/lib/bucket/allowed-files"
import { compressRasterToWebp } from "@/lib/bucket/compress-image"
import { replacePathExtension, uploadPathForFile } from "@/lib/bucket/bucket"

export type PreparedUpload = {
  file: File
  path: string
  contentType: string
}

/** Compress rasters to WebP when possible; other allowed types pass through. */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  const webp = await compressRasterToWebp(file)
  if (webp) {
    const path = replacePathExtension(uploadPathForFile(file), ".webp")
    if (!isAllowedByExtension(webp, BUCKET_MAX_FILE_BYTES)) {
      throw new Error("Invalid file format")
    }
    return { file: webp, path, contentType: "image/webp" }
  }

  const ext = pathExtension(file.name)
  const contentType = mimeFromExtension(ext) ?? guessFileMime(file)
  const path = uploadPathForFile(file)

  if (!isAllowedByExtension(file, BUCKET_MAX_FILE_BYTES)) {
    throw new Error("Invalid file format")
  }

  return { file, path, contentType }
}

export { buildFileAcceptList }
