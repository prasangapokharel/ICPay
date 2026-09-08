import imageCompression from "browser-image-compression"
import { pathExtension } from "@/lib/bucket/allowedFiles"
import { blobHasWebpHeader, validateWebpHeader } from "@/lib/bucket/imageBytes"
import { sanitizeUploadFilename } from "@/lib/bucket/uploadPath"
import { shouldConvertRasterToWebp } from "@/lib/bucket/rasterFormats"
import { BUCKET_MAX_FILE_BYTES } from "@/lib/bucket/uploadChunk"

/** Target output size — keeps most photos under the legacy 700 KB single-upload cap. */
export const COMPRESSION_MAX_SIZE_MB = 0.65
export const COMPRESSION_MAX_EDGE = 4096
export const COMPRESSION_INITIAL_QUALITY = 0.85

export type RasterCompression = {
  file: File
  originalBytes: number
  compressedBytes: number
  originalExt: string
}

export class ImageConvertError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ImageConvertError"
  }
}

export function formatCompressionSummary(
  originalBytes: number,
  compressedBytes: number
): string {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)} MB`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)} KB`
        : `${n} B`
  const ratio =
    originalBytes > 0 ? Math.round((1 - compressedBytes / originalBytes) * 100) : 0
  return `${fmt(originalBytes)} → ${fmt(compressedBytes)} WebP (−${ratio}%)`
}

function isSvgFile(file: File): boolean {
  const ext = pathExtension(file.name)
  const mime = file.type.trim().toLowerCase()
  return ext === "svg" || mime === "image/svg+xml"
}

/** Rasterize vector SVG to WebP via canvas — raw SVG is never uploaded. */
async function rasterizeSvgToWebp(file: File): Promise<Blob | null> {
  if (typeof document === "undefined") return null

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("svg load failed"))
      el.src = url
    })

    let w = img.naturalWidth || 2048
    let h = img.naturalHeight || 2048
    if (w <= 0 || h <= 0) {
      w = 2048
      h = 2048
    }
    const scale = Math.min(1, COMPRESSION_MAX_EDGE / Math.max(w, h))
    w = Math.max(1, Math.round(w * scale))
    h = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, w, h)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", COMPRESSION_INITIAL_QUALITY)
    })
    if (!blob || !(await blobHasWebpHeader(blob))) return null
    return blob
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function encodeRasterToWebp(file: File): Promise<Blob | null> {
  if (isSvgFile(file)) {
    return rasterizeSvgToWebp(file)
  }

  const attempts = [
    { maxSizeMB: COMPRESSION_MAX_SIZE_MB, initialQuality: COMPRESSION_INITIAL_QUALITY },
    { maxSizeMB: 0.5, initialQuality: 0.75 },
    { maxSizeMB: 0.4, initialQuality: 0.65 },
  ]

  for (const attempt of attempts) {
    try {
      const blob = await imageCompression(file, {
        maxSizeMB: attempt.maxSizeMB,
        maxWidthOrHeight: COMPRESSION_MAX_EDGE,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: attempt.initialQuality,
      })
      if (await blobHasWebpHeader(blob)) return blob
    } catch {
      // try next quality tier
    }
  }

  return null
}

function webpFileFromBlob(source: File, blob: Blob): File {
  const stem = sanitizeUploadFilename(
    source.name.replace(/\.[^.]+$/, "") || "photo"
  ).replace(/\.webp$/, "")
  return new File([blob], `${stem}.webp`, {
    type: "image/webp",
    lastModified: source.lastModified,
  })
}

/**
 * Raster uploads → real WebP bytes on the client before the canister sees them.
 * Throws when conversion is required but fails — never uploads raw JPEG/PNG/SVG.
 */
export async function compressRasterToWebp(file: File): Promise<RasterCompression> {
  if (!shouldConvertRasterToWebp(file)) {
    throw new ImageConvertError("Could not process this photo")
  }

  const blob = await encodeRasterToWebp(file)
  if (!blob) {
    throw new ImageConvertError("Could not process this photo")
  }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (!validateWebpHeader(bytes)) {
    throw new ImageConvertError("Could not process this photo")
  }

  const out = webpFileFromBlob(file, blob)
  if (out.size <= 0 || out.size > BUCKET_MAX_FILE_BYTES) {
    throw new ImageConvertError("File too large after compression")
  }

  return {
    file: out,
    originalBytes: file.size,
    compressedBytes: out.size,
    originalExt: pathExtension(file.name) || "image",
  }
}
