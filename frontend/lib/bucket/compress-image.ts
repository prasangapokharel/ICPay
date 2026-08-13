import { pathExtension } from "@/lib/bucket/allowed-files"

/** Target size for raster uploads — iPhone photos compress here before upload. */
export const RASTER_TARGET_MAX_BYTES = 1_000_000

const CONVERT_TO_WEBP = new Set([
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

/** Raster types we leave as-is (animated or vector). */
const SKIP_CONVERSION = new Set(["gif", "svg", "ico"])

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality)
  })
}

async function encodeWebpUnderLimit(
  bitmap: ImageBitmap,
  maxBytes: number,
): Promise<Blob | null> {
  let maxDim = Math.max(bitmap.width, bitmap.height, 1)
  const qualities = [0.88, 0.78, 0.68, 0.58, 0.48, 0.38]

  while (maxDim >= 256) {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, w, h)

    for (const q of qualities) {
      const blob = await canvasToWebpBlob(canvas, q)
      if (blob && blob.size <= maxBytes) return blob
    }

    maxDim = Math.floor(maxDim * 0.75)
  }

  return null
}

/**
 * Compress raster uploads to WebP before they hit the canister.
 * iPhone PNG/JPEG/HEIC → smaller WebP; GIF/SVG/code/archives pass through.
 */
export async function compressRasterToWebp(
  file: File,
  maxBytes = RASTER_TARGET_MAX_BYTES,
): Promise<File | null> {
  if (typeof createImageBitmap === "undefined") return null

  const ext = pathExtension(file.name)
  if (SKIP_CONVERSION.has(ext)) return null
  if (!CONVERT_TO_WEBP.has(ext) && !file.type.startsWith("image/")) return null

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await createImageBitmap(file)
    const blob = await encodeWebpUnderLimit(bitmap, maxBytes)
    if (!blob) return null

    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_")
    const name = `${stem || "photo"}.webp`
    return new File([blob], name, { type: "image/webp", lastModified: file.lastModified })
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}
