import { MAX_FILE_BYTES } from "@/lib/bucket/bucket"
import {
  buildFileAcceptList,
  guessFileMime,
  isAllowedUpload as isAllowedByExtension,
  mimeFromExtension,
  pathExtension,
} from "@/lib/bucket/allowed-files"
import { uploadPathForFile } from "@/lib/bucket/bucket"

export type PreparedUpload = {
  file: File
  path: string
  contentType: string
}

/** Upload native files — preserve extension and MIME for CDN (max 10 MB). */
export async function prepareUploadFile(file: File): Promise<PreparedUpload> {
  const ext = pathExtension(file.name)
  const contentType = mimeFromExtension(ext) ?? guessFileMime(file)
  const path = uploadPathForFile(file)

  if (!isAllowedByExtension(file, MAX_FILE_BYTES)) {
    throw new Error("Invalid file format")
  }

  return { file, path, contentType }
}

export { buildFileAcceptList }
