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

/** True when the file should be compressed to WebP on the client. */
export function shouldConvertRasterToWebp(file: File): boolean {
  const ext = pathExtension(file.name)
  if (RASTER_SKIP.has(ext)) return false
  if (RASTER_TO_WEBP.has(ext)) return true
  if (file.type === "image/heic" || file.type === "image/heif") return true
  return file.type.startsWith("image/") && !RASTER_SKIP.has(ext)
}
