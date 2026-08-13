import { pathExtension } from "@/lib/bucket/allowed-files"
import { sanitizeUploadFilename } from "@/lib/bucket/upload-path"
import { shouldConvertRasterToWebp } from "@/lib/bucket/raster-formats"

/** Default WebP budget for bucket CDN photos (aggressive — display-sized, not archival). */
export const RASTER_TARGET_MAX_BYTES = 100_000

const QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.22] as const

type BitmapSource = ImageBitmap | HTMLImageElement

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

function drawScaled(source: BitmapSource, maxEdge: number): HTMLCanvasElement {
  const longEdge = Math.max(source.width, source.height, 1)
  const scale = Math.min(1, maxEdge / longEdge)
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(source.width * scale))
  canvas.height = Math.max(1, Math.round(source.height * scale))
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas
}

async function encodeWebpUnderLimit(
  source: BitmapSource,
  maxBytes: number,
): Promise<Blob | null> {
  let maxEdge = Math.min(Math.max(source.width, source.height), 2560)

  while (maxEdge >= 320) {
    const canvas = drawScaled(source, maxEdge)
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

async function decodeToRasterSource(file: File): Promise<BitmapSource | null> {
  try {
    if (typeof createImageBitmap === "function") {
      return await createImageBitmap(file)
    }
  } catch {
    // Safari / unsupported format — fall through to <img>
  }
  return decodeViaImageElement(file)
}

function decodeViaImageElement(file: File): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

function closeRasterSource(source: BitmapSource | null): void {
  if (source && "close" in source && typeof source.close === "function") {
    source.close()
  }
}

/**
 * Raster uploads → WebP on the client before the canister sees them.
 * PNG/JPEG/HEIC from iPhone often land as multi-MB; CDN wants display-sized assets.
 */
export async function compressRasterToWebp(file: File): Promise<RasterCompression | null> {
  if (!shouldConvertRasterToWebp(file)) return null

  let source: BitmapSource | null = null
  try {
    source = await decodeToRasterSource(file)
    if (!source) return null
    const budget = targetBytesFor(file.size)
    const blob = await encodeWebpUnderLimit(source, budget)
    if (!blob) return null

    const stem = sanitizeUploadFilename(file.name.replace(/\.[^.]+$/, "") || "photo")
      .replace(/\.webp$/, "")
    const out = new File([blob], `${stem}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    })
    return {
      file: out,
      originalBytes: file.size,
      compressedBytes: out.size,
      originalExt: pathExtension(file.name) || "image",
    }
  } catch {
    return null
  } finally {
    closeRasterSource(source)
  }
}
