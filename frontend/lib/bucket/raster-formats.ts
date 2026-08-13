import { pathExtension } from "./allowed-files"

/** Raster formats converted to WebP before upload. */
export const RASTER_TO_WEBP = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "bmp",
  "tif",
  "tiff",
  "heic",
  "heif",
])

/** Never rasterize — animated GIF, vector SVG, multi-size ICO. */
export const RASTER_SKIP = new Set(["gif", "svg", "ico"])

const RASTER_SKIP_MIMES = new Set([
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
])

const RASTER_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/heic": "heic",
  "image/heif": "heif",
}

/** True when the file should be compressed to WebP on the client. */
export function shouldConvertRasterToWebp(file: File): boolean {
  const ext = pathExtension(file.name)
  if (RASTER_SKIP.has(ext)) return false

  const mime = file.type.trim().toLowerCase()
  if (mime && RASTER_SKIP_MIMES.has(mime)) return false

  if (RASTER_TO_WEBP.has(ext)) return true
  if (mime === "image/heic" || mime === "image/heif") return true

  // Extensionless raster — infer from MIME only when filename has no ext.
  if (!ext && mime) {
    const inferred = RASTER_MIME_TO_EXT[mime]
    return inferred !== undefined && RASTER_TO_WEBP.has(inferred)
  }

  return false
}
