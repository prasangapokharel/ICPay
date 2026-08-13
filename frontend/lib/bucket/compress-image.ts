import { pathExtension } from "@/lib/bucket/allowed-files"

/** Default WebP budget for bucket CDN photos (aggressive — display-sized, not archival). */
export const RASTER_TARGET_MAX_BYTES = 100_000

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

/** Animated / vector — never rasterize. */
const SKIP_CONVERSION = new Set(["gif", "svg", "ico"])

const QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.22] as const

export type RasterCompression = {
  file: File
  originalBytes: number
  compressedBytes: number
  originalExt: string
}

/** Larger originals get a tighter byte budget (e.g. 8 MB iPhone PNG → ~50 KB WebP). */
export function targetBytesFor(originalSize: number): number {
  if (originalSize >= 5_000_000) return 50_000
  if (originalSize >= 2_000_000) return 80_000
  if (originalSize >= 500_000) return 120_000
  return RASTER_TARGET_MAX_BYTES
}

function canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", quality)
  })
}

function drawScaled(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const longEdge = Math.max(bitmap.width, bitmap.height, 1)
  const scale = Math.min(1, maxEdge / longEdge)
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")
  ctx.drawImage(bitmap, 0, 0, w, h)
  return canvas
}

async function encodeWebpUnderLimit(
  bitmap: ImageBitmap,
  maxBytes: number,
): Promise<Blob | null> {
  let maxEdge = Math.min(Math.max(bitmap.width, bitmap.height), 2560)

  while (maxEdge >= 320) {
    const canvas = drawScaled(bitmap, maxEdge)
    for (const q of QUALITIES) {
      const blob = await canvasToWebpBlob(canvas, q)
      if (blob && blob.size <= maxBytes) return blob
    }
    maxEdge = Math.floor(maxEdge * 0.72)
  }

  return null
}

export function formatCompressionSummary(
  originalBytes: number,
  compressedBytes: number,
): string {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)} MB`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)} KB`
        : `${n} B`
  const ratio = originalBytes > 0 ? Math.round((1 - compressedBytes / originalBytes) * 100) : 0
  return `${fmt(originalBytes)} → ${fmt(compressedBytes)} WebP (−${ratio}%)`
}

async function decodeToBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file)
  } catch {
    return decodeViaImageElement(file)
  }
}

function decodeViaImageElement(file: File): Promise<ImageBitmap | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      void (async () => {
        try {
          resolve(await createImageBitmap(img))
        } catch {
          resolve(null)
        } finally {
          URL.revokeObjectURL(url)
        }
      })()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/**
 * Raster uploads → WebP on the client before the canister sees them.
 * PNG/JPEG/HEIC from iPhone often land as multi-MB; CDN wants display-sized assets.
 */
export async function compressRasterToWebp(file: File): Promise<RasterCompression | null> {
  if (typeof createImageBitmap === "undefined") return null

  const ext = pathExtension(file.name)
  if (SKIP_CONVERSION.has(ext)) return null
  const isRaster =
    CONVERT_TO_WEBP.has(ext) ||
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    (file.type.startsWith("image/") && ext !== "gif" && ext !== "svg" && ext !== "ico")
  if (!isRaster) return null

  let bitmap: ImageBitmap | null = null
  try {
    bitmap = await decodeToBitmap(file)
    if (!bitmap) return null
    const budget = targetBytesFor(file.size)
    const blob = await encodeWebpUnderLimit(bitmap, budget)
    if (!blob) return null

    const stem = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "_")
    const out = new File([blob], `${stem || "photo"}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    })
    return {
      file: out,
      originalBytes: file.size,
      compressedBytes: out.size,
      originalExt: ext || "image",
    }
  } catch {
    return null
  } finally {
    bitmap?.close()
  }
}
