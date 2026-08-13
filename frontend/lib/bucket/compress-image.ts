import imageCompression from "browser-image-compression"
import { pathExtension } from "@/lib/bucket/allowed-files"
import { validateWebpHeader } from "@/lib/bucket/image-bytes"
import { sanitizeUploadFilename } from "@/lib/bucket/upload-path"
import { shouldConvertRasterToWebp } from "@/lib/bucket/raster-formats"

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

/**
 * Raster uploads → real WebP bytes on the client before the canister sees them.
 * Returns null when encoding is unavailable — caller uploads the original format.
 */
export async function compressRasterToWebp(file: File): Promise<RasterCompression | null> {
  if (!shouldConvertRasterToWebp(file)) return null

  try {
    const blob = await imageCompression(file, {
      maxSizeMB: COMPRESSION_MAX_SIZE_MB,
      maxWidthOrHeight: COMPRESSION_MAX_EDGE,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: COMPRESSION_INITIAL_QUALITY,
    })

    const bytes = new Uint8Array(await blob.arrayBuffer())
    if (!validateWebpHeader(bytes)) return null

    const stem = sanitizeUploadFilename(
      file.name.replace(/\.[^.]+$/, "") || "photo"
    ).replace(/\.webp$/, "")
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
  }
}
